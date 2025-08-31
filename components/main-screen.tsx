"use client"
import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Stethoscope, User, Globe, Heart, Activity, Calendar } from "lucide-react"
import { useWebSocketAudio } from "@/hooks/useWebSocketAudio"
import { Mic, MicOff, Volume2} from 'lucide-react'
import { useAccount, useSignMessage } from "wagmi"
import { deriveEncryptionKeyFromSignature } from "@/lib/utils"


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
  const [isAIActive, setIsAIActive] = useState(false)
  const { signMessageAsync } = useSignMessage()
// <CHANGE> Added WebSocket audio functionality with connection callbacks
const { isConnected, isRecording, isPlaying, connect, disconnect, startRecording, stopRecording } = useWebSocketAudio(
  {
    serverUrl: "ws://localhost:8080/audio",
    onConnectionOpen: () => {
      console.log("[v0] Audio WebSocket connected successfully")
      setIsAIActive(true)
    },
    onConnectionClose: () => {
      console.log("[v0] Audio WebSocket disconnected")
      setIsAIActive(false)
    },
    onError: (error) => {
      console.error("[v0] WebSocket audio error:", error)
      setIsInitializing(false)
      setIsAIActive(false)
    },
  },
)

// <CHANGE> Replaced mock initialization with real WebSocket connection
const handleInitAI = async () => {
  setIsInitializing(true)

  try {
    console.log("[v0] Initializing Medical AI Agent with audio communication...")
    await connect()
    console.log("[v0] Medical AI Agent initialized successfully")
  } catch (error) {
    console.error("[v0] Failed to initialize AI Agent:", error)
    alert("Failed to initialize AI Agent. Please check your connection and try again.")
  } finally {
    setIsInitializing(false)
  }
}
// <CHANGE> Added microphone recording control
const handleMicToggle = async () => {
  if (!isConnected) {
    alert("AI Agent not connected. Please initialize first.")
    return
  }

  try {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  } catch (error) {
    console.error("[v0] Failed to toggle microphone:", error)
    alert("Failed to access microphone. Please check permissions.")
  }
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

const sendData = async (info: String) => {
    try {
      const response = await fetch('http://localhost:8000/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ myString: info }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      // Handle the successful response
    } catch (error) {
      console.error('Error sending data:', error);
      // Handle any errors
    }
  };

const stopAgent = async () => {
      disconnect()
      setIsAIActive(false)
    handleDerive().then(result => {
      sendData(result)
    })
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
{/* Call to Action Section */}
          <div className="space-y-6 pt-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-balance">
                {isAIActive ? "AI Agent Ready" : "Ready to Get Started?"}
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto text-balance">
                {isAIActive
                  ? "Your AI agent is connected and ready for voice interaction."
                  : "Initialize your personal medical AI agent to begin receiving personalized health insights and recommendations."}
              </p>
            </div>

            <div className="flex justify-center">
              {!isAIActive ? (
                <button
                  onClick={handleInitAI}
                  disabled={isInitializing}
                  className="relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none"
                >
                  {isInitializing ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Initializing AI Agent...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5" />
                      Init Medical AI Agent
                    </div>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleMicToggle}
                    disabled={isPlaying}
                    className={`px-12 py-6 text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {isRecording ? (
                      <div className="flex items-center gap-3">
                        <MicOff className="w-5 h-5" />
                        Stop Recording
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Mic className="w-5 h-5" />
                        Start Voice Chat
                      </div>
                    )}
                  </button>

                  {isPlaying && (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Volume2 className="h-4 w-4" />
                      <span>AI is responding...</span>
                    </div>
                  )}

                  <button
                    onClick={stopAgent}
                  >
                    Disconnect AI Agent
                  </button>
                </div>
              )}
            </div>
                </div>
        </div>
      </div>
    )
}
