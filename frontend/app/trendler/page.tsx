"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { useRouter } from "next/navigation";
import { usePosts } from "@/hooks/usePosts";
import Header from "@/components/Header";

interface Post {
  id: string;
  title: string;
  content: string;
  coverImageUrl?: string;
  author: {
    id: string;
    username: string;
    profileImgUrl?: string;
  };
  category: {
    id: number;
    name: string;
  };
  tags: Array<{
    id: number;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  viewsCount: number;
  isLiked: boolean;
}

export default function TrendlerPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toggleLike } = usePosts();

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

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      const res = await apiClient.get<Post[]>("/api/posts/top-liked");
      setPosts(((res.data as any[]) || []).map(mapDtoToPost));
      setLoading(false);
    };
    fetchTrends();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/")}
          className="mb-6 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          ← Geri Dön
        </button>
        <h1 className="text-3xl font-bold mb-8 text-left gradient-text">Trend Konular</h1>
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
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Hiç trend konu yok.</div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={async (postId) => {
                  await toggleLike(postId);
                  setPosts((prev) => prev.map((p) => p.id === postId ? {
                    ...p,
                    isLiked: !p.isLiked,
                    likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
                  } : p));
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 