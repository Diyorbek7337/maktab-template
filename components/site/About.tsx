"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { schoolConfig } from "@/school.config";
import { stagger, fadeUp, slideLeft, slideRight } from "@/lib/animations";

const features = [
  {
    title: "Malakali ustozlar",
    text: "Tajribali va o'z kasbiga fidoyi pedagoglar jamoasi.",
  },
  {
    title: "Zamonaviy sharoit",
    text: "Yangilangan sinflar, ustaxonalar va laboratoriyalar.",
  },
  {
    title: "Amaliy ta'lim",
    text: "Har bir yo'nalish bo'yicha real ish tajribasi va malaka oshirish imkoniyati.",
  },
];

export default function About() {
  const { director, schoolImage, shortName } = schoolConfig;

  return (
    <section id="about" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* Chap: texnikum rasmi */}
          <motion.div
            className="relative"
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {schoolImage ? (
              <div className="relative h-80 overflow-hidden rounded-2xl shadow-lg lg:h-96">
                <Image
                  src={schoolImage}
                  alt={shortName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="flex h-80 w-full items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 lg:h-96">
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="mt-3 text-sm text-primary/40">Texnikum binosi</p>
                </div>
              </div>
            )}

            <div className="absolute -bottom-6 -right-4 hidden max-w-xs rounded-xl border border-gray-100 bg-white p-4 shadow-lg lg:block">
              <p className="text-sm italic text-gray-600 line-clamp-3">"{director.quote}"</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {director.name.charAt(0)}
                </span>
                <div>
                  <div className="text-xs font-semibold text-gray-900">{director.name}</div>
                  <div className="text-xs text-primary">{director.position}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* O'ng: matn */}
          <motion.div
            className="lg:pl-6"
            variants={slideRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Texnikum haqida
            </span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Bilim va kasb-mahorat uyg'unligi
            </h2>
            <p className="mt-4 text-gray-600">
              {shortName} — talabalarni tanlagan kasbi bo'yicha har tomonlama
              tayyorlashga yo'naltirilgan ta'lim maskani. Biz har bir yoshning
              iqtidorini ochishga va ish bozorida raqobatbardosh mutaxassis
              qilib yetishtirishga intilamiz.
            </p>

            <motion.div
              className="mt-8 space-y-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {features.map((f) => (
                <motion.div key={f.title} variants={fadeUp} className="flex gap-4">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{f.title}</h3>
                    <p className="text-sm text-gray-600">{f.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 rounded-xl border-l-4 border-primary bg-primary/5 p-5 lg:hidden">
              <p className="italic text-gray-700">"{director.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                  {director.name.charAt(0)}
                </span>
                <div>
                  <div className="font-semibold text-gray-900">{director.name}</div>
                  <div className="text-sm text-primary">{director.position}</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
