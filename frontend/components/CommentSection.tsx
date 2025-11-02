"use client"

import type React from "react"

import { useState } from "react"
import { Trash2, Reply, Heart, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useComments } from "@/hooks/useComments"
import { getImageUrl } from "@/lib/utils"

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, token, isAdmin } = useAuth()
  const { comments, loading, error, createComment, toggleCommentLike, deleteComment } = useComments(postId)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const result = await createComment({
      postId,
      content: newComment.trim(),
    })

    if (result.success) {
      setNewComment("")
    } else {
      alert(result.error || "Yorum gönderilemedi")
    }
    setIsSubmitting(false)
  }

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!token || !replyContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    const result = await createComment({
      postId,
      content: replyContent.trim(),
      parentCommentId: parentId,
    })

    if (result.success) {
      setReplyContent("")
      setReplyTo(null)
    } else {
      alert(result.error || "Yanıt gönderilemedi")
    }
    setIsSubmitting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return

    if (confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
      const result = await deleteComment(commentId)
      if (!result.success && result.error) {
        alert(result.error)
      }
    }
  }

  const handleLikeComment = async (commentId: string) => {
    if (!token) return

    const result = await toggleCommentLike(commentId)
    if (!result.success && result.error) {
      alert(result.error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Az önce"
    if (diffInMinutes < 60) return `${diffInMinutes}dk önce`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}sa önce`
    return `${Math.floor(diffInMinutes / 1440)}g önce`
  }

  const CommentItem = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-8 mt-3" : "mt-4"}`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {comment.author.profileImgUrl ? (
            <img
              src={getImageUrl(comment.author.profileImgUrl)}
              alt={comment.author.username}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg"
              }}
            />
          ) : (
            comment.author.username.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{comment.author.username}</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">{formatDate(comment.createdAt)}</span>
            </div>

            {(isAdmin || user?.id === comment.author.id) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Yorumu sil"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <p className="mt-1 text-gray-900 dark:text-gray-100 text-sm">{comment.content}</p>

          <div className="flex items-center space-x-4 mt-2">
            {user && (
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center space-x-1 text-xs transition-colors ${
                  comment.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                }`}
              >
                <Heart className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`} />
                <span>{comment.likeCount}</span>
              </button>
            )}

            {!isReply && user && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Yanıtla</span>
              </button>
            )}
          </div>

          {replyTo === comment.id && (
            <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Yanıt yazın..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null)
                    setReplyContent("")
                  }}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isSubmitting}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Yanıtla</span>
                </button>
              </div>
            </form>
          )}

          {comment.replies &&
            comment.replies.map((reply: any) => <CommentItem key={reply.id} comment={reply} isReply={true} />)}
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-gray-500">Yorumlar yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Yorum yazın..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{500 - newComment.length} karakter kaldı</span>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Yorum Yap</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-1">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}

        {comments.length === 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            Henüz yorum yok. İlk yorumu yapan siz olun!
          </p>
        )}
      </div>
    </div>
  )
}
