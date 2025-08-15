"use client"

import { useRef, useState } from "react"
import { apiClient, type ProfileImageResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface Props {
  userId?: number | string
  onUploaded?: (url: string) => void
}

export default function ProfileImageUploader({ userId, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const { user, refreshProfile } = useAuth()

  const resolveUserId = (): number | null => {
    if (userId !== undefined && userId !== null && String(userId).length > 0) {
      return Number(userId)
    }
    if (user?.id && String(user.id).length > 0) {
      return Number(user.id)
    }
    // Token'dan yakalamayı dene
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const uid = payload?.userId
        if (uid) return Number(uid)
      } catch {}
    }
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uid = resolveUserId()
    if (uid == null || Number.isNaN(uid)) {
      alert("Kullanıcı kimliği bulunamadı. Lütfen tekrar giriş yapın.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setUploading(true)
    const res = await apiClient.uploadFile<ProfileImageResponse>(`/api/user/${uid}/profile-image`, formData)
    setUploading(false)

    if (res.data?.imageUrl) {
      await refreshProfile()
      onUploaded?.(res.data.imageUrl)
    } else if (res.error) {
      alert(res.error)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full px-3 py-1 flex items-center gap-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Profil fotoğrafı yükle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-8m0 0-3 3m3-3 3 3M21 16.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5"/></svg>
        {uploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
      </Button>
      <span className="text-xs mt-1 text-gray-700 dark:text-gray-200">Profil fotoğrafınızı yükleyin</span>
    </div>
  )
}


