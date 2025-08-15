"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.post<{ password: string }>("/forgot-password", { email })

      if (response.data) {
        setNewPassword(response.data.password)
        setSuccess(true)
      } else {
        setError(response.error || "Şifre sıfırlama başarısız")
      }
    } catch (error) {
      setError("Bağlantı hatası")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Şifre Sıfırlandı</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Yeni şifreniz aşağıda gösterilmektedir</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Yeni şifreniz:</p>
            <p className="text-2xl font-mono font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
              {newPassword}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-3">
              ⚠️ Bu şifreyi güvenli bir yerde saklayın ve giriş yaptıktan sonra değiştirin
            </p>
          </div>

          <div className="text-center">
            <Link href="/login" className="btn-primary inline-flex items-center space-x-2">
              <span>Giriş Yap</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Giriş sayfasına dön
          </Link>

          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Şifremi Unuttum</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            E-posta adresinizi girin, size yeni bir şifre gönderelim
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              E-posta Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="E-posta adresinizi girin"
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Şifre sıfırlanıyor...</span>
                </div>
              ) : (
                "Şifremi Sıfırla"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
