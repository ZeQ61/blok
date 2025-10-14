"use client"

import { useState, useEffect } from "react"
import { apiClient, type Post, type CreatePostRequest } from "@/lib/api"
import { useErrorHandler } from "./useErrorHandler"
import { handleApiError } from "@/lib/errorReporting"

function mapPostResponseDtoToPost(post: any): Post {
  return {
    ...post,
    category: { id: 0, name: post.categoryName },
    tags: post.tagNames?.map((name: string, i: number) => ({ id: i, name })) || [],
    author: post.author || { id: '', username: 'Bilinmeyen' },
    isLiked: post.likedByCurrentUser,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { error, handleError, handleApiError: handleApiErr, clearError } = useErrorHandler()

  const fetchPosts = async () => {
    setLoading(true)
    clearError()

    try {
      const response = await apiClient.get<any[]>("/api/posts")

      if (response.data) {
        setPosts(response.data.map(mapPostResponseDtoToPost))
      } else {
        handleApiErr(response)
      }
    } catch (error) {
      handleError(error, "fetchPosts")
      handleApiError(error, "Posts - Fetch Posts")
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData: CreatePostRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      clearError()
      const response = await apiClient.post<Post>("/api/posts", postData)

      if (response.data) {
        setPosts((prev) => [response.data!, ...prev])
        return { success: true }
      } else {
        handleApiErr(response)
        return { success: false, error: response.error || "Gönderi oluşturulamadı" }
      }
    } catch (error) {
      handleError(error, "createPost")
      handleApiError(error, "Posts - Create Post")
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const toggleLike = async (postId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      clearError()
      const response = await apiClient.patch(`/api/like/post/${postId}/toggle`)

      if (response.status === 200) {
        // Update local state
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                }
              : post,
          ),
        )
        return { success: true }
      } else {
        handleApiErr(response)
        return { success: false, error: response.error || "Beğeni işlemi başarısız" }
      }
    } catch (error) {
      handleError(error, "toggleLike")
      handleApiError(error, "Posts - Toggle Like")
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const deletePost = async (postId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      clearError()
      const response = await apiClient.delete(`/api/posts/posts/delete/${postId}`)

      if (response.status === 200) {
        setPosts((prev) => prev.filter((post) => post.id !== postId))
        return { success: true }
      } else {
        handleApiErr(response)
        return { success: false, error: response.error || "Gönderi silinemedi" }
      }
    } catch (error) {
      handleError(error, "deletePost")
      handleApiError(error, "Posts - Delete Post")
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const uploadPostImage = async (file: File): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    try {
      clearError()
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.uploadFile<string>("/api/posts/upload-image", formData)

      if (response.data) {
        return { success: true, imageUrl: response.data }
      } else {
        handleApiErr(response)
        return { success: false, error: response.error || "Resim yüklenemedi" }
      }
    } catch (error) {
      handleError(error, "uploadPostImage")
      handleApiError(error, "Posts - Upload Image")
      return { success: false, error: "Bağlantı hatası" }
    }
  }

  const retryFetch = () => {
    fetchPosts()
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    toggleLike,
    deletePost,
    uploadPostImage,
    retryFetch,
  }
}
