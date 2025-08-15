"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiClient, type User, type LoginRequest, type RegisterRequest, type LoginResponse } from "@/lib/api"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  adminLogin: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token")

      if (savedToken) {
        setToken(savedToken)
        await fetchUserProfile()
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get<User>("/api/user/profile")

      if (response.data) {
        // Token'dan rol bilgisini oku ve profille birleştir
        const tokenFromStorage = localStorage.getItem("token")
        let roleName: User["roleName"] | undefined
        if (tokenFromStorage) {
          try {
            const payload = JSON.parse(atob(tokenFromStorage.split(".")[1]))
            const roles: string[] | undefined = payload?.roles
            if (Array.isArray(roles) && roles.includes("ADMIN")) {
              roleName = "ADMIN"
            } else if (Array.isArray(roles) && roles.includes("USER")) {
              roleName = "USER"
            }
          } catch (e) {
            // ignore parse errors; roleName undefined kalır
          }
        }

        setUser({ ...(response.data as any), roleName: roleName || (user?.roleName ?? "USER") })
      } else {
        // Token geçersiz, temizle
        logout()
      }
    } catch (error) {
      console.error("Profile fetch error:", error)
      logout()
    }
  }

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post<LoginResponse>("/api/auth/login", credentials)

      if (response.data) {
        const { token: newToken, username, roleName } = response.data

        setToken(newToken)
        localStorage.setItem("token", newToken)

        // Set basic user info from login response
        setUser({
          id: "", // Will be filled by profile fetch
          username,
          email: "", // Will be filled by profile fetch
          roleName,
        })

        // Fetch full profile
        await fetchUserProfile()

        return { success: true }
      } else {
        return { success: false, error: response.error || "Giriş başarısız" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const adminLogin = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post<{ token: string }>("/api/auth/admin/login", credentials)

      if (response.data?.token) {
        const newToken = response.data.token
        setToken(newToken)
        localStorage.setItem("token", newToken)

        // Token payload'dan anında kontrol et (state güncellenmesini bekleme)
        let isAdmin = false
        try {
          const payload = JSON.parse(atob(newToken.split(".")[1]))
          const roles: string[] | undefined = payload?.roles
          isAdmin = Array.isArray(roles) && roles.includes("ADMIN")
        } catch (e) {
          isAdmin = false
        }

        await fetchUserProfile()

        if (!isAdmin) {
          logout()
          return { success: false, error: "Sadece admin giriş yapabilir." }
        }

        return { success: true }
      } else {
        return { success: false, error: response.error || "Giriş başarısız" }
      }
    } catch (error) {
      console.error("Admin login error:", error)
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const register = async (userData: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post<User>("/api/auth/register", userData)

      if (response.data) {
        // After successful registration, login automatically
        const loginResult = await login({
          username: userData.username,
          password: userData.password,
        })

        return loginResult
      } else {
        return { success: false, error: response.error || "Kayıt başarısız" }
      }
    } catch (error) {
      console.error("Register error:", error)
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
  }

  const refreshProfile = async () => {
    if (token) {
      await fetchUserProfile()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        adminLogin,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.roleName === "ADMIN",
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
