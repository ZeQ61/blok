"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Header from "@/components/Header"
import CommentSection from "@/components/CommentSection"
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Trash2, MoreHorizontal, Eye } from "lucide-react"
import { apiClient } from "@/lib/api"
import { usePosts } from "@/hooks/usePosts"
import { useToast } from "@/hooks/use-toast"
import { getImageUrl } from "@/lib/utils"
import Link from "next/link"

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

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAdmin, token } = useAuth()
  const { deletePost, toggleSavePost, isPostSaved } = usePosts()
  const { toast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const postId = params.id as string

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  useEffect(() => {
    if (token && post) {
      isPostSaved(post.id).then(setIsBookmarked)
    }
  }, [post, token])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<any>(`/api/posts/${postId}`)
      if (res.data) {
        setPost(mapDtoToPost(res.data))
      }
    } catch (error: any) {
      console.error("Error fetching post:", error)
      toast({
        title: "Hata",
        description: error.response?.data?.message || "Gönderi yüklenemedi",
        variant: "destructive"
      })
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

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
    category: { id: 0, name: p.categoryName || "" },
    tags: (p.tagNames || []).map((name: string, idx: number) => ({ id: idx, name })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    viewsCount: p.viewsCount ?? 0,
    isLiked: p.likedByCurrentUser ?? false,
  })

  const handleLike = async () => {
    if (!token || isLiking || !post) return

    setIsLiking(true)
    try {
      const optimisticLikeCount = post.isLiked ? post.likeCount - 1 : post.likeCount + 1
      setPost({ ...post, isLiked: !post.isLiked, likeCount: optimisticLikeCount })

      await apiClient.patch(`/api/like/post/${post.id}/toggle`)

      const res = await apiClient.get<any>(`/api/posts/${post.id}`)
      if (res.data) {
        setPost(mapDtoToPost(res.data))
      }
    } catch (error) {
      setPost({ ...post, isLiked: !post.isLiked, likeCount: post.likeCount })
      toast({
        title: "Hata",
        description: "Beğeni işlemi başarısız",
        variant: "destructive"
      })
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (!token || isSaving || !post) return

    setIsSaving(true)
    try {
      const result = await toggleSavePost(post.id)
      if (result.success) {
        setIsBookmarked(!isBookmarked)
        toast({
          title: isBookmarked ? "Kayıt kaldırıldı" : "Gönderi kaydedildi",
          description: isBookmarked ? "Gönderi kaydedilenlerden kaldırıldı" : "Gönderi kaydedilenlere eklendi",
          variant: "default"
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!post || !confirm("Bu gönderiyi silmek istediğinizden emin misiniz?")) return

    const result = await deletePost(post.id)
    if (result.success) {
      toast({
        title: "Gönderi silindi",
        description: "Post başarıyla silindi",
        variant: "default"
      })
      router.push("/")
    } else {
      toast({
        title: "Hata",
        description: result.error || "Gönderi silinemedi",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInSeconds = Math.floor(diffInMs / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInMonths / 12)

    if (diffInSeconds < 60) return "Az önce"
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`
    if (diffInHours < 24) return `${diffInHours} saat önce`
    if (diffInDays < 30) return `${diffInDays} gün önce`
    if (diffInMonths < 12) return `${diffInMonths} ay önce`
    return `${diffInYears} yıl önce`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-6 animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Gönderi bulunamadı</p>
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
              Ana sayfaya dön
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Geri Dön Butonu */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>

        {/* Post Card */}
        <article className="card p-6 mb-6">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            {/* Avatar */}
            <Link href={`/profile`} className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                {post.author.profileImgUrl ? (
                  <img
                    src={getImageUrl(post.author.profileImgUrl)}
                    alt={post.author.username}
                    className="w-12 h-12 rounded-2xl object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg"
                    }}
                  />
                ) : (
                  post.author.username.charAt(0).toUpperCase()
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <Link href={`/profile`} className="font-bold text-gray-900 dark:text-gray-100 hover:underline">
                    @{post.author.username}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(post.createdAt)}</p>
                </div>

                {/* Menu */}
                {(isAdmin || String(user?.id) === String(post.author.id)) && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 z-20">
                          <button
                            onClick={() => {
                              setShowMenu(false)
                              handleDelete()
                            }}
                            className="w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Sil</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{post.title}</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            </div>
          </div>

          {/* Cover Media (Image or Video) */}
          {post.coverImageUrl && (
            <div className="mb-4 rounded-2xl overflow-hidden">
              {post.coverImageUrl.includes('/video/upload') || post.coverImageUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video
                  src={getImageUrl(post.coverImageUrl)}
                  controls
                  className="w-full h-auto max-h-[600px] object-contain rounded-2xl bg-black"
                  onError={(e) => {
                    console.error("Video yüklenemedi:", e)
                  }}
                >
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
              ) : (
                <img
                  src={getImageUrl(post.coverImageUrl)}
                  alt={post.title}
                  className="w-full h-auto object-cover rounded-2xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                disabled={!token || isLiking}
                className={`flex items-center gap-2 transition-colors ${
                  post.isLiked
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                <span className="font-medium">{post.likeCount}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{post.commentCount}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Eye className="w-5 h-5" />
                <span className="font-medium">{post.viewsCount || 0}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={!token || isSaving}
                className={`p-2 transition-colors ${
                  isBookmarked
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
              </button>

              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="card p-6">
          <CommentSection postId={post.id} />
        </div>
      </main>
    </div>
  )
}
