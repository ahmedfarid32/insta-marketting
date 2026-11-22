// Model catalog shared between server and client

export const IMAGE_MODELS = [
  { id: 'gemini-nano-banana-2.1', name: 'Nano Banana 2.1 — الأحدث والأفضل' },
  { id: 'gemini-3.1-flash-image', name: 'Nano Banana 2 — سريع وعالي الجودة' },
  { id: 'gemini-3.1-flash-lite-image', name: 'Nano Banana 2 Lite — الأسرع والأرخص' },
  { id: 'gemini-3-pro-image', name: 'Nano Banana Pro — جودة استوديو' },
  { id: 'gemini-2.5-flash-image', name: 'Nano Banana (قديم) — 2.5 Flash Image' },
] as const

export const VIDEO_MODELS = [
  { id: 'gemini-omni-1.2-flash', name: 'Gemini Omni 1.2 Flash — فيديو + صوت أصلي' },
] as const

export const CAPTION_MODELS = [
  { id: 'gemini-flash-latest', name: 'Gemini Flash (الأحدث)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite' },
] as const

export const GOOGLE_TTS_MODELS = [
  { id: 'gemini-3.8-flash-tts', name: 'Gemini 3.8 Flash TTS — جودة عالية' },
  { id: 'gemini-3.8-flash-lite-tts', name: 'Gemini 3.8 Flash-Lite TTS — أسرع' },
] as const

export const ELEVEN_MODELS = [
  { id: 'eleven_v4', name: 'Eleven v4 — يدعم العربية، الأحدث' },
  { id: 'eleven_flash_v2_5', name: 'Eleven Flash v2.5 — سريع' },
  { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2' },
] as const

export const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1 — بوست مربع' },
  { id: '4:5', name: '4:5 — بوست طولي' },
  { id: '9:16', name: '9:16 — ريلز / ستوري' },
  { id: '16:9', name: '16:9 — عريض' },
] as const

export const VIDEO_RESOLUTIONS = [
  { id: '360p', name: '360p — سريع' },
  { id: '720p', name: '720p — قياسي' },
  { id: '1080p', name: '1080p — عالي' },
] as const

export const IMAGE_SIZES = [
  { id: '1K', name: '1K' },
  { id: '2K', name: '2K' },
  { id: '4K', name: '4K' },
] as const

export const TONES = [
  'حماسي ومحفّز',
  'فخم وراقٍ',
  'ودود وبسيط',
  'فكاهي',
  'احترافي رسمي',
  'عاطفي مؤثر',
] as const

export const KIND_LABELS: Record<string, string> = {
  image: 'صورة',
  video: 'فيديو',
  audio: 'صوت',
  text: 'كابشن',
}
