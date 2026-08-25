import { getAdminDb } from "./firebaseAdmin";
import type { NextRequest } from "next/server";

// ============================================================
// Serverless-mos rate limiting.
//
// Vercel'da har bir so'rov boshqa (yoki cold-start bo'lgan) funksiya
// nusxasiga tushishi mumkin — shu sababli jarayon xotirasidagi Map
// himoya bermaydi. Holat tashqi umumiy saqlagichda turishi shart:
//
//   1) Upstash Redis — UPSTASH_REDIS_REST_URL va UPSTASH_REDIS_REST_TOKEN
//      env o'zgaruvchilari bo'lsa, avtomatik shu ishlatiladi (tavsiya etiladi).
//   2) Firestore — Upstash sozlanmagan bo'lsa, atomik tranzaksiya orqali
//      hisoblagich (qo'shimcha xizmatsiz ishlaydi, biroz sekinroq).
// ============================================================

export interface RateLimitConfig {
  /** Oynadagi maksimal so'rovlar soni */
  limit: number;
  /** Oyna davomiyligi (millisekund) */
  windowMs: number;
  /** Turli endpoint'lar hisoblagichini ajratish uchun prefiks */
  prefix: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Oyna qachon tugashi (epoch ms) */
  resetAt: number;
  /** Qayta urinishgacha qolgan vaqt (sekund) — 429 javobdagi Retry-After uchun */
  retryAfterSeconds: number;
}

export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  prefix: "login",
};

export const NOTIFY_RATE_LIMIT: RateLimitConfig = {
  limit: 3,
  windowMs: 60 * 1000, // 1 daqiqa
  prefix: "notify",
};

/**
 * Client IP — rate limit kaliti sifatida ishlatiladi.
 *
 * Muhim: `x-forwarded-for` ni client O'ZI ham yubora oladi, ya'ni uni
 * bevosita ishonchli deb bo'lmaydi. Vercel o'zi o'rnatadigan sarlavhalar
 * (`x-vercel-forwarded-for`, `x-real-ip`) platformada qayta yoziladi va
 * soxtalashtirib bo'lmaydi — shuning uchun ular birinchi o'rinda turadi.
 */
export function getClientIp(req: NextRequest): string {
  const trusted =
    req.headers.get("x-vercel-forwarded-for") ?? req.headers.get("x-real-ip");
  if (trusted?.trim()) return trusted.split(",")[0].trim();

  // Vercel'dan tashqarida (masalan mahalliy dev yoki boshqa proxy ortida)
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  // IP aniqlanmasa — barcha shunday so'rovlar bitta umumiy hisoblagichga
  // tushadi. Bu ochiq qoldirishdan ko'ra xavfsizroq.
  return "unknown";
}

function upstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// ── 1-variant: Upstash Redis (sliding window) ────────────────
// Modullar faqat kerak bo'lganda yuklanadi, shunda Upstash sozlanmagan
// loyihada ular bundle'ga umuman kirmaydi.
type UpstashLimiter = {
  limit: (key: string) => Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }>;
  resetUsedTokens: (key: string) => Promise<void>;
};

const upstashCache = new Map<string, UpstashLimiter>();

async function getUpstashLimiter(cfg: RateLimitConfig): Promise<UpstashLimiter> {
  const cached = upstashCache.get(cfg.prefix);
  if (cached) return cached;

  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import("@upstash/ratelimit"),
    import("@upstash/redis"),
  ]);

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(cfg.limit, `${cfg.windowMs} ms`),
    prefix: `rl:${cfg.prefix}`,
    analytics: false,
  });

  upstashCache.set(cfg.prefix, limiter);
  return limiter;
}

// ── 2-variant: Firestore atomik hisoblagich ──────────────────
// Fixed-window: har bir kalit uchun bitta hujjat, tranzaksiya ichida
// o'qib-yoziladi, shuning uchun parallel so'rovlarda ham to'g'ri sanaydi.
async function firestoreRateLimit(
  identifier: string,
  cfg: RateLimitConfig
): Promise<RateLimitResult> {
  const db = getAdminDb();
  // IP'ni hujjat ID sifatida ishlatib bo'lmaydi ("/" va boshqa belgilar) —
  // shuning uchun xavfsiz kalitga aylantiramiz.
  const safeId = `${cfg.prefix}_${Buffer.from(identifier).toString("base64url")}`;
  const docRef = db.collection("_rateLimits").doc(safeId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const now = Date.now();

    const data = snap.exists ? snap.data() : undefined;
    const resetAt: number = typeof data?.resetAt === "number" ? data.resetAt : 0;

    // Oyna tugagan yoki hujjat yo'q — yangi oyna ochamiz
    if (!snap.exists || now >= resetAt) {
      const newResetAt = now + cfg.windowMs;
      tx.set(docRef, {
        count: 1,
        resetAt: newResetAt,
        // Firestore TTL siyosati uchun (eski hujjatlarni avtomatik tozalash)
        expiresAt: new Date(newResetAt + cfg.windowMs),
      });
      return {
        success: true,
        remaining: cfg.limit - 1,
        resetAt: newResetAt,
        retryAfterSeconds: 0,
      };
    }

    const count: number = typeof data?.count === "number" ? data.count : 0;

    if (count >= cfg.limit) {
      return {
        success: false,
        remaining: 0,
        resetAt,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
      };
    }

    tx.update(docRef, { count: count + 1 });
    return {
      success: true,
      remaining: cfg.limit - (count + 1),
      resetAt,
      retryAfterSeconds: 0,
    };
  });
}

/**
 * Berilgan identifikator (odatda IP) uchun so'rovga ruxsat berilishini
 * tekshiradi. Upstash sozlangan bo'lsa o'sha, aks holda Firestore ishlatiladi.
 *
 * Muhim: saqlagich ishlamay qolsa, so'rov RAD ETILADI (fail-closed) —
 * aks holda Redis/Firestore uzilishi cheklovni butunlay o'chirib qo'yardi.
 */
export async function rateLimit(
  identifier: string,
  cfg: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    if (upstashConfigured()) {
      const limiter = await getUpstashLimiter(cfg);
      const res = await limiter.limit(`${cfg.prefix}:${identifier}`);
      const now = Date.now();
      return {
        success: res.success,
        remaining: res.remaining,
        resetAt: res.reset,
        retryAfterSeconds: res.success
          ? 0
          : Math.max(1, Math.ceil((res.reset - now) / 1000)),
      };
    }

    return await firestoreRateLimit(identifier, cfg);
  } catch (err) {
    console.error("[rate-limit] saqlagich xatosi:", err);
    return {
      success: false,
      remaining: 0,
      resetAt: Date.now() + cfg.windowMs,
      retryAfterSeconds: Math.ceil(cfg.windowMs / 1000),
    };
  }
}

/**
 * Hisoblagichni tozalaydi — muvaffaqiyatli login'dan keyin chaqiriladi.
 *
 * Bu brute-force himoyasini zaiflashtirmaydi: hisoblagichni faqat TO'G'RI
 * parolni bilgan odam tozalay oladi. Aks holda bir necha marta xato yozgan
 * haqiqiy admin kirganidan keyin ham bloklangan holatda qolardi.
 */
export async function resetRateLimit(
  identifier: string,
  cfg: RateLimitConfig
): Promise<void> {
  try {
    if (upstashConfigured()) {
      const limiter = await getUpstashLimiter(cfg);
      await limiter.resetUsedTokens(`${cfg.prefix}:${identifier}`);
      return;
    }

    const safeId = `${cfg.prefix}_${Buffer.from(identifier).toString("base64url")}`;
    await getAdminDb().collection("_rateLimits").doc(safeId).delete();
  } catch (err) {
    // Tozalash muvaffaqiyatsiz bo'lsa ham login jarayoni to'xtamasin
    console.error("[rate-limit] hisoblagichni tozalab bo'lmadi:", err);
  }
}
