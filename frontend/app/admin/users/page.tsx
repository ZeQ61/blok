"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { useAdminUsers } from "@/hooks/useAdminUsers"

export default function AdminUsersPage() {
  const { users, loading, error, pagination, setPage, search, deleteUser } = useAdminUsers()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kullanıcılar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Kullanıcı adı veya e-posta ile ara..."
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
              <TableHead>Kullanıcı Adı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Çevrimiçi</TableHead>
              <TableHead>Oluşturma</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>Yükleniyor...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>Kayıt bulunamadı</TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>@{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.roleName}</TableCell>
                  <TableCell>{u.isOnline ? "Evet" : "Hayır"}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (confirm(`${u.username} kullanıcısını silmek istediğine emin misin? Bu işlem geri alınamaz.`)) {
                          const res = await deleteUser(u.id)
                          if (!res.success) {
                            alert(res.error || "Silme işlemi başarısız")
                          }
                        }
                      }}
                    >
                      Sil
                    </Button>
                  </TableCell>
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
