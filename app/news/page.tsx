"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ImageWithSkeleton from "@/components/site/ImageWithSkeleton";
import { getNews, type NewsDoc } from "@/lib/firestore";
import { initialNews, formatDateUz, newsImages, type NewsItem } from "@/lib/data";

type AnyNews = NewsDoc | (NewsItem & { id: string | number });

function toSlug(item: AnyNews): string {
  return (item as NewsDoc).slug ?? String((item as NewsItem).id);
}

export default function NewsPage() {
  const [news, setNews] = useState<AnyNews[]>(initialNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then((data) => { if (data.length) setNews(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8">
            <Link href="/" className="text-sm text-primary hover:text-primary-hover">
              ← Bosh sahifa
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">Barcha yangiliklar</h1>
            {!loading && (
              <p className="mt-1 text-gray-500">{news.length} ta yangilik</p>
            )}
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white overflow-hidden">
                  <div className="h-48 bg-gray-100" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-16 rounded bg-gray-100" />
                    <div className="h-5 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-full rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => {
                const cover = newsImages(item)[0];
                return (
                <Link
                  key={String(item.id)}
                  href={`/news/${toSlug(item)}`}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-primary hover:shadow-md transition-all"
                >
                  {cover ? (
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      <ImageWithSkeleton
                        src={cover}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-primary/5">
                      <svg className="h-12 w-12 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                        {item.category}
                      </span>
                      <time className="text-gray-400">{formatDateUz(item.date)}</time>
                    </div>
                    <h2 className="mt-3 font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-3">{item.excerpt}</p>
                    <span className="mt-4 text-sm font-medium text-primary group-hover:text-primary-hover">
                      Batafsil →
                    </span>
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
