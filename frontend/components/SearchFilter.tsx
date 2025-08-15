"use client"

import type React from "react"

import { useState } from "react"
import { Search, Tag, X } from "lucide-react"

interface SearchFilterProps {
  onSearch: (query: string) => void
  onTagFilter: (tag: string) => void
  onClearFilters: () => void
  activeTag?: string
}

export default function SearchFilter({ onSearch, onTagFilter, onClearFilters, activeTag }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [tagQuery, setTagQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleTagSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (tagQuery.trim()) {
      onTagFilter(tagQuery.trim().toLowerCase())
      setTagQuery("")
    }
  }

  return (
    <div className="card p-4 space-y-4">
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      <form onSubmit={handleTagSearch} className="flex space-x-2">
        <div className="flex-1 relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Filter by tag..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      {activeTag && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Filtering by: {activeTag}</span>
          </div>
          <button
            onClick={onClearFilters}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
