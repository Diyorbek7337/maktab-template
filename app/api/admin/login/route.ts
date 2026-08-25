import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  safeCompare,
} from "@/lib/auth";
import {
  LOGIN_RATE_LIMIT,
  getClientIp,
  rateLimit,
  resetRateLimit,
} from "@/lib/rate-limit";
import { firstIssueMessage, loginSchema } from "@/lib/validation";

// firebase-admin Node API'lariga tayanadi — Edge'da ishlamaydi.
export const runtime = "nodejs";
// Javob hech qachon keshlanmasin
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1) Rate limit — holat Upstash Redis yoki Firestore'da (umumiy), shuning
  //    uchun serverless nusxalar orasida ham haqiqatan ishlaydi.
  const ip = getClientIp(req);
  const limit = await rateLimit(ip, LOGIN_RATE_LIMIT);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  // 2) Runtime validatsiya — kelayotgan JSON'ga umuman ishonilmaydi
  const raw = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 }
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("[login] ADMIN_PASSWORD env o'zgaruvchisi sozlanmagan");
    return NextResponse.json(
      { error: "Server konfiguratsiya xatosi" },
      { status: 500 }
    );
  }

  // 3) Timing-attack'ga chidamli solishtirish (oddiy `!==` emas)
  const passwordOk = await safeCompare(parsed.data.password, adminPassword);
  if (!passwordOk) {
    // Qolgan urinishlar soni ataylab oshkor qilinmaydi — bu hujumchiga
    // limitni kuzatish imkonini berardi.
    return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });
  }

  // Parol to'g'ri — hisoblagich tozalanadi, aks holda bir necha marta
  // xato yozgan admin kirganidan keyin ham bloklangan qolardi.
  await resetRateLimit(ip, LOGIN_RATE_LIMIT);

  // 4) Firebase Auth custom token — client shu bilan Firestore/Storage'ga
  //    autentifikatsiyalangan holda yozadi (rules: request.auth != null).
  let firebaseToken: string;
  try {
    firebaseToken = await getAdminAuth().createCustomToken("admin", {
      role: "admin",
    });
  } catch (err) {
    console.error("[login] Firebase custom token yaratilmadi:", err);
    return NextResponse.json(
      { error: "Firebase Admin sozlanmagan. FIREBASE_ADMIN_* qiymatlarini tekshiring." },
      { status: 500 }
    );
  }

  // 5) Imzolangan, muddati cheklangan sessiya JWT'si
  let sessionToken: string;
  try {
    sessionToken = await createSessionToken();
  } catch (err) {
    console.error("[login] Sessiya tokeni yaratilmadi:", err);
    return NextResponse.json(
      { error: "Server konfiguratsiya xatosi" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true, token: firebaseToken });
  res.cookies.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // CSRF himoyasi
    maxAge: SESSION_MAX_AGE, // 8 soat, JWT `exp` bilan bir xil
    path: "/",
  });

  return res;
}
