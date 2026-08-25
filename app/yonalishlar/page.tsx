"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ImageWithSkeleton from "@/components/site/ImageWithSkeleton";
import { schoolConfig, type Major } from "@/school.config";
import { getMajors, type MajorDoc } from "@/lib/firestore";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";
import { majorSlug } from "@/lib/data";
import { motion } from "framer-motion";

type MajorItem = Major | MajorDoc;

export default function YonalishlarPage() {
  const [majors, setMajors] = useState<MajorItem[]>(schoolConfig.majors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMajors()
      .then((data) => { if (data.length) setMajors(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12">

          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.nav variants={fadeUp} className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-primary">Bosh sahifa</Link>
              <span>/</span>
              <span className="text-gray-900">Yo'nalishlar</span>
            </motion.nav>
            <motion.span variants={fadeUp} className="text-sm font-semibold uppercase tracking-wide text-primary">
              Ta'lim yo'nalishlari
            </motion.span>
            <motion.h1 variants={fadeUp} className="mt-2 text-3xl font-bold text-gray-900">
              Kasb-hunar yo'nalishlari
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-2 text-gray-500">
              {!loading && `${majors.length} ta yo'nalish — `}
              Zamonaviy ustaxona va laboratoriyalarda amaliy mahorat bilan birga nazariy bilim beramiz.
            </motion.p>
          </motion.div>

          {loading ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <div className="h-40 bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-full rounded bg-gray-100" />
                    <div className="h-3 w-2/3 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {majors.map((major, i) => (
                <motion.div key={major.name + i} variants={scaleIn}>
              <Link
                href={`/yonalishlar/${majorSlug(major.name)}`}
                className="group block h-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-primary hover:shadow-md"
              >
                  {major.image ? (
                    <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                      <ImageWithSkeleton
                        src={major.image}
                        alt={major.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-primary/5">
                      <svg className="h-10 w-10 text-primary/25" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {major.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                      {major.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {major.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 15a4 4 0 100-8 4 4 0 000 8z" />
                          <path d="M8.5 14.5 6 22l6-3 6 3-2.5-7.5" />
                        </svg>
                        {major.qualification}
                      </span>
                    </div>
                  </div>
                </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
