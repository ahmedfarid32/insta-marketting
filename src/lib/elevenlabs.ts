// ElevenLabs API client — server-side only.

const BASE = 'https://api.elevenlabs.io'

export class ElevenLabsError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

function apiKey(): string {
  const k = process.env.ELEVENLABS_API_KEY
  if (!k) throw new ElevenLabsError('مفتاح ElevenLabs API غير مضبوط في متغيرات البيئة', 500)
  return k
}

function friendlyElevenError(status: number, detail: any): ElevenLabsError {
  const code = detail?.code ?? ''
  const msg: string = detail?.message ?? 'خطأ غير معروف من ElevenLabs'
  if (status === 402 || code === 'paid_plan_required') {
    return new ElevenLabsError(
      'خطة ElevenLabs المجانية لا تسمح بتوليد الصوت عبر الـ API (تتطلب ترقية الخطة إلى Starter أو أعلى). يمكنك استخدام مزود Google بدلاً منه.',
      402
    )
  }
  if (status === 401) return new ElevenLabsError('مفتاح ElevenLabs غير صالح أو منتهي الصلاحية.', 401)
  if (status === 429) return new ElevenLabsError('تجاوزت حد الاستخدام في ElevenLabs، انتظر قليلاً ثم أعد المحاولة.', 429)
  if (status === 422) return new ElevenLabsError(`بيانات الطلب غير صالحة: ${msg}`, 422)
  return new ElevenLabsError(`خطأ من ElevenLabs: ${msg}`, status)
}

export interface ElevenVoice {
  voice_id: string
  name: string
  category: string
  labels?: Record<string, string>
  description?: string
  preview_url?: string
}

export async function listVoices(): Promise<ElevenVoice[]> {
  const res = await fetch(`${BASE}/v1/voices`, { headers: { 'xi-api-key': apiKey() } })
  const json: any = await res.json().catch(() => null)
  if (!res.ok) throw friendlyElevenError(res.status, json?.detail)
  return (json.voices ?? []) as ElevenVoice[]
}

export async function textToSpeech(opts: {
  text: string
  voiceId: string
  modelId: string
}): Promise<{ buffer: Buffer; mimeType: string }> {
  const res = await fetch(`${BASE}/v1/text-to-speech/${encodeURIComponent(opts.voiceId)}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey(), 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: opts.text,
      model_id: opts.modelId,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })
  if (!res.ok) {
    const json: any = await res.json().catch(() => null)
    throw friendlyElevenError(res.status, json?.detail)
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  return { buffer, mimeType: 'audio/mpeg' }
}
