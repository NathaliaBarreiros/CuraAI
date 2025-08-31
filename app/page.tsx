"use client"

import { useEffect, useState } from "react"
import { Stethoscope, User, Globe, Heart, Activity, Calendar } from "lucide-react"
import { usePrivy, useLoginWithEmail, useLogin } from '@privy-io/react-auth'
import Dashboard from "@/components/dashboard"
import OnboardingForm from "@/components/onboarding-form"
import MainScreen from "@/components/main-screen"

export default function Home() {
  const [currentView, setCurrentView] = useState<"login" | "onboarding" | "main" | "dashboard">("login")

  // Simplified Privy hooks - only need usePrivy
  const { ready, authenticated, user, logout } = usePrivy()

  const [userInfo, setFormData] = useState({
    email: "",
    name: "",
    age: "",
    nationality: "",
    gender: "",
  })
const { login } = useLogin({
        onComplete: ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount }) => {
            console.log('User logged in successfully', user);
            console.log('Is new user:', isNewUser);
            console.log('Was already authenticated:', wasAlreadyAuthenticated);
            console.log('Login method:', loginMethod);
            console.log('Login account:', loginAccount);
            // Navigate to dashboard, show welcome message, etc.
      if (user.email?.address === "ledesma.nando@yahoo.com") {
	      console.log("----------go to onboarding")
        setCurrentView("onboarding")
      } else {
	      console.log("----------go to dashboard")
        setCurrentView("dashboard")
      }

      setFormData((prev) => ({ ...prev, email: user.email?.address || "" }))
        },
        onError: (error) => {
            console.error('Login failed', error);
            // Show error message
        }
    });

  const handleLogin = () => {
    // if (email === "test1@test.com") {
    //   setCurrentView("onboarding")
    // } else {
    //   setCurrentView("dashboard")
    // }
    // setUserInfo((prev) => ({ ...prev, email }))
    login()
  }

  // If user is already authenticated, determine which view to show

  // Wait for Privy to be ready before rendering
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (currentView === "login" && !authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-cyan-100 rounded-full">
                <Stethoscope className="h-8 w-8 text-cyan-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome to MedAI</h2>
            <p className="mt-2 text-gray-600">Your trusted medical AI companion</p>
          </div>
	  <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-[1.02]"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (currentView === "onboarding") {

return <OnboardingForm 
  onComplete={setFormData}
  formData={userInfo}
  setCurrentView={setCurrentView}
 />
  }

  if (currentView === "main") {
	  return <MainScreen
		  userInfo={userInfo}
		  setCurrentView={setCurrentView}
		  />
	  
  }

return <Dashboard 
  userData={userInfo}
  // onSignOut={handleLogout}
  // onViewMain={() => setCurrentView("main")}
  // ... other props
 />

}
