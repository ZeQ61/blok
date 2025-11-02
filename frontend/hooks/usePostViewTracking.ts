"use client"

import { useEffect, useRef, useCallback } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

/**
 * usePostViewTracking - Ekranda görünen postların görüntülenme sayısını takip eder
 * 
 * Kullanım:
 * 1. Her post kartına bir ref ekleyin: const postRef = usePostViewTracking(post.id)
 * 2. PostCard component'inde: <div ref={postRef}>...</div>
 * 
 * Özellikler:
 * - IntersectionObserver ile sadece ekranda görünen postları tespit eder
 * - Debounce ile çok fazla istek gönderilmesini önler (500ms)
 * - Kullanıcı giriş yapmamışsa hiçbir şey yapmaz
 * - Aynı post için tekrar görüntülenme sayısı artırılmaz (backend tarafında kontrol edilir)
 */
export function usePostViewTracking(postId: string) {
  const { token } = useAuth()
  const hasBeenViewedRef = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingPostIdsRef = useRef<Set<string>>(new Set())

  // Debounce ile toplu gönderim için timer
  const sendPendingViews = useCallback(() => {
    if (pendingPostIdsRef.current.size === 0 || !token) {
      return
    }

    const postIds = Array.from(pendingPostIdsRef.current).map(id => Number(id))
    pendingPostIdsRef.current.clear()

    // Backend'e toplu istek gönder
    apiClient.post("/api/posts/views", { postIds }).catch((error) => {
      console.error("Görüntülenme takibi hatası:", error)
      // Hata durumunda sessizce devam et (kullanıcıyı rahatsız etme)
    })
  }, [token])

  // IntersectionObserver callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasBeenViewedRef.current) {
          // Post ekranda görünüyor ve henüz takip edilmemiş
          hasBeenViewedRef.current = true
          pendingPostIdsRef.current.add(postId)

          // Debounce: 500ms sonra gönder
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          timeoutRef.current = setTimeout(() => {
            sendPendingViews()
          }, 500)
        }
      })
    },
    [postId, sendPendingViews]
  )

  // Ref callback - element mount olduğunda observer'ı başlat
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      // Önceki observer'ı temizle
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current)
      }

      elementRef.current = element

      // Yeni element varsa observer'ı başlat
      if (element && token) {
        // IntersectionObserver options
        const options: IntersectionObserverInit = {
          root: null, // Viewport
          rootMargin: "0px",
          threshold: 0.5, // Element'in %50'si görünür olmalı
        }

        observerRef.current = new IntersectionObserver(handleIntersection, options)
        observerRef.current.observe(element)
      }
    },
    [token, handleIntersection]
  )

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // Component unmount olurken bekleyen görüntülenmeleri gönder
      if (pendingPostIdsRef.current.size > 0) {
        sendPendingViews()
      }
    }
  }, [sendPendingViews])

  return setRef
}

