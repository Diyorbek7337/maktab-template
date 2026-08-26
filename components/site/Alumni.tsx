"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { schoolConfig, type Alumni } from "@/school.config";
import { getAlumni, type AlumniDoc } from "@/lib/firestore";
import { fadeUp, stagger } from "@/lib/animations";

type AlumniItem = Alumni | AlumniDoc;

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function AlumniSection() {
  const [alumni, setAlumni] = useState<AlumniItem[]>(schoolConfig.alumni);

  useEffect(() => {
    getAlumni()
      .then((data) => { if (data.length) setAlumni(data); })
      .catch(() => {});
  }, []);

  if (alumni.length === 0) return null;

  return (
    <section id="alumni" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mb-12"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Texnikum faxrlari
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Bitiruvchilar</h2>
          <p className="mt-2 text-gray-500 max-w-xl">
            Bizning bitiruvchilarimiz bugun turli sohalarda muvaffaqiyatli faoliyat yuritmoqda.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {alumni.map((person, i) => (
            <motion.div
              key={person.name + i}
              variants={fadeUp}
              className="group flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Avatar */}
              <div className="shrink-0">
                {person.image ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image src={person.image} alt={person.name} fill className="object-cover" sizes="64px" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {getInitials(person.name)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {person.name}
                  </h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {person.graduationYear}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-gray-600 leading-snug">
                  {person.achievement}
                </p>
                {person.workplace && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    {person.workplace}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
