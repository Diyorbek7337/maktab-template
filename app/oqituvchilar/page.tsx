"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { schoolConfig, type Teacher } from "@/school.config";
import { getTeachers } from "@/lib/firestore";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

const ALL = "Barchasi";

export default function OqituvchilarPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(schoolConfig.teachers);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(ALL);

  useEffect(() => {
    getTeachers()
      .then((data) => { if (data.length) setTeachers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fanlar ro'yxati o'qituvchilarning o'zidan olinadi — bu yerda
  // sahifalash yo'q, ya'ni hammasi xotirada va filtr to'liq ishlaydi.
  const subjects = useMemo(
    () => [ALL, ...Array.from(new Set(teachers.map((t) => t.subject))).sort()],
    [teachers]
  );

  const shown = subject === ALL ? teachers : teachers.filter((t) => t.subject === subject);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12">

          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.nav variants={fadeUp} className="mb-6 flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary">Bosh sahifa</Link>
              <span>/</span>
              <span className="text-gray-900">O&apos;qituvchilar</span>
            </motion.nav>
            <motion.span variants={fadeUp} className="text-sm font-semibold uppercase tracking-wide text-primary">
              Pedagoglar
            </motion.span>
            <motion.h1 variants={fadeUp} className="mt-2 text-3xl font-bold text-gray-900">
              O&apos;qituvchilar
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-2 text-gray-500">
              {!loading && `${teachers.length} nafar — `}
              texnikumimizning tajribali pedagog jamoasi
            </motion.p>
          </motion.div>

          {/* Fan bo'yicha filtr */}
          {subjects.length > 2 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    subject === s
                      ? "bg-primary text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <p className="mt-20 text-center text-gray-400">O&apos;qituvchi topilmadi</p>
          ) : (
            <motion.div
              key={subject}
              className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {shown.map((teacher) => (
                <motion.div
                  key={teacher.name}
                  variants={scaleIn}
                  className="group relative flex gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="shrink-0">
                    {teacher.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={teacher.image}
                        alt={teacher.name}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                        <span className="text-xl font-bold text-primary">{teacher.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 pr-8">
                    <h2 className="font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary">
                      {teacher.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {teacher.subject}
                      </span>
                    </div>
                    {teacher.achievement && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <p className="text-xs leading-snug text-gray-500">{teacher.achievement}</p>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-4 right-4 text-right">
                    <div className="text-lg font-bold text-primary/20 transition-colors group-hover:text-primary/40">
                      {teacher.experience}
                    </div>
                    <div className="text-[10px] text-gray-300 transition-colors group-hover:text-gray-400">yil</div>
                  </div>
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
