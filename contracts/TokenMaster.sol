// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenMaster is ERC721, Ownable, ReentrancyGuard {
    uint256 public totalOccasions;
    uint256 public totalSupply;

    struct Occasion {
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    mapping(uint256 => Occasion) public occasions;
    mapping(uint256 => mapping(address => bool)) public hasBought;
    mapping(uint256 => mapping(uint256 => address)) public seatTaken;
    mapping(uint256 => uint256[]) public seatsTaken;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        // Ownership is handled by Ownable
    }

    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location
    ) public onlyOwner {
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_date).length > 0, "Date cannot be empty");
        require(bytes(_time).length > 0, "Time cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");

        totalOccasions++;
        occasions[totalOccasions] = Occasion(
            totalOccasions,
            _name,
            _cost,
            _maxTickets,
            _maxTickets,
            _date,
            _time,
            _location
        );
    }

    function mint(uint256 _id, uint256 _seat) public payable nonReentrant {
        require(_id != 0 && _id <= totalOccasions, "Invalid occasion ID");
        require(msg.value >= occasions[_id].cost, "Insufficient payment");
        require(seatTaken[_id][_seat] == address(0), "Seat already taken");
        require(_seat > 0 && _seat <= occasions[_id].maxTickets, "Invalid seat number");
        require(occasions[_id].tickets > 0, "No tickets available");

        occasions[_id].tickets -= 1;
        hasBought[_id][msg.sender] = true;
        seatTaken[_id][_seat] = msg.sender;
        seatsTaken[_id].push(_seat);

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function getOccasion(uint256 _id) public view returns (Occasion memory) {
        require(_id != 0 && _id <= totalOccasions, "Invalid occasion ID");
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
        require(_id != 0 && _id <= totalOccasions, "Invalid occasion ID");
        return seatsTaken[_id];
    }

    function withdraw() public onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
