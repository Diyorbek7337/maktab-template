"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { schoolConfig, type Club, type ClubCategory } from "@/school.config";
import { getClubs, type ClubDoc } from "@/lib/firestore";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

const CATEGORIES: ClubCategory[] = ["Sport", "San'at", "Fan", "Texnologiya", "Til", "Boshqa"];

const CATEGORY_COLORS: Record<ClubCategory, string> = {
  Sport:       "bg-orange-100 text-orange-700",
  "San'at":    "bg-pink-100 text-pink-700",
  Fan:         "bg-blue-100 text-blue-700",
  Texnologiya: "bg-purple-100 text-purple-700",
  Til:         "bg-green-100 text-green-700",
  Boshqa:      "bg-gray-100 text-gray-700",
};

const CATEGORY_ICONS: Record<ClubCategory, React.ReactNode> = {
  Sport: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  ),
  "San'at": (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Fan: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Texnologiya: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  Til: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1m8 18-5-10-5 10M3.5 15h9" />
    </svg>
  ),
  Boshqa: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
};

type ClubItem = Club | ClubDoc;

export default function Clubs() {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [filter, setFilter] = useState<ClubCategory | "Barchasi">("Barchasi");

  useEffect(() => {
    getClubs()
      .then((data) => setClubs(data.length ? data : schoolConfig.clubs))
      .catch(() => setClubs(schoolConfig.clubs));
  }, []);

  const allCategories = Array.from(new Set(clubs.map((c) => c.category)));
  const filtered = filter === "Barchasi" ? clubs : clubs.filter((c) => c.category === filter);

  return (
    <section id="clubs" className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-20">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mb-10"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Qo'shimcha ta'lim
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">To'garaklar va seksiyalar</h2>
          <p className="mt-2 text-gray-500 max-w-xl">
            Darsdan tashqari iste'dodingizni rivojlantiring — sport, san'at, fan va texnologiya yo'nalishlari.
          </p>
        </motion.div>

        {/* Filter */}
        {allCategories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {(["Barchasi", ...allCategories] as (ClubCategory | "Barchasi")[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  filter === cat
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((club, i) => (
              <motion.div
                key={club.name + i}
                variants={scaleIn}
                layout
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.9 }}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                {/* Icon + category */}
                <div className="mb-4 flex items-start justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${CATEGORY_COLORS[club.category]}`}>
                    {CATEGORY_ICONS[club.category]}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_COLORS[club.category]}`}>
                    {club.category}
                  </span>
                </div>

                {/* Name + description */}
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {club.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {club.description}
                </p>

                {/* Meta */}
                <div className="mt-4 space-y-1.5">
                  {club.teacher && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {club.teacher}
                    </div>
                  )}
                  {club.schedule && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {club.schedule}
                    </div>
                  )}
                  {club.capacity && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {club.capacity} nafar
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
