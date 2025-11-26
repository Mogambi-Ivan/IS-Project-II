// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {
    // =========================
    // USER REGISTRY
    // =========================
    enum Role {
        None,
        Owner,
        Government
    }

    struct User {
        string name;
        string nationalId;
        Role role;
        bool exists;
    }

    // wallet => user profile
    mapping(address => User) public users;

    // hashed national ID => wallet (to avoid duplicate IDs)
    mapping(bytes32 => address) public walletByNationalIdHash;

    event UserRegistered(
        address indexed wallet,
        string name,
        string nationalId,
        Role role
    );

    // =========================
    // ADMIN / GOVERNMENT
    // =========================
    address public governmentOfficial;
    address public admin;

    constructor() {
        admin = msg.sender;
        governmentOfficial = msg.sender; // default gov = deployer for local testing
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    modifier onlyGovernment() {
        require(
            msg.sender == governmentOfficial,
            "Only government official allowed"
        );
        _;
    }

    modifier onlyRegisteredOwner() {
        require(users[msg.sender].exists, "User not registered");
        require(
            users[msg.sender].role == Role.Owner,
            "Registered user is not an owner"
        );
        _;
    }

    modifier onlyRegisteredGovernment() {
        require(users[msg.sender].exists, "User not registered");
        require(
            users[msg.sender].role == Role.Government,
            "Registered user is not government"
        );
        _;
    }

    // =========================
    // USER FUNCTIONS
    // =========================
    function registerUser(
        string memory _name,
        string memory _nationalId,
        Role _role
    ) public {
        require(!users[msg.sender].exists, "Already registered");
        require(
            _role == Role.Owner || _role == Role.Government,
            "Invalid role"
        );

        bytes32 idHash = keccak256(abi.encodePacked(_nationalId));
        require(
            walletByNationalIdHash[idHash] == address(0),
            "National ID already used"
        );

        users[msg.sender] = User({
            name: _name,
            nationalId: _nationalId,
            role: _role,
            exists: true
        });

        walletByNationalIdHash[idHash] = msg.sender;

        emit UserRegistered(msg.sender, _name, _nationalId, _role);
    }

    // =========================
    // LAND REGISTRATION
    // =========================
       struct Land {
        uint256 landId;
        string ownerName;
        string nationalId;
        string titleNumber;
        string location;
        string size;
        string landType;
        address currentOwner;
        bool isRegistered;
        uint256 approvedAt;
        bool isRejected;          
        string rejectionReason;   
    }


    // All lands by id
    mapping(uint256 => Land) public landRecords;

    // Track all registration requests
    uint256[] public requestedLandIds;

    // Owner => list of their landIds (historical list)
    mapping(address => uint256[]) public landsByOwner;

    event LandRequested(uint256 landId, address owner);
    event LandApproved(uint256 landId, address owner);
    event LandRejected(uint256 landId, string reason); // NEW


       function requestLandRegistration(
        uint256 _landId,
        string memory _ownerName,
        string memory _nationalId,
        string memory _titleNumber,
        string memory _location,
        string memory _size,
        string memory _landType
    ) public onlyRegisteredOwner {
        require(
            landRecords[_landId].currentOwner == address(0),
            "Land ID already exists"
        );

        landRecords[_landId] = Land({
            landId: _landId,
            ownerName: _ownerName,
            nationalId: _nationalId,
            titleNumber: _titleNumber,
            location: _location,
            size: _size,
            landType: _landType,
            currentOwner: msg.sender,
            isRegistered: false,
            approvedAt: 0,
            isRejected: false,          
            rejectionReason: ""         
        });

        requestedLandIds.push(_landId);

        emit LandRequested(_landId, msg.sender);
    }


    function approveLand(
        uint256 _landId
    ) public onlyGovernment onlyRegisteredGovernment {
        Land storage land = landRecords[_landId];
        require(land.currentOwner != address(0), "Land not requested");
        require(!land.isRegistered, "Already registered");
        require(!land.isRejected, "Already rejected"); // ✅

        land.isRegistered = true;
        land.approvedAt = block.timestamp;

        landsByOwner[land.currentOwner].push(_landId);

        emit LandApproved(_landId, land.currentOwner);
    }

        function rejectLand(
        uint256 _landId,
        string memory _reason
    ) public onlyGovernment onlyRegisteredGovernment {
        Land storage land = landRecords[_landId];

        require(land.currentOwner != address(0), "Land not requested");
        require(!land.isRegistered, "Already registered");
        require(!land.isRejected, "Already rejected");

        land.isRejected = true;
        land.rejectionReason = _reason;

        emit LandRejected(_landId, _reason);
    }



    function getRequestedLandIds() public view returns (uint256[] memory) {
        return requestedLandIds;
    }

    function getLandsByOwner(
        address _owner
    ) public view returns (uint256[] memory) {
        return landsByOwner[_owner];
    }

    // =========================
    // TRANSFER REQUESTS
    // =========================
    struct TransferRequest {
        uint256 landId;
        address fromOwner;
        address toOwner;
        string proposedNewOwnerName;
        bool approved;
        bool rejected;
        uint256 decidedAt;
    }

    mapping(uint256 => TransferRequest) public transferRequests;
    uint256[] public pendingTransferIds;

    event TransferRequested(
        uint256 landId,
        address fromOwner,
        address toOwner
    );
    event TransferApproved(uint256 landId, address newOwner);
    event TransferRejected(uint256 landId);
    

        function requestTransfer(
        uint256 _landId,
        string memory _newOwnerNationalId
    ) public onlyRegisteredOwner {
        Land storage land = landRecords[_landId];

        require(land.isRegistered, "Land not registered");
        require(land.currentOwner == msg.sender, "Not current owner");

        // Look up new owner wallet from national ID
        bytes32 idHash = keccak256(abi.encodePacked(_newOwnerNationalId));
        address newOwner = walletByNationalIdHash[idHash];
        require(newOwner != address(0), "New owner not registered");

        User storage u = users[newOwner];

        transferRequests[_landId] = TransferRequest({
            landId: _landId,
            fromOwner: msg.sender,
            toOwner: newOwner,
            proposedNewOwnerName: u.name, // official on-chain name
            approved: false,
            rejected: false,
            decidedAt: 0
        });

        pendingTransferIds.push(_landId);

        emit TransferRequested(_landId, msg.sender, newOwner);
    }


    function approveTransfer(
    uint256 _landId
) public onlyGovernment onlyRegisteredGovernment {
    TransferRequest storage req = transferRequests[_landId];
    Land storage land = landRecords[_landId];

    require(req.fromOwner != address(0), "No transfer request");
    require(!req.approved && !req.rejected, "Already decided");

    // ✅ 1. Update the blockchain record to the NEW owner
    land.currentOwner = req.toOwner;

    // ✅ 2. Also update the details to match the new owner
    User storage newOwner = users[req.toOwner];
    if (newOwner.exists) {
        land.ownerName = newOwner.name;
        land.nationalId = newOwner.nationalId;
    }

    // ✅ 3. Mark transfer as approved
    req.approved = true;
    req.decidedAt = block.timestamp;

    // (Optional: we could remove from fromOwner's list, but for now
    //  we just append to the new owner's history.)
    landsByOwner[req.toOwner].push(_landId);

    emit TransferApproved(_landId, req.toOwner);
}


    function rejectTransfer(
        uint256 _landId
    ) public onlyGovernment onlyRegisteredGovernment {
        TransferRequest storage req = transferRequests[_landId];

        require(req.fromOwner != address(0), "No transfer request");
        require(!req.approved && !req.rejected, "Already decided");

        req.rejected = true;
        req.decidedAt = block.timestamp;

        emit TransferRejected(_landId);
    }

    function getPendingTransferIds() public view returns (uint256[] memory) {
        return pendingTransferIds;
    }

    // =========================
    // ADMIN ACTIONS
    // =========================
    function setGovernmentOfficial(address _newGov) public onlyAdmin {
        require(_newGov != address(0), "Invalid address");
        governmentOfficial = _newGov;
    }
}
