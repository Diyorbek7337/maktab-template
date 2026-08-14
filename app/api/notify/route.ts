import { NextRequest, NextResponse } from "next/server";
import { schoolConfig } from "@/school.config";

function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  const cfg = schoolConfig.telegramNotify;
  if (!cfg?.botToken || !cfg?.chatId) {
    return NextResponse.json({ ok: false, reason: "not configured" });
  }

  const raw = await req.json().catch(() => ({}));
  const { name, phone, subject, body } = raw;

  // Server-side validatsiya
  if (
    typeof name   !== "string" || name.trim().length   < 2 || name.trim().length   > 100 ||
    typeof phone  !== "string" || phone.trim().length  < 7 || phone.trim().length  > 30  ||
    typeof body   !== "string" || body.trim().length   < 5 || body.trim().length   > 2000||
    typeof subject !== "string"
  ) {
    return NextResponse.json({ error: "Noto'g'ri ma'lumotlar" }, { status: 400 });
  }

  // Barcha foydalanuvchi ma'lumotlari HTML escape qilinadi
  const text = [
    `📩 <b>Yangi xabar</b>`,
    `👤 <b>Ism:</b> ${escHtml(name)}`,
    `📞 <b>Telefon:</b> ${escHtml(phone)}`,
    `📌 <b>Mavzu:</b> ${escHtml(subject)}`,
    `💬 <b>Xabar:</b> ${escHtml(body)}`,
  ].join("\n");

  const res = await fetch(
    `https://api.telegram.org/bot${cfg.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: cfg.chatId, text, parse_mode: "HTML" }),
    }
  );

  return NextResponse.json({ ok: res.ok });
}
