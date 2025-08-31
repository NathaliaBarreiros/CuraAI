import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // Deploy PatientDemographics contract
  const deployedPatientDemographics = await deploy("PatientDemographics", {
    from: deployer,
    log: true,
  });

  console.log(`PatientDemographics contract deployed at: ${deployedPatientDemographics.address}`);
  
  // Log deployment info for frontend integration
  console.log("\n=== DEPLOYMENT INFO FOR FRONTEND ===");
  console.log(`Contract Address: ${deployedPatientDemographics.address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${hre.network.config.chainId}`);
  console.log("=====================================\n");
};

export default func;
func.id = "deploy_patientDemographics";
func.tags = ["PatientDemographics"];