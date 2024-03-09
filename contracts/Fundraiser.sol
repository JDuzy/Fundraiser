// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";
contract Fundraiser is Ownable {

    struct Donation {
    uint256 value;
    uint256 date;
    }

    string public name;
    string public url;
    string public imageURL;
    string public description;


    address payable public beneficiary;

    mapping(address => Donation[]) private _donations;
    uint256 public totalDonationsValue;
    uint256 public donationsCount;

    event DonationReceived(address indexed donor, uint256 value);
    event Withdraw(uint256 amount);

    constructor(
        string memory _name,
        string memory _url,
        string memory _imageURL,
        string memory _description,
        address payable _beneficiary,
        address _custodian
    ) Ownable(_custodian) {
        name = _name;
        url = _url;
        imageURL = _imageURL;
        description = _description;
        beneficiary = _beneficiary;
    }

    function setBeneficiary(address payable _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    // Donations

    function donate() public payable {
        Donation memory donation = Donation({
            value: msg.value,
            date: block.timestamp
        });
        _donations[msg.sender].push(donation);
        totalDonationsValue += msg.value;
        donationsCount++;
        emit DonationReceived(msg.sender, msg.value);
    }

    function myDonationsCount() public view returns(uint256) {
        return _donations[msg.sender].length;
    }

    function myDonations() public view returns(
        uint256[] memory donationValues,
        uint256[] memory dates
    ) {
        uint256 count = myDonationsCount();
        donationValues = new uint256[](count);
        dates = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Donation storage donation = _donations[msg.sender][i];
            donationValues[i] = donation.value;
            dates[i] = donation.date;
        }

        return (donationValues, dates);
    }

    // Whithdrawal
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        beneficiary.transfer(balance);
        emit Withdraw(balance);
    }

    receive () external payable {
    totalDonationsValue += msg.value;
    donationsCount++;
    }
}
