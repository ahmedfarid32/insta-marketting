import { ensureSchema } from '@/lib/turso'
import { downloadGoogleFile } from '@/lib/google'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await ensureSchema()
    const result = await db.execute({
      sql: 'SELECT mime_type, data, external_uri FROM media WHERE id = ?',
      args: [id],
    })
    const row: any = result.rows[0]
    if (!row) return new Response('Not found', { status: 404 })

    const { searchParams } = new URL(req.url)
    const isDownload = searchParams.get('download') === '1'
    const extOf = (mime: string) => {
      const map: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp',
        'video/mp4': 'mp4',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'text/plain': 'txt',
      }
      return map[mime] ?? 'bin'
    }

    if (row.data) {
      const buf = Buffer.from(row.data as ArrayBuffer ?? row.data)
      const headers: Record<string, string> = {
        'Content-Type': (row.mime_type as string) ?? 'application/octet-stream',
        'Content-Length': String(buf.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
      if (isDownload) headers['Content-Disposition'] = `attachment; filename="media-${id}.${extOf(headers['Content-Type'])}"`
      return new Response(new Uint8Array(buf), { headers })
    }

    if (row.external_uri) {
      const buf = await downloadGoogleFile(String(row.external_uri), 20, 3000)
      const headers: Record<string, string> = {
        'Content-Type': (row.mime_type as string) ?? 'video/mp4',
        'Content-Length': String(buf.byteLength),
        'Cache-Control': 'private, max-age=3600',
      }
      if (isDownload) headers['Content-Disposition'] = `attachment; filename="media-${id}.${extOf(headers['Content-Type'])}"`
      return new Response(new Uint8Array(buf), { headers })
    }

    return new Response('No data', { status: 404 })
  } catch (e) {
    return new Response(`Error: ${(e as Error).message}`, { status: 500 })
  }
}
