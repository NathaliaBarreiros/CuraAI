// FHEVM Instance Management for CuraAI
// Using the same approach as Zama's template
import { createFhevmInstance } from "./internal/fhevm";

type FhevmInstance = any; // Temporary type for now

let fhevmInstance: FhevmInstance | null = null;

export const getFhevmInstance = async (): Promise<FhevmInstance> => {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  try {
    // Use the same createFhevmInstance function as the Zama template
    // This handles all the complexity internally
    fhevmInstance = await createFhevmInstance({
      provider: "http://127.0.0.1:8545", // Hardhat local network
      signal: new AbortController().signal,
    });

    console.log("✅ FHEVM Instance created successfully (using Zama template approach)");
    return fhevmInstance;
  } catch (error) {
    console.error("❌ Failed to create FHEVM instance:", error);
    throw new Error(`FHEVM initialization failed: ${error}`);
  }
};

export const resetFhevmInstance = () => {
  fhevmInstance = null;
  console.log("🔄 FHEVM Instance reset");
};
