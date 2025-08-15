"use client"

import { useState } from "react"
import Header from "@/components/Header"
import PostForm from "@/components/PostForm"
import PostCard from "@/components/PostCard"
import SearchFilter from "@/components/SearchFilter"
import ErrorAlert from "@/components/ErrorAlert"
import { TrendingUp, Users, MessageSquare, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePosts } from "@/hooks/usePosts"
import { useCategories, useTags } from "@/hooks/useCategories"

export default function HomePage() {
  const router = useRouter();
  const { posts, loading, error, fetchPosts, createPost, toggleLike, deletePost, retryFetch } = usePosts()
  const { categories } = useCategories()
  const { tags } = useTags()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTag, setActiveTag] = useState("")

  const handlePostCreated = () => {
    fetchPosts()
  }

  const handlePostDeleted = async (postId: string) => {
    const result = await deletePost(postId)
    if (!result.success && result.error) {
      // Error will be handled by the hook's error handler
    }
  }

  const handlePostLiked = async (postId: string) => {
    const result = await toggleLike(postId)
    if (!result.success && result.error) {
      // Error will be handled by the hook's error handler
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setActiveTag("")
  }

  const handleTagFilter = (tag: string) => {
    setActiveTag(tag)
    setSearchQuery("")
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setActiveTag("")
  }

  // Filter posts locally for now (until search API is implemented)
  const filteredPosts = posts.filter((post) => {
    if (searchQuery) {
      return (
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (activeTag) {
      return post.tags.some((tag) => tag.name.toLowerCase().includes(activeTag.toLowerCase()))
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <Header />

      {/* Error Alert */}
      <ErrorAlert
        error={error}
        onRetry={retryFetch}
        onDismiss={() => {}}
        type={error?.includes("bağlantı") || error?.includes("network") ? "network" : "error"}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="space-y-4">
              <div
                className="card p-6 text-center cursor-pointer hover:shadow-lg transition hover:scale-105"
                onClick={() => router.push("/trendler")}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Trend Konular</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bu hafta popüler</p>
              </div>

              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{posts.length}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Gönderi</p>
              </div>

              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{categories.length}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Kategori</p>
              </div>
            </div>

            {/* Popular Tags */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Popüler Etiketler</h3>
              <div className="space-y-2">
                {tags.slice(0, 5).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagFilter(tag.name)}
                    className="block w-full text-left px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <PostForm onPostCreated={handlePostCreated} />

            <SearchFilter
              onSearch={handleSearch}
              onTagFilter={handleTagFilter}
              onClearFilters={handleClearFilters}
              activeTag={activeTag}
            />

            {loading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-xl w-1/4"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-xl w-3/4"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-xl w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="card p-8 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gönderiler yüklenemedi</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button onClick={retryFetch} className="btn-primary">
                  Tekrar Dene
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {filteredPosts.map((post, index) => (
                    <div key={post.id} style={{ animationDelay: `${index * 0.1}s` }} className="slide-in-up">
                      <PostCard post={post} onDelete={handlePostDeleted} onLike={handlePostLiked} />
                    </div>
                  ))}
                </div>

                {filteredPosts.length === 0 && (
                  <div className="card p-16 text-center bounce-in">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {searchQuery || activeTag
                        ? "Aradığınız kriterlere uygun gönderi bulunamadı"
                        : "Henüz gönderi yok"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {searchQuery || activeTag
                        ? "Farklı anahtar kelimeler veya etiketler deneyebilirsiniz"
                        : "İlk gönderiyi paylaşan siz olun! ✨"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
