"use client"

import { useState, useEffect } from "react"
import { apiClient, type Comment, type CreateCommentRequest } from "@/lib/api"

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapDtoToComment = (dto: any): Comment => {
    return {
      id: String(dto.id),
      content: dto.content,
      author: {
        id: String(dto.author?.id ?? ""),
        username: dto.author?.username ?? "",
        profileImgUrl: dto.author?.profileImgUrl ?? dto.author?.profileImgURL ?? undefined,
      },
      postId: String(postId),
      parentCommentId: dto.parentCommentId ? String(dto.parentCommentId) : undefined,
      createdAt: dto.createdAt,
      likeCount: dto.likeCount ?? 0,
      isLiked: dto.likedByCurrentUser ?? false,
      replies: (dto.replies || []).map(mapDtoToComment),
    }
  }

  const fetchComments = async () => {
    if (!postId) return

    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<Comment[]>(`/api/comments/post/${postId}`)

      if (response.data) {
        // Gelen DTO'ları frontend tipine dönüştür
        const mapped = (response.data as any[]).map(mapDtoToComment)
        setComments(mapped)
      } else {
        setError(response.error || "Yorumlar yüklenemedi")
      }
    } catch (error) {
      setError("Bağlantı hatası")
    } finally {
      setLoading(false)
    }
  }

  const createComment = async (commentData: CreateCommentRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post<Comment>("/api/comments", commentData)

      if (response.data) {
        await fetchComments() // Refresh comments to get updated structure
        return { success: true }
      } else {
        return { success: false, error: response.error || "Yorum oluşturulamadı" }
      }
    } catch (error) {
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const toggleCommentLike = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.patch(`/api/like/comment/${commentId}/toggle`)

      if (response.status === 200) {
        // Update local state
        const updateCommentLike = (comments: Comment[]): Comment[] => {
          return comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: !comment.isLiked,
                likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
              }
            }
            if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentLike(comment.replies),
              }
            }
            return comment
          })
        }

        setComments((prev) => updateCommentLike(prev))
        return { success: true }
      } else {
        return { success: false, error: response.error || "Beğeni işlemi başarısız" }
      }
    } catch (error) {
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const deleteComment = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.delete(`/api/comments/delete/comment/${commentId}`)

      // 204 veya 200 ise başarılı kabul et
      if (response.status === 200 || response.status === 204) {
        await fetchComments() // Refresh comments
        return { success: true }
      } else {
        return { success: false, error: response.error || "Yorum silinemedi" }
      }
    } catch (error) {
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    toggleCommentLike,
    deleteComment,
  }
}
