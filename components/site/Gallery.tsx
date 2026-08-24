"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ImageWithSkeleton from "./ImageWithSkeleton";
import { getGallery, type GalleryItem } from "@/lib/firestore";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

const PREVIEW = 6;

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    getGallery().then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const preview = items.slice(0, PREVIEW);

  return (
    <section id="gallery" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">

        <motion.div
          className="flex items-end justify-between"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">Galereya</span>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">Maktab hayotidan</h2>
          </div>
          {items.length > PREVIEW && (
            <Link href="/gallery" className="hidden text-sm font-medium text-primary hover:text-primary-hover sm:block">
              Barchasi →
            </Link>
          )}
        </motion.div>

        {items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-gray-400">
            <svg className="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Rasmlar admin paneldan qo'shiladi</p>
          </div>
        ) : (
        <motion.div
          className="mt-10 grid gap-3 grid-cols-2 sm:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {preview.map((item, i) => (
            <motion.button
              key={item.id}
              variants={scaleIn}
              onClick={() => setLightbox(item)}
              className={`group relative overflow-hidden rounded-xl bg-gray-100 ${i === 0 ? "h-64 sm:col-span-2 sm:row-span-2 sm:h-80" : "h-40"}`}
            >
              <ImageWithSkeleton
                src={item.url}
                alt={item.caption ?? ""}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={i === 0 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
              />
              <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/30 flex items-center justify-center">
                <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803zM10.5 7.5v6m3-3h-6" />
                </svg>
              </div>
              {item.category && (
                <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                  {item.category}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>
        )}

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox.url} alt={lightbox.caption ?? ""} className="max-h-[80vh] rounded-xl object-contain" />
              {lightbox.caption && (
                <p className="mt-3 text-center text-sm text-gray-300">{lightbox.caption}</p>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow hover:bg-gray-100"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
