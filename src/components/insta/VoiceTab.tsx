'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { GOOGLE_TTS_MODELS, ELEVEN_MODELS } from '@/lib/models'
import { Loader2, Mic, Download, Wand2, AlertTriangle } from 'lucide-react'
import type { VoicesResponse } from './types'

export function VoiceTab({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast()
  const [provider, setProvider] = useState<'google' | 'elevenlabs'>('google')
  const [text, setText] = useState('')
  const [style, setStyle] = useState('حماسي وودود')
  const [googleVoice, setGoogleVoice] = useState('Kore')
  const [googleModel, setGoogleModel] = useState<string>(GOOGLE_TTS_MODELS[0].id)
  const [elevenVoice, setElevenVoice] = useState('')
  const [elevenModel, setElevenModel] = useState<string>(ELEVEN_MODELS[0].id)
  const [voices, setVoices] = useState<VoicesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url: string } | null>(null)

  useEffect(() => {
    fetch('/api/voices')
      .then((r) => r.json())
      .then((data: VoicesResponse) => {
        setVoices(data)
        if (data.elevenlabs?.length) setElevenVoice(data.elevenlabs[0].id)
      })
      .catch(() => {})
  }, [])

  async function handleGenerate() {
    if (!text.trim()) {
      toast({ title: 'انتبه', description: 'اكتب النص المراد تحويله لصوت أولاً', variant: 'destructive' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const payload =
        provider === 'google'
          ? { provider, text, voice: googleVoice, model: googleModel, style }
          : { provider, text, voice: elevenVoice, model: elevenModel }
      const res = await fetch('/api/generate/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل توليد الصوت')
      setResult({ url: data.url })
      toast({ title: 'تم توليد الصوت بنجاح' })
      onCreated()
    } catch (e) {
      toast({ title: 'تعذر توليد الصوت', description: (e as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-rose-500" />
            تعليق صوتي للريلز
          </CardTitle>
          <CardDescription>
            حوّل نصك إلى تعليق صوتي احترافي باستخدام Google AI أو ElevenLabs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={provider}
            onValueChange={(v) => setProvider(v as 'google' | 'elevenlabs')}
            className="grid grid-cols-2 gap-3"
          >
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition ${
                provider === 'google' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-border'
              }`}
            >
              <RadioGroupItem value="google" />
              Google TTS
            </label>
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition ${
                provider === 'elevenlabs' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-border'
              }`}
            >
              <RadioGroupItem value="elevenlabs" />
              ElevenLabs
            </label>
          </RadioGroup>

          {provider === 'elevenlabs' && voices?.elevenError && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{voices.elevenError}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="voice-text">النص</Label>
            <Textarea
              id="voice-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="مثال: خصم خاص لفترة محدودة! كل منتجاتك المفضلة بأسعار مذهلة، اطلب الآن قبل انتهاء العرض"
              rows={5}
              className="resize-none"
            />
          </div>

          {provider === 'google' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>الصوت</Label>
                  <Select value={googleVoice} onValueChange={setGoogleVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {(voices?.google ?? []).map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الموديل</Label>
                  <Select value={googleModel} onValueChange={setGoogleModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOOGLE_TTS_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="voice-style">أسلوب الأداء</Label>
                <Input
                  id="voice-style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="مثال: حماسي وودود"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الصوت</Label>
                <Select value={elevenVoice} onValueChange={setElevenVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder={voices?.elevenlabs?.length ? 'اختر صوتاً' : 'جارٍ التحميل...'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {(voices?.elevenlabs ?? []).map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الموديل</Label>
                <Select value={elevenModel} onValueChange={setElevenModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ELEVEN_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="insta-gradient w-full font-bold text-white hover:opacity-90"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جارٍ توليد الصوت...
              </>
            ) : (
              <>
                <Wand2 className="ml-2 h-4 w-4" />
                توليد الصوت
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>النتيجة</CardTitle>
          <CardDescription>استمع للتعليق الصوتي وحمّله بصيغة صوتية جاهزة للريلز</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin text-rose-400" />
              <p className="text-sm">جارٍ تسجيل الصوت...</p>
            </div>
          ) : result ? (
            <div className="w-full space-y-4">
              <audio controls src={result.url} className="w-full" />
              <a href={`${result.url}?download=1`} download>
                <Button variant="outline" className="w-full">
                  <Download className="ml-2 h-4 w-4" />
                  تحميل الملف الصوتي
                </Button>
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Mic className="h-12 w-12 text-rose-200" />
              <p className="text-sm">لم يتم توليد أي صوت بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
