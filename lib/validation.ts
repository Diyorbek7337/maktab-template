import { z } from "zod";

// Serverga kelayotgan BARCHA kirish ma'lumotlari shu sxemalar orqali
// runtime'da tekshiriladi. TypeScript turlari faqat compile vaqtida
// ishlaydi — tashqi so'rov uchun ular himoya emas.

export const contactSchema = z.object({
  name: z
    .string({ message: "Ism kiritilmagan" })
    .trim()
    .min(2, "Ism juda qisqa")
    .max(100, "Ism juda uzun"),
  phone: z
    .string({ message: "Telefon raqami kiritilmagan" })
    .trim()
    .min(7, "Telefon raqami juda qisqa")
    .max(30, "Telefon raqami juda uzun")
    .regex(/^[0-9+()\-\s]+$/, "Telefon raqamida faqat raqam va + ( ) - belgilari bo'lishi mumkin"),
  subject: z
    .string({ message: "Mavzu tanlanmagan" })
    .trim()
    .min(2, "Mavzu tanlanmagan")
    .max(100, "Mavzu juda uzun"),
  body: z
    .string({ message: "Xabar kiritilmagan" })
    .trim()
    .min(5, "Xabar juda qisqa")
    .max(3000, "Xabar juda uzun"),

  /**
   * Honeypot — formada ko'rinmas maydon. Odam uni hech qachon
   * to'ldirmaydi, avtomatik bot esa barcha maydonlarni to'ldiradi.
   *
   * Diqqat: bu yerda ataylab RAD ETILMAYDI. Aks holda javobda "Spam
   * aniqlandi" deb yozilib, botga qaysi maydon ushlaganini aytib
   * qo'yardik. Tekshiruv route ichida, jimgina amalga oshiriladi.
   */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  password: z
    .string({ message: "Parol kiritilmagan" })
    .min(1, "Parol kiritilmagan")
    // Uzun payload bilan hash/solishtirishni ortiqcha yuklashning oldini oladi
    .max(200, "Parol juda uzun"),
});

/**
 * Zod xatolarini foydalanuvchiga ko'rsatiladigan bitta satrga aylantiradi.
 * Ichki maydon nomlari va sxema tuzilishi tashqariga chiqarilmaydi.
 */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Noto'g'ri ma'lumot";
}
