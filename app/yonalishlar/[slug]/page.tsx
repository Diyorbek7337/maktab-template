"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import ImageWithSkeleton from "@/components/site/ImageWithSkeleton";
import { schoolConfig, type Major } from "@/school.config";
import { getMajors, type MajorDoc } from "@/lib/firestore";
import { majorSlug } from "@/lib/data";

type MajorItem = Major | MajorDoc;

export default function MajorDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const [majors, setMajors] = useState<MajorItem[]>(schoolConfig.majors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Yo'nalishlar soni kam (o'nlab), shuning uchun hammasi bir marta
    // olinadi — yangiliklardagidek cheksiz o'sadigan ro'yxat emas.
    getMajors()
      .then((data) => { if (data.length) setMajors(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const major = majors.find((m) => majorSlug(m.name) === slug);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-3xl animate-pulse px-4 py-12">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="mt-6 h-56 rounded-2xl bg-gray-200" />
            <div className="mt-6 h-8 w-2/3 rounded bg-gray-200" />
            <div className="mt-4 h-4 w-full rounded bg-gray-200" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!major) notFound();

  const others = majors.filter((m) => majorSlug(m.name) !== slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-12">

          <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary">Bosh sahifa</Link>
            <span>/</span>
            <Link href="/yonalishlar" className="hover:text-primary">Yo&apos;nalishlar</Link>
            <span>/</span>
            <span className="text-gray-900">{major.name}</span>
          </nav>

          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {major.image ? (
              <div className="relative h-56 w-full bg-gray-100 sm:h-72">
                <ImageWithSkeleton
                  src={major.image}
                  alt={major.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-primary/5">
                <svg className="h-12 w-12 text-primary/25" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            )}

            <div className="p-6 sm:p-10">
              <h1 className="text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
                {major.name}
              </h1>

              {/* Asosiy ma'lumotlar */}
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    O&apos;qish muddati
                  </dt>
                  <dd className="mt-1.5 font-semibold text-gray-900">{major.duration}</dd>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 15a4 4 0 100-8 4 4 0 000 8z" /><path d="M8.5 14.5 6 22l6-3 6 3-2.5-7.5" />
                    </svg>
                    Beriladigan malaka
                  </dt>
                  <dd className="mt-1.5 font-semibold text-gray-900">{major.qualification}</dd>
                </div>
              </dl>

              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Yo&apos;nalish haqida
                </h2>
                <p className="mt-3 leading-relaxed text-gray-700">{major.description}</p>
              </div>

              {/* Qabul uchun murojaat */}
              <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="font-medium text-gray-900">Shu yo&apos;nalishda o&apos;qimoqchimisiz?</p>
                <p className="mt-1 text-sm text-gray-600">
                  Qabul shartlari va hujjatlar bo&apos;yicha biz bilan bog&apos;laning.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/#contact"
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                  >
                    Ariza qoldirish
                  </Link>
                  {schoolConfig.phones[0] && (
                    <a
                      href={`tel:${schoolConfig.phones[0].replace(/\s/g, "")}`}
                      className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
                    >
                      📞 {schoolConfig.phones[0]}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* Boshqa yo'nalishlar */}
          {others.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Boshqa yo&apos;nalishlar
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {others.map((m) => (
                  <Link
                    key={m.name}
                    href={`/yonalishlar/${majorSlug(m.name)}`}
                    className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary hover:shadow-sm"
                  >
                    <p className="font-medium text-gray-900 transition-colors group-hover:text-primary">
                      {m.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{m.duration}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link href="/yonalishlar" className="text-sm font-medium text-primary hover:text-primary-hover">
              ← Barcha yo&apos;nalishlar
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
