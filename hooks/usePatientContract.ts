// Custom hook for PatientDemographics contract interaction
import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { getFhevmInstance } from "../lib/fhevm/fhevmInstance";
import { PatientDemographicsABI } from "../lib/contracts/PatientDemographicsABI";
import { 
  FHEVM_CONFIG, 
  PatientData, 
  EncryptedPatientData, 
  DecryptedStatistics,
  GENDER_MAPPING,
  COUNTRY_MAPPING 
} from "../lib/fhevm/fhevmTypes";

export const usePatientContract = () => {
  const { wallets } = useWallets();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract and FHEVM instance
  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (!wallets || wallets.length === 0) return;

        const wallet = wallets[0];
        if (!wallet.address) return;

        // Get provider from wallet
        const ethereumProvider = await wallet.getEthereumProvider();
        const provider = new BrowserProvider(ethereumProvider);
        const signer = await provider.getSigner();

        // Use PatientDemographics ABI (we know the contract works from Hardhat console)
        const patientABI = [
          "function submitPatientData(bytes32 encryptedData, bytes calldata inputProof)",
          "function hasPatientData(address patientAddr) view returns (bool)",
          "function totalPatients() view returns (bytes32)"
        ];
        
        const contractInstance = new ethers.Contract(
          "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // PatientDemographics address that works
          patientABI,
          signer
        );

        // Initialize FHEVM instance
        const fhevm = await getFhevmInstance();

        setContract(contractInstance);
        setFhevmInstance(fhevm);

        // Following Zama template approach: no initial data verification
        // We'll check for existing data only when needed (e.g., before submission)

        console.log("✅ Contract and FHEVM initialized successfully");
      } catch (err) {
        console.error("❌ Failed to initialize contract:", err);
        setError(`Initialization failed: ${err}`);
      }
    };

    initializeContract();
  }, [wallets]);

  // Submit encrypted patient data
  const submitPatientData = useCallback(async (patientData: PatientData): Promise<boolean> => {
    console.log("🚀 submitPatientData called with:", patientData);
    console.log("🔧 Hook state:", { 
      hasContract: !!contract, 
      hasFhevmInstance: !!fhevmInstance, 
      hasWallet: !!wallets[0],
      contractAddress: contract?.target 
    });

    if (!contract || !fhevmInstance || !wallets[0]) {
      console.log("❌ Missing dependencies:", { contract: !!contract, fhevmInstance: !!fhevmInstance, wallet: !!wallets[0] });
      setError("Contract not initialized");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user already has data (this might be causing the revert)
      try {
        const hasData = await contract.hasPatientData(wallets[0].address);
        console.log("🔍 User already has data:", hasData);
        
        if (hasData) {
          setError("You have already submitted your data. Each user can only submit once.");
          return false;
        }
      } catch (checkError) {
        console.log("⚠️ Could not verify existing data, proceeding anyway:", checkError);
      }

      console.log("🔐 Encrypting patient data...", patientData);

      // EXACTLY like Zama template - single input with multiple fields
      console.log("🔐 Creating encrypted input (Zama template style)...");
      
      // Get the actual signer address instead of wallet address
      const ethereumProvider = await wallets[0].getEthereumProvider();
      const provider = new BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      
      console.log("🔑 Using signer address:", signerAddress);
      
      const input = fhevmInstance.createEncryptedInput(
        FHEVM_CONFIG.contractAddress,
        signerAddress  // Use actual signer address
      );
      
      // Pack all data into a single 32-bit value (like FHECounter)
      // Format: age (8 bits) + gender (8 bits) + country (16 bits)
      const packedData = patientData.age + (patientData.gender << 8) + (patientData.country << 16);
      console.log("📦 Packed data:", packedData, "=", {
        age: patientData.age,
        gender: patientData.gender << 8, 
        country: patientData.country << 16
      });
      
      input.add32(packedData);  // Single 32-bit value (like FHECounter)
      
      // Encrypt (like Zama template)
      const enc = await input.encrypt();

      console.log("✅ Data encrypted successfully");
      console.log("📋 Encrypted data structure:", {
        handles: enc.handles,
        proofLength: enc.inputProof.length
      });

      // Submit to PatientDemographics using submitPatientData (we know this works from console)
      console.log("📤 Calling contract.submitPatientData...");
      const tx = await contract.submitPatientData(
        enc.handles[0],     // packed data (single field like FHECounter)
        enc.inputProof      // single proof (like FHECounter)
      );

      console.log("📤 Transaction submitted:", tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.transactionHash);

      return true;

    } catch (err) {
      console.error("❌ Failed to submit patient data:", err);
      setError(`Submission failed: ${err}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contract, fhevmInstance, wallets]);

  // Get user's own encrypted data and decrypt it
  const getMyData = useCallback(async (): Promise<PatientData | null> => {
    if (!contract || !fhevmInstance || !wallets[0]) {
      return null;
    }

    // Check if user has data before trying to decrypt
    try {
      const hasData = await contract.hasPatientData(wallets[0].address);
      if (!hasData) {
        console.log("ℹ️ User has no data to decrypt");
        return null;
      }
    } catch (error) {
      console.error("❌ Error checking if user has data:", error);
      return null;
    }

    try {
      console.log("🔍 Fetching user's encrypted data...");

      // Get encrypted data from contract
      const encryptedData = await contract.getMyEncryptedData();
      
      // Generate signature for decryption
      const signature = await fhevmInstance.generateSignature(FHEVM_CONFIG.contractAddress);

      // Decrypt the data
      const decryptedValues = await fhevmInstance.userDecrypt([
        { handle: encryptedData.age, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedData.gender, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedData.countryCode, contractAddress: FHEVM_CONFIG.contractAddress }
      ], signature);

      const userData: PatientData = {
        age: decryptedValues[0],
        gender: decryptedValues[1],
        country: decryptedValues[2]
      };

      console.log("✅ User data decrypted successfully");
      return userData;

    } catch (err) {
      console.error("❌ Failed to get user data:", err);
      setError(`Failed to get user data: ${err}`);
      return null;
    }
  }, [contract, fhevmInstance, wallets]);

  // Get aggregated statistics (only for registered users)
  const getStatistics = useCallback(async (): Promise<DecryptedStatistics | null> => {
    if (!contract || !fhevmInstance || !wallets[0]) {
      return null;
    }

    // Check if user has submitted data before allowing access to statistics
    try {
      const hasData = await contract.hasPatientData(wallets[0].address);
      if (!hasData) {
        console.log("ℹ️ User must submit data before viewing statistics");
        return null;
      }
    } catch (error) {
      console.error("❌ Error checking if user has data:", error);
      return null;
    }

    try {
      console.log("📊 Fetching community statistics...");

      // Get encrypted statistics from contract
      const [encryptedStats, encryptedCountryStats] = await Promise.all([
        contract.getStatistics(),
        contract.getCountryStatistics()
      ]);

      // Generate signature for decryption
      const signature = await fhevmInstance.generateSignature(FHEVM_CONFIG.contractAddress);

      // Decrypt all statistics
      const decryptedValues = await fhevmInstance.userDecrypt([
        // General and gender stats
        { handle: encryptedStats.total, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.females, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.males, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.nonBinary, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.preferNotToSay, contractAddress: FHEVM_CONFIG.contractAddress },

        // Age group stats
        { handle: encryptedStats.age15_20, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.age21_30, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.age31_40, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.age41_50, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.age51_60, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedStats.age61Plus, contractAddress: FHEVM_CONFIG.contractAddress },

        // Country stats
        { handle: encryptedCountryStats.ecuador, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedCountryStats.argentina, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedCountryStats.brasil, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedCountryStats.us, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedCountryStats.canada, contractAddress: FHEVM_CONFIG.contractAddress },
        { handle: encryptedCountryStats.francia, contractAddress: FHEVM_CONFIG.contractAddress }
      ], signature);

      const statistics: DecryptedStatistics = {
        totalPatients: decryptedValues[0],
        genderStats: {
          female: decryptedValues[1],
          male: decryptedValues[2],
          nonBinary: decryptedValues[3],
          preferNotToSay: decryptedValues[4]
        },
        ageStats: {
          "15-20": decryptedValues[5],
          "21-30": decryptedValues[6],
          "31-40": decryptedValues[7],
          "41-50": decryptedValues[8],
          "51-60": decryptedValues[9],
          "61+": decryptedValues[10]
        },
        countryStats: {
          ecuador: decryptedValues[11],
          argentina: decryptedValues[12],
          brasil: decryptedValues[13],
          us: decryptedValues[14],
          canada: decryptedValues[15],
          francia: decryptedValues[16]
        }
      };

      console.log("✅ Statistics decrypted successfully");
      return statistics;

    } catch (err) {
      console.error("❌ Failed to get statistics:", err);
      setError(`Failed to get statistics: ${err}`);
      return null;
    }
  }, [contract, fhevmInstance, wallets]);

  return {
    contract,
    fhevmInstance,
    isLoading,
    error,
    submitPatientData,
    getMyData,
    getStatistics,
    clearError: () => setError(null)
  };
};
