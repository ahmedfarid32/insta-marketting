import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { ensureSchema } from '@/lib/turso'
import { generateVideo, downloadGoogleFile, GoogleApiError } from '@/lib/google'

export const maxDuration = 300

const MAX_STORE_BYTES = 24 * 1024 * 1024 // 24MB — store inline in Turso

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const prompt = String(body.prompt ?? '').trim()
    const model = String(body.model ?? 'gemini-omni-1.2-flash')
    const aspectRatio = body.aspectRatio ? String(body.aspectRatio) : undefined
    const duration = body.duration ? String(body.duration) : undefined
    const resolution = body.resolution ? String(body.resolution) : undefined

    if (!prompt) return NextResponse.json({ error: 'من فضلك اكتب وصف الفيديو أولاً' }, { status: 400 })

    const result = await generateVideo({ prompt, model, aspectRatio, duration, resolution })

    let buffer: Buffer | null = null
    let externalUri: string | null = null

    if (result.base64) {
      buffer = Buffer.from(result.base64, 'base64')
    } else if (result.uri) {
      const downloaded = await downloadGoogleFile(result.uri)
      if (downloaded.byteLength <= MAX_STORE_BYTES) {
        buffer = downloaded
      } else {
        externalUri = result.uri // too large — serve by proxying on demand
      }
    }

    const id = randomUUID()
    const db = await ensureSchema()
    await db.execute({
      sql: `INSERT INTO media (id, kind, prompt, model, provider, mime_type, data, external_uri, duration, meta, created_at)
            VALUES (?, 'video', ?, ?, 'google', ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        prompt,
        model,
        result.mimeType,
        buffer,
        externalUri,
        duration ?? null,
        JSON.stringify({ aspectRatio, resolution }),
        Date.now(),
      ],
    })

    return NextResponse.json({
      id,
      kind: 'video',
      prompt,
      model,
      provider: 'google',
      mimeType: result.mimeType,
      duration: duration ?? null,
      createdAt: Date.now(),
      url: `/api/media/${id}/file`,
    })
  } catch (e) {
    const status = e instanceof GoogleApiError ? e.status : 500
    return NextResponse.json({ error: (e as Error).message }, { status })
  }
}
