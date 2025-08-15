"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { apiClient, type AdminPost, type PageResult } from "@/lib/api"
import { useErrorHandler } from "./useErrorHandler"
import { handleApiError } from "@/lib/errorReporting"

export interface UseAdminPostsOptions {
  initialQuery?: string
  pageSize?: number
}

export function useAdminPosts(options: UseAdminPostsOptions = {}) {
  const { initialQuery = "", pageSize = 20 } = options
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(pageSize)
  const [data, setData] = useState<PageResult<AdminPost> | null>(null)
  const [loading, setLoading] = useState(false)
  const { error, handleError, handleApiError: handleApiErr, clearError } = useErrorHandler()

  const fetchPosts = useCallback(async (opts?: { page?: number; size?: number; q?: string }) => {
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

      const response = await apiClient.get<PageResult<AdminPost>>(`/api/admin/posts?${params.toString()}`)

      if (response.data) {
        setData(response.data)
      } else {
        handleApiErr(response)
      }
    } catch (err) {
      handleError(err, "useAdminPosts.fetchPosts")
      handleApiError(err, "Admin - Fetch Posts")
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
    await fetchPosts({ page: 0, q })
  }

  const refresh = async () => {
    await fetchPosts()
  }

  useEffect(() => {
    fetchPosts()
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
    posts: data?.content ?? [],
    loading,
    error,
    pagination,
    setPage: setPageSafe,
    setSize,
    search,
    refresh,
  }
}


