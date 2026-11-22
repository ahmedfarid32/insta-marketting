import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { ensureSchema } from '@/lib/turso'
import { generateSpeech, GoogleApiError } from '@/lib/google'
import { textToSpeech, ElevenLabsError } from '@/lib/elevenlabs'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const text = String(body.text ?? '').trim()
    const provider = String(body.provider ?? 'google')
    const voice = String(body.voice ?? '')
    const model = String(body.model ?? '')
    const style = body.style ? String(body.style) : undefined

    if (!text) return NextResponse.json({ error: 'من فضلك اكتب النص المراد تحويله لصوت أولاً' }, { status: 400 })

    let buffer: Buffer
    let mimeType: string
    let modelUsed: string
    let providerUsed: string

    if (provider === 'elevenlabs') {
      if (!voice || !model) return NextResponse.json({ error: 'اختر الصوت والموديل من ElevenLabs' }, { status: 400 })
      const res = await textToSpeech({ text, voiceId: voice, modelId: model })
      buffer = res.buffer
      mimeType = res.mimeType
      modelUsed = model
      providerUsed = 'elevenlabs'
    } else {
      if (!voice || !model) return NextResponse.json({ error: 'اختر الصوت والموديل من Google' }, { status: 400 })
      const res = await generateSpeech({ text, model, voice, style })
      buffer = Buffer.from(res.base64, 'base64')
      mimeType = res.mimeType
      modelUsed = model
      providerUsed = 'google'
    }

    const id = randomUUID()
    const db = await ensureSchema()
    await db.execute({
      sql: `INSERT INTO media (id, kind, prompt, model, provider, mime_type, data, duration, meta, created_at)
            VALUES (?, 'audio', ?, ?, ?, ?, ?, NULL, ?, ?)`,
      args: [
        id,
        text.slice(0, 500),
        modelUsed,
        providerUsed,
        mimeType,
        buffer,
        JSON.stringify({ voice, style, chars: text.length }),
        Date.now(),
      ],
    })

    return NextResponse.json({
      id,
      kind: 'audio',
      prompt: text.slice(0, 500),
      model: modelUsed,
      provider: providerUsed,
      mimeType,
      createdAt: Date.now(),
      url: `/api/media/${id}/file`,
    })
  } catch (e) {
    const status = e instanceof GoogleApiError || e instanceof ElevenLabsError ? e.status : 500
    return NextResponse.json({ error: (e as Error).message }, { status })
  }
}
