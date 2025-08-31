"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePrivy } from "@privy-io/react-auth"

interface MainScreenProps {
  userData: {
    name: string
    age: number
    nationality: string
    gender: string
  } | null
}

export default function MainScreen({ userData }: MainScreenProps) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold">MedAI</h1>
          </div>
          <Button variant="outline" onClick={logout} size="sm">
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-balance">Welcome to MedAI, {userData?.name || "User"}!</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Your profile has been successfully created. You're now ready to experience the power of AI-driven medical
              assistance tailored specifically for you.
            </p>
          </div>

          {/* Profile Summary Card */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Your Profile</CardTitle>
              <CardDescription>Information we'll use to personalize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{userData?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Age:</span>
                <span className="font-medium">{userData?.age} years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nationality:</span>
                <span className="font-medium">{userData?.nationality}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gender:</span>
                <span className="font-medium">{userData?.gender}</span>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action Section */}
          <div className="space-y-6 pt-8">
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-balance">Ready to Get Started?</h3>
              <p className="text-muted-foreground max-w-xl mx-auto text-balance">
                Initialize your personal medical AI agent to begin receiving personalized health insights and
                recommendations.
              </p>
            </div>

            {/* Prominent Init Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleInitAI}
                disabled={isInitializing}
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none"
              >
                {isInitializing ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Initializing AI Agent...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Init Medical AI Agent
                  </div>
                )}
              </Button>
            </div>

            {/* Additional Info */}
            <div className="max-w-2xl mx-auto">
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-muted-foreground text-left">
                      <p className="font-medium text-foreground mb-1">What happens next?</p>
                      <p className="text-balance">
                        Your AI agent will be configured with your profile information to provide personalized medical
                        insights, health recommendations, and answer your health-related questions with context-aware
                        responses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
