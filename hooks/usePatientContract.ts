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

        // Create contract instance
        const contractInstance = new ethers.Contract(
          FHEVM_CONFIG.contractAddress,
          PatientDemographicsABI.abi,
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

      // Encrypt each field separately (following Zama template approach)
      console.log("🔐 Creating separate encrypted inputs for each field...");
      
      // Create separate inputs for each field
      const ageInput = fhevmInstance.createEncryptedInput(
        FHEVM_CONFIG.contractAddress,
        wallets[0].address
      );
      ageInput.add8(patientData.age);
      const encryptedAge = await ageInput.encrypt();

      const genderInput = fhevmInstance.createEncryptedInput(
        FHEVM_CONFIG.contractAddress,
        wallets[0].address
      );
      genderInput.add8(patientData.gender);
      const encryptedGender = await genderInput.encrypt();

      const countryInput = fhevmInstance.createEncryptedInput(
        FHEVM_CONFIG.contractAddress,
        wallets[0].address
      );
      countryInput.add16(patientData.country);
      const encryptedCountry = await countryInput.encrypt();

      console.log("✅ All fields encrypted successfully");
      console.log("📋 Encrypted data structure:", {
        age: { handle: encryptedAge.handles[0], proofLength: encryptedAge.inputProof.length },
        gender: { handle: encryptedGender.handles[0], proofLength: encryptedGender.inputProof.length },
        country: { handle: encryptedCountry.handles[0], proofLength: encryptedCountry.inputProof.length }
      });

      // Submit to smart contract using external encrypted inputs (following Zama template)
      console.log("📤 Calling contract.submitPatientData...");
      const tx = await contract.submitPatientData(
        encryptedAge.handles[0],     // externalEuint8 for age
        encryptedAge.inputProof,     // age proof
        encryptedGender.handles[0],  // externalEuint8 for gender
        encryptedGender.inputProof,  // gender proof
        encryptedCountry.handles[0], // externalEuint16 for country
        encryptedCountry.inputProof  // country proof
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
