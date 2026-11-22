import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/turso'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const kind = searchParams.get('kind')
    const limit = Math.min(Number(searchParams.get('limit') ?? 60) || 60, 200)

    const db = await ensureSchema()
    let result
    if (kind && ['image', 'video', 'audio', 'text'].includes(kind)) {
      result = await db.execute({
        sql: `SELECT id, kind, prompt, model, provider, mime_type, external_uri, duration, meta, created_at,
                     (data IS NOT NULL) AS has_data
              FROM media WHERE kind = ? ORDER BY created_at DESC LIMIT ?`,
        args: [kind, limit],
      })
    } else {
      result = await db.execute({
        sql: `SELECT id, kind, prompt, model, provider, mime_type, external_uri, duration, meta, created_at,
                     (data IS NOT NULL) AS has_data
              FROM media ORDER BY created_at DESC LIMIT ?`,
        args: [limit],
      })
    }

    const items = result.rows.map((r: any) => ({
      id: r.id,
      kind: r.kind,
      prompt: r.prompt,
      model: r.model,
      provider: r.provider,
      mimeType: r.mime_type,
      duration: r.duration,
      meta: r.meta ? JSON.parse(r.meta) : null,
      createdAt: Number(r.created_at),
      url: `/api/media/${r.id}/file`,
    }))
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
