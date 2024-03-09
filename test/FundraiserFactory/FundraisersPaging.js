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
        FundraiserFactory,
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

    async function addFundraisers(factory, count, beneficary) {
        const name = "Beneficiary";
        const lowerCaseName = name.toLowerCase();
        beneficary;
        for (let i=0; i < count; i++) {
          await factory.createFundraiser(
            // create a series of fundraisers. The index will be used
            // to make them each unique
            `${name} ${i}`,
            `${lowerCaseName}${i}.com`,
            `${lowerCaseName}${i}.png`,
            `Description for ${name} ${i}`,
            beneficary
          );
        }
      }

    it("Given no fundraisers Should return an empty collection when createFundraiser", async function () {
        // Given
        const { fundraiserFactory } = await loadFixture(deployFundraiserFactory);

        // When
        const fundraisers = await fundraiserFactory.fundraisers(10, 0);

        // Then
        const newFundraisersCount = await fundraiserFactory.fundraisersCount();
        expect(fundraisers.length).to.be.equal(0);
    });

    describe("Given 30 fundraisers and fetch limit 20", async () => {

        const amount = 30;
        let beneficiary;
        let fundraiserFactory;
        let FundraiserFactory;

        beforeEach(async () => {
            const result = await loadFixture(deployFundraiserFactory);
            fundraiserFactory = result.fundraiserFactory;
            beneficiary = result.beneficiary;
            await addFundraisers(fundraiserFactory, amount, beneficiary);
        });

        it("And 10 page amount When funraisers fetched return 10", async () => {
            // Given
            // The fundraisers are already added in the beforeEach hook

            // When
            const fundraisers = await fundraiserFactory.fundraisers(10, 0);

            // Then
            expect(fundraisers.length).to.be.equal(10);
        });

        it("And 20 page amount When funraisers fetched then return 20", async () => {
            // Given
            // The fundraisers are already added in the beforeEach hook

            // When
            const fundraisers = await fundraiserFactory.fundraisers(20, 0);

            // Then
            expect(fundraisers.length).to.be.equal(20);
        });

        it("And 30 page limit When funraisers fetched then return 20", async () => {
            // Given
            // The fundraisers are already added in the beforeEach hook

            // When
            const fundraisers = await fundraiserFactory.fundraisers(20, 0);

            // Then
            expect(fundraisers.length).to.be.equal(20);
        });
    });

    describe("Varying offsets", async () => {
        let beneficiary;
        let fundraiserFactory;
        let FundraiserContract;
        
        beforeEach(async () => {
            const result = await deployFundraiserFactory();
            fundraiserFactory = result.fundraiserFactory;
            beneficiary = result.beneficiary;
        
            // Add fundraisers to the factory
            await addFundraisers(fundraiserFactory, 10, beneficiary);
        });
        
        it("contains the fundraiser with offset 0", async () => {
            const fundraisers = await fundraiserFactory.fundraisers(1, 0);
            const fundraiser = await ethers.getContractAt("Fundraiser", fundraisers[0]);
            const name = await fundraiser.name();
            expect(name.includes(0)).to.be.true;
        });
        
        it("contains the fundraiser with offset 7", async () => {
            const fundraisers = await fundraiserFactory.fundraisers(1, 7);
            const fundraiser = await ethers.getContractAt("Fundraiser", fundraisers[0]);
            const name = await fundraiser.name();
            expect(name.includes(7)).to.be.true;
        });
    });

    describe("Boundary Conditions", () => {
        let factory;
        let beneficary;
      
        beforeEach(async () => {
          const result = await deployFundraiserFactory();
          factory = result.fundraiserFactory;
          beneficary = result.beneficiary;
        });
      
        it("Should raise out of bounds error", async () => {
            // When
            const tx = factory.fundraisers(1, 11);
            
            // Then
            expect(tx).to.be.revertedWith("offset out of bounds");
        });
      
        it("Given 10 fundraisers when fetching for 10 with an offset of 5 then return only 5", async () => {
          // Given
          await addFundraisers(factory, 10, beneficary);
        
          // When
          const fundraisers = await factory.fundraisers(10, 5);

          // Then
          expect(fundraisers.length).to.equal(5);
        });
      });
});