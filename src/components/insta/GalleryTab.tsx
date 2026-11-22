'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { KIND_LABELS } from '@/lib/models'
import type { MediaItem } from './types'
import { LayoutGrid, Trash2, Download, ImageIcon, Film, Mic, Type, RefreshCw } from 'lucide-react'

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'image', label: 'صور' },
  { id: 'video', label: 'فيديو' },
  { id: 'audio', label: 'صوت' },
  { id: 'text', label: 'كابشن' },
]

const KIND_ICON: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  text: <Type className="h-4 w-4" />,
}

export function GalleryTab({ refreshKey }: { refreshKey: number }) {
  const { toast } = useToast()
  const [items, setItems] = useState<MediaItem[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/media?limit=100')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems(data.items ?? [])
    } catch (e) {
      toast({ title: 'تعذر تحميل المعرض', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
     
  }, [refreshKey])

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast({ title: 'تم حذف العنصر' })
    } catch (e) {
      toast({ title: 'تعذر الحذف', description: (e as Error).message, variant: 'destructive' })
    }
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.kind === filter)

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  filter === f.id
                    ? 'insta-gradient text-white'
                    : 'border border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`ml-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {loading && items.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <LayoutGrid className="h-12 w-12 text-rose-200" />
            <p className="font-medium">المعرض فارغ</p>
            <p className="text-sm">ابدأ بتوليد صور أو فيديوهات أو كابشن وستظهر هنا</p>
          </div>
        ) : (
          <div className="pretty-scrollbar grid max-h-[70vh] gap-4 overflow-y-auto pl-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
                <div className="relative flex h-48 items-center justify-center bg-muted">
                  {item.kind === 'image' && (
                     
                    <img src={item.url} alt={item.prompt} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  {item.kind === 'video' && <video src={item.url} controls playsInline className="h-full w-full" preload="metadata" />}
                  {item.kind === 'audio' && (
                    <div className="flex w-full flex-col items-center gap-3 p-4">
                      <Mic className="h-8 w-8 text-rose-400" />
                      <audio controls src={item.url} className="w-full" preload="none" />
                    </div>
                  )}
                  {item.kind === 'text' && (
                    <div className="pretty-scrollbar h-full w-full overflow-y-auto p-4 text-sm leading-6">
                      <p className="whitespace-pre-wrap">{item.meta?.caption ?? item.prompt}</p>
                    </div>
                  )}
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                    {KIND_ICON[item.kind]}
                    {KIND_LABELS[item.kind] ?? item.kind}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-muted-foreground" title={item.prompt}>
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <div className="flex gap-1">
                      {item.kind !== 'text' && (
                        <a href={`${item.url}?download=1`} download title="تحميل">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
