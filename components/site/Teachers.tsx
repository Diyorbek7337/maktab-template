"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { schoolConfig, type Teacher } from "@/school.config";
import { getTeachers } from "@/lib/firestore";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>(schoolConfig.teachers);

  useEffect(() => {
    getTeachers()
      .then((data) => { if (data.length) setTeachers(data); })
      .catch(() => {});
  }, []);

  if (!teachers.length) return null;

  return (
    <section id="teachers" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">

        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Pedagoglar
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Eng yaxshi o'qituvchilar</h2>
          <p className="mt-3 text-gray-500">
            Texnikumimizning yutuqli va tajribali pedagog jamoasi
          </p>
        </motion.div>

        <motion.div
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {teachers.map((teacher) => (
            <motion.div
              key={teacher.name}
              variants={scaleIn}
              className="group relative flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-primary hover:shadow-md"
            >
              {/* Avatar */}
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
                    <span className="text-xl font-bold text-primary">
                      {teacher.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Ma'lumot */}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                  {teacher.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {teacher.subject}
                  </span>
                  <span className="text-xs text-gray-400">{teacher.experience} yil</span>
                </div>
                {teacher.achievement && (
                  <div className="mt-2 flex items-start gap-1.5">
                    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-xs text-gray-500 leading-snug">{teacher.achievement}</p>
                  </div>
                )}
              </div>

              {/* Tajriba — pastki o'ng burchak */}
              <div className="absolute bottom-4 right-4 text-right">
                <div className="text-lg font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                  {teacher.experience}
                </div>
                <div className="text-[10px] text-gray-300 group-hover:text-gray-400 transition-colors">yil</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
