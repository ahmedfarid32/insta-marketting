import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { ensureSchema } from '@/lib/turso'
import { generateCaption, GoogleApiError } from '@/lib/google'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const topic = String(body.topic ?? '').trim()
    const tone = String(body.tone ?? 'حماسي ومحفّز')
    const language = String(body.language ?? 'ar')
    const cta = body.cta ? String(body.cta).trim() : undefined
    const model = body.model ? String(body.model) : undefined

    if (!topic) return NextResponse.json({ error: 'من فضلك اكتب وصف المنتج أو الموضوع أولاً' }, { status: 400 })

    const result = await generateCaption({ topic, tone, language, cta, model })

    const id = randomUUID()
    const db = await ensureSchema()
    await db.execute({
      sql: `INSERT INTO media (id, kind, prompt, model, provider, mime_type, data, duration, meta, created_at)
            VALUES (?, 'text', ?, ?, 'google', 'text/plain', NULL, NULL, ?, ?)`,
      args: [
        id,
        topic,
        model ?? 'gemini-flash-latest',
        JSON.stringify({ caption: result.caption, hashtags: result.hashtags, tone, language }),
        Date.now(),
      ],
    })

    return NextResponse.json({
      id,
      kind: 'text',
      prompt: topic,
      caption: result.caption,
      hashtags: result.hashtags,
      createdAt: Date.now(),
    })
  } catch (e) {
    const status = e instanceof GoogleApiError ? e.status : 500
    return NextResponse.json({ error: (e as Error).message }, { status })
  }
}
