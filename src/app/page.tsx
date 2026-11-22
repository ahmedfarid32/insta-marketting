'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageTab } from '@/components/insta/ImageTab'
import { VideoTab } from '@/components/insta/VideoTab'
import { CaptionTab } from '@/components/insta/CaptionTab'
import { VoiceTab } from '@/components/insta/VoiceTab'
import { GalleryTab } from '@/components/insta/GalleryTab'
import { Instagram, ImageIcon, Film, Type, Mic, LayoutGrid, Sparkles } from 'lucide-react'

export default function Home() {
  const [galleryKey, setGalleryKey] = useState(0)
  const bump = () => setGalleryKey((k) => k + 1)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50/60 via-background to-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="insta-gradient flex h-11 w-11 items-center justify-center rounded-2xl shadow-md">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight sm:text-xl">
                Insta<span className="insta-gradient-text"> Marketing</span>
              </h1>
              <p className="text-xs text-muted-foreground">صور • ريلز • كابشن • صوت — بالذكاء الاصطناعي</p>
            </div>
          </div>
          <span className="hidden items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 sm:flex">
            <Sparkles className="h-3.5 w-3.5" />
            Google AI + ElevenLabs
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Tabs defaultValue="image" dir="rtl" className="w-full">
          <TabsList className="pretty-scrollbar mb-6 grid h-auto w-full grid-cols-2 gap-1 overflow-x-auto sm:grid-cols-5">
            <TabsTrigger value="image" className="gap-1.5 py-2 text-xs font-bold sm:text-sm">
              <ImageIcon className="h-4 w-4" />
              صور المنشورات
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1.5 py-2 text-xs font-bold sm:text-sm">
              <Film className="h-4 w-4" />
              فيديو ريلز
            </TabsTrigger>
            <TabsTrigger value="caption" className="gap-1.5 py-2 text-xs font-bold sm:text-sm">
              <Type className="h-4 w-4" />
              كابشن وهاشتاج
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-1.5 py-2 text-xs font-bold sm:text-sm">
              <Mic className="h-4 w-4" />
              تعليق صوتي
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-1.5 py-2 text-xs font-bold sm:text-sm">
              <LayoutGrid className="h-4 w-4" />
              المعرض
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image">
            <ImageTab onCreated={bump} />
          </TabsContent>
          <TabsContent value="video">
            <VideoTab onCreated={bump} />
          </TabsContent>
          <TabsContent value="caption">
            <CaptionTab onCreated={bump} />
          </TabsContent>
          <TabsContent value="voice">
            <VoiceTab onCreated={bump} />
          </TabsContent>
          <TabsContent value="gallery">
            <GalleryTab refreshKey={galleryKey} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-auto border-t bg-background">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
          Insta Marketing — يعمل بـ Google AI (صور، فيديو، نصوص، صوت) و ElevenLabs (أصوات) وقاعدة بيانات Turso
        </div>
      </footer>
    </div>
  )
}
