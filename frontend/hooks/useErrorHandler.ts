"use client"

import { useState, useCallback } from "react"

interface ErrorState {
  error: string | null
  isError: boolean
  errorType: "error" | "warning" | "network"
}

interface UseErrorHandlerReturn {
  error: string | null
  isError: boolean
  errorType: "error" | "warning" | "network"
  setError: (error: string | null, type?: "error" | "warning" | "network") => void
  clearError: () => void
  handleError: (error: unknown, context?: string) => void
  handleApiError: (response: { error?: string; status?: number }) => void
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorType: "error",
  })

  const setError = useCallback((error: string | null, type: "error" | "warning" | "network" = "error") => {
    setErrorState({
      error,
      isError: !!error,
      errorType: type,
    })
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorType: "error",
    })
  }, [])

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      console.error(`Error${context ? ` in ${context}` : ""}:`, error)

      let errorMessage = "Bilinmeyen bir hata oluştu"
      let errorType: "error" | "warning" | "network" = "error"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // Check for network errors
      if (
        errorMessage.includes("fetch") ||
        errorMessage.includes("network") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("Failed to fetch")
      ) {
        errorType = "network"
        errorMessage = "Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin."
      }

      // Check for timeout errors
      if (errorMessage.includes("timeout")) {
        errorType = "network"
        errorMessage = "İstek zaman aşımına uğradı. Lütfen tekrar deneyin."
      }

      setError(errorMessage, errorType)
    },
    [setError],
  )

  const handleApiError = useCallback(
    (response: { error?: string; status?: number }) => {
      let errorMessage = response.error || "API hatası oluştu"
      let errorType: "error" | "warning" | "network" = "error"

      // Handle different HTTP status codes
      if (response.status) {
        switch (response.status) {
          case 400:
            errorMessage = "Geçersiz istek. Lütfen bilgilerinizi kontrol edin."
            break
          case 401:
            errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın."
            break
          case 403:
            errorMessage = "Bu işlem için yetkiniz bulunmuyor."
            break
          case 404:
            errorMessage = "Aradığınız kaynak bulunamadı."
            break
          case 429:
            errorMessage = "Çok fazla istek gönderdiniz. Lütfen biraz bekleyin."
            errorType = "warning"
            break
          case 500:
            errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin."
            errorType = "network"
            break
          case 502:
          case 503:
          case 504:
            errorMessage = "Sunucu geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin."
            errorType = "network"
            break
          default:
            if (response.status >= 500) {
              errorType = "network"
            }
        }
      }

      setError(errorMessage, errorType)
    },
    [setError],
  )

  return {
    error: errorState.error,
    isError: errorState.isError,
    errorType: errorState.errorType,
    setError,
    clearError,
    handleError,
    handleApiError,
  }
}
