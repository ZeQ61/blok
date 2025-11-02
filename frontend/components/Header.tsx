"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import { Moon, Sun, User, LogOut, Sparkles, Bell, Settings } from "lucide-react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getImageUrl } from "@/lib/utils"

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/20 dark:border-gray-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 floating-animation">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full pulse-glow"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Blok</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mikroblog Platformu</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`relative transition-all duration-300 font-medium group ${
                pathname === "/" || pathname === "/trendler"
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Ana Sayfa
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${
                pathname === "/" || pathname === "/trendler" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile"
                className={`relative transition-all duration-300 font-medium group ${
                  pathname === "/profile"
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Profil
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${
                  pathname === "/profile" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900 dark:hover:to-purple-900 transition-all duration-300 transform hover:scale-110 hover:rotate-12"
              aria-label="Tema değiştir"
            >
              {isDark ? (
                <Sun className="w-5 h-5 transform rotate-0 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 transform rotate-0 transition-transform duration-300" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <button className="relative p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900 dark:hover:to-purple-900 transition-all duration-300 transform hover:scale-110">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white font-bold text-sm flex items-center justify-center">
                      {user?.profileImgUrl ? (
                        <img
                          src={getImageUrl(user.profileImgUrl)}
                          alt={user?.username || "user"}
                          className="w-10 h-10 object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg"
                          }}
                        />
                      ) : (
                        user?.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="hidden sm:inline font-medium text-gray-900 dark:text-gray-100">
                      {user?.username}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 slide-in-up">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profil</span>
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Ayarlar</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setShowUserMenu(false)
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-medium"
                >
                  Giriş Yap
                </Link>
                <Link href="/register" className="btn-primary">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
