// Google AI Studio (Gemini API) — Interactions API client
// Used server-side only.

const BASE = 'https://generativelanguage.googleapis.com/v1beta'

export class GoogleApiError extends Error {
  status: number
  code: string
  constructor(message: string, status = 500, code = 'unknown') {
    super(message)
    this.status = status
    this.code = code
  }
}

function apiKey(): string {
  const k = process.env.GOOGLE_AI_API_KEY
  if (!k) throw new GoogleApiError('مفتاح Google AI API غير مضبوط في متغيرات البيئة', 500, 'config')
  return k
}

/** Translate raw Google API errors into friendly Arabic messages */
function friendlyGoogleError(status: number, message: string, code?: string): GoogleApiError {
  const m = message || ''
  if (status === 429 || /quota|RESOURCE_EXHAUSTED/i.test(code + m)) {
    if (/limit: 0|Free Tier/i.test(m)) {
      return new GoogleApiError(
        'هذا الموديل غير متاح على الخطة المجانية من Google AI Studio (الحصة = 0). فعّل الفوترة (Billing) في مشروعك على Google Cloud ثم رقِّ الحساب إلى Tier 1 لاستخدام توليد الصور/الفيديو.',
        429,
        'free_tier_zero'
      )
    }
    return new GoogleApiError('تم تجاوز حصة الاستخدام المسموحة من Google AI. انتظر قليلاً ثم أعد المحاولة، أو راجع خطة الفوترة.', 429, 'quota')
  }
  if (status === 400 && /location|region/i.test(m)) {
    return new GoogleApiError(
      'الموقع الجغرافي للسيرفر غير مدعوم من Google AI حالياً. بعد النشر على Vercel (منطقة أمريكية) سيعمل بشكل طبيعي.',
      400,
      'location'
    )
  }
  if (status === 403) return new GoogleApiError('تم رفض الطلب من Google AI (403). تأكد من صلاحيات مفتاح الـ API.', 403, 'forbidden')
  if (status === 404) return new GoogleApiError('الموديل المطلوب غير متاح حالياً في Google AI API (404).', 404, 'not_found')
  if (status === 429) return new GoogleApiError('تجاوزت حد الاستخدام، حاول بعد دقيقة.', 429, 'rate')
  return new GoogleApiError(`خطأ من Google AI: ${m.slice(0, 300)}`, status, code || 'api_error')
}

interface InteractionStep {
  type: string
  content?: Array<{
    type: string
    text?: string
    data?: string
    mime_type?: string
    uri?: string
  }>
}

/** POST /v1beta/interactions */
export async function createInteraction(body: Record<string, unknown>, timeoutMs = 240_000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const text = await res.text()
    let json: any
    try {
      json = JSON.parse(text)
    } catch {
      throw new GoogleApiError(`استجابة غير صالحة من Google AI: ${text.slice(0, 200)}`, 502, 'bad_response')
    }
    if (!res.ok) {
      throw friendlyGoogleError(res.status, json?.error?.message ?? json?.message ?? '', json?.error?.status)
    }
    return json
  } catch (e) {
    if (e instanceof GoogleApiError) throw e
    if ((e as Error).name === 'AbortError') {
      throw new GoogleApiError('انتهت مدة انتظار توليد المحتوى من Google. حاول مرة أخرى أو اختر مدة/جودة أقل.', 504, 'timeout')
    }
    throw new GoogleApiError(`فشل الاتصال بخدمة Google AI: ${(e as Error).message}`, 502, 'network')
  } finally {
    clearTimeout(timer)
  }
}

/** Collect all output parts of given types from an interaction response */
export function outputParts(interaction: any): Array<{ type: string; text?: string; data?: string; mime_type?: string; uri?: string }> {
  const steps: InteractionStep[] = interaction?.steps ?? []
  return steps.flatMap((s) =>
    (s.content ?? []).map((c) => ({
      type: c.type,
      text: c.text,
      data: c.data,
      mime_type: c.mime_type,
      uri: c.uri,
    }))
  )
}

// ---------------- Image generation (Nano Banana family) ----------------

export interface ImageResult {
  base64: string
  mimeType: string
  text?: string
}

export async function generateImage(opts: {
  prompt: string
  model: string
  aspectRatio?: string
  imageSize?: string
}): Promise<ImageResult> {
  const responseFormat: Record<string, string> = { type: 'image' }
  if (opts.aspectRatio) responseFormat.aspect_ratio = opts.aspectRatio
  if (opts.imageSize) responseFormat.image_size = opts.imageSize
  const interaction = await createInteraction({
    model: opts.model,
    input: opts.prompt,
    response_format: responseFormat,
  })
  const parts = outputParts(interaction)
  const img = parts.find((p) => p.type === 'image' && p.data)
  const txt = parts.find((p) => p.type === 'text')?.text
  if (!img) {
    throw new GoogleApiError('لم يُرجع الموديل أي صورة. جرّب تعديل الوصف (Prompt).', 502, 'no_image')
  }
  return { base64: img.data!, mimeType: img.mime_type || 'image/png', text: txt }
}

// ---------------- Video generation (Gemini Omni Flash) ----------------

export interface VideoResult {
  base64?: string
  uri?: string
  mimeType: string
  text?: string
}

export async function generateVideo(opts: {
  prompt: string
  model: string
  aspectRatio?: string
  duration?: string
  resolution?: string
}): Promise<VideoResult> {
  const responseFormat: Record<string, string> = { type: 'video', delivery: 'uri' }
  if (opts.aspectRatio) responseFormat.aspect_ratio = opts.aspectRatio
  if (opts.duration) responseFormat.duration = opts.duration
  if (opts.resolution) responseFormat.resolution = opts.resolution
  const interaction = await createInteraction({
    model: opts.model,
    input: opts.prompt,
    response_format: responseFormat,
  })
  const parts = outputParts(interaction)
  const vid = parts.find((p) => p.type === 'video')
  const txt = parts.find((p) => p.type === 'text')?.text
  if (!vid || (!vid.uri && !vid.data)) {
    throw new GoogleApiError('لم يُرجع الموديل أي فيديو. جرّب تعديل الوصف (Prompt).', 502, 'no_video')
  }
  return { uri: vid.uri, base64: vid.data, mimeType: vid.mime_type || 'video/mp4', text: txt }
}

/** Download a generated video from its Google-hosted URI (poll until ready). */
export async function downloadGoogleFile(uri: string, maxAttempts = 30, intervalMs = 5000): Promise<Buffer> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(uri, { headers: { 'x-goog-api-key': apiKey() } })
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.byteLength > 0) return buf
    }
    // 403/404 while file is still processing -> wait and retry
    if (res.status === 429 || res.status >= 500 || res.status === 403 || res.status === 404) {
      await new Promise((r) => setTimeout(r, intervalMs))
      continue
    }
    const t = await res.text().catch(() => '')
    throw new GoogleApiError(`تعذّر تحميل الفيديو من Google (${res.status}): ${t.slice(0, 150)}`, 502, 'download_failed')
  }
  throw new GoogleApiError('ظل الفيديو قيد المعالجة لفترة طويلة. حاول مرة أخرى.', 504, 'download_timeout')
}

// ---------------- Text generation (captions & hashtags) ----------------

export interface CaptionResult {
  caption: string
  hashtags: string[]
}

export async function generateCaption(opts: {
  topic: string
  tone: string
  language: string
  cta?: string
  model?: string
}): Promise<CaptionResult> {
  const model = opts.model || 'gemini-flash-latest'
  const langMap: Record<string, string> = {
    ar: 'بالعربية الفصحى البسيطة',
    en: 'بالإنجليزية',
    mix: 'بالعربية مع سطر إنجليزي قصير',
  }
  const prompt = `أنت خبير كتابة محتوى تسويقي لإنستجرام. اكتب منشور تسويقي جذاباً ${langMap[opts.language] || langMap.ar}.

الموضوع / المنتج: ${opts.topic}
نبرة الكتابة: ${opts.tone}
${opts.cta ? `الدعوة لاتخاذ إجراء (CTA): ${opts.cta}` : ''}

المطلوب:
1) كابشن (نص المنشور) من 3 إلى 6 أسطر جذابة مع إيموجي مناسب، بدون هاشتاجات داخل النص.
2) قائمة من 12 هاشتاج مناسبة (اكتبها بدون مسافات وبشكل #هاشتاج).

أعد الإجابة بصيغة JSON فقط بدون أي شرح أو علامات تنسيق إضافية:
{"caption": "...", "hashtags": ["#...", "#..."]}`

  const interaction = await createInteraction({
    model,
    input: prompt,
    response_format: { type: 'text' },
  })
  const parts = outputParts(interaction)
  const text = parts.map((p) => p.text ?? '').join('\n').trim()
  if (!text) throw new GoogleApiError('لم يُرجع الموديل نصاً. أعد المحاولة.', 502, 'no_text')

  // Robust JSON extraction
  let parsed: CaptionResult | null = null
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const j = JSON.parse(jsonMatch[0])
      if (typeof j.caption === 'string') {
        parsed = { caption: j.caption, hashtags: Array.isArray(j.hashtags) ? j.hashtags.map(String) : [] }
      }
    } catch {
      /* fallthrough */
    }
  }
  if (!parsed) {
    // Fallback: first paragraph = caption, hashtags extracted by regex
    const tags = (text.match(/#[\w\u0600-\u06FF_]+/g) ?? []).slice(0, 12)
    const caption = text.replace(/#[\w\u0600-\u06FF_]+/g, '').trim()
    parsed = { caption: caption || text, hashtags: tags }
  }
  return parsed
}

// ---------------- Text-to-speech (Gemini 3.8 Flash TTS) ----------------

export interface SpeechResult {
  base64: string
  mimeType: string
}

export const GEMINI_TTS_VOICES = [
  { id: 'Kore', name: 'كوري — حازم وواضح' },
  { id: 'Puck', name: 'باك — حيوي ومبهج' },
  { id: 'Zephyr', name: 'زفير — مشرق' },
  { id: 'Charon', name: 'خارون — إخباري' },
  { id: 'Fenrir', name: 'فنرير — متحمس' },
  { id: 'Leda', name: 'ليدا — شبابي' },
  { id: 'Orus', name: 'أوروس — قوي' },
  { id: 'Aoede', name: 'أويدي — خفيف ومرح' },
  { id: 'Callirrhoe', name: 'كاليروي — هادئ وودود' },
  { id: 'Autonoe', name: 'أوتونوي — مشرق' },
  { id: 'Enceladus', name: 'إنسيلادوس — ناعم' },
  { id: 'Iapetus', name: 'يابيتوس — واضح' },
  { id: 'Umbriel', name: 'أمبريل — مرتاح' },
  { id: 'Algieba', name: 'الجبهة — سلس' },
  { id: 'Despina', name: 'ديسبينا — سلس' },
  { id: 'Erinome', name: 'إرينومي — صافٍ' },
  { id: 'Laomedeia', name: 'لاوميديا — متفائل' },
  { id: 'Achernar', name: 'أخر النهر — هادئ' },
  { id: 'Alnilam', name: 'النيلم — حازم' },
  { id: 'Schedar', name: 'الصدر — متوازن' },
  { id: 'Gacrux', name: 'جاكروكس — ناضج' },
  { id: 'Achird', name: 'أكيرد — ودود' },
  { id: 'Zubenelgenubi', name: 'زوبن — عفوي' },
  { id: 'Sadachbia', name: 'سعد — حيوي' },
  { id: 'Sadaltager', name: 'سعد التاجر — خبير' },
  { id: 'Sulafat', name: 'سلاف — دافئ' },
  { id: 'Rasalgethi', name: 'رأس — إخباري' },
  { id: 'Vindemiatrix', name: 'فندم — لطيف' },
  { id: 'Pulcherrima', name: 'بولكيريما — واثق' },
  { id: 'Algenib', name: 'الجنيب — خشن' },
]

export async function generateSpeech(opts: {
  text: string
  model: string
  voice: string
  style?: string
}): Promise<SpeechResult> {
  const interaction = await createInteraction({
    model: opts.model,
    input: [
      {
        type: 'user_input',
        content: [
          {
            type: 'text',
            text: opts.text,
            annotations: [{ type: 'speech_metadata', style: opts.style || 'warm and friendly' }],
          },
        ],
      },
    ],
    response_format: { type: 'audio', mime_type: 'audio/wav' },
    generation_config: { speech_config: [{ voice: opts.voice }] },
  })
  const parts = outputParts(interaction)
  const audio = parts.find((p) => p.type === 'audio' && p.data)
  if (!audio) throw new GoogleApiError('لم يُرجع الموديل أي صوت. جرّب نصاً آخر أو صوتاً مختلفاً.', 502, 'no_audio')
  return { base64: audio.data!, mimeType: audio.mime_type || 'audio/wav' }
}
