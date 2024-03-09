const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
describe("FundraiserFactory", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFundraiserFactory() {
      const name = "Beneficiary Name"
      const url = "beneficiaryname.org";
      const imageURL = "https://placekitten.com/600/350";
      const description = "Beneficiary description";

      // Contracts are deployed using the first signer/account by default
      const [custodian, beneficiary, donor, otherAccount] = await ethers.getSigners();
    
      const FundraiserFactory = await ethers.getContractFactory("FundraiserFactory", custodian);
      const fundraiserFactory = await FundraiserFactory.deploy();
      return { 
        fundraiserFactory,
        name,
        url,
        imageURL,
        description,
        beneficiary,
        custodian,
        donor,
        otherAccount
      };
    }

    it("Has been deployed", async function () {
        const { fundraiserFactory } = await loadFixture(deployFundraiserFactory);
        
    });

    it("Should increment the fundraisersCount", async function () {
        // Given
        const { 
            fundraiserFactory,
            name,
            url,
            imageURL,
            description,
            beneficiary
        } = await loadFixture(deployFundraiserFactory);
        const previousFundraisersCount = await fundraiserFactory.fundraisersCount();
        // When
        await fundraiserFactory.createFundraiser(
            name,
            url,
            imageURL,
            description,
            beneficiary
        );

        // Then
        const newFundraisersCount = await fundraiserFactory.fundraisersCount();
        expect(newFundraisersCount - previousFundraisersCount).to.be.equal(1);
    });

    it("Should emit DonationReceived event when one donation is made", async function () {
        // Given
        const { 
            fundraiserFactory,
            name,
            url,
            imageURL,
            description,
            beneficiary
        } = await loadFixture(deployFundraiserFactory);

        // When
        const tx = fundraiserFactory.createFundraiser(
            name,
            url,
            imageURL,
            description,
            beneficiary
            );

        // Then
        await expect(tx)
        .to.emit(fundraiserFactory, "FundraiserCreated")
    });
});