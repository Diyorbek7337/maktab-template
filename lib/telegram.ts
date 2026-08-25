// Telegram bot tokeni — MAXFIY qiymat. Ilgari u `school.config.ts` da edi,
// lekin o'sha fayl git'ga commit qilinadi va token omma oldiga chiqib ketardi.
// Endi faqat server tomonidagi env o'zgaruvchilarda saqlanadi.

function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface TelegramMessageFields {
  name: string;
  phone: string;
  subject: string;
  body: string;
}

/**
 * Adminga Telegram orqali bildirishnoma yuboradi.
 * Sozlanmagan bo'lsa jim `false` qaytaradi — bu asosiy oqimni to'xtatmaydi.
 */
export async function sendTelegramNotification(
  fields: TelegramMessageFields
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return false;

  // Barcha foydalanuvchi ma'lumotlari HTML escape qilinadi —
  // aks holda `parse_mode: "HTML"` bilan teg inyeksiyasi mumkin edi.
  const text = [
    `📩 <b>Yangi xabar</b>`,
    `👤 <b>Ism:</b> ${escHtml(fields.name)}`,
    `📞 <b>Telefon:</b> ${escHtml(fields.phone)}`,
    `📌 <b>Mavzu:</b> ${escHtml(fields.subject)}`,
    `💬 <b>Xabar:</b> ${escHtml(fields.body)}`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
        // Telegram javob bermay qolsa so'rov osilib qolmasligi uchun
        signal: AbortSignal.timeout(8000),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
