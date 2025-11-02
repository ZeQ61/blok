"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import PostCard from "@/components/PostCard"
import PostForm from "@/components/PostForm"
import { Grid3x3, Bookmark, Heart, MessageCircle, Camera, Settings } from "lucide-react"
import { apiClient } from "@/lib/api"
import { usePosts } from "@/hooks/usePosts"
import { useToast } from "@/hooks/use-toast"
import ProfileImageUploader from "@/components/ProfileImageUploader"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"

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
  viewsCount: number
  isLiked: boolean
}

export default function ProfilePage() {
  const { user, isAuthenticated, refreshProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "likes" | "comments">("posts")
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [commentedPosts, setCommentedPosts] = useState<Post[]>([])
  const [savedPosts, setSavedPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const { deletePost, getSavedPosts } = usePosts()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchUserData()
  }, [isAuthenticated, router])

  const mapDtoToPost = (p: any): Post => ({
    id: String(p.id),
    title: p.title,
    content: p.content,
    coverImageUrl: p.coverImageUrl || p.coverImageURL || undefined,
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
    viewsCount: p.viewsCount ?? 0,
    isLiked: p.likedByCurrentUser ?? false,
  })

  const fetchLikedPosts = async () => {
    const likedRes = await apiClient.get<any[]>(`/api/like/my-liked-posts`)
    setLikedPosts((likedRes.data || []).map(mapDtoToPost))
  }

  const fetchSavedPosts = async () => {
    const result = await getSavedPosts()
    if (result.success && result.posts) {
      setSavedPosts(result.posts)
    }
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
    if (activeTab === "saved") {
      fetchSavedPosts()
    } else if (activeTab === "likes") {
      fetchLikedPosts()
    } else if (activeTab === "comments") {
      // Comments already fetched in fetchUserData
    }
  }, [activeTab])

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
    setLikedPosts(likedPosts.filter((post) => post.id !== postId))
    setCommentedPosts(commentedPosts.filter((post) => post.id !== postId))
    setSavedPosts(savedPosts.filter((post) => post.id !== postId))
    fetchUserData()
  }

  const handlePostLiked = async (postId: string) => {
    const optimisticUpdate = (p: Post) => (p.id === postId ? {
      ...p,
      isLiked: !p.isLiked,
      likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
    } : p)

    setPosts((prev) => prev.map(optimisticUpdate))
    setLikedPosts((prev) => prev.map(optimisticUpdate))
    setCommentedPosts((prev) => prev.map(optimisticUpdate))
    setSavedPosts((prev) => prev.map(optimisticUpdate))

    await apiClient.patch(`/api/like/post/${postId}/toggle`)

    try {
      const res = await apiClient.get<any>(`/api/posts/${postId}`)
      if (res.data) {
        const updated = mapDtoToPost(res.data)
        const updater = (p: Post) => (p.id === postId ? { ...p, ...updated } : p)
        setPosts((prev) => prev.map(updater))
        setLikedPosts((prev) => {
          const exists = prev.some((p) => p.id === postId)
          if (updated.isLiked) {
            return exists ? prev.map(updater) : [updated, ...prev]
          }
          return prev.filter((p) => p.id !== postId)
        })
        setCommentedPosts((prev) => prev.map(updater))
        setSavedPosts((prev) => prev.map(updater))
      }
    } catch {}
  }

  const handleDeletePost = async (postId: string) => {
    const result = await deletePost(postId)
    if (result.success) {
      handlePostDeleted(postId)
      toast({ title: "Gönderi silindi", description: "Post başarıyla silindi.", variant: "default" })
    } else {
      toast({ title: "Hata", description: result.error || "Gönderi silinemedi.", variant: "destructive" })
    }
  }

  const handlePostCreated = () => {
    setShowPostForm(false)
    fetchUserData()
    toast({ title: "Gönderi oluşturuldu", description: "Post başarıyla paylaşıldı.", variant: "default" })
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const getCurrentPosts = () => {
    if (activeTab === "posts") return posts
    if (activeTab === "saved") return savedPosts
    if (activeTab === "likes") return likedPosts
    if (activeTab === "comments") return commentedPosts
    return []
  }

  const currentPosts = getCurrentPosts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instagram tarzı kullanıcı bilgileri */}
        <div className="border-b border-gray-300 dark:border-gray-800 pb-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Profil Resmi */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-700">
                {user.profileImgUrl ? (
                  <img
                    src={getImageUrl(user.profileImgUrl)}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg"
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Kullanıcı Bilgileri */}
            <div className="flex-1 min-w-0">
              {/* Üst Satır: Kullanıcı adı ve butonlar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <h1 className="text-xl md:text-2xl font-light text-gray-900 dark:text-gray-100">
                  {user.username}
                </h1>
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile/edit"
                    className="px-4 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    Profili düzenle
                  </Link>
                  <button
                    onClick={() => setShowPostForm(!showPostForm)}
                    className="px-4 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    Yeni gönderi
                  </button>
                  <Link
                    href="/profile/edit"
                    className="p-2 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{posts.length}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">gönderi</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">0</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">takipçi</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">0</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">takip</span>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">{user.username}</span>
                {user.bio && (
                  <p className="text-gray-900 dark:text-gray-100 mt-1">{user.bio}</p>
                )}
              </div>

              {/* Profil fotoğrafı yükle */}
              <div className="mt-4">
                <ProfileImageUploader userId={Number(user.id) || 0} />
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Gönderi Formu */}
        {showPostForm && (
          <div className="mb-8">
            <PostForm onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* Navigasyon Sekmeleri - Instagram tarzı minimal */}
        <div className="border-t border-gray-300 dark:border-gray-800">
          <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 py-4 border-t-2 transition-colors ${
                activeTab === "posts"
                  ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Gönderiler</span>
            </button>
            <button
              onClick={() => setActiveTab("likes")}
              className={`flex items-center gap-2 py-4 border-t-2 transition-colors ${
                activeTab === "likes"
                  ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Beğenilenler</span>
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`flex items-center gap-2 py-4 border-t-2 transition-colors ${
                activeTab === "comments"
                  ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Yorum Yapılanlar</span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 py-4 border-t-2 transition-colors ${
                activeTab === "saved"
                  ? "border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
                  : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Kaydedilenler</span>
            </button>
          </div>
        </div>

        {/* İçerik - Grid Layout (Instagram tarzı) */}
        {loading ? (
          <div className="grid grid-cols-3 gap-1 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-sm"></div>
            ))}
          </div>
        ) : currentPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 mt-4">
            {currentPosts.map((post) => {
              const isVideo = post.coverImageUrl && (
                post.coverImageUrl.includes('/video/upload') || 
                post.coverImageUrl.match(/\.(mp4|webm|ogg|mov)$/i)
              )
              
              return (
                <div
                  key={post.id}
                  className="aspect-square bg-gray-200 dark:bg-gray-800 relative group cursor-pointer overflow-hidden rounded-sm"
                  onClick={() => router.push(`/posts/${post.id}`)}
                >
                  {post.coverImageUrl ? (
                    isVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          src={getImageUrl(post.coverImageUrl)}
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                          muted
                          playsInline
                          onMouseEnter={(e) => {
                            const video = e.currentTarget as HTMLVideoElement
                            video.currentTime = 1 // Video'nun ilk saniyesini göster
                            video.play().catch(() => {}) // Autoplay engellenebilir, hata yok say
                          }}
                          onMouseLeave={(e) => {
                            const video = e.currentTarget as HTMLVideoElement
                            video.pause()
                            video.currentTime = 0
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={getImageUrl(post.coverImageUrl)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium mb-1">{post.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-3">{post.content}</p>
                      </div>
                    </div>
                  )}
                  {/* Hover overlay - Instagram tarzı */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">❤️</span>
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">💬</span>
                      <span>{post.commentCount}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Boş Durum - Instagram tarzı */
          <div className="flex flex-col items-center justify-center py-20 mt-8">
            <div className="w-16 h-16 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            </div>
            <h2 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-2">
              {activeTab === "posts"
                ? "Fotoğraflar Paylaş"
                : activeTab === "saved"
                ? "Henüz kaydedilmiş gönderi yok"
                : activeTab === "likes"
                ? "Henüz beğenilen gönderi yok"
                : "Henüz yorum yapılan gönderi yok"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
              {activeTab === "posts"
                ? "Paylaştığın fotoğraflar profilinde gözükür."
                : activeTab === "saved"
                ? "Beğendiğin gönderileri kaydederek burada görüntüleyebilirsin."
                : activeTab === "likes"
                ? "Beğendiğin gönderiler burada görünecek."
                : "Yorum yaptığın gönderiler burada görünecek."}
            </p>
            {activeTab === "posts" && (
              <button
                onClick={() => setShowPostForm(true)}
                className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
              >
                İlk fotoğrafını paylaş
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}