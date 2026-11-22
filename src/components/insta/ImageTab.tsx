'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { IMAGE_MODELS, ASPECT_RATIOS, IMAGE_SIZES } from '@/lib/models'
import { Loader2, ImageIcon, Download, Sparkles, Wand2 } from 'lucide-react'

const IDEAS = [
  'إعلان فخم لعطر رجالي فاخر على خلفية سوداء مع دخان ذهبي وإضاءة استوديو درامية',
  'فنجان قهوة لاتيه بتصميم قلب على الرغوة بجانب زهور صغيرة على طاولة خشبية دافئة',
  'صورة منتج لعصير مانجو طبيعي مع قطرات ماء منعشة وخلفية صفراء زاهية',
  'متجر ملابس داخلي عصري بإضاءة دافئة ورفوف خشبية بأسلوب مينيمال',
]

export function ImageTab({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<string>(IMAGE_MODELS[0].id)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [imageSize, setImageSize] = useState('1K')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url: string; prompt: string } | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast({ title: 'انتبه', description: 'اكتب وصف الصورة أولاً', variant: 'destructive' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, aspectRatio, imageSize }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل توليد الصورة')
      setResult({ url: data.url, prompt })
      toast({ title: 'تم توليد الصورة بنجاح', description: 'يمكنك تحميلها من المعرض أو من هنا' })
      onCreated()
    } catch (e) {
      toast({ title: 'تعذر توليد الصورة', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-rose-500" />
            إنشاء صورة للمنشور
          </CardTitle>
          <CardDescription>
            اكتب وصفاً تفصيلياً للصورة التي تريدها — المنتج، الإضاءة، الألوان، الأسلوب
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="img-prompt">وصف الصورة (Prompt)</Label>
            <Textarea
              id="img-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: إعلان فخم لساعة يد ذهبية على رخام أبيض بإضاءة ناعمة..."
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
                <Sparkles className="ml-1 inline h-3 w-3" />
                {idea.slice(0, 32)}…
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>الموديل</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {IMAGE_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>أبعاد الصورة</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الجودة</Label>
              <Select value={imageSize} onValueChange={setImageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_SIZES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
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
                جارٍ توليد الصورة... قد يستغرق 10-30 ثانية
              </>
            ) : (
              <>
                <Wand2 className="ml-2 h-4 w-4" />
                توليد الصورة
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>النتيجة</CardTitle>
          <CardDescription>ستظهر الصورة هنا بعد التوليد مباشرة</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-rose-400" />
              <p className="text-sm">جارٍ الرسم بالذكاء الاصطناعي...</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              { }
              <img
                src={result.url}
                alt={result.prompt}
                className="max-h-[420px] w-full rounded-xl border object-contain"
              />
              <a href={`${result.url}?download=1`} download>
                <Button variant="outline" className="w-full">
                  <Download className="ml-2 h-4 w-4" />
                  تحميل الصورة
                </Button>
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-12 w-12 text-rose-200" />
              <p className="text-sm">لم يتم توليد أي صورة بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
