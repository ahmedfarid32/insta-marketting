# Insta Marketing — منصة تسويق إنستجرام بالذكاء الاصطناعي 🚀

منصة متكاملة لإنشاء محتوى إنستجرام (صور، فيديوهات ريلز، كابشن وهاشتاجات، تعليق صوتي) باستخدام الذكاء الاصطناعي، بواجهة عربية كاملة تدعم الاتجاه من اليمين لليسار (RTL).

## ✨ المميزات

| الميزة | المزوّد | الموديلات |
| --- | --- | --- |
| 🖼️ توليد صور المنشورات | Google AI Studio | Nano Banana 2.1 / 2 / 2 Lite / Pro (أبعاد 1:1، 4:5، 9:16، 16:9 — جودة حتى 4K) |
| 🎬 توليد فيديو ريلز (مع صوت أصلي) | Google AI Studio | Gemini Omni 1.2 Flash (مدة 3-15 ثانية، 9:16 / 16:9، حتى 1080p) |
| ✍️ كتابة كابشن وهاشتاجات | Google AI Studio | Gemini Flash (نبرات وأساليب متعددة، عربي/إنجليزي) |
| 🎙️ تعليق صوتي | Google TTS + ElevenLabs | Gemini 3.8 Flash TTS (30 صوتاً) و ElevenLabs v4 |

- 🗂️ معرض موحّد لكل المحتوى المولَّد مع تحميل وحذف
- 💾 تخزين دائم في قاعدة بيانات **Turso** (libsql)
- 📱 تصميم متجاوب بالكامل مع هوية إنستجرام البصرية

## 🛠️ التقنيات

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + shadcn/ui
- **Turso** (libsql) لقاعدة البيانات
- **Google AI Studio API** (Interactions API) للصور/الفيديو/النصوص/الصوت
- **ElevenLabs API** للأصوات

## ⚙️ متغيرات البيئة

انسخ ملف `.env.example` إلى `.env` واملأ القيم:

```env
TURSO_DATABASE_URL=libsql://...turso.io
TURSO_AUTH_TOKEN=eyJ...
GOOGLE_AI_API_KEY=AIza...
ELEVENLABS_API_KEY=sk_...
```

> جدول قاعدة البيانات (`media`) يُنشأ تلقائياً عند أول طلب — لا حاجة لأي خطوات إضافية.

## 🚀 التشغيل محلياً

```bash
npm install        # أو bun install
npm run dev
```

ثم افتح `http://localhost:3000`

## ▲ النشر على Vercel

1. ارفع المشروع إلى GitHub.
2. من لوحة Vercel: **Add New → Project** واختر مستودع `insta-marketting`.
3. في خطوة الإعداد أضف متغيرات البيئة الأربعة (TURSO_DATABASE_URL، TURSO_AUTH_TOKEN، GOOGLE_AI_API_KEY، ELEVENLABS_API_KEY).
4. اضغط **Deploy**.

> توليد الفيديو قد يستغرق حتى 3 دقائق — مسار `/api/generate/video` مضبوط على `maxDuration = 300` ثانية. إن ظهر خطأ حدود المدة في خطتك، فعّل **Fluid Compute** من إعدادات المشروع في Vercel أو قلّل القيمة في `src/app/api/generate/video/route.ts`.

## ⚠️ ملاحظات مهمة عن الحصص (Plans & Quotas)

- **صور وفيديو Google**: موديلات Nano Banana و Omni Flash تتطلب تفعيل الفوترة (Billing) في مشروع Google Cloud والترقية إلى Tier 1 — الخطة المجانية حصتها صفر لهذه الموديلات، وسيظهر لك خطأ واضح داخل التطبيق يشرح ذلك.
- **الكابشن والنصوص**: تعمل على الخطة المجانية (بحدود يومية).
- **ElevenLabs**: الخطة المجانية لا تسمح بتوليد الصوت عبر الـ API (تتطلب خطة Starter أو أعلى) — لذلك يوجد مزود Google TTS كبديل مجاني داخل التطبيق.

## 📁 بنية المشروع

```
src/
├── app/
│   ├── api/
│   │   ├── generate/       # image / video / caption / voice
│   │   ├── media/          # قائمة المعرض + حذف + تقديم الملفات
│   │   └── voices/         # قائمة الأصوات
│   ├── layout.tsx          # RTL + خط Cairo
│   └── page.tsx            # الواجهة الرئيسية (تبويبات)
├── components/insta/       # تبويبات الواجهة
└── lib/                    # turso / google / elevenlabs / models
```
