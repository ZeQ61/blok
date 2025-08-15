"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Log error to monitoring service (e.g., Sentry)
    if (typeof window !== "undefined") {
      // You can integrate with error monitoring services here
      console.error("Error details:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development"

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = "/"
  }

  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2)).then(() => {
      alert("Hata detayları panoya kopyalandı. Destek ekibiyle paylaşabilirsiniz.")
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="card p-8 text-center space-y-6">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Oops! Bir şeyler ters gitti</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {isDevelopment && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-left">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center">
                <Bug className="w-4 h-4 mr-2" />
                Geliştirici Bilgisi
              </h3>
              <pre className="text-sm text-red-700 dark:text-red-300 overflow-auto max-h-40">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={resetError} className="btn-primary flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Tekrar Dene</span>
            </button>

            <button onClick={handleReload} className="btn-secondary flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Sayfayı Yenile</span>
            </button>

            <button onClick={handleGoHome} className="btn-secondary flex items-center justify-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>

          {/* Report Error */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReportError}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Hata detaylarını kopyala ve destek ekibiyle paylaş
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
