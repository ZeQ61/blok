"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tag, ImageIcon, Smile, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useCategories, useTags } from "@/hooks/useCategories"
import { usePosts } from "@/hooks/usePosts"

interface PostFormProps {
  onPostCreated?: () => void
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { token, user } = useAuth()
  const { categories } = useCategories()
  const { tags } = useTags()
  const { createPost } = usePosts()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [error, setError] = useState("")

  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const emojis = ["😀", "😂", "❤️", "👍", "🎉", "🔥", "💯", "✨", "🚀", "💡", "🌟", "⚡"]

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !title.trim() || !content.trim() || !selectedCategoryId || isSubmitting) return

    setIsSubmitting(true)
    setError("")

    try {
      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        categoryId: selectedCategoryId,
        tagIds: selectedTagIds,
      })

      if (result.success) {
        setTitle("")
        setContent("")
        setSelectedCategoryId(null)
        setSelectedTagIds([])
        setShowEmojiPicker(false)
        if (onPostCreated) {
          onPostCreated()
        }
      } else {
        setError(result.error || "Gönderi oluşturulamadı")
      }
    } catch (error) {
      setError("Beklenmeyen bir hata oluştu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const addEmoji = (emoji: string) => {
    setContent(content + emoji)
    setShowEmojiPicker(false)
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  if (!token) {
    return (
      <div className="card p-8 text-center bounce-in">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Tag className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gönderi paylaşmak için giriş yapın</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Düşüncelerinizi paylaşmak için hesabınıza giriş yapmanız gerekiyor.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6 slide-in-up">
      {/* User info */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold">
          {user?.profileImgUrl ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${user.profileImgUrl}`}
              alt={user.username}
              className="w-12 h-12 rounded-2xl object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg"
              }}
            />
          ) : (
            user?.username?.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">@{user?.username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ne düşünüyorsun?</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Title input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Başlık</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Gönderinize bir başlık verin..."
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:ring-opacity-30 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300"
          maxLength={100}
          required
        />
      </div>

      {/* Content input */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">İçerik</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bugün ne paylaşmak istiyorsun? ✨"
          className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-3xl focus:ring-4 focus:ring-blue-300 focus:ring-opacity-30 focus:border-blue-500 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100 resize-none transition-all duration-300 text-lg leading-relaxed"
          rows={4}
          maxLength={1000}
          required
        />
        <div className="absolute bottom-4 right-4 flex items-center space-x-2">
          <span
            className={`text-sm font-medium ${
              content.length > 900
                ? "text-red-500"
                : content.length > 800
                  ? "text-yellow-500"
                  : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {1000 - content.length}
          </span>
        </div>
      </div>

      {/* Category selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Kategori *</label>
        <select
          value={selectedCategoryId || ""}
          onChange={(e) => setSelectedCategoryId(Number(e.target.value) || null)}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:ring-opacity-30 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300"
          required
        >
          <option value="">Kategori seçin...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Etiketler (isteğe bağlı)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              className={`inline-flex items-center px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                selectedTagIds.includes(tag.id)
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
              }`}
            >
              <Tag className="w-3 h-3 mr-1" />#{tag.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          İstediğiniz etiketleri seçin. Seçilen: {selectedTagIds.length}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 transform hover:scale-110"
            title="Fotoğraf ekle"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className={`p-3 rounded-2xl bg-gradient-to-br transition-all duration-300 transform hover:scale-110 ${
                showEmojiPicker
                  ? "from-yellow-200 to-orange-200 dark:from-yellow-900/40 dark:to-orange-900/40 text-yellow-700 dark:text-yellow-300"
                  : "from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20"
              }`}
              title="Emoji ekle"
            >
              <Smile className="w-5 h-5" />
            </button>

            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 grid grid-cols-6 gap-2 slide-in-up z-20">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-125 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !content.trim() || !selectedCategoryId || isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Paylaşılıyor...</span>
            </div>
          ) : (
            "Paylaş ✨"
          )}
        </button>
      </div>
    </form>
  )
}
