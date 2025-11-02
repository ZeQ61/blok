import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Görsel URL'sini düzeltir. Eğer URL zaten tam URL (http:// veya https:// ile başlıyor) ise
 * olduğu gibi döndürür, değilse API URL'si ile birleştirir.
 */
export function getImageUrl(url?: string | null): string {
  if (!url) return "/placeholder-user.jpg"
  
  // Eğer URL zaten tam URL ise (http:// veya https:// ile başlıyor) direkt döndür
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  
  // Değilse API URL'si ile birleştir
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${url}`
}
