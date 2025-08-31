"use client"

import { Stethoscope, User, Globe, Heart, Activity, Calendar } from "lucide-react"
import { useState } from "react"
// import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
// import { Badge } from "@/components/ui/badge"
import { usePrivy } from "@privy-io/react-auth"

import {useAccount} from 'wagmi';
import { Badge } from "./badge"
import { Button } from "./button";

const WalletAddress = () => {
  const {address} = useAccount();
  return <p>Wallet address: {address}</p>;
}

interface DashboardProps {
  userData: {
    email: string
    name: string
    age: string
    nationality: string
    gender: string
  } | null,
  setCurrentView: React.Dispatch<React.SetStateAction<"login" | "onboarding" | "main" | "dashboard">>
}

// Mock session data
const mockSessions = [
  {
    id: "1",
    date: "2024-01-15",
    time: "10:30 AM",
    type: "General Consultation",
    duration: "15 min",
    status: "completed",
    summary: "Discussed symptoms and received personalized health recommendations",
  },
  {
    id: "2",
    date: "2024-01-12",
    time: "2:15 PM",
    type: "Medication Review",
    duration: "8 min",
    status: "completed",
    summary: "Reviewed current medications and potential interactions",
  },
  {
    id: "3",
    date: "2024-01-08",
    time: "9:45 AM",
    type: "Symptom Analysis",
    duration: "12 min",
    status: "completed",
    summary: "AI analysis of reported symptoms with care recommendations",
  },
  {
    id: "4",
    date: "2024-01-05",
    time: "4:20 PM",
    type: "Health Check-in",
    duration: "6 min",
    status: "completed",
    summary: "Routine health status check and wellness tips",
  },
  {
    id: "5",
    date: "2024-01-03",
    time: "11:00 AM",
    type: "Initial Assessment",
    duration: "20 min",
    status: "completed",
    summary: "Comprehensive health profile setup and baseline assessment",
  },
]

export default function Dashboard({ userData, setCurrentView }: DashboardProps) {
  const { logout } = usePrivy()
  const [isInitializing, setIsInitializing] = useState(false)


  const userLogout = () => {
	  logout()
	  setCurrentView("login")
  }

  const handleInitAI = async () => {
    setIsInitializing(true)
    // Simulate AI initialization process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsInitializing(false)
    // TODO: Implement actual AI agent initialization
    console.log("AI Agent initialization would happen here")
  }

  


  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical AI Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userData?.email}</p>
          </div>
          <button
            onClick={userLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
	  <WalletAddress/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Sessions</h2>
              <div className="space-y-4">
                {[
                  { date: "2024-01-15", type: "General Consultation", duration: "15 min", status: "Completed" },
                  { date: "2024-01-10", type: "Symptom Analysis", duration: "22 min", status: "Completed" },
                  { date: "2024-01-05", type: "Health Check", duration: "18 min", status: "Completed" },
                ].map((session, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{session.type}</h3>
                        <p className="text-gray-600 text-sm">
                          {session.date} • {session.duration}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Start New Session</h3>
              <button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-4 px-6 rounded-full text-lg font-semibold hover:from-cyan-700 hover:to-purple-700 transition-all transform hover:scale-105">
                <Activity className="inline h-5 w-5 mr-2" />
                Init Medical AI Agent
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <Calendar className="inline h-4 w-4 mr-2 text-cyan-600" />
                  Schedule Appointment
                </button>
                <button 
		onClick={() => setCurrentView("onboarding")}
		className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <User className="inline h-4 w-4 mr-2 text-cyan-600" />
                  Update Profile
                </button>
                <button
                  onClick={() => setCurrentView("main")}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  <Heart className="inline h-4 w-4 mr-2 text-cyan-600" />
                  View Main Screen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
