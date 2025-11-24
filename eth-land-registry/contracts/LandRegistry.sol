// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {
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
        require(msg.sender == governmentOfficial, "Only government official allowed");
        _;
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
    }

    // All lands by id
    mapping(uint256 => Land) public landRecords;

    // Track all registration requests
    uint256[] public requestedLandIds;

    // Owner => list of their landIds
    mapping(address => uint256[]) public landsByOwner;

    event LandRequested(uint256 landId, address owner);
    event LandApproved(uint256 landId, address owner);

    function requestLandRegistration(
        uint256 _landId,
        string memory _ownerName,
        string memory _nationalId,
        string memory _titleNumber,
        string memory _location,
        string memory _size,
        string memory _landType
    ) public {
        require(landRecords[_landId].currentOwner == address(0), "Land ID already exists");

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
            approvedAt: 0
        });

        requestedLandIds.push(_landId);

        emit LandRequested(_landId, msg.sender);
    }

    function approveLand(uint256 _landId) public onlyGovernment {
        Land storage land = landRecords[_landId];
        require(land.currentOwner != address(0), "Land not requested");
        require(!land.isRegistered, "Already registered");

        land.isRegistered = true;
        land.approvedAt = block.timestamp;

        landsByOwner[land.currentOwner].push(_landId);

        emit LandApproved(_landId, land.currentOwner);
    }

    function getRequestedLandIds() public view returns (uint256[] memory) {
        return requestedLandIds;
    }

    function getLandsByOwner(address _owner) public view returns (uint256[] memory) {
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

    event TransferRequested(uint256 landId, address fromOwner, address toOwner);
    event TransferApproved(uint256 landId, address newOwner);
    event TransferRejected(uint256 landId);

    function requestTransfer(
        uint256 _landId,
        address _newOwner,
        string memory _newOwnerName
    ) public {
        Land storage land = landRecords[_landId];

        require(land.isRegistered, "Land not registered");
        require(land.currentOwner == msg.sender, "Not current owner");
        require(_newOwner != address(0), "Invalid new owner");

        transferRequests[_landId] = TransferRequest({
            landId: _landId,
            fromOwner: msg.sender,
            toOwner: _newOwner,
            proposedNewOwnerName: _newOwnerName,
            approved: false,
            rejected: false,
            decidedAt: 0
        });

        pendingTransferIds.push(_landId);

        emit TransferRequested(_landId, msg.sender, _newOwner);
    }

    function approveTransfer(uint256 _landId) public onlyGovernment {
        TransferRequest storage req = transferRequests[_landId];
        Land storage land = landRecords[_landId];

        require(req.fromOwner != address(0), "No transfer request");
        require(!req.approved && !req.rejected, "Already decided");

        land.currentOwner = req.toOwner;

        req.approved = true;
        req.decidedAt = block.timestamp;

        landsByOwner[req.toOwner].push(_landId);

        emit TransferApproved(_landId, req.toOwner);
    }

    function rejectTransfer(uint256 _landId) public onlyGovernment {
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
