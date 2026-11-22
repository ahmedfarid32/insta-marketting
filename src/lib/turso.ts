import { createClient, type Client } from '@libsql/client'

let _db: Client | null = null
let _schemaReady = false

export function getDb(): Client {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN
    if (!url || !authToken) {
      throw new Error('متغيرات بيئة قاعدة البيانات (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN) غير مضبوطة')
    }
    _db = createClient({ url, authToken })
  }
  return _db
}

/** Create the media table if it doesn't exist yet (idempotent — safe on every deploy). */
export async function ensureSchema(): Promise<Client> {
  const db = getDb()
  if (!_schemaReady) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        prompt TEXT NOT NULL,
        model TEXT NOT NULL,
        provider TEXT,
        mime_type TEXT,
        data BLOB,
        external_uri TEXT,
        duration TEXT,
        meta TEXT,
        created_at INTEGER NOT NULL
      )
    `)
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at DESC)`)
    _schemaReady = true
  }
  return db
}

export interface MediaRow {
  id: string
  kind: string
  prompt: string
  model: string
  provider: string | null
  mime_type: string | null
  external_uri: string | null
  duration: string | null
  meta: string | null
  created_at: number
  has_data?: number
}
