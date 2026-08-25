"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WEEKDAYS, initialSchedule, type Weekday, type ScheduleEntry } from "@/lib/data";
import { getSchedule } from "@/lib/firestore";
import { fadeUp } from "@/lib/animations";

export default function Schedule() {
  const [schedule, setSchedule] = useState<Record<Weekday, ScheduleEntry[]>>(initialSchedule);
  const [active, setActive] = useState<Weekday>("Dushanba");

  useEffect(() => {
    getSchedule()
      .then((data) => { if (data) setSchedule(data); })
      .catch(() => {});
  }, []);

  // Bugungi kunni avtomatik ochamiz (yakshanba bo'lsa — dushanba)
  useEffect(() => {
    const index = new Date().getDay(); // 0 = yakshanba
    const day = WEEKDAYS[index - 1];
    if (day) setActive(day);
  }, []);

  const rows = schedule[active] ?? [];
  const hasAny = WEEKDAYS.some((d) => (schedule[d] ?? []).length > 0);
  if (!hasAny) return null;

  return (
    <section id="schedule" className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-20">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mb-8"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            O'quv jarayoni
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Dars jadvali</h2>
          <p className="mt-2 text-gray-500">Kun bo'yicha mashg'ulotlar vaqti va xonalari</p>
        </motion.div>

        {/* Kun tanlash */}
        <div className="mb-6 flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const count = (schedule[day] ?? []).length;
            return (
              <button
                key={day}
                onClick={() => setActive(day)}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active === day
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {day}
                {count > 0 && (
                  <span className={active === day ? "ml-1.5 text-white/70" : "ml-1.5 text-gray-400"}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            {rows.length === 0 ? (
              <p className="px-6 py-12 text-center text-gray-400">
                {active} kuni uchun dars belgilanmagan
              </p>
            ) : (
              // Tor ekranda jadval o'z ichida siljiydi, sahifa emas
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Vaqt</th>
                      <th className="px-5 py-3 font-medium">Fan / mashg'ulot</th>
                      <th className="px-5 py-3 font-medium">O'qituvchi</th>
                      <th className="px-5 py-3 font-medium">Xona</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                        <td className="whitespace-nowrap px-5 py-3.5 font-medium text-primary">{row.time}</td>
                        <td className="px-5 py-3.5 font-medium text-gray-900">{row.subject}</td>
                        <td className="px-5 py-3.5 text-gray-600">{row.teacher}</td>
                        <td className="px-5 py-3.5 text-gray-600">{row.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
