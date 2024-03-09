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

    describe("Deployment", function () {
        it("Gets the beneficiary name", async function () {
          const { fundraiser, name } = await loadFixture(deployFundraiser);
          const actual = await fundraiser.name();
          expect(actual).to.equal(name);
        });
    
        it("Gets the beneficiary url", async function () {
          const { fundraiser, url } = await loadFixture(deployFundraiser);
          const actual = await fundraiser.url();
          expect(actual).to.equal(url);
        });
    
        it("Gets the beneficiary imageURL", async function () {
          const { fundraiser, imageURL } = await loadFixture(deployFundraiser);
          const actual = await fundraiser.imageURL();
          expect(actual).to.equal(imageURL);
        });
    
        it("Gets the beneficiary description", async function () {
          const { fundraiser, description } = await loadFixture(deployFundraiser);
          const actual = await fundraiser.description();
          expect(actual).to.equal(description);
        });
    
        it("Gets the beneficiary", async function () {
          const { fundraiser, beneficiary } = await loadFixture(deployFundraiser);
          const actual = await fundraiser.beneficiary();
          expect(actual).to.equal(beneficiary);
        });
    
        it("Gets the custodian", async function () {
          const { fundraiser, custodian } = await loadFixture(deployFundraiser);
          const actual = await fundraiser.owner();
          expect(actual).to.equal(custodian);
        });
      });
});