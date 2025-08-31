"use client"

import type React from "react"

import {useCallback, useEffect, useState } from "react"
import { usePrivy } from '@privy-io/react-auth'
import { useAccount, useSignMessage } from "wagmi"
import { deriveEncryptionKeyFromPrivyPrivateKey, deriveEncryptionKeyFromSignature, maskHexPreview } from "@/lib/utils"
// COMMENTED OUT: FHEVM-related imports for basic testing
// import { usePatientContract } from "../hooks/usePatientContract"
// import { mapFormDataToNumbers, validatePatientData } from "../lib/utils/dataMapping"

type User = {
    email: string,
    name: string
    age: string
    country: string
    gender: string
  }

interface OnboardingFormProps {
  onComplete: React.Dispatch<React.SetStateAction<User>>,
  formData: User,
  setCurrentView: React.Dispatch<React.SetStateAction<"login" | "onboarding" | "main" | "dashboard">>
}



export default function OnboardingForm({ onComplete, formData, setCurrentView }: OnboardingFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fheStatus, setFheStatus] = useState<string>("")

  const { user, authenticated, ready } = usePrivy()
  const { signMessageAsync } = useSignMessage()
  
  // FHEVM integration - COMMENTED OUT FOR BASIC TESTING
  // const { 
  //   submitPatientData, 
  //   isLoading: fheLoading, 
  //   error: fheError, 
  //   hasSubmittedData 
  // } = usePatientContract()

  const { address } = useAccount()
  
  const handleDerive = async () => {
    if (!address) throw new Error("Connect/login first to derive key")

    const message = `Generate encryption key for CuraAI session`
    console.log('[EncryptionSetup] Message to sign:', message)
    console.log('[EncryptionSetup] User address:', address)

    const sig = await signMessageAsync({ message })
    console.log('[EncryptionSetup] Signature received:', sig)

    const { rawKey, base64Key } = await deriveEncryptionKeyFromSignature(sig, address)
    console.log('[EncryptionSetup] Raw key (first 8 bytes):', Array.from(rawKey.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(''))
    console.log('[EncryptionSetup] Derived key (base64):', base64Key)

    // setDerived(base64Key)
    return base64Key
  }

  const handleOnboardingSubmit = async (data: any) => {
    console.log("📝 Starting basic profile completion...")
    
    try {
      // Basic validation (no FHEVM for now)
      if (!data.name || !data.age || !data.gender || !data.country) {
        setErrors({ general: "Please fill in all required fields" });
        return;
      }

      setFheStatus("🔐 Generating encryption key...");
      
      // Just derive the encryption key and complete the profile
      const encryptionKey = await handleDerive();
      console.log("🔑 Encryption key derived:", encryptionKey);

      setFheStatus("✅ Profile completed successfully!");
      console.log("🎉 Basic profile completion successful");
      
      // Complete the onboarding process
      onComplete((prev) => ({ ...prev, ...data }));

      // Navigate to main view
      setCurrentView("main");
      
    } catch (error) {
      console.error("❌ Profile completion error:", error);
      setFheStatus("❌ Failed to complete profile");
      setErrors({ general: `Error: ${error}` });
    }
  }

  // COMMENTED OUT: Original FHEVM encryption process
  // const handleOnboardingSubmitWithFHEVM = async (data: any) => {
  //   console.log("🔐 Starting FHE encryption process...")
  //   
  //   try {
  //     // Validate form data
  //     const validation = validatePatientData(data);
  //     if (!validation.isValid) {
  //       setErrors(validation.errors.reduce((acc, error) => ({ ...acc, general: error }), {}));
  //       return;
  //     }

  //     setFheStatus("🔐 Encrypting data...");
  //     
  //     // Convert form data to numeric format for FHE
  //     const patientData = mapFormDataToNumbers(data);
  //     console.log("📊 Patient data for encryption:", patientData);

  //     // Submit encrypted data to blockchain
  //     const success = await submitPatientData(patientData);
  //     
  //     if (success) {
  //       setFheStatus("✅ Data encrypted and stored successfully!");
  //       console.log("🎉 FHE encryption completed successfully");
  //       
  //       // Complete the onboarding process
  //       onComplete((prev) => ({ ...prev, ...data }));
  //       
  //       // Still derive the key for Filecoin (as mentioned by user)
  //       handleDerive().then(result => {
  //         console.log("🔑 Filecoin encryption key derived:", result);
  //       });

  //       // Navigate to main view
  //       setCurrentView("main");
  //     } else {
  //       setFheStatus("❌ Failed to encrypt and store data");
  //       setErrors({ general: "Failed to encrypt data. Please try again." });
  //     }
  //     
  //   } catch (error) {
  //     console.error("❌ FHE encryption error:", error);
  //     setFheStatus("❌ Encryption failed");
  //     setErrors({ general: `Encryption error: ${error}` });
  //   }
  // }

    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="text-gray-600 mt-2">Help us personalize your medical AI experience</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleOnboardingSubmit({
                name: formData.get("name"),
                age: formData.get("age"),
                country: formData.get("country"),
                gender: formData.get("gender"),
              })
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                name="age"
                type="number"
                min="18"
                max="120"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                name="country"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select your country</option>
                <option value="1">🇪🇨 Ecuador</option>
                <option value="2">🇦🇷 Argentina</option>
                <option value="3">🇧🇷 Brasil</option>
                <option value="4">🇺🇸 United States</option>
                <option value="5">🇨🇦 Canada</option>
                <option value="6">🇫🇷 Francia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select your gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* FHE Status and Error Display */}
            {fheStatus && (
              <div className={`p-3 rounded-lg text-sm ${
                fheStatus.includes("✅") 
                  ? "bg-green-100 text-green-800" 
                  : fheStatus.includes("❌") 
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}>
                {fheStatus}
              </div>
            )}

            {errors.general && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* COMMENTED OUT: FHEVM error display
            {fheError && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                FHE Error: {fheError}
              </div>
            )}
            */}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg transition-all transform bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 hover:scale-[1.02] text-white"
            >
              Complete Profile
            </button>
          </form>
        </div>
      </div>
    )
}
