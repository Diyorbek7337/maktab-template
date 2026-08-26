"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { schoolConfig, type OlympiadLevel, type OlympiadWinner } from "@/school.config";
import { getWinners } from "@/lib/firestore";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

const LEVELS: OlympiadLevel[] = ["Tuman", "Viloyat", "Respublika", "Xalqaro"];

const medalConfig = {
  1: { label: "I o'rin", bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-600", icon: "🥇" },
  2: { label: "II o'rin", bg: "bg-gray-50",  border: "border-gray-300",  text: "text-gray-500",  icon: "🥈" },
  3: { label: "III o'rin", bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-600", icon: "🥉" },
} as const;

const levelBadge: Record<OlympiadLevel, string> = {
  Texnikum:    "bg-gray-100 text-gray-600",
  Tuman:       "bg-blue-50 text-blue-600",
  Viloyat:     "bg-violet-50 text-violet-600",
  Respublika:  "bg-green-50 text-green-700",
  Xalqaro:     "bg-amber-50 text-amber-700",
};

export default function OlympiadWinners() {
  const [olympiadWinners, setOlympiadWinners] = useState<OlympiadWinner[]>(schoolConfig.olympiadWinners);
  const [activeLevel, setActiveLevel] = useState<OlympiadLevel | "Barchasi">("Barchasi");

  useEffect(() => {
    getWinners()
      .then((data) => { if (data.length) setOlympiadWinners(data); })
      .catch(() => {});
  }, []);

  if (!olympiadWinners.length) return null;

  const filtered = activeLevel === "Barchasi"
    ? olympiadWinners
    : olympiadWinners.filter((w) => w.level === activeLevel);

  // Darajaga qarab saralash: Xalqaro > Respublika > Viloyat > Tuman > Texnikum
  const levelOrder: Record<OlympiadLevel, number> = { Xalqaro: 0, Respublika: 1, Viloyat: 2, Tuman: 3, Texnikum: 4 };
  const sorted = [...filtered].sort((a, b) =>
    levelOrder[a.level] - levelOrder[b.level] || a.place - b.place
  );

  const allLevels = ["Barchasi", ...LEVELS] as const;

  return (
    <section id="olympiad" className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-14">

        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Yutuqlar
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Musobaqa g'oliblari</h2>
          <p className="mt-3 text-gray-500">
            Fan olimpiadalari va kasbiy mahorat musobaqalarida texnikumimizni munosib vakil etgan talabalar
          </p>
        </motion.div>

        {/* Filter tugmalar */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-2"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {allLevels.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeLevel === level
                  ? "bg-primary text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              {level}
            </button>
          ))}
        </motion.div>

        {/* G'oliblar jadvali */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLevel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mt-10"
          >
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {sorted.map((winner, i) => {
                const medal = medalConfig[winner.place];
                return (
                  <motion.div
                    key={`${winner.student}-${winner.year}`}
                    variants={scaleIn}
                    className={`relative flex flex-col rounded-xl border ${medal.border} ${medal.bg} p-4 transition-shadow hover:shadow-md`}
                  >
                    {/* Medal + daraja */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{medal.icon}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelBadge[winner.level]}`}>
                        {winner.level}
                      </span>
                    </div>

                    {/* Talaba rasmi + ismi */}
                    <div className="mt-3 flex items-center gap-3">
                      {winner.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={winner.image} alt={winner.student}
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white shadow" />
                      ) : (
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${medal.bg} ${medal.border} border text-lg font-bold ${medal.text}`}>
                          {winner.student.charAt(0)}
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 leading-snug">{winner.student}</h3>
                    </div>

                    {/* Fan */}
                    <p className={`mt-0.5 text-sm font-medium ${medal.text}`}>{winner.subject}</p>

                    {/* Quyi qator */}
                    <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                      <span className="text-xs text-gray-400">{winner.year}-yil</span>
                      {winner.teacher && (
                        <span className="text-xs text-gray-400">
                          ✦ {winner.teacher}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {sorted.length === 0 && (
              <p className="py-16 text-center text-gray-400">Bu daraja bo'yicha g'oliblar yo'q</p>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
