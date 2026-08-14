import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { initialNews, formatDateUz } from "@/lib/data";
import { schoolConfig } from "@/school.config";
import { getNews } from "@/lib/firestore";

export const dynamic = "force-dynamic";

async function findArticle(slug: string) {
  // Avval initialNews dan izlash
  const staticItem = initialNews.find((n) => n.slug === slug);
  if (staticItem) return staticItem;

  // Firestore'dan izlash
  try {
    const firestoreNews = await getNews();
    return firestoreNews.find((n) => n.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (!/^[a-z0-9-]{1,100}$/.test(params.id)) return {};
  const item = await findArticle(params.id);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: `${item.title} | ${schoolConfig.shortName}`,
      description: item.excerpt,
      images: item.image ? [{ url: item.image }] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  if (!/^[a-z0-9-]{1,100}$/.test(params.id)) notFound();

  const item = await findArticle(params.id);
  if (!item) notFound();

  const paragraphs = ((item as { content?: string }).content ?? item.excerpt)
    .split("\n\n")
    .filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary">Bosh sahifa</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-primary">Yangiliklar</Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-xs">{item.title}</span>
          </nav>

          <article className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {item.image && (
              <div className="relative h-64 w-full sm:h-80">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            )}

            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                  {item.category}
                </span>
                <time className="text-gray-400">{formatDateUz(item.date)}</time>
              </div>

              <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl leading-snug">
                {item.title}
              </h1>

              <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </article>

          <div className="mt-6">
            <Link href="/news" className="text-sm font-medium text-primary hover:text-primary-hover">
              ← Barcha yangiliklarga qaytish
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
