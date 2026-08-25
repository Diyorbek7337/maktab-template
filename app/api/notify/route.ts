import { NextResponse, type NextRequest } from "next/server";
import { NOTIFY_RATE_LIMIT, getClientIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema, firstIssueMessage } from "@/lib/validation";
import { sendTelegramNotification } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Faqat Telegram bildirishnomasini yuboradi (Firestore'ga yozmaydi).
 *
 * Kontakt formasi endi `/api/contact` dan foydalanadi — u xabarni saqlaydi
 * VA bildirishnomani o'zi yuboradi. Bu route alohida integratsiyalar uchun
 * qoldirilgan, lekin u ham rate limit va Zod validatsiyasi ostida.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = await rateLimit(ip, NOTIFY_RATE_LIMIT);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Juda ko'p so'rov yuborildi. Birozdan so'ng qayta urinib ko'ring." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const raw = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssueMessage(parsed.error) },
      { status: 400 }
    );
  }

  const ok = await sendTelegramNotification(parsed.data);
  return NextResponse.json({ ok });
}
