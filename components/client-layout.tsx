"use client"

import type React from "react"

import { PrivyProvider } from "@/providers/PrivyProvider"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <PrivyProvider>
          {children}
        </PrivyProvider>

  )
}
