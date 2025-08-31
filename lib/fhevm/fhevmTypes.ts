// FHEVM Types and Configuration for CuraAI
import { FhevmInstance } from "fhevmjs";

export interface PatientData {
  age: number;
  gender: number; // 1=Female, 2=Male, 3=Non-binary, 4=Prefer not to say
  country: number; // 1=Ecuador, 2=Argentina, 3=Brasil, 4=US, 5=Canada, 6=Francia
}

export interface EncryptedPatientData {
  age: string; // encrypted euint8
  gender: string; // encrypted euint8
  country: string; // encrypted euint16
}

export interface DecryptedStatistics {
  totalPatients: number;
  genderStats: {
    female: number;
    male: number;
    nonBinary: number;
    preferNotToSay: number;
  };
  ageStats: {
    "15-20": number;
    "21-30": number;
    "31-40": number;
    "41-50": number;
    "51-60": number;
    "61+": number;
  };
  countryStats: {
    ecuador: number;
    argentina: number;
    brasil: number;
    us: number;
    canada: number;
    francia: number;
  };
}

export interface FHEVMConfig {
  contractAddress: string;
  chainId: number;
  rpcUrl: string;
}

// Default configuration for local development
export const FHEVM_CONFIG: FHEVMConfig = {
  contractAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // PatientDemographics contract (newly deployed)
  chainId: 31337, // Hardhat local network
  rpcUrl: "http://127.0.0.1:8545",
};

// Gender mapping
export const GENDER_MAPPING = {
  "Female": 1,
  "Male": 2,
  "Non-binary": 3,
  "Prefer not to say": 4,
} as const;

// Country mapping (matches smart contract)
export const COUNTRY_MAPPING = {
  "Ecuador": 1,
  "Argentina": 2,
  "Brasil": 3,
  "United States": 4,
  "Canada": 5,
  "Francia": 6,
} as const;

// Reverse mappings for display
export const GENDER_LABELS = {
  1: "Female",
  2: "Male", 
  3: "Non-binary",
  4: "Prefer not to say",
} as const;

export const COUNTRY_LABELS = {
  1: "🇪🇨 Ecuador",
  2: "🇦🇷 Argentina",
  3: "🇧🇷 Brasil", 
  4: "🇺🇸 United States",
  5: "🇨🇦 Canada",
  6: "🇫🇷 Francia",
} as const;

export type GenderCode = keyof typeof GENDER_LABELS;
export type CountryCode = keyof typeof COUNTRY_LABELS;
