import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/turso'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await ensureSchema()
    const r = await db.execute({ sql: 'DELETE FROM media WHERE id = ?', args: [id] })
    if (r.rowsAffected === 0) return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
