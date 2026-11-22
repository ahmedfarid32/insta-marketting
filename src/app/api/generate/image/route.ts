import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { ensureSchema } from '@/lib/turso'
import { generateImage, GoogleApiError } from '@/lib/google'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const prompt = String(body.prompt ?? '').trim()
    const model = String(body.model ?? 'gemini-nano-banana-2.1')
    const aspectRatio = body.aspectRatio ? String(body.aspectRatio) : undefined
    const imageSize = body.imageSize ? String(body.imageSize) : undefined

    if (!prompt) return NextResponse.json({ error: 'من فضلك اكتب وصف الصورة أولاً' }, { status: 400 })

    const result = await generateImage({ prompt, model, aspectRatio, imageSize })
    const buffer = Buffer.from(result.base64, 'base64')
    const id = randomUUID()

    const db = await ensureSchema()
    await db.execute({
      sql: `INSERT INTO media (id, kind, prompt, model, provider, mime_type, data, duration, meta, created_at)
            VALUES (?, 'image', ?, ?, 'google', ?, ?, NULL, ?, ?)`,
      args: [id, prompt, model, result.mimeType, buffer, JSON.stringify({ aspectRatio, imageSize }), Date.now()],
    })

    return NextResponse.json({
      id,
      kind: 'image',
      prompt,
      model,
      provider: 'google',
      mimeType: result.mimeType,
      createdAt: Date.now(),
      url: `/api/media/${id}/file`,
    })
  } catch (e) {
    const status = e instanceof GoogleApiError ? e.status : 500
    return NextResponse.json({ error: (e as Error).message }, { status })
  }
}
