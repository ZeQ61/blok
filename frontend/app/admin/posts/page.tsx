"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useAdminPosts } from "@/hooks/useAdminPosts"

export default function AdminPostsPage() {
  const { posts, loading, error, pagination, setPage, search } = useAdminPosts()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gönderiler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Başlık veya slug ile ara..."
            className="w-full max-w-md px-3 py-2 border rounded-md"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = (e.target as HTMLInputElement).value
                search(value)
              }
            }}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Başlık</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Yazar</TableHead>
              <TableHead>Yayın</TableHead>
              <TableHead>Oluşturma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Yükleniyor...</TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>Kayıt bulunamadı</TableCell>
              </TableRow>
            ) : (
              posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>{p.slug}</TableCell>
                  <TableCell>@{p.authorUsername}</TableCell>
                  <TableCell>{p.published ? "Evet" : "Hayır"}</TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (!pagination.isFirst) setPage(pagination.page - 1)
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 py-2 text-sm text-muted-foreground">
                Sayfa {pagination.page + 1} / {Math.max(1, pagination.totalPages)}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (!pagination.isLast) setPage(pagination.page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {error && (
          <div className="text-sm text-red-600">Bir hata oluştu. Lütfen tekrar deneyin.</div>
        )}
      </CardContent>
    </Card>
  )
}
