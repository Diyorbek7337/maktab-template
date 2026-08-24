"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getNews, type NewsDoc } from "@/lib/firestore";
import { initialNews, formatDateUz, newsImages, type NewsItem } from "@/lib/data";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

type AnyNews = NewsDoc | (NewsItem & { id: string | number });

function toSlug(item: AnyNews): string {
  return (item as NewsDoc).slug ?? String((item as NewsItem).id);
}

const PREVIEW = 3;

export default function News() {
  const [news, setNews] = useState<AnyNews[]>(initialNews);

  useEffect(() => {
    getNews()
      .then((data) => { if (data.length) setNews(data); })
      .catch(() => {});
  }, []);

  return (
    <section id="news" className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-20">

        <motion.div
          className="flex items-end justify-between"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Yangiliklar
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">So'nggi yangiliklar</h2>
          </div>
          <Link href="/news" className="hidden text-sm font-medium text-primary hover:text-primary-hover sm:block">
            Barchasi →
          </Link>
        </motion.div>

        <motion.div
          className="mt-10 grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {news.slice(0, PREVIEW).map((item) => {
            const cover = newsImages(item)[0];
            return (
            <motion.div key={String(item.id)} variants={scaleIn}>
              <Link
                href={`/news/${toSlug(item)}`}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:border-primary hover:shadow-md"
              >
                {cover ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={cover}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-primary/5">
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
                  <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-gray-600">{item.excerpt}</p>
                  <span className="mt-4 text-sm font-medium text-primary group-hover:text-primary-hover">
                    Batafsil →
                  </span>
                </div>
              </Link>
            </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
