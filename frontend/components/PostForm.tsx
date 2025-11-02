"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tag, ImageIcon, Video, Smile, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { usePosts } from "@/hooks/usePosts"
import { getImageUrl } from "@/lib/utils"

interface PostFormProps {
  onPostCreated?: () => void
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { token, user } = useAuth()
  const { createPost, uploadPostImage, uploadPostMedia } = usePosts()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tagNames, setTagNames] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [error, setError] = useState("")
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (!token || !title.trim() || !content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError("")

    try {
      let coverImageUrl = ""
      
      // Eğer medya (resim veya video) seçilmişse önce yükle
      if (selectedMedia) {
        const mediaUrl = await handleMediaUpload()
        if (mediaUrl) {
          coverImageUrl = mediaUrl
        } else {
          setIsSubmitting(false)
          return
        }
      }

      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        tagNames: tagNames,
        coverImageUrl: coverImageUrl,
      })

      if (result.success) {
        setTitle("")
        setContent("")
        setTagInput("")
        setTagNames([])
        setSelectedMedia(null)
        setMediaPreview(null)
        setMediaType(null)
        setShowEmojiPicker(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
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

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && tagInput === "" && tagNames.length > 0) {
      // Son etiketi sil
      setTagNames((prev) => prev.slice(0, -1))
    }
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return

    // @ işareti varsa kaldır, yoksa ekle
    const cleanTag = trimmed.startsWith("@") ? trimmed.substring(1) : trimmed
    if (cleanTag && !tagNames.includes(cleanTag.toLowerCase())) {
      setTagNames((prev) => [...prev, cleanTag.toLowerCase()])
      setTagInput("")
    }
  }

  const removeTag = (tagName: string) => {
    setTagNames((prev) => prev.filter((t) => t !== tagName))
  }

  const addEmoji = (emoji: string) => {
    setContent(content + emoji)
    setShowEmojiPicker(false)
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const fileType = file.type
      let type: "image" | "video" | null = null

      // Dosya tipi kontrolü
      if (fileType.startsWith('image/')) {
        type = "image"
        // Resim boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Resim boyutu 5MB\'dan küçük olmalıdır!')
          return
        }
      } else if (fileType.startsWith('video/')) {
        type = "video"
        // Video boyutu kontrolü (100MB)
        if (file.size > 100 * 1024 * 1024) {
          setError('Video boyutu 100MB\'dan küçük olmalıdır!')
          return
        }
      } else {
        setError('Sadece resim ve video dosyaları yüklenebilir!')
        return
      }

      setSelectedMedia(file)
      setMediaType(type)
      setError('')

      // Preview oluştur
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMedia = () => {
    setSelectedMedia(null)
    setMediaPreview(null)
    setMediaType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleMediaUpload = async () => {
    if (!selectedMedia) return

    setIsUploadingMedia(true)
    setError('')

    try {
      // Medya tipine göre uygun upload fonksiyonunu kullan
      let mediaUrl: string | undefined
      
      if (mediaType === "video") {
        const result = await uploadPostMedia(selectedMedia)
        mediaUrl = result.mediaUrl
        if (!result.success) {
          setError(result.error || 'Video yüklenemedi')
          return null
        }
      } else {
        const result = await uploadPostImage(selectedMedia)
        mediaUrl = result.imageUrl
        if (!result.success) {
          setError(result.error || 'Resim yüklenemedi')
          return null
        }
      }

      if (mediaUrl) {
        // Media URL'yi state'e kaydet (post oluştururken kullanılacak)
        setSelectedMedia(null)
        setMediaPreview(null)
        setMediaType(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return mediaUrl
      } else {
        setError('Medya yüklenemedi')
        return null
      }
    } catch (error) {
      setError('Medya yükleme sırasında hata oluştu')
      return null
    } finally {
      setIsUploadingMedia(false)
    }
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
              src={getImageUrl(user.profileImgUrl)}
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

      {/* Media Preview */}
      {mediaPreview && (
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {mediaType === "video" ? "Seçilen Video" : "Seçilen Resim"}
          </label>
          <div className="relative inline-block">
            {mediaType === "video" ? (
              <video
                src={mediaPreview}
                controls
                className="w-full max-w-md h-48 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-full max-w-md h-48 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-600"
              />
            )}
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaSelect}
        className="hidden"
      />

      {/* Tags input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Etiketler (isteğe bağlı)
        </label>
        <div className="space-y-2">
          {/* Tag input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="@araba veya araba yazın..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:ring-opacity-30 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Ekle
            </button>
          </div>
          {/* Selected tags */}
          {tagNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tagNames.map((tagName) => (
                <span
                  key={tagName}
                  className="inline-flex items-center px-3 py-2 rounded-2xl text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  <Tag className="w-3 h-3 mr-1" />@{tagName}
                  <button
                    type="button"
                    onClick={() => removeTag(tagName)}
                    className="ml-2 hover:text-gray-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @ işareti ile başlayabilir veya doğrudan yazabilirsiniz. Enter, virgül veya boşluk ile ekleyin.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-2xl bg-gradient-to-br transition-all duration-300 transform hover:scale-110 ${
              selectedMedia
                ? "from-blue-200 to-purple-200 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300"
                : "from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-600 dark:text-gray-300 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
            }`}
            title={mediaType === "video" ? "Video eklendi" : "Resim/Video ekle"}
            disabled={isUploadingMedia}
          >
            {isUploadingMedia ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mediaType === "video" ? (
              <Video className="w-5 h-5" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
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
          disabled={!title.trim() || !content.trim() || isSubmitting}
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
