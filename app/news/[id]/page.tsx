import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ImageWithSkeleton from "@/components/site/ImageWithSkeleton";
import { initialNews, formatDateUz, newsImages } from "@/lib/data";
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
  const images = newsImages(item);
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: `${item.title} | ${schoolConfig.shortName}`,
      description: item.excerpt,
      images: images.length ? [{ url: images[0] }] : [],
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
  const images = newsImages(item);

  // "[rasm:2]" kabi paragraflar matn o'rniga o'sha rasmni ko'rsatadi.
  const IMAGE_TOKEN = /^\[rasm:(\d+)\]$/;
  const usedInline = new Set<number>();
  const blocks = paragraphs.map((p) => {
    const match = p.trim().match(IMAGE_TOKEN);
    const index = match ? Number(match[1]) - 1 : -1;
    if (match && images[index]) {
      usedInline.add(index);
      return { type: "image" as const, src: images[index] };
    }
    return { type: "text" as const, text: p };
  });

  // Matn ichida ishlatilmagan qolgan rasmlar (muqovadan tashqari) pastda galereya bo'lib chiqadi.
  const gallery = images
    .map((src, i) => ({ src, i }))
    .filter(({ i }) => i !== 0 && !usedInline.has(i));

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
            {images[0] && (
              <div className="relative h-64 w-full bg-gray-100 sm:h-80">
                <ImageWithSkeleton
                  src={images[0]}
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
                {blocks.map((block, i) =>
                  block.type === "image" ? (
                    <div key={i} className="relative h-56 w-full overflow-hidden rounded-lg bg-gray-100 sm:h-72">
                      <ImageWithSkeleton
                        src={block.src}
                        alt={`${item.title} — rasm`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                      />
                    </div>
                  ) : (
                    <p key={i}>{block.text}</p>
                  )
                )}
              </div>

              {gallery.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map(({ src, i }) => (
                    <div key={i} className="relative h-32 overflow-hidden rounded-lg bg-gray-100 sm:h-40">
                      <ImageWithSkeleton
                        src={src}
                        alt={`${item.title} — rasm ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              )}
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
