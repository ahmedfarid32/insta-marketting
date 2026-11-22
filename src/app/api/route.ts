import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    app: 'Insta Marketing API',
    status: 'ok',
    providers: ['google', 'elevenlabs'],
    database: 'turso',
  })
}
