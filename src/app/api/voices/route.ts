import { NextResponse } from 'next/server'
import { listVoices, ElevenLabsError } from '@/lib/elevenlabs'
import { GEMINI_TTS_VOICES } from '@/lib/google'

export const dynamic = 'force-dynamic'

export async function GET() {
  const google = GEMINI_TTS_VOICES.map((v) => ({ id: v.id, name: v.name }))
  let elevenlabs: Array<{ id: string; name: string; category: string }> = []
  let elevenError: string | null = null
  try {
    const voices = await listVoices()
    elevenlabs = voices.map((v) => ({ id: v.voice_id, name: v.name, category: v.category }))
  } catch (e) {
    elevenError = e instanceof ElevenLabsError ? e.message : (e as Error).message
  }
  return NextResponse.json({ google, elevenlabs, elevenError })
}
