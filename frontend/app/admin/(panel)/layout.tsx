"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInput,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Users,
  FileText,
  Tags,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: "Kullanıcılar", href: "/admin/users", icon: Users },
  { title: "Gönderiler", href: "/admin/posts", icon: FileText },
  { title: "Kategoriler", href: "/admin/categories", icon: Tags },
  { title: "Etiketler", href: "/admin/tags", icon: Tags },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Image
              src="/placeholder-logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-semibold">Admin</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menü</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} className={cn("flex items-center gap-2")}> 
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <div className="px-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                logout()
                router.push("/login")
              }}
            >
              <LogOut className="mr-2 size-4" /> Çıkış
            </Button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-3 backdrop-blur-md md:px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground hidden sm:inline">Yönetim Paneli</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block w-64">
              <SidebarInput placeholder="Ara..." />
            </div>
            <Avatar className="size-8">
              <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}


