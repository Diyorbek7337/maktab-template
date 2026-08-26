"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { getGalleryPage, type GalleryItem, type PageCursor } from "@/lib/firestore";
import { youTubeEmbedUrl } from "@/lib/youtube";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";
import { GALLERY_CATEGORIES } from "@/lib/data";

const ALL = "Barchasi";
const PAGE_SIZE = 24;

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [active, setActive] = useState<string>(ALL);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<PageCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filtr o'zgarganda ro'yxat ham, kursor ham noldan boshlanadi —
  // saralash Firestore'da bajariladi, brauzerda emas.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getGalleryPage(PAGE_SIZE, undefined, active === ALL ? undefined : active)
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      })
      .catch(() => { if (!cancelled) { setItems([]); setHasMore(false); } })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [active]);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getGalleryPage(
        PAGE_SIZE, cursor, active === ALL ? undefined : active
      );
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Filtr ro'yxati barqaror: yuklangan rasmlardan emas, kategoriyalar
  // ro'yxatidan olinadi — aks holda keyingi sahifadagi kategoriya
  // tugmasi umuman chiqmasdi.
  const categories: string[] = [ALL, ...GALLERY_CATEGORIES];
  // Saralash Firestore'da bajarilgani uchun bu yerda qo'shimcha filtr shart emas
  const filtered = items;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-12">

          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.nav variants={fadeUp} className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-primary">Bosh sahifa</Link>
              <span>/</span>
              <span className="text-gray-900">Galereya</span>
            </motion.nav>
            <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900">Galereya</motion.h1>
            <motion.p variants={fadeUp} className="mt-2 text-gray-500">Texnikum hayotidagi eng yaxshi lahzalar</motion.p>
          </motion.div>

          {/* Kategoriya filter */}
          {categories.length > 1 && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="mt-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    active === cat
                      ? "bg-primary text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}

          {loading ? (
            <div className="mt-20 text-center text-gray-400">Yuklanmoqda…</div>
          ) : filtered.length === 0 ? (
            <div className="mt-20 text-center text-gray-400">Rasmlar yo'q</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4"
              >
                {filtered.map((item) => (
                  <motion.button
                    key={item.id}
                    variants={scaleIn}
                    initial="hidden"
                    animate="show"
                    onClick={() => setLightbox(item)}
                    className="group relative mb-3 block w-full overflow-hidden rounded-xl"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.caption ?? ""}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {item.videoId && (
                      <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 transition-transform group-hover:scale-110">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-lg border-2 border-primary px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-60"
              >
                {loadingMore ? "Yuklanmoqda…" : "Ko'proq yuklash"}
              </button>
            </div>
          )}
        </div>
      </main>

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
              {lightbox.videoId ? (
                <div className="aspect-video w-[90vw] max-w-4xl overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={youTubeEmbedUrl(lightbox.videoId, true)}
                    title={lightbox.caption ?? "Video"}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lightbox.url} alt={lightbox.caption ?? ""} className="max-h-[80vh] rounded-xl object-contain" />
              )}
              {lightbox.caption && (
                <p className="mt-3 text-center text-sm text-gray-300">{lightbox.caption}</p>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-800 shadow"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
