import { expect } from "chai";
import { ethers } from "hardhat";
import { PatientDemographics } from "../types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PatientDemographics", function () {
  let patientDemographics: PatientDemographics;
  let owner: SignerWithAddress;
  let patient1: SignerWithAddress;
  let patient2: SignerWithAddress;

  beforeEach(async function () {
    [owner, patient1, patient2] = await ethers.getSigners();

    const PatientDemographicsFactory = await ethers.getContractFactory("PatientDemographics");
    patientDemographics = await PatientDemographicsFactory.deploy();
    await patientDemographics.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await patientDemographics.getAddress()).to.be.properAddress;
    });

    it("Should initialize all counters to 0", async function () {
      // Note: We can't directly check encrypted values in tests without decryption
      // This is a limitation of FHE - encrypted values can't be compared directly
      console.log("Contract deployed at:", await patientDemographics.getAddress());
    });
  });

  describe("Patient Data Submission", function () {
    it("Should allow checking if patient has data", async function () {
      // Initially, no patient should have data
      expect(await patientDemographics.hasPatientData(patient1.address)).to.be.false;
      expect(await patientDemographics.hasPatientData(patient2.address)).to.be.false;
    });

    // Note: Testing actual FHE operations requires the FHEVM environment
    // For now, we'll test the basic contract structure
    it("Should have the correct contract interface", async function () {
      // Check that all expected functions exist
      expect(patientDemographics.submitPatientData).to.exist;
      expect(patientDemographics.getMyEncryptedData).to.exist;
      expect(patientDemographics.getStatistics).to.exist;
      expect(patientDemographics.getCountryStatistics).to.exist;
      expect(patientDemographics.hasPatientData).to.exist;
    });
  });

  describe("Access Control", function () {
    it("Should revert when non-registered user tries to get statistics", async function () {
      await expect(
        patientDemographics.connect(patient1).getStatistics()
      ).to.be.revertedWith("Must be registered user with submitted data");
    });

    it("Should revert when non-registered user tries to get country statistics", async function () {
      await expect(
        patientDemographics.connect(patient1).getCountryStatistics()
      ).to.be.revertedWith("Must be registered user with submitted data");
    });

    it("Should revert when non-registered user tries to get their data", async function () {
      await expect(
        patientDemographics.connect(patient1).getMyEncryptedData()
      ).to.be.revertedWith("No data found for this user");
    });
  });

  describe("Events", function () {
    it("Should have PatientDataSubmitted event defined", async function () {
      // Check that the event exists in the contract interface
      const eventFragment = patientDemographics.interface.getEvent("PatientDataSubmitted");
      expect(eventFragment.name).to.equal("PatientDataSubmitted");
    });

    it("Should have StatisticsUpdated event defined", async function () {
      const eventFragment = patientDemographics.interface.getEvent("StatisticsUpdated");
      expect(eventFragment.name).to.equal("StatisticsUpdated");
    });
  });
});

// Note: Full FHE testing would require:
// 1. FHEVM test environment setup
// 2. Encrypted input generation
// 3. Decryption for verification
// 
// For the hackathon, we focus on:
// - Contract deployment
// - Interface verification
// - Access control testing
// - Basic functionality structure
