import { NextResponse, type NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Amaldagi admin sessiyasi (cookie'dagi JWT) uchun YANGI Firebase custom
 * token beradi.
 *
 * Nima uchun kerak: cookie 8 soat yashaydi, Firebase Auth sessiyasi esa
 * brauzer yopilganda o'chadi. Ular rassinxron bo'lganda admin panel
 * "kirgan" ko'rinadi, lekin Firestore'ga hech narsa o'qiy/yoza olmaydi —
 * barcha ro'yxatlar bo'sh va sanoqlar 0 bo'lib qoladi.
 *
 * Bu endpoint parol so'ramaydi, chunki cookie'dagi JWT allaqachon imzo
 * bilan tasdiqlangan — ya'ni foydalanuvchi avval parol bilan kirgan.
 */
export async function POST(req: NextRequest) {
  const session = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ error: "Sessiya yaroqsiz" }, { status: 401 });
  }

  try {
    const token = await getAdminAuth().createCustomToken("admin", {
      role: "admin",
    });
    return NextResponse.json({ token });
  } catch (err) {
    console.error("[firebase-token] token yaratilmadi:", err);
    return NextResponse.json(
      { error: "Firebase Admin sozlanmagan" },
      { status: 500 }
    );
  }
}
