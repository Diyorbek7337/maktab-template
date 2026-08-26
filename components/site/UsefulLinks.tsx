"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { schoolConfig } from "@/school.config";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

export default function UsefulLinks() {
  const { usefulLinks, shortName } = schoolConfig;
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  if (!usefulLinks.length) return null;

  return (
    <section id="useful-links" className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-14">

        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            {shortName}
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Foydali Manbalar</h2>
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gray-300" />
            <div className="h-2 w-2 rounded-sm bg-gray-400" />
            <div className="h-px w-12 bg-gray-300" />
          </div>
          <p className="mt-4 text-gray-500">
            O'qituvchilar va Ota-onalar uchun foydali bo'lgan manbalar
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {usefulLinks.map((link, i) => (
            <motion.a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={scaleIn}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
              className="group relative flex flex-col items-center rounded-2xl border border-primary/30 bg-white px-6 pb-6 pt-14 text-center transition-colors hover:border-primary"
            >
              <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white shadow-md">
                {link.logo && !imgErrors[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={link.logo}
                    alt={link.title}
                    className="h-10 w-10 object-contain"
                    onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700 group-hover:text-primary transition-colors leading-snug">
                {link.title}
              </p>
              <span className="mt-3 text-xs text-gray-400 group-hover:text-primary/70 transition-colors">
                {new URL(link.url).hostname} →
              </span>
            </motion.a>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
