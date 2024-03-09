const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
describe("Fundraiser", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployFundraiser() {
      const name = "Beneficiary Name"
      const url = "beneficiaryname.org";
      const imageURL = "https://placekitten.com/600/350";
      const description = "Beneficiary description";
      
      // Contracts are deployed using the first signer/account by default
      const [custodian, beneficiary, donor, otherAccount] = await ethers.getSigners();
    
      const Fundraiser = await ethers.getContractFactory("Fundraiser", custodian);
      const fundraiser = await Fundraiser.deploy(name, url, imageURL, description, beneficiary, custodian);
      return { 
        fundraiser,
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

    describe("setBeneficiary", function () {
        it("Should update beneficiary when called by owner account", async function () {
          // Given
          const { fundraiser, owner, otherAccount } = await loadFixture(deployFundraiser);
        
          // When
          await fundraiser.setBeneficiary(otherAccount.address);
    
          // Then
          const actualBeneficiary = await fundraiser.beneficiary();
          expect(actualBeneficiary).to.equal(otherAccount.address);
        });
    
        it("Should throw error when called from a non-owner account", async function () {
          // Given
          const { fundraiser, otherAccount } = await loadFixture(deployFundraiser);
          
          // When // Then
          await expect(
            fundraiser.connect(otherAccount).setBeneficiary(otherAccount)
          ).to.be.revertedWithCustomError(
            fundraiser,
            "OwnableUnauthorizedAccount"
            ).withArgs(otherAccount.address);
        });
      });

});