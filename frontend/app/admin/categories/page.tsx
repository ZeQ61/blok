"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCategories } from "@/hooks/useCategories"
import { Trash2 } from "lucide-react"

export default function AdminCategoriesPage() {
  const { categories, loading, createCategory, deleteCategory } = useCategories()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const addCategory = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    const res = await createCategory({ name: name.trim(), description: description.trim() || undefined })
    setSubmitting(false)
    if (res.success) {
      setName("")
      setDescription("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kategoriler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2">
          <Input placeholder="Yeni kategori adı" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Açıklama (opsiyonel)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={addCategory} disabled={submitting}>{submitting ? "Ekleniyor..." : "Ekle"}</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ad</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Açıklama</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Yükleniyor...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Kategori bulunamadı</TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.slug}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <span className="flex-1">{c.description || "-"}</span>
                    <Button variant="destructive" size="sm" onClick={() => deleteCategory(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
