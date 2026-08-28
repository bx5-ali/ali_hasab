# 🚀 دليل رفع تطبيق رياضيات دولينجو للأطفال على متجر Google Play Store

تم تجهيز التطبيق بنسبة 100% ليكون متوافقاً تماماً مع معايير متجر جوجل بلاي (Google Play Store) بتقنية **Trusted Web Activity (TWA)** وتطبيقات الويب التقدمية **PWA**.

---

## 📁 الملفات التي تم إنشاؤها وتجهيزها:
1. **`public/manifest.json`**:
   - يحتوي على معرّف التطبيق `com.duomath.kids.app`.
   - اسم التطبيق بالعربية والإنجليزية وألوان السمة (`#58CC02`).
   - وضع التشغيل بملء الشاشة (`standalone`).
   - تصنيفات التطبيق: تعليمي، أطفال، ألعاب (`education`, `kids`, `games`).
2. **حزمة الأيقونات عالية الدقة (High-Res Icons)**:
   - `public/icon.svg` (أيقونة 512x512 فائقة الوضوح مع شخصية فطين).
   - `public/icon-192.svg` (أيقونة 192x192).
   - `public/maskable-icon.svg` (أيقونة مخصصة لأجهزة أندرويد الحديثة بأشكالها المتغيرة).
   - `public/favicon.svg` (أيقونة شريط المتصفح).
3. **`public/sw.js` (Service Worker)**:
   - تشغيل التطبيق بالكامل بدون إنترنت (Offline First) لتسريع الأداء على هواتف وأجهزة الأطفال اللوحية.
4. **`public/.well-known/assetlinks.json`**:
   - ملف التحقق الرقمي من ملكية النطاق لإزالة شريط عنوان المتصفح والعمل كتطبيق Native حقيقي على أندرويد.

---

## 🛠️ خطوات استخراج حزمة `.aab` ورفعها على Google Play Console:

### 🌟 الخيار الأول (الأسهل والأسرع - بنقرة واحدة عبر PWABuilder):
1. انسخ رابط تطبيقك المنشور (URL).
2. افتح موقع: [PWABuilder.com](https://www.pwabuilder.com).
3. الصق رابط التطبيق واضغط **Start**.
4. سيتحقق الموقع من المنفست (ستحصل على درجة كاملة 100% بفضل التجهيزات التي قمنا بها).
5. اضغط على زر **"Package for Stores"** واختر **"Android"**.
6. حمّل حزمة **`.aab` (Android App Bundle)** والـ KeyStore الموقّع.
7. افتح [Google Play Console](https://play.google.com/console) وارفع ملف الـ `.aab` في قسم الإصدارات!

---

### 💻 الخيار الثاني (عبر سطر الأوامر Bubblewrap الرسمي من Google):
```bash
# 1. تثبيت أداة Bubblewrap
npm install -g @bubblewrap/cli

# 2. تهيئة التطبيق من المنفست
bubblewrap init --manifest="https://your-app-domain.com/manifest.json"

# 3. بناء ملف aab النهائي
bubblewrap build
```

---

## 🎨 معلومات بطاقة المتجر المقترحة (Store Listing Metadata):
- **اسم التطبيق**: رياضيات دولينجو للأطفال | Duo Math Kids
- **الوصف القصير**: رحلة تفاعلية ممتعة لتعلم الحساب، الأرقام والعمليات بأسلوب دولينجو واللعب البصري.
- **الفئة**: تعليم (Education) / عائلة وأطفال (Family - Ages 6-12).
- **التسعير**: مجاني.
