"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadSearchIndex, search, KIND_LABEL, KIND_ORDER,
  type SearchResult, type SearchKind, type SearchIndex,
} from "@/lib/search";

const ICONS: Record<SearchKind, React.ReactNode> = {
  major: <path d="M12 14l9-5-9-5-9 5 9 5z" />,
  news: <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm14-8h-8M15 18h-5M10 6h8v4h-8V6Z" />,
  teacher: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  club: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
  alumni: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></>,
};

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<SearchIndex | null>(null);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ma'lumot faqat qidiruv ochilganda yuklanadi — bosh sahifa
  // yuklanishini sekinlashtirmasligi uchun
  useEffect(() => {
    if (!open) return;
    setError(false);
    loadSearchIndex().then(setRows).catch(() => setError(true));
    // Ochilganda kursor darhol maydonga tushsin
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  // Escape bilan yopish + fon sahifasi siljimasin
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const results = useMemo(
    () => (rows ? search(rows, query) : []),
    [rows, query]
  );

  // Turi bo'yicha guruhlab ko'rsatamiz
  const grouped = useMemo(() => {
    const map = new Map<SearchKind, SearchResult[]>();
    results.forEach((r) => {
      const list = map.get(r.kind) ?? [];
      list.push(r);
      map.set(r.kind, list);
    });
    return KIND_ORDER.filter((k) => map.has(k)).map((k) => [k, map.get(k)!] as const);
  }, [results]);

  const trimmed = query.trim();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[10vh]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Saytdan qidirish"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[75vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Kiritish maydoni */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
              <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Yo'nalish, yangilik, o'qituvchi…"
                className="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
                aria-label="Qidiruv so'zi"
              />
              <button
                onClick={onClose}
                aria-label="Yopish"
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ESC
              </button>
            </div>

            {/* Natijalar */}
            <div className="overflow-y-auto">
              {error ? (
                <p className="px-5 py-10 text-center text-sm text-gray-500">
                  Qidiruv ma&apos;lumotini yuklab bo&apos;lmadi. Internet aloqasini tekshiring.
                </p>
              ) : !trimmed ? (
                <p className="px-5 py-10 text-center text-sm text-gray-400">
                  Qidirish uchun yozing — yo&apos;nalishlar, yangiliklar, o&apos;qituvchilar,
                  to&apos;garaklar va bitiruvchilar bo&apos;yicha
                </p>
              ) : rows === null ? (
                <p className="px-5 py-10 text-center text-sm text-gray-400">Yuklanmoqda…</p>
              ) : results.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700">&laquo;{trimmed}&raquo;</span> bo&apos;yicha hech narsa topilmadi
                </p>
              ) : (
                <div className="py-2">
                  {grouped.map(([kind, list]) => (
                    <div key={kind} className="mb-1">
                      <p className="px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {KIND_LABEL[kind]}
                      </p>
                      {list.map((r, i) => (
                        <Link
                          key={`${r.href}-${i}`}
                          href={r.href}
                          onClick={onClose}
                          className="flex items-start gap-3 px-5 py-2.5 transition-colors hover:bg-primary/5"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              {ICONS[r.kind]}
                            </svg>
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-gray-900">{r.title}</span>
                            {r.subtitle && (
                              <span className="block truncate text-sm text-gray-500">{r.subtitle}</span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
