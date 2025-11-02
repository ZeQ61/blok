"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import { User, Mail, Camera, Save, ArrowLeft, Eye, EyeOff, Shield, Bell, Globe, Lock, Palette } from "lucide-react"
import { apiClient } from "@/lib/api"

interface UserProfile {
  id: string
  username: string
  email: string
  bio: string
  profileImgUrl: string
  website?: string
  coverImage?: string
  isPrivate?: boolean
  emailNotifications?: boolean
  pushNotifications?: boolean
  theme?: "light" | "dark" | "auto"
}

export default function EditProfilePage() {
  const { user, isAuthenticated, token } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    username: "",
    email: "",
    bio: "",
    profileImgUrl: "",
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "privacy" | "notifications">("profile")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchProfile()
  }, [isAuthenticated, router])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get<UserProfile>("/api/user/profile")
      if (res.data) {
        setProfile({
          id: res.data.id || "",
          email: res.data.email || "",
          username: res.data.username || "",
          bio: res.data.bio || "",
          profileImgUrl: res.data.profileImgUrl || "",
        })
      }
    } catch (error) {
      console.error("Profil yüklenirken hata:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!profile.username.trim()) {
      newErrors.username = "Kullanıcı adı gerekli"
    } else if (profile.username.length < 3) {
      newErrors.username = "Kullanıcı adı en az 3 karakter olmalı"
    }

    if (!profile.email.trim()) {
      newErrors.email = "E-posta adresi gerekli"
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin"
    }

    if (profile.bio.length > 160) {
      newErrors.bio = "Biyografi 160 karakterden uzun olamaz"
    }

    if (profile.website && !profile.website.startsWith("http")) {
      newErrors.website = "Website URL'si http:// veya https:// ile başlamalı"
    }

    // Password validation
    if (passwords.currentPassword || passwords.newPassword || passwords.confirmPassword) {
      if (!passwords.currentPassword) {
        newErrors.currentPassword = "Mevcut şifre gerekli"
      }
      if (!passwords.newPassword) {
        newErrors.newPassword = "Yeni şifre gerekli"
      } else if (passwords.newPassword.length < 6) {
        newErrors.newPassword = "Yeni şifre en az 6 karakter olmalı"
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        newErrors.confirmPassword = "Şifreler eşleşmiyor"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let payload: any = { ...profile }
      if (passwords.currentPassword && passwords.newPassword) {
        payload = {
          ...payload,
          currentPassword: passwords.currentPassword,
          password: passwords.newPassword,
        }
      }
      const res = await apiClient.put<UserProfile>("/api/user/profile", payload)
      if (res.data) {
        setProfile(res.data)
        setSuccessMessage("Profil ve şifre başarıyla güncellendi.")
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
      }
    } catch (error) {
      setErrors({ genel: "Profil veya şifre güncellenemedi." })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const res = await apiClient.uploadFile<{ imageUrl: string }>(`/api/user/${user?.id || profile.id}/profile-image`, formData)
    if (res.data?.imageUrl) {
      setProfile((prev) => ({ ...prev, profileImgUrl: res.data!.imageUrl }))
    } else if (res.error) {
      alert(res.error)
    }
  }

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile((prev) => ({ ...prev, coverImage: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isAuthenticated) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Profil yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Profili Düzenle</h1>
                <p className="text-gray-600 dark:text-gray-400">Profil bilgilerinizi ve ayarlarınızı güncelleyin</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Kaydediliyor...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Kaydet</span>
                </div>
              )}
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-2xl slide-in-up">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.genel && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl">
              {errors.genel}
            </div>
          )}

          {/* Cover Image */}
          <div className="card overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
              {profile.coverImage && (
                <img
                  src={profile.coverImage || "/placeholder.svg"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20"></div>
              <button
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-2xl hover:bg-black/70 transition-all duration-200 transform hover:scale-105"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </div>

            {/* Avatar */}
            <div className="relative px-6 pb-6">
              <div className="flex items-end space-x-6 -mt-16">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800">
                    {profile.profileImgUrl ? (
                      <img
                        src={getImageUrl(profile.profileImgUrl)}
                        alt="Avatar"
                        className="w-full h-full rounded-3xl object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg"
                        }}
                      />
                    ) : (
                      profile.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {profile.username}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {[
                { id: "profile", label: "Profil", icon: User },
                { id: "security", label: "Güvenlik", icon: Shield },
                { id: "privacy", label: "Gizlilik", icon: Lock },
                { id: "notifications", label: "Bildirimler", icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6 fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Kullanıcı Adı *
                      </label>
                      <input
                        type="text"
                        value={profile.username || ''}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        className={`input-field ${errors.username ? "border-red-500 focus:border-red-500 focus:ring-red-300" : ""}`}
                        placeholder="kullanici_adi"
                      />
                      {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        value={profile.email || ''}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`input-field ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-300" : ""}`}
                        placeholder="ornek@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Profil Fotoğrafı
                      </label>
                      <input
                        type="text"
                        value={profile.profileImgUrl || ''}
                        onChange={(e) => handleInputChange("profileImgUrl", e.target.value)}
                        className="input-field"
                        placeholder="Profil fotoğrafı URL'si"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Biyografi ({(profile.bio || '').length}/160)
                      </label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        className={`input-field resize-none ${errors.bio ? "border-red-500 focus:border-red-500 focus:ring-red-300" : ""}`}
                        rows={3}
                        maxLength={160}
                        placeholder="Kendiniz hakkında kısa bir açıklama..."
                      />
                      {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6 fade-in">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">Şifre Değiştir</p>
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                      Güvenliğiniz için düzenli olarak şifrenizi değiştirin.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Mevcut Şifre
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwords.currentPassword}
                          onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                          className={`input-field pr-12 ${errors.currentPassword ? "border-red-500 focus:border-red-500 focus:ring-red-300" : ""}`}
                          placeholder="Mevcut şifrenizi girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Yeni Şifre
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.newPassword}
                          onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                          className={`input-field pr-12 ${errors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-300" : ""}`}
                          placeholder="Yeni şifrenizi girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Yeni Şifre (Tekrar)
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirmPassword}
                          onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                          className={`input-field pr-12 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-300" : ""}`}
                          placeholder="Yeni şifrenizi tekrar girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-6 fade-in">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Lock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Özel Hesap</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Gönderilerinizi sadece takipçileriniz görebilir
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.isPrivate}
                          onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Profil Görünürlüğü</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Profiliniz arama motorlarında görünsün
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6 fade-in">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">E-posta Bildirimleri</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Yeni takipçiler ve etkileşimler için e-posta alın
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.emailNotifications}
                          onChange={(e) => handleInputChange("emailNotifications", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Push Bildirimleri</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tarayıcı bildirimleri alın</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profile.pushNotifications}
                          onChange={(e) => handleInputChange("pushNotifications", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                      <div className="flex items-center space-x-3 mb-3">
                        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <p className="font-medium text-gray-900 dark:text-gray-100">Tema Tercihi</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "light", label: "Açık" },
                          { value: "dark", label: "Koyu" },
                          { value: "auto", label: "Otomatik" },
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => handleInputChange("theme", theme.value)}
                            className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                              profile.theme === theme.value
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500"
                            }`}
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
