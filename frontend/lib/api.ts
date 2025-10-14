const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private getAuthOnlyHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status

    // 204 No Content
    if (status === 204) {
      return { status }
    }

    const contentType = response.headers.get("content-type") || ""

    // Try JSON first when content-type hints JSON
    if (contentType.includes("application/json")) {
      try {
        const data = await response.json()
        if (!response.ok) {
          return { error: (data as any)?.message || `HTTP Error: ${status}`, status }
        }
        return { data, status }
      } catch {
        // fallthrough to text parsing
      }
    }

    // Fallback: try reading as text
    try {
      const text = await response.text()
      if (!response.ok) {
        return { error: text || `HTTP Error: ${status}`, status }
      }
      return { data: (text as unknown as T), status }
    } catch (e) {
      return { error: "Failed to parse response", status }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: "Network error",
        status: 0,
      }
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: "Network error",
        status: 0,
      }
    }
  }

  async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.getAuthOnlyHeaders(), // Content-Type otomatik ayarlansın
        body: formData,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: "Network error",
        status: 0,
      }
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: "Network error",
        status: 0,
      }
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: "Network error",
        status: 0,
      }
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse<T>(response)
    } catch (error) {
      return {
        error: "Network error",
        status: 0,
      }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// API Types
export interface User {
  id: string
  username: string
  email: string
  bio?: string
  profileImgUrl?: string
  roleName: "USER" | "ADMIN"
}

// Admin - Users
export interface AdminUser {
  id: number
  username: string
  email: string
  roleName: "USER" | "ADMIN"
  isOnline: boolean
  createdAt: string
}

export interface PageResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number // current page (0-based)
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  roleName: "USER" | "ADMIN"
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  profileImgUrl?: string
  bio?: string
}

export interface Post {
  id: string
  title: string
  content: string
  coverImageUrl?: string
  author: {
    id: string
    username: string
    profileImgUrl?: string
  }
  category: {
    id: number
    name: string
  }
  tags: Array<{
    id: number
    name: string
  }>
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  isLiked: boolean
}

export interface CreatePostRequest {
  title: string
  content: string
  categoryId: number
  tagIds: number[]
  coverImageUrl?: string
}

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    profileImgUrl?: string
  }
  postId: string
  parentCommentId?: string
  createdAt: string
  likeCount: number
  isLiked: boolean
  replies: Comment[]
}

export interface CreateCommentRequest {
  postId: string
  content: string
  parentCommentId?: string
}

export interface Category {
  id: number
  name: string
  slug?: string
  description?: string
}

export interface Tag {
  id: number
  name: string
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
  bio?: string
  profileImgUrl?: string
  password?: string
  currentPassword?: string
}

export interface ForgotPasswordRequest {
  email: string
}

// Admin - Posts
export interface AdminPost {
  id: number
  title: string
  slug: string
  authorUsername: string
  published: boolean
  createdAt: string
}

// Profile Image Upload
export interface ProfileImageResponse {
  imageUrl: string
}
