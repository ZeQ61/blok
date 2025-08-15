"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function AdminSettingsPage() {
  const [siteTitle, setSiteTitle] = useState("Blok Platformu")
  const [maintenance, setMaintenance] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Site Başlığı</Label>
            <Input id="title" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-medium">Bakım Modu</div>
              <div className="text-sm text-muted-foreground">Siteyi geçici olarak kullanıcı erişimine kapatır</div>
            </div>
            <Switch checked={maintenance} onCheckedChange={setMaintenance} />
          </div>

          <Button className="w-full sm:w-auto">Kaydet</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Güvenlik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>2FA</Label>
            <div className="text-sm text-muted-foreground">İki adımlı doğrulama (yakında)</div>
          </div>
          <Button variant="outline" disabled>
            Etkinleştir
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


