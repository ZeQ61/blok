"use client"

import { useState } from "react"
import { Heart, MessageCircle, Trash2, Tag, Share2, Bookmark, MoreHorizontal, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import CommentSection from "./CommentSection"
import ShareModal from "./ShareModal"
import type { Post } from "@/lib/api"

interface PostCardProps {
  post: Post
  onDelete?: (postId: string) => void
  onLike?: (postId: string) => void
}

export default function PostCard({ post, onDelete, onLike }: PostCardProps) {
  const { user, isAdmin, token } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const handleLike = async () => {
    if (!token || isLiking || !onLike) return

    setIsLiking(true)
    await onLike(post.id)
    setIsLiking(false)
  }

  const handleDelete = async () => {
    const isOwner = String(user?.id) === String(post.author.id)
    if (!token || (!isAdmin && !isOwner) || !onDelete) return

    if (confirm("Bu gönderiyi silmek istediğinizden emin misiniz?")) {
      await onDelete(post.id)
    }
  }

  const handleShare = async () => {
    // Check if Web Share API is supported and available
    if (navigator.share && navigator.canShare) {
      try {
        const shareData = {
          title: `${post.author.username} - ${post.title}`,
          text: post.content,
          url: window.location.href,
        }

        // Check if the data can be shared
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      } catch (error) {
        console.log("Native share failed, showing custom modal:", error)
        // Fall through to custom modal
      }
    }

    // Fallback to custom share modal
    setShowShareModal(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Az önce"
    if (diffInHours < 24) return `${diffInHours} saat önce`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`
    return date.toLocaleDateString("tr-TR")
  }

  return (
    <>
      <article className="card p-6 slide-in-up group">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg transform group-hover:scale-110 transition-all duration-300">
              {post.author.profileImgUrl ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${post.author.profileImgUrl}`}
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
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                  @{post.author.username}
                </h3>
                <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.createdAt)}</span>
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 slide-in-up z-10">
                    <button
                      onClick={() => {
                        setIsBookmarked(!isBookmarked)
                        setShowMenu(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current text-blue-600" : ""}`} />
                      <span>{isBookmarked ? "Kaydetmekten çıkar" : "Kaydet"}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleShare()
                        setShowMenu(false)
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Paylaş</span>
                    </button>
                    {(isAdmin || String(user?.id) === String(post.author.id)) && (
                      <button
                        onClick={() => {
                          handleDelete()
                          setShowMenu(false)
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Sil</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-3">{post.title}</h2>

            {/* Content */}
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{post.content}</p>

            {/* Category */}
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-800 dark:text-green-200">
                📁 {post.category?.name}
              </span>
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-900/50 dark:hover:to-purple-900/50 transition-all duration-200 cursor-pointer transform hover:scale-105"
                  >
                    <Tag className="w-3 h-3 mr-1" />#{tag?.name}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  disabled={!token || isLiking}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    post.isLiked
                      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/20 dark:hover:to-pink-900/20"
                  } ${!token ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""} ${isLiking ? "animate-pulse" : ""}`}
                  />
                  <span className="font-medium">{post.likeCount}</span>
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 transform hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">{post.commentCount}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                    isBookmarked
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 transform hover:scale-110"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 fade-in">
            <CommentSection postId={post.id} />
          </div>
        )}
      </article>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        content={`${post.title}\n\n${post.content}`}
        postUrl={`${window.location.origin}/post/${post.id}`}
      />
    </>
  )
}
