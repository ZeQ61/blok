"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X, RefreshCw, Wifi, WifiOff } from "lucide-react"

interface ErrorAlertProps {
  error: string | null
  onRetry?: () => void
  onDismiss?: () => void
  type?: "error" | "warning" | "network"
  autoHide?: boolean
  duration?: number
}

export default function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  type = "error",
  autoHide = false,
  duration = 5000,
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(!!error)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsVisible(!!error)
  }, [error])

  useEffect(() => {
    if (autoHide && error && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [error, isVisible, autoHide, duration, onDismiss])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const getAlertStyles = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200"
      case "network":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200"
      default:
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
    }
  }

  const getIcon = () => {
    switch (type) {
      case "network":
        return isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getErrorMessage = () => {
    if (!isOnline) {
      return "İnternet bağlantınız kesildi. Lütfen bağlantınızı kontrol edin."
    }

    if (type === "network") {
      return "Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin."
    }

    return error || "Bilinmeyen bir hata oluştu"
  }

  if (!isVisible && isOnline) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full slide-in-up">
      <div className={`border rounded-2xl p-4 shadow-lg ${getAlertStyles()}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">{getIcon()}</div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">
              {type === "network" ? "Bağlantı Sorunu" : type === "warning" ? "Uyarı" : "Hata"}
            </h3>
            <p className="text-sm mt-1 opacity-90">{getErrorMessage()}</p>

            {(onRetry || onDismiss) && (
              <div className="flex items-center space-x-3 mt-3">
                {onRetry && (
                  <button onClick={onRetry} className="text-xs font-medium hover:underline flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>Tekrar Dene</span>
                  </button>
                )}
                {onDismiss && (
                  <button onClick={handleDismiss} className="text-xs font-medium hover:underline">
                    Kapat
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
