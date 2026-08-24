"use client";

import { useEffect, useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getGallery, addGalleryItem, deleteGalleryItem, type GalleryItem } from "@/lib/firestore";
import { compressImage } from "@/lib/imageCompress";

const CATEGORIES = ["Umumiy", "Tadbirlar", "Sport", "Fanlar", "Sayohat", "Bitiruvchilar"];
const CACHE_CONTROL = "public, max-age=31536000, immutable";

export default function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getGallery().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

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

  async function handleDelete(id: string, url: string) {
    if (!confirm("Rasmni o'chirishni tasdiqlaysizmi?")) return;
    await deleteGalleryItem(id, url).catch(() => {});
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Galereya</h2>
        <p className="mt-1 text-gray-500">Texnikum hayotiga oid rasmlar. Bir vaqtda bir nechta rasm yuklash mumkin.</p>
      </div>

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
      </div>

      {/* Galereya grid */}
      <div>
        <p className="mb-3 text-sm text-gray-500">
          {loading ? "Yuklanmoqda…" : `Jami: ${items.length} ta rasm`}
        </p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.caption ?? ""} className="h-40 w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 transition-all group-hover:bg-black/40">
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(item.id, item.url)}
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
      </div>
    </div>
  );
}
