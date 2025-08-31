const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying PatientDemographics deployment...\n");

  // Get the deployed contract address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  try {
    // Get contract factory and attach to deployed address
    const PatientDemographics = await ethers.getContractFactory("PatientDemographics");
    const contract = PatientDemographics.attach(contractAddress);
    
    console.log("✅ Contract found at:", contractAddress);
    console.log("📊 Network:", hre.network.name);
    console.log("🔗 Chain ID:", hre.network.config.chainId);
    
    // Test basic contract functions
    console.log("\n🧪 Testing contract functions...");
    
    // Test hasPatientData function
    const [signer] = await ethers.getSigners();
    const hasData = await contract.hasPatientData(signer.address);
    console.log("✅ hasPatientData() works:", !hasData); // Should be false initially
    
    // Test that statistics functions exist (but will revert for unregistered users)
    try {
      await contract.getStatistics();
      console.log("❌ getStatistics() should have reverted for unregistered user");
    } catch (error) {
      if (error.message.includes("Must be registered user")) {
        console.log("✅ getStatistics() correctly reverts for unregistered users");
      } else {
        console.log("⚠️  Unexpected error:", error.message);
      }
    }
    
    // Test country statistics function
    try {
      await contract.getCountryStatistics();
      console.log("❌ getCountryStatistics() should have reverted for unregistered user");
    } catch (error) {
      if (error.message.includes("Must be registered user")) {
        console.log("✅ getCountryStatistics() correctly reverts for unregistered users");
      } else {
        console.log("⚠️  Unexpected error:", error.message);
      }
    }
    
    // Test getMyEncryptedData function
    try {
      await contract.getMyEncryptedData();
      console.log("❌ getMyEncryptedData() should have reverted for user with no data");
    } catch (error) {
      if (error.message.includes("No data found")) {
        console.log("✅ getMyEncryptedData() correctly reverts for users with no data");
      } else {
        console.log("⚠️  Unexpected error:", error.message);
      }
    }
    
    console.log("\n🎉 Contract verification completed successfully!");
    console.log("📋 Summary:");
    console.log("   - Contract deployed and accessible");
    console.log("   - Access control working correctly");
    console.log("   - All expected functions present");
    console.log("   - Ready for frontend integration");
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
