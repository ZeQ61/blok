"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const initial = [
  { id: 1, name: "react" },
  { id: 2, name: "nextjs" },
  { id: 3, name: "tailwind" },
]

export default function AdminTagsPage() {
  const [tags, setTags] = useState(initial)
  const [name, setName] = useState("")

  const addTag = () => {
    if (!name.trim()) return
    setTags((prev) => [...prev, { id: prev.length + 1, name }])
    setName("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etiketler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Yeni etiket" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={addTag}>Ekle</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.id}</TableCell>
                <TableCell>#{t.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}


