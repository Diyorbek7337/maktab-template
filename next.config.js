/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// ── Content Security Policy ──────────────────────────────────
// Har bir manba ataylab aniq ko'rsatilgan — wildcard (*) ishlatilmagan.
//
// Eslatma `'unsafe-inline'` haqida (script-src):
// Next.js App Router sahifa holatini (hydration payload) inline `<script>`
// teglarida yuboradi. Ularni nonce bilan almashtirish har bir so'rovni
// dinamik qilib, statik sahifalarni keshlashni buzadi. Shu sababli bu yerda
// script uchun 'unsafe-inline' qoldirilgan — bu Next.js uchun odatiy amaliyot.
// CSP baribir tashqi (begona domendagi) skriptlarni bloklaydi, ya'ni XSS
// natijasida ma'lumot chetga uzatilishining oldini oladi.
const cspDirectives = [
  "default-src 'self'",

  // Skriptlar: faqat o'z domenimizdan. Dev rejimida React Fast Refresh
  // 'unsafe-eval' talab qiladi — productionda u BERILMAYDI.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,

  // Tailwind va framer-motion element'larga inline `style` yozadi
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",

  // Rasmlar: Firebase Storage, YouTube muqovalari (i.ytimg.com),
  // favicon'lar (foydali havolalar bo'limi), blob:/data: — admin
  // panelidagi yuklashdan oldingi ko'rish uchun
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://*.googleapis.com https://i.ytimg.com https://img.youtube.com https://president.uz https://my.gov.uz https://edu.uz",

  // Firebase SDK ulanadigan manzillar (Firestore, Auth, Storage)
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com",

  // Xarita (Google/Yandex) va YouTube video embed uchun.
  // youtube-nocookie — video ochilmaguncha kuzatuv cookie'lari qo'yilmaydi.
  "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://www.google.com https://maps.google.com https://yandex.com https://yandex.uz",

  // Saytimizni boshqa hech kim iframe ichiga sola olmasin
  // (X-Frame-Options ning zamonaviy ekvivalenti)
  "frame-ancestors 'none'",

  // Forma faqat o'z serverimizga yuborilsin
  "form-action 'self'",

  // <base> teg orqali nisbiy URL'larni o'g'irlashning oldini oladi
  "base-uri 'self'",

  // Flash/applet kabi plaginlar butunlay taqiqlanadi
  "object-src 'none'",

  // Barcha HTTP so'rovlar avtomatik HTTPS'ga ko'tariladi
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig = {
  // firebase-admin (jwks-rsa -> jose) webpack orqali bundle qilinganda
  // ESM/CommonJS ziddiyatiga uchraydi — shuning uchun Node runtime'ga
  // to'g'ridan-to'g'ri "require" qilinishi kerak (bundle qilinmasin).
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },

  // Server sarlavhasi orqali texnologiya versiyasi oshkor qilinmasin
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        // Rasmsiz, lekin videoli yangiliklarda muqova sifatida
        // YouTube'ning tayyor muqova rasmi ishlatiladi
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspDirectives },
          // Clickjacking himoyasi (eski brauzerlar uchun; zamonaviylari
          // yuqoridagi frame-ancestors direktivasidan foydalanadi)
          { key: "X-Frame-Options",        value: "DENY" },
          // MIME sniffing himoyasi
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS himoyasi (eski brauzerlar uchun)
          { key: "X-XSS-Protection",       value: "1; mode=block" },
          // Referrer siyosati
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          // Permissions Policy
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // HTTPS'ni majburiy qilish (faqat production)
          ...(isDev
            ? []
            : [{
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              }]),
        ],
      },
      {
        // Admin sahifalari — qo'shimcha himoya
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma",        value: "no-cache" },
        ],
      },
      {
        // API javoblari hech qachon (shu jumladan proxy'larda) keshlanmasin
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
