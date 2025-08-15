"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      // Show "back online" message briefly
      const timer = setTimeout(() => {
        setShowOfflineMessage(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, showOfflineMessage])

  if (!showOfflineMessage && isOnline) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div
        className={`mx-auto max-w-md rounded-2xl p-4 shadow-lg transition-all duration-300 ${
          isOnline
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5 animate-pulse" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{isOnline ? "Bağlantı Yeniden Kuruldu" : "İnternet Bağlantısı Yok"}</p>
            <p className="text-xs opacity-90 mt-1">
              {isOnline ? "Artık tüm özellikler kullanılabilir" : "Bazı özellikler çalışmayabilir"}
            </p>
          </div>
          {!isOnline && (
            <div className="flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
