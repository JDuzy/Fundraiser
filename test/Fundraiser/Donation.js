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

    describe("Donation", function () {
        const donationValue = ethers.parseUnits('0.0289', 'ether');
    
        it("Should initialize myDonationsCount at 0", async function () {
          // Given
          const { fundraiser, donor } = await loadFixture(deployFundraiser);
          const fundraiserByDonor = fundraiser.connect(donor)
    
          // When
          const currentDonationCount = await fundraiserByDonor.myDonationsCount();
    
          // Then 
          expect(currentDonationCount).to.be.equals(0);
        }); 
    
        it("Should increase myDonationsCount", async function () {
          // Given
          const { fundraiser, donor } = await loadFixture(deployFundraiser);
          const fundraiserByDonor = fundraiser.connect(donor)
          const currentDonationCount = await fundraiserByDonor.myDonationsCount();
    
          // When
          await fundraiserByDonor.donate({value: donationValue});
    
          // Then 
          const newDonationsCount = await fundraiserByDonor.myDonationsCount();
          expect(newDonationsCount).to.be.equals(newDonationsCount - currentDonationCount);
        }); 
    
        it("Should include donation in myDonations", async function () {
          // Given
          const { fundraiser, donor } = await loadFixture(deployFundraiser);
          const fundraiserByDonor = fundraiser.connect(donor);
      
          // When
          await fundraiserByDonor.donate({ value: donationValue });
      
          // Then
          const result = await fundraiserByDonor.myDonations();
          const values = result[0];
          const dates = result[1];
          
          const actualValue = values[0];
          expect(actualValue).to.be.equal(donationValue);
      });
    
      it("Should increase the total donations amount", async function () {
        // Given
        const { fundraiser, donor } = await loadFixture(deployFundraiser);
        const fundraiserByDonor = fundraiser.connect(donor);
        const currentTotalDonations = await fundraiser.totalDonationsValue();
    
        // When
        await fundraiserByDonor.donate({ value: donationValue });
        const newTotalDonations = await fundraiser.totalDonationsValue();
    
        // Then
        const diff = newTotalDonations - currentTotalDonations;
        expect(diff).to.be.equal(donationValue);
      });
    
      it("Should increase the total donations count by one when donating", async function () {
        // Given
        const { fundraiser, donor } = await loadFixture(deployFundraiser);
        const fundraiserByDonor = fundraiser.connect(donor);
        const currentDonationsCount = await fundraiser.donationsCount();
    
        // When
        await fundraiserByDonor.donate({ value: donationValue });
        const newtDonationsCount = await fundraiser.donationsCount();
      
        // Then
        const diff = newtDonationsCount - currentDonationsCount;
        expect(diff).to.be.equal(1);
      });
    
      it("Should emit DonationReceived event when one donation is made", async function () {
        // Given
        const { fundraiser, donor } = await loadFixture(deployFundraiser);
        const fundraiserByDonor = fundraiser.connect(donor);
    
        // When
        const tx = await fundraiserByDonor.donate({ value: donationValue });
    
        // Then
        await expect(tx)
        .to.emit(fundraiser, "DonationReceived")
        .withArgs(donor.address, donationValue);
      });

      it("Should increase totalDonationsValue when fallback function is invoked", async function () {
        // Given
        const { fundraiser, donor } = await loadFixture(deployFundraiser);
        const currentTotalDonations = await fundraiser.totalDonationsValue();

        // When
        await donor.sendTransaction({
          to: fundraiser.target,
          value: donationValue,
      });
        
      // Then
        const newTotalDonations = await fundraiser.totalDonationsValue();
        const diff = newTotalDonations - currentTotalDonations;
        expect(diff).to.be.equal(donationValue)
      });

      it("Should increase donationsCount when fallback function is invoked", async function () {
        // Given
        const { fundraiser, donor } = await loadFixture(deployFundraiser);
        const currentDonationsCount = await fundraiser.donationsCount();

        // When
        await donor.sendTransaction({
          to: fundraiser.target,
          value: donationValue,
      });
        
      // Then
        const newtDonationsCount = await fundraiser.donationsCount();
        const diff = newtDonationsCount - currentDonationsCount;
        expect(diff).to.be.equal(1)
      });
    
    });
});