"use client"

import { useState, useEffect, useRef } from "react"
import { X, Copy, Twitter, Facebook, Linkedin } from "lucide-react"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
  postUrl?: string
}

export default function ShareModal({ isOpen, onClose, content, postUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Get current URL if postUrl is not provided
  const currentUrl = typeof window !== "undefined" ? window.location.href : ""
  const finalPostUrl = postUrl || currentUrl

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shareText = content.length > 100 ? content.substring(0, 100) + "..." : content
  const encodedText = encodeURIComponent(shareText)
  const encodedUrl = encodeURIComponent(finalPostUrl)

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: "from-blue-400 to-blue-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      color: "from-blue-600 to-blue-800",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
      color: "from-blue-700 to-blue-900",
    },
  ]

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n\n${finalPostUrl}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = `${shareText}\n\n${finalPostUrl}`
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Kopyalama hatası:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md slide-in-up"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gönderiyi Paylaş</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Content preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{shareText}</p>
          </div>

          {/* Copy link */}
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            {copied ? (
              <>
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="font-medium text-green-600 dark:text-green-400">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Linki Kopyala</span>
              </>
            )}
          </button>

          {/* Social media links */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">Sosyal medyada paylaş</p>
            <div className="grid grid-cols-3 gap-3">
              {shareLinks.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center space-y-2 p-4 bg-gradient-to-br ${platform.color} text-white rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                >
                  <platform.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
