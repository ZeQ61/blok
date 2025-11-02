import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Görsel URL'sini düzeltir. 
 * - Eğer URL zaten tam URL (http:// veya https:// ile başlıyor) ise olduğu gibi döndürür
 * - Cloudinary URL'leri otomatik olarak tanır ve düzeltir
 * - Relative path'ler için API URL'si ile birleştirir
 */
export function getImageUrl(url?: string | null): string {
  // Boş URL kontrolü
  if (!url || url.trim() === "") {
    return "/placeholder-user.jpg"
  }
  
  // Boşlukları temizle
  url = url.trim()
  
  // 1. Zaten tam URL ise (http:// veya https:// ile başlıyor) direkt döndür
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  
  // 2. Protocol-relative URL kontrolü (// ile başlıyorsa)
  if (url.startsWith("//")) {
    // Production'da https kullan, localhost'ta http kullan
    const isProduction = typeof window !== "undefined" && 
      !window.location.hostname.includes("localhost") && 
      !window.location.hostname.includes("127.0.0.1")
    return isProduction ? `https:${url}` : `http:${url}`
  }
  
  // 3. Cloudinary URL kontrolü - Cloudinary URL'leri asla base URL ile birleştirilmemeli
  // Cloudinary URL'leri genellikle "res.cloudinary.com" veya "cloudinary.com" içerir
  if (url.includes("cloudinary.com")) {
    // Eğer zaten https:// ile başlıyorsa direkt döndür
    if (url.startsWith("https://") || url.startsWith("http://")) {
      return url
    }
    // Protocol yoksa https:// ekle (Cloudinary her zaman HTTPS kullanır)
    // Eğer "res.cloudinary.com" zaten varsa sadece protocol ekle
    if (url.includes("res.cloudinary.com")) {
      return `https://${url}`
    }
    // Sadece domain veya path gibi görünüyorsa
    return `https://res.cloudinary.com${url.startsWith("/") ? url : `/${url}`}`
  }
  
  // 4. Relative path ise API URL'si ile birleştir
  const getApiBaseUrl = (): string => {
    // Browser'da çalışıyorsak window.location'dan API URL'i tespit et
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      const protocol = window.location.protocol
      const port = window.location.port
      
      // Production ortamları (Render, Vercel, vb.)
      if (hostname.includes("vercel.app") || hostname.includes("onrender.com") || hostname === "blok-maiq.vercel.app") {
        // Frontend Vercel'de (blok-maiq.vercel.app), backend Render'da (https://blok.onrender.com)
        // Environment variable'dan API URL'i al, yoksa varsayılan Render URL'ini kullan
        return process.env.NEXT_PUBLIC_API_URL || "https://blok.onrender.com"
      }
      
      // Localhost için
      if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      }
      
      // Diğer durumlarda environment variable kullan
      return process.env.NEXT_PUBLIC_API_URL || `${protocol}//${hostname}${port ? `:${port}` : ""}`
    }
    
    // Server-side rendering için
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  }
  
  const apiUrl = getApiBaseUrl()
  // URL başında / varsa zaten var, yoksa ekle
  const cleanUrl = url.startsWith("/") ? url : `/${url}`
  
  // API URL'in sonunda / varsa kaldır
  const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl
  
  return `${cleanApiUrl}${cleanUrl}`
}
