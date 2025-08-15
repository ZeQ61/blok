import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import ErrorBoundary from "@/components/ErrorBoundary"
import NetworkStatus from "@/components/NetworkStatus"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Blok - Microblogging Platform",
  description: "Share your thoughts in 500 characters or less",
  keywords: "microblogging, social media, posts, comments, tags",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <NetworkStatus />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
