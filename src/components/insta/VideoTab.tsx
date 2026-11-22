'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { VIDEO_MODELS, VIDEO_RESOLUTIONS } from '@/lib/models'
import { Loader2, Film, Download, Wand2 } from 'lucide-react'

const IDEAS = [
  'فيديو ريلز لعطر يُرش على حرير وردي بإضاءة سينمائية وحركة كاميرا بطيئة، لقطة واحدة متصلة بدون حوار',
  'مشهد تحضير كوب شاي بالنعناع بخروج البخار ببطء على طاولة خشبية بإضاءة صباحية دافئة، لقطة قريبة مستمرة',
  'عرض سريع لسماعات لاسلكية تدور حول نفسها على خلفية متدرجة وردية مع إضاءة استوديو، لقطة واحدة متصلة',
]

export function VideoTab({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<string>(VIDEO_MODELS[0].id)
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [resolution, setResolution] = useState('720p')
  const [seconds, setSeconds] = useState([8])
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<{ url: string; prompt: string } | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast({ title: 'انتبه', description: 'اكتب وصف الفيديو أولاً', variant: 'destructive' })
      return
    }
    setLoading(true)
    setResult(null)
    setElapsed(0)
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000)
    try {
      const res = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          aspectRatio,
          resolution,
          duration: `${seconds[0]}s`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل توليد الفيديو')
      setResult({ url: data.url, prompt })
      toast({ title: 'تم توليد الفيديو بنجاح' })
      onCreated()
    } catch (e) {
      toast({ title: 'تعذر توليد الفيديو', description: (e as Error).message, variant: 'destructive' })
    } finally {
      clearInterval(timer)
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-rose-500" />
            إنشاء فيديو ريلز
          </CardTitle>
          <CardDescription>
            وصف المشهد، حركة الكاميرا، الإضاءة والمزاج — الموديل يولّد الفيديو مع صوت أصلي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vid-prompt">وصف الفيديو (Prompt)</Label>
            <Textarea
              id="vid-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: لقطة متصلة لفنجان قهوة يُصب فيه الحليب بحركة بطيئة، إضاءة دافئة..."
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setPrompt(idea)}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700 transition hover:bg-rose-100"
              >
                {idea.slice(0, 30)}…
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>الموديل</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الأبعاد</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9:16">9:16 — ريلز / ستوري</SelectItem>
                  <SelectItem value="16:9">16:9 — عريض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>الدقة</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_RESOLUTIONS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المدة: {seconds[0]} ثانية</Label>
              <Slider value={seconds} onValueChange={setSeconds} min={3} max={15} step={1} />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="insta-gradient w-full font-bold text-white hover:opacity-90"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جارٍ توليد الفيديو... {elapsed} ثانية (قد يستغرق 1-3 دقائق)
              </>
            ) : (
              <>
                <Wand2 className="ml-2 h-4 w-4" />
                توليد الفيديو
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>النتيجة</CardTitle>
          <CardDescription>سيظهر الفيديو هنا بعد اكتمال التوليد</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-rose-400" />
              <p className="text-sm">
                جارٍ إنشاء الفيديو... لا تغلق الصفحة
                <br />
                ({elapsed} ثانية)
              </p>
            </div>
          ) : result ? (
            <div className="w-full space-y-4">
              <video
                src={result.url}
                controls
                playsInline
                className="mx-auto max-h-[420px] rounded-xl border"
              />
              <a href={`${result.url}?download=1`} download>
                <Button variant="outline" className="w-full">
                  <Download className="ml-2 h-4 w-4" />
                  تحميل الفيديو
                </Button>
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Film className="h-12 w-12 text-rose-200" />
              <p className="text-sm">لم يتم توليد أي فيديو بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
