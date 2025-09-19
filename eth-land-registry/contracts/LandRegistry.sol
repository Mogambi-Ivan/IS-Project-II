// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LandRegistry {
    address public governmentOfficial;

    struct LandRecord {
        uint256 landId;
        string location;
        uint256 size;
        address currentOwner;
        bool isRegistered;
    }

    mapping(uint256 => LandRecord) public landRecords;

    event LandRegistered(uint256 landId, string location, uint256 size, address indexed owner);
    event OwnershipTransferred(uint256 landId, address indexed oldOwner, address indexed newOwner);

    modifier onlyGovernment() {
        require(msg.sender == governmentOfficial, "Only government can perform this action");
        _;
    }

    modifier onlyOwner(uint256 landId) {
        require(landRecords[landId].currentOwner == msg.sender, "Only current owner can transfer");
        _;
    }

    constructor() {
        governmentOfficial = msg.sender;
    }

    function registerLand(uint256 landId, string memory location, uint256 size, address owner) public onlyGovernment {
        require(!landRecords[landId].isRegistered, "Land already registered");

        landRecords[landId] = LandRecord({
            landId: landId,
            location: location,
            size: size,
            currentOwner: owner,
            isRegistered: true
        });

        emit LandRegistered(landId, location, size, owner);
    }

    function transferLand(uint256 landId, address newOwner) public onlyOwner(landId) {
        require(landRecords[landId].isRegistered, "Land not registered");

        address oldOwner = landRecords[landId].currentOwner;
        landRecords[landId].currentOwner = newOwner;

        emit OwnershipTransferred(landId, oldOwner, newOwner);
    }

    function getLandDetails(uint256 landId) public view returns (string memory, uint256, address, bool) {
        LandRecord memory record = landRecords[landId];
        return (record.location, record.size, record.currentOwner, record.isRegistered);
    }
}
