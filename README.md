# Decentralized Fundraising Smart Contract

This project is an upgraded version of the original walkthrough from the book ['Hands-On Smart Contract Development with Solidity and Ethereum'](https://learning.oreilly.com/library/view/hands-on-smart-contract/9781492045250/) by Kevin Solorio, Randall Kanna, and David H. Hoover. The purpose of this smart contract is to facilitate decentralized fundraising.

## Project Overview


The project has undergone migration from Truffle and web3 to Hardhat and ethers due to the outdated status of Truffle and Ganache, which are currently in their sunset phase. Notable changes include the exclusion of the SafeMath library from OpenZeppelin, as Solidity 0.8 and later versions inherently implement overflow/underflow checks. This project ensures that developers can have an up-to-date code references from the mentioned book without concerns about outdated technologies.

## Running Tests and Deployment

To run the test suite, execute the following command:

```bash
npx hardhat test
```

Run a local node:
```bash
npx hardhat node
```

Deploy smart contract to the local node:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## Acknowledgments

A special thanks to the authors of the original book 'Hands-On Smart Contract Development with Solidity and Ethereum' for providing the foundation for this project.
