"use client"

import type React from "react"
import PanelLayout from "./(panel)/layout"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        return // client-side: admin sayfaları fetch sırasında token cookie/ls yoksa boş render et, /login yönlendir
      }
      if (!isAdmin) {
        router.replace("/")
      }
    }
  }, [isAuthenticated, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Yükleniyor...
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!isAdmin) {
    return null
  }

  return <PanelLayout>{children}</PanelLayout>
}


