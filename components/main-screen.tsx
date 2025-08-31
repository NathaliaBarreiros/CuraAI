"use client"
import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Stethoscope, User, Globe, Heart, Activity, Calendar } from "lucide-react"


type User = {
    email: string,
    name: string
    age: string
    nationality: string
    gender: string
  }


interface MainScreenProps {
  userInfo: User,
  setCurrentView: React.Dispatch<React.SetStateAction<"login" | "onboarding" | "main" | "dashboard">>
}

export default function MainScreen({ userInfo, setCurrentView }: MainScreenProps) {
  const { logout } = usePrivy()
  const [isInitializing, setIsInitializing] = useState(false)

  const handleInitAI = async () => {
    setIsInitializing(true)
    // Simulate AI initialization process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsInitializing(false)
    // TODO: Implement actual AI agent initialization
    console.log("AI Agent initialization would happen here")
  }

    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-full shadow-lg">
                <Heart className="h-12 w-12 text-cyan-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {userInfo.name}!</h1>
            <p className="text-xl text-gray-600">Your medical AI assistant is ready to help</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Profile</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">
                  {userInfo.name}, {userInfo.age} years old
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-cyan-600" />
                <span className="text-gray-700">{userInfo.nationality}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-6 px-12 rounded-full text-xl font-semibold hover:from-cyan-700 hover:to-purple-700 transition-all transform hover:scale-105 animate-pulse shadow-2xl">
              <Activity className="inline h-6 w-6 mr-3" />
              Init Medical AI Agent
            </button>
            <p className="mt-4 text-gray-600">Click to start your personalized medical consultation</p>

            <button
              onClick={() => setCurrentView("dashboard")}
              className="mt-8 text-cyan-600 hover:text-cyan-700 underline"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    )
}
