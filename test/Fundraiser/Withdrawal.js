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

    describe("Withdrawal", function () {
        const donationValue = ethers.parseUnits('0.0289', 'ether');

        it("Should throw error when called from a non custodian account", async function () {
            // Given
            const { fundraiser, donor, otherAccount } = await loadFixture(deployFundraiser);
            await fundraiser.connect(donor).donate({ value: donationValue });
        
            // When
            const withdrawTransaction = fundraiser.connect(otherAccount).withdraw();
        
            // Then
            await expect(withdrawTransaction)
                .to.be.revertedWithCustomError(fundraiser, "OwnableUnauthorizedAccount")
                .withArgs(otherAccount.address);
        });

        it("Should withdraw amount if called from owner account", async function () {
            // Given
            const { fundraiser, donor, custodian } = await loadFixture(deployFundraiser);
            await fundraiser.connect(donor).donate({value: donationValue});

            // Then
            await fundraiser.connect(custodian).withdraw()
        }); 

        it("Given 0 balance Should throw error when custodian withdraws", async function () {
            // Given
            const { fundraiser, donor, custodian } = await loadFixture(deployFundraiser);
            // Then
            const withdrawTransaction = fundraiser.connect(custodian).withdraw()

            await expect(withdrawTransaction)
            .to.be.revertedWith("No funds to withdraw");
        }); 

        it("Should transfer balance to beneficiary when custodian withdraws", async function () {
            // Given
            const { fundraiser, beneficiary, custodian, donor } = await loadFixture(deployFundraiser);
            await fundraiser.connect(donor).donate({ value: donationValue });
            const previousContractBalance = await ethers.provider.getBalance(fundraiser.target);
            const previousBeneficiaryBalance = await ethers.provider.getBalance(beneficiary.address);
        
            // when
            await fundraiser.connect(custodian).withdraw();
            
            // Then
            const newContractBalance = await ethers.provider.getBalance(fundraiser.target);
            const newBeneficiaryBalance = await ethers.provider.getBalance(beneficiary.address);
            const beneficiaryDifference = newBeneficiaryBalance - previousBeneficiaryBalance;
            expect(newContractBalance).to.be.equal(0);
            expect(previousContractBalance).to.be.equal(beneficiaryDifference);
        });

        it("Should emit Withdraw event when custodian withdraws", async function () {
            // Given
            const { fundraiser, beneficiary, custodian, donor } = await loadFixture(deployFundraiser);
            await fundraiser.connect(donor).donate({ value: donationValue });
        
            // when
            const tx = await fundraiser.connect(custodian).withdraw();
    
            // Then
            await expect(tx)
            .to.emit(fundraiser, "Withdraw")
            .withArgs(donationValue);
        });
    });
});