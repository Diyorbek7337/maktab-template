/**
 * Saytning to'liq manzili — sitemap, robots va absolyut havolalar uchun.
 *
 * Tartib: aniq berilgan domen → Vercel bergan domen → mahalliy dev.
 * O'z domeningizni ulaganingizda `NEXT_PUBLIC_SITE_URL` ni o'rnating,
 * aks holda sitemap Vercel manzilini ko'rsatib turadi.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
