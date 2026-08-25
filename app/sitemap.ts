import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { getNews } from "@/lib/firestore";
import { initialNews } from "@/lib/data";

// Yangi maqolalar sitemap'ga tushishi uchun vaqti-vaqti bilan qayta
// generatsiya qilinadi (soatiga bir marta).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/yonalishlar`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/news`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/gallery`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/mamuriyat`, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Yangilik sahifalari — Firestore bo'sh bo'lsa namuna yangiliklar
  let slugs: { slug: string; date?: string }[] = [];
  try {
    const news = await getNews();
    slugs = news.length
      ? news.map((n) => ({ slug: n.slug, date: n.date }))
      : initialNews.map((n) => ({ slug: n.slug, date: n.date }));
  } catch {
    slugs = initialNews.map((n) => ({ slug: n.slug, date: n.date }));
  }

  const newsPages: MetadataRoute.Sitemap = slugs.map(({ slug, date }) => ({
    url: `${base}/news/${slug}`,
    lastModified: date ? new Date(date) : undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...newsPages];
}
