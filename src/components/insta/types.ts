export interface MediaItem {
  id: string
  kind: 'image' | 'video' | 'audio' | 'text'
  prompt: string
  model: string
  provider?: string | null
  mimeType?: string | null
  duration?: string | null
  meta?: {
    caption?: string
    hashtags?: string[]
    voice?: string
    style?: string
    aspectRatio?: string
    resolution?: string
    [k: string]: unknown
  } | null
  createdAt: number
  url: string
}

export interface VoicesResponse {
  google: Array<{ id: string; name: string }>
  elevenlabs: Array<{ id: string; name: string; category: string }>
  elevenError: string | null
}
