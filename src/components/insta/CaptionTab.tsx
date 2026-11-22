'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { CAPTION_MODELS, TONES } from '@/lib/models'
import { Loader2, Type, Copy, Hash, Wand2 } from 'lucide-react'

export function CaptionTab({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast()
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<string>(TONES[0])
  const [language, setLanguage] = useState('ar')
  const [cta, setCta] = useState('')
  const [model, setModel] = useState<string>(CAPTION_MODELS[0].id)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ caption: string; hashtags: string[] } | null>(null)

  async function handleGenerate() {
    if (!topic.trim()) {
      toast({ title: 'انتبه', description: 'اكتب وصف المنتج أو الموضوع أولاً', variant: 'destructive' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/generate/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, language, cta: cta || undefined, model }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل توليد الكابشن')
      setResult({ caption: data.caption, hashtags: data.hashtags })
      toast({ title: 'تم توليد الكابشن والهاشتاجات' })
      onCreated()
    } catch (e) {
      toast({ title: 'تعذر توليد الكابشن', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast({ title: `تم نسخ ${label}` })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-rose-500" />
            كابشن وهاشتاجات
          </CardTitle>
          <CardDescription>
            اكتب وصفاً لمنتجك أو خدمتك وسيقوم الذكاء الاصطناعي بكتابة منشور جذاب مع هاشتاجات مناسبة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cap-topic">وصف المنتج / الموضوع</Label>
            <Textarea
              id="cap-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: متجر عطور فاخرة، خصم 30% لأول 100 عميل، توصيل لجميع المحافظات"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>نبرة الكتابة</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>اللغة</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">عربي</SelectItem>
                  <SelectItem value="en">إنجليزي</SelectItem>
                  <SelectItem value="mix">عربي + إنجليزي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cap-cta">دعوة لاتخاذ إجراء (اختياري)</Label>
              <Input
                id="cap-cta"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="اطلب الآن من الرابط في البايو"
              />
            </div>
            <div className="space-y-2">
              <Label>الموديل</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAPTION_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                جارٍ كتابة الكابشن...
              </>
            ) : (
              <>
                <Wand2 className="ml-2 h-4 w-4" />
                توليد الكابشن
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>النتيجة</CardTitle>
          <CardDescription>كابشن جاهز للنسخ مع هاشتاجات مقترحة</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-rose-400" />
              <p className="text-sm">جارٍ صياغة النص التسويقي...</p>
            </div>
          ) : result ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>الكابشن</Label>
                  <Button variant="ghost" size="sm" onClick={() => copy(result.caption, 'الكابشن')}>
                    <Copy className="ml-1 h-4 w-4" />
                    نسخ
                  </Button>
                </div>
                <div className="pretty-scrollbar max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border bg-rose-50/50 p-4 text-sm leading-7">
                  {result.caption}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    الهاشتاجات
                  </Label>
                  <Button variant="ghost" size="sm" onClick={() => copy(result.hashtags.join(' '), 'الهاشتاجات')}>
                    <Copy className="ml-1 h-4 w-4" />
                    نسخ
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((h) => (
                    <span
                      key={h}
                      className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-800"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Type className="h-12 w-12 text-rose-200" />
              <p className="text-sm">لم يتم توليد أي كابشن بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
