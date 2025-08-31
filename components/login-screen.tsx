"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginScreen() {
  const { login } = usePrivy()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-balance">Welcome to MedAI</CardTitle>
          <CardDescription className="text-muted-foreground text-balance">
            Your trusted Web3 medical AI assistant. Sign in with your email to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={login} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
            Sign In with Email
          </Button>
          <p className="text-xs text-muted-foreground text-center text-balance">
            We'll send you a secure one-time password to verify your identity.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
