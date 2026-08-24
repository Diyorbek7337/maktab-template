import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

// 15 daqiqada 10 ta urinishdan ko'p bo'lsa bloklash
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 daqiqa

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." },
      {
        status: 429,
        headers: { "Retry-After": "900" },
      }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { password } = body;

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Parol kiritilmagan" }, { status: 400 });
  }

  // Belgilar soni cheklovi (DoS oldini olish)
  if (password.length > 200) {
    return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json(
      { error: `Parol noto'g'ri. ${remaining} ta urinish qoldi.` },
      { status: 401 }
    );
  }

  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server konfiguratsiya xatosi" },
      { status: 500 }
    );
  }

  // Muvaffaqiyatli kirish — urinishlar tozalanadi
  attempts.delete(ip);

  // Firebase Auth uchun custom token — client shu bilan Firestore/Storage'ga
  // autentifikatsiyalangan holda yoza oladi (rules: request.auth != null).
  let token: string;
  try {
    token = await getAdminAuth().createCustomToken("admin");
  } catch {
    return NextResponse.json(
      { error: "Firebase Admin sozlanmagan. FIREBASE_ADMIN_* qiymatlarini tekshiring." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true, token });
  res.cookies.set("admin_session", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",   // "lax" emas, "strict" — CSRF himoyasi
    maxAge: 60 * 60 * 8, // 7 kun emas, 8 soat
    path: "/",
  });

  return res;
}
