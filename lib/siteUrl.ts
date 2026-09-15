/**
 * Saytning to'liq manzili — sitemap, robots va absolyut havolalar uchun.
 *
 * Tartib: aniq berilgan domen → hosting bergan domen → mahalliy dev.
 * O'z domeningizni ulaganingizda `NEXT_PUBLIC_SITE_URL` ni o'rnating,
 * aks holda sitemap hosting bergan texnik manzilni ko'rsatib turadi.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  // Netlify asosiy manzilni `URL` da beradi
  if (process.env.NETLIFY && process.env.URL) return process.env.URL.replace(/\/$/, "");

  return "http://localhost:3000";
}
