"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import PostCard from "@/components/PostCard"
import { User, Heart, MessageCircle, Calendar } from "lucide-react"
import { apiClient } from "@/lib/api"
import { usePosts } from "@/hooks/usePosts"
import { useToast } from "@/hooks/use-toast"
import ProfileImageUploader from "@/components/ProfileImageUploader"

interface UserStats {
  postsCount: number
  likesCount: number
  commentsCount: number
  joinedDate: string
}

interface Post {
  id: string
  title: string
  content: string
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

export default function ProfilePage() {
  const { user, isAuthenticated, refreshProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"posts" | "likes" | "comments">("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [commentedPosts, setCommentedPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { deletePost } = usePosts()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchUserData()
  }, [isAuthenticated, router])

  // Update the profile page to handle missing API endpoints gracefully

  const mapDtoToPost = (p: any): Post => ({
    id: String(p.id),
    title: p.title,
    content: p.content,
    author: {
      id: String(p.author?.id ?? ""),
      username: p.author?.username ?? "",
      profileImgUrl: p.author?.profileImgUrl || p.author?.profileImgURL || undefined,
    },
    category: { id: 0, name: p.categoryName },
    tags: (p.tagNames || []).map((name: string, idx: number) => ({ id: idx, name })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    isLiked: p.likedByCurrentUser ?? false,
  })

  const fetchLikedPosts = async () => {
    const likedRes = await apiClient.get<any[]>(`/api/like/my-liked-posts`)
    setLikedPosts((likedRes.data || []).map(mapDtoToPost))
  }

  const fetchUserData = async () => {
    setLoading(true)
    try {
      // Kullanıcının kendi postlarını çek
      const postsRes = await apiClient.get<any[]>(`/api/posts/me`)
      setPosts((postsRes.data || []).map(mapDtoToPost))
      // Kullanıcının beğendiği postları çek
      await fetchLikedPosts()
      // Kullanıcının yorum yaptığı postları çek
      const commentedRes = await apiClient.get<any[]>(`/api/comments/user-posts`)
      setCommentedPosts((commentedRes.data || []).map(mapDtoToPost))
      // İstatistik ve diğer veriler için gerekirse ek endpointler eklenebilir
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "likes") {
      fetchLikedPosts()
    }
  }, [activeTab])

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
    setLikedPosts(likedPosts.filter((post) => post.id !== postId))
    setCommentedPosts(commentedPosts.filter((post) => post.id !== postId))
  }

  const handlePostLiked = async (postId: string) => {
    // Eğer comments sekmesindeysek, önce küçük bir optimistic update yap
    if (activeTab === "comments") {
      setCommentedPosts((prev) => prev.map((p) => p.id === postId ? {
        ...p,
        isLiked: !p.isLiked,
        likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
      } : p))
    }

    await apiClient.patch(`/api/like/post/${postId}/toggle`)

    try {
      const res = await apiClient.get<any>(`/api/posts/${postId}`)
      if (res.data) {
        const updated = mapDtoToPost(res.data)
        const updater = (p: any) => (p.id === postId ? { ...p, ...updated } : p)
        setPosts((prev) => prev.map(updater))
        setLikedPosts((prev) => {
          const exists = prev.some((p) => p.id === postId)
          if (updated.isLiked) {
            return exists ? prev.map(updater) : [updated, ...prev]
          }
          return prev.filter((p) => p.id !== postId)
        })
        setCommentedPosts((prev) => prev.map(updater))
      }
    } catch {}
  }

  // Post silme fonksiyonu
  const handleDeletePost = async (postId: string) => {
    const result = await deletePost(postId)
    if (result.success) {
      setPosts(posts.filter((post) => post.id !== postId))
      setLikedPosts(likedPosts.filter((post) => post.id !== postId))
      setCommentedPosts(commentedPosts.filter((post) => post.id !== postId))
      toast({ title: "Gönderi silindi", description: "Post başarıyla silindi.", variant: "default" })
    } else {
      toast({ title: "Hata", description: result.error || "Gönderi silinemedi.", variant: "destructive" })
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    })
  }

  // Aktif sekmeye göre postları döndüren fonksiyon
  const getCurrentPosts = () => {
    if (activeTab === "posts") return posts
    if (activeTab === "likes") return likedPosts
    if (activeTab === "comments") return commentedPosts
    return []
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="card p-6">
            <div className="flex items-start space-x-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {user.profileImgUrl ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${user.profileImgUrl}`}
                      alt={user.username}
                      className="w-20 h-20 object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg"
                      }}
                    />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <ProfileImageUploader userId={Number(user.id) || 0} />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.username}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
                {/* Admin etiketi kaldırıldı, gerekirse roleName ile eklenebilir */}

                {stats && (
                  <div className="flex items-center space-x-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(stats.joinedDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.postsCount}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.likesCount}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.commentsCount}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Comments</div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "posts"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>My Posts</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("likes")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "likes"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Liked Posts</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "comments"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Commented Posts</span>
                </div>
              </button>
            </div>
          </div>

          {/* Posts Content */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getCurrentPosts().map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDeletePost} onLike={handlePostLiked} />
              ))}

              {getCurrentPosts().length === 0 && (
                <div className="card p-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {activeTab === "posts" && "You haven't posted anything yet."}
                    {activeTab === "likes" && "You haven't liked any posts yet."}
                    {activeTab === "comments" && "You haven't commented on any posts yet."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
