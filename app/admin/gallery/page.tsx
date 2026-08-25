"use client";

import { useEffect, useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getGalleryPage, addGalleryItem, deleteGalleryItem, type GalleryItem, type PageCursor } from "@/lib/firestore";
import { compressImage } from "@/lib/imageCompress";
import { parseYouTubeId, youTubeThumbnail } from "@/lib/youtube";

const CATEGORIES = ["Umumiy", "Tadbirlar", "Sport", "Fanlar", "Sayohat", "Bitiruvchilar"];
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const PAGE_SIZE = 30;

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [cursor, setCursor] = useState<PageCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [videoSaving, setVideoSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Havola yozilayotganda darhol ko'rsatiladigan tekshiruv natijasi
  const videoId = parseYouTubeId(videoUrl);
  const videoInvalid = videoUrl.trim().length > 0 && !videoId;

  async function load() {
    setLoading(true);
    setError("");
    try {
      // Butun galereya emas, birinchi sahifa — rasmlar soni o'sib borsa ham
      // admin paneli sekinlashmaydi
      const page = await getGalleryPage(PAGE_SIZE);
      setItems(page.items);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch {
      setError("Galereyani yuklab bo'lmadi. Sahifani yangilang yoki qaytadan kiring.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getGalleryPage(PAGE_SIZE, cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch {
      setError("Keyingi rasmlarni yuklab bo'lmadi.");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAddVideo() {
    if (!videoId) return;
    setVideoSaving(true);
    setError("");
    try {
      await addGalleryItem({
        // Ro'yxatda muqova sifatida YouTube rasmi ko'rinadi
        url: youTubeThumbnail(videoId),
        videoId,
        ...(caption ? { caption } : {}),
        category,
      });
      setVideoUrl("");
      setCaption("");
      await load();
    } catch {
      setError("Videoni qo'shib bo'lmadi. Sessiya tugagan bo'lishi mumkin — sahifani yangilang.");
    } finally {
      setVideoSaving(false);
    }
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} — 5 MB dan katta`); continue; }

      try {
        const compressed = await compressImage(file);
        const storageRef = ref(storage, `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
        await uploadBytes(storageRef, compressed, { cacheControl: CACHE_CONTROL });
        const url = await getDownloadURL(storageRef);
        const id = await addGalleryItem({ url, ...(caption ? { caption } : {}), category });
        setItems((prev) => [{ id, url, caption, category }, ...prev]);
      } catch {
        alert(`${file.name} — yuklashda xatolik`);
      }
    }

    setUploading(false);
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(item: GalleryItem) {
    const what = item.videoId ? "Videoni" : "Rasmni";
    if (!confirm(`${what} o'chirishni tasdiqlaysizmi?`)) return;
    try {
      // Video uchun `url` — YouTube muqovasi, ya'ni Storage'da fayl yo'q.
      // deleteGalleryItem buni o'zi farqlaydi (faqat firebasestorage
      // manzillarini o'chiradi), video esa YouTube'da o'z joyida qoladi.
      await deleteGalleryItem(item.id, item.url);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      setError("O'chirib bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Galereya</h2>
        <p className="mt-1 text-gray-500">
          Texnikum hayotiga oid rasm va videolar. Bir vaqtda bir nechta rasm yuklash mumkin.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Yuklash paneli */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Kategoriya</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-44">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tavsif (ixtiyoriy)</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="2026-yil bahor tadbiri..."
              className="input"
            />
          </div>
          <label className={`flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-hover"}`}>
            {uploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Yuklanmoqda…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Rasmlar tanlash
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
          </label>
        </div>

        {/* YouTube video qo'shish */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
            </svg>
            YouTube videosi qo'shish
          </label>
          <p className="mb-2 text-xs text-gray-400">
            Videoni YouTube&apos;ga yuklang, so&apos;ng havolasini shu yerga qo&apos;ying.
            Yuqoridagi kategoriya va tavsif video uchun ham amal qiladi.
          </p>

          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-64 flex-1">
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`input ${videoInvalid ? "border-red-300" : ""}`}
              />
              {videoInvalid && (
                <p className="mt-1 text-xs text-red-500">
                  Havola tanilmadi. YouTube&apos;dagi videoning to&apos;liq manzilini qo&apos;ying.
                </p>
              )}
              {videoId && (
                <p className="mt-1 text-xs text-green-600">✓ Video tanildi — quyida ko&apos;rinishini tekshiring</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddVideo}
              disabled={!videoId || videoSaving}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {videoSaving ? "Qo'shilmoqda…" : "Videoni qo'shish"}
            </button>
          </div>

          {/* Oldindan ko'rish — xodim to'g'ri video ekanini tasdiqlaydi */}
          {videoId && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youTubeThumbnail(videoId)}
                alt="Video muqovasi"
                className="h-16 w-28 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 text-sm">
                <p className="font-medium text-gray-700">Shu video qo&apos;shiladimi?</p>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  YouTube&apos;da ochib tekshirish →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Galereya grid */}
      <div>
        <p className="mb-3 text-sm text-gray-500">
          {loading
            ? "Yuklanmoqda…"
            : `Jami: ${items.length} ta — ${items.filter((i) => !i.videoId).length} rasm, ${items.filter((i) => i.videoId).length} video`}
        </p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.caption ?? ""} className="h-40 w-full object-cover" loading="lazy" />

              {/* Video ekanini bildiruvchi belgi */}
              {item.videoId && (
                <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}

              <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 transition-all group-hover:bg-black/40">
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow"
                  >
                    ✕
                  </button>
                </div>
                {(item.caption || item.category) && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.category && (
                      <span className="rounded-full bg-primary/80 px-2 py-0.5 text-xs text-white">{item.category}</span>
                    )}
                    {item.caption && (
                      <p className="mt-1 text-xs text-white line-clamp-2">{item.caption}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!loading && hasMore && (
          <div className="mt-6 text-center">
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
    </div>
  );
}
