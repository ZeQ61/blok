"use client"

import { useCallback, useEffect, useState } from "react"
import { apiClient, type Category, type Tag } from "@/lib/api"
import { useErrorHandler } from "./useErrorHandler"
import { handleApiError } from "@/lib/errorReporting"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const { error, handleError, handleApiError: handleApiErr, clearError } = useErrorHandler()

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    clearError()
    try {
      const res = await apiClient.get<Category[]>("/api/posts/categories")
      if (res.data) {
        setCategories(res.data)
      } else {
        handleApiErr(res)
      }
    } catch (err) {
      handleError(err, "useCategories.fetchCategories")
      handleApiError(err, "Admin - Fetch Categories")
    } finally {
      setLoading(false)
    }
  }, [clearError, handleApiErr, handleError])

  const createCategory = useCallback(async (payload: { name: string; description?: string }) => {
    try {
      const res = await apiClient.post<Category>("/api/categories", payload)
      if (res.data) {
        setCategories((prev) => [res.data!, ...prev])
        return { success: true }
      }
      return { success: false, error: res.error || "Kategori eklenemedi" }
    } catch (err) {
      handleError(err, "useCategories.createCategory")
      handleApiError(err, "Admin - Create Category")
      return { success: false, error: "Bağlantı hatası" }
    }
  }, [handleApiError, handleError])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, error, fetchCategories, createCategory }
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<Tag[]>("/api/posts/tags")

      if (response.data) {
        setTags(response.data)
      } else {
        setError(response.error || "Etiketler yüklenemedi")
      }
    } catch (error) {
      setError("Bağlantı hatası")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return {
    tags,
    loading,
    error,
    fetchTags,
  }
}
