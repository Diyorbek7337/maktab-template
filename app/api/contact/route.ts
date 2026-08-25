import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { NOTIFY_RATE_LIMIT, getClientIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema, firstIssueMessage } from "@/lib/validation";
import { sendTelegramNotification } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Kontakt formasi uchun yagona xavfsiz kirish nuqtasi.
 *
 * Ilgari brauzer Firestore'ga TO'G'RIDAN-TO'G'RI yozardi va qoida shunchaki
 * `allow create: if true` edi — ya'ni istalgan odam ochiq API kalit bilan
 * cheksiz va istalgan hajmdagi hujjat yozishi mumkin edi. Endi yozuv faqat
 * shu route orqali: rate limit + Zod validatsiyasi + Admin SDK.
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

  const { name, phone, subject, body } = parsed.data;

  try {
    // Admin SDK xavfsizlik qoidalarini chetlab o'tadi — bu yerda bu xavfsiz,
    // chunki ma'lumot yuqorida to'liq validatsiyadan o'tgan.
    await getAdminDb().collection("messages").add({
      name,
      phone,
      subject,
      body,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("[contact] Firestore yozuv xatosi:", err);
    return NextResponse.json(
      { error: "Xabarni saqlab bo'lmadi. Keyinroq urinib ko'ring." },
      { status: 500 }
    );
  }

  // Telegram bildirishnomasi — yuborilmasa ham xabar allaqachon saqlangan,
  // shuning uchun foydalanuvchiga xatolik ko'rsatilmaydi.
  await sendTelegramNotification({ name, phone, subject, body });

  return NextResponse.json({ ok: true });
}
