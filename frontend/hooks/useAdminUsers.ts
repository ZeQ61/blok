"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { apiClient, type AdminUser, type PageResult } from "@/lib/api"
import { useErrorHandler } from "./useErrorHandler"
import { handleApiError } from "@/lib/errorReporting"

export interface UseAdminUsersOptions {
  initialQuery?: string
  pageSize?: number
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const { initialQuery = "", pageSize = 20 } = options
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(pageSize)
  const [data, setData] = useState<PageResult<AdminUser> | null>(null)
  const [loading, setLoading] = useState(false)
  const { error, handleError, handleApiError: handleApiErr, clearError } = useErrorHandler()

  const fetchUsers = useCallback(async (opts?: { page?: number; size?: number; q?: string }) => {
    setLoading(true)
    clearError()

    try {
      const actualPage = opts?.page ?? page
      const actualSize = opts?.size ?? size
      const actualQuery = opts?.q ?? query

      const params = new URLSearchParams()
      params.set("page", String(actualPage))
      params.set("size", String(actualSize))
      if (actualQuery && actualQuery.trim().length > 0) {
        params.set("q", actualQuery.trim())
      }

      const response = await apiClient.get<PageResult<AdminUser>>(`/api/admin/users?${params.toString()}`)

      if (response.data) {
        setData(response.data)
      } else {
        handleApiErr(response)
      }
    } catch (err) {
      handleError(err, "useAdminUsers.fetchUsers")
      handleApiError(err, "Admin - Fetch Users")
    } finally {
      setLoading(false)
    }
  }, [page, size, query, clearError, handleApiErr, handleError])

  const setPageSafe = (next: number) => {
    setPage(Math.max(0, next))
  }

  const search = async (q: string) => {
    setQuery(q)
    setPage(0)
    await fetchUsers({ page: 0, q })
  }

  const refresh = async () => {
    await fetchUsers()
  }

  const deleteUser = async (userId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.delete(`/api/admin/users/${userId}`)
      if (response.status === 204 || response.status === 200) {
        // local listeyi güncelle
        setData((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.filter((u) => u.id !== userId),
                totalElements: Math.max(0, prev.totalElements - 1),
              }
            : prev,
        )
        return { success: true }
      } else {
        return { success: false, error: response.error || "Kullanıcı silinemedi" }
      }
    } catch (err) {
      handleError(err, "useAdminUsers.deleteUser")
      handleApiError(err, "Admin - Delete User")
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pagination = useMemo(() => {
    return {
      page: data?.number ?? page,
      size: data?.size ?? size,
      totalPages: data?.totalPages ?? 0,
      totalElements: data?.totalElements ?? 0,
      isFirst: data?.first ?? true,
      isLast: data?.last ?? true,
    }
  }, [data, page, size])

  return {
    users: data?.content ?? [],
    loading,
    error,
    pagination,
    setPage: setPageSafe,
    setSize,
    search,
    refresh,
    deleteUser,
  }
}


