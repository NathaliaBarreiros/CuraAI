"use client"

import type React from "react"

import {useCallback, useEffect, useState } from "react"
import { usePrivy } from '@privy-io/react-auth'
import { useAccount, useSignMessage } from "wagmi"
import { deriveEncryptionKeyFromPrivyPrivateKey, deriveEncryptionKeyFromSignature, maskHexPreview } from "@/lib/utils"

type User = {
    email: string,
    name: string
    age: string
    nationality: string
    gender: string
  }

interface OnboardingFormProps {
  onComplete: React.Dispatch<React.SetStateAction<User>>,
  formData: User,
  setCurrentView: React.Dispatch<React.SetStateAction<"login" | "onboarding" | "main" | "dashboard">>
}

const nationalities = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Japan",
  "South Korea",
  "Singapore",
  "India",
  "Brazil",
  "Mexico",
  "Argentina",
  "Other",
]

const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"]

export default function OnboardingForm({ onComplete, formData, setCurrentView }: OnboardingFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [derived, setDerived] = useState<string>("")

  const { user, authenticated, ready } = usePrivy()

  const { signMessageAsync } = useSignMessage()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    const age = Number.parseInt(formData.age)
    if (!formData.age || isNaN(age) || age < 18 || age > 120) {
      newErrors.age = "Age must be between 18 and 120"
    }

    if (!formData.nationality) {
      newErrors.nationality = "Please select your nationality"
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onComplete({
      email: formData.email.trim(),
      name: formData.name.trim(),
      age: formData.age,
      nationality: formData.nationality,
      gender: formData.gender,
    })

    setIsSubmitting(false)
  }

      const { address } = useAccount()
      const handleDerive = async () =>  {
	      if (!address) throw new Error("Connect/login first to derive key")

		      const message = `Generate encryption key for ShadowVault session`
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
	  console.log("==========================")
    onComplete((prev) => ({ ...prev, ...data }))
    handleDerive().then(result => {
	    console.log("------------------------ this is the key for zama", result)
    })

    //TODO connectWithZama()
    setCurrentView("main")
  }

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
                nationality: formData.get("nationality"),
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <select
                name="nationality"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select your nationality</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="Other">Other</option>
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-[1.02]"
            >
              Complete Profile
            </button>
          </form>
        </div>
      </div>
    )
}
