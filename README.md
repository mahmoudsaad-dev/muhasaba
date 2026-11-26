# محاسبة النفس (Muhasaba)

تطبيق أندرويد للمحاسبة اليومية: تسجيل الصلوات والأذكار وورد القرآن، نقاط يومية (١٠–٣٠)،
سلسلة أيام متتالية مع درع حماية، حديقة تنمو بالنقاط، ومتجر لصرف النقاط.

## المكونات

- **تطبيق أندرويد** (`app/`): WebView خفيف بدون مكتبات خارجية، كل واجهة التطبيق في
  `app/src/main/assets/www/index.html` (HTML/CSS/JS، البيانات محلية على الجهاز).
- **الباك إند على Vercel** (`api/`): دوال serverless —
  - `POST /api/sync` و `GET /api/sync?deviceId=` لمزامنة نقاط المستخدم بين الأجهزة.
  - `GET /api/ayah` لآية اليوم.
  - النسخة الويب من التطبيق تُستضاف من `public/`.
- **GitHub Actions** (`.github/workflows/build.yml`): كل push يبني
  `app-debug.apk` ويرفعه كـ artifact باسم `muhasaba-apk`.

## التخزين الدائم للمزامنة (اختياري)

الدالة تستخدم Vercel KV / Upstash Redis عند توفر متغيري البيئة
`KV_REST_API_URL` و `KV_REST_API_TOKEN` (اربط KV store من لوحة Vercel).
بدونهما تعمل المزامنة بذاكرة مؤقتة غير دائمة.

## البناء محليًا

```bash
gradle assembleDebug   # ينتج app/build/outputs/apk/debug/app-debug.apk
```
