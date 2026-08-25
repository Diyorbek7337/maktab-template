"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getNews, addNews, updateNews, deleteNews, type NewsDoc } from "@/lib/firestore";
import { initialNews, formatDateUz, newsImages } from "@/lib/data";
import { compressImage } from "@/lib/imageCompress";
import { parseYouTubeId, youTubeThumbnail } from "@/lib/youtube";

const CATEGORIES = ["E'lon", "Yangilik", "Yutuq", "Tadbir"];
const CACHE_CONTROL = "public, max-age=31536000, immutable";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
}

export default function NewsAdminPage() {
  const [news, setNews]         = useState<NewsDoc[]>([]);
  const [loading, setLoading]   = useState(true);
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt]   = useState("");
  const [content, setContent]   = useState("");
  const [images, setImages]     = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prevImages, setPrevImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    setLoading(true);
    try {
      const firestoreNews = await getNews();
      if (firestoreNews.length > 0) {
        setNews(firestoreNews);
      } else {
        // Firestore bo'sh bo'lsa, initialNews ni ko'rsatamiz (o'zgartirish mumkin emas)
        setNews(
          initialNews.map((n) => ({
            id: String(n.id),
            slug: n.slug,
            title: n.title,
            category: n.category,
            excerpt: n.excerpt,
            content: n.content,
            image: n.image,
            date: n.date,
          }))
        );
      }
    } catch {
      setNews(
        initialNews.map((n) => ({
          id: String(n.id),
          slug: n.slug,
          title: n.title,
          category: n.category,
          excerpt: n.excerpt,
          content: n.content,
          image: n.image,
          date: n.date,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);

    for (const file of files) {
      if (!file.type.startsWith("image/")) { alert(`${file.name} — rasm fayli emas`); continue; }
      if (file.size > 15 * 1024 * 1024) { alert(`${file.name} — 15 MB dan katta`); continue; }

      try {
        // Yuklashdan oldin siqamiz — sifat deyarli saqlanadi, hajm ancha kichrayadi.
        const compressed = await compressImage(file);
        const storageRef = ref(storage, `news/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
        await uploadBytes(storageRef, compressed, { cacheControl: CACHE_CONTROL });
        const url = await getDownloadURL(storageRef);
        setImages((prev) => [...prev, url]);
      } catch {
        alert(`${file.name} — yuklashda xatolik`);
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function makeCover(url: string) {
    setImages((prev) => [url, ...prev.filter((u) => u !== url)]);
  }

  // Tanlangan rasmga mos [rasm:N] belgisini kursor turgan joyga qo'shadi.
  function insertImageToken(index: number) {
    const token = `[rasm:${index + 1}]`;
    const el = contentRef.current;
    if (!el) { setContent((c) => (c ? `${c}\n\n${token}` : token)); return; }

    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const insertion = `\n\n${token}\n\n`;
    const next = content.slice(0, start) + insertion + content.slice(end);
    setContent(next);

    const pos = start + insertion.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  function startEdit(item: NewsDoc) {
    const isStatic = initialNews.some((n) => String(n.id) === item.id);
    if (isStatic) {
      alert("Namuna yangiliklarni tahrirlab bo'lmaydi. O'z yangiligingizni qo'shing — namunalar avtomatik almashadi.");
      return;
    }
    const imgs = newsImages(item);
    setEditingId(item.id);
    setPrevImages(imgs);
    setTitle(item.title);
    setCategory(CATEGORIES.includes(item.category) ? item.category : CATEGORIES[0]);
    setExcerpt(item.excerpt);
    setContent(item.content ?? "");
    setImages(imgs);
    setVideoUrl(item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : "");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    setEditingId(null);
    setPrevImages([]);
    setTitle(""); setExcerpt(""); setContent("");
    setCategory(CATEGORIES[0]); setImages([]); setVideoUrl("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: content.trim() || undefined,
        date: new Date().toISOString().slice(0, 10),
        images: images.length ? images : undefined,
        image: images[0] || undefined,
        videoId: parseYouTubeId(videoUrl) ?? undefined,
      };

      if (editingId) {
        // Sana va slug o'zgarmaydi — havolalar buzilmasligi uchun
        const existing = news.find((n) => n.id === editingId);
        await updateNews(
          editingId,
          { ...payload, date: existing?.date ?? payload.date },
          prevImages
        );
      } else {
        await addNews({ ...payload, slug: `${slugify(title.trim())}-${Date.now()}` });
      }

      resetForm();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch {
      setError("Saqlab bo'lmadi. Sessiya tugagan bo'lishi mumkin — sahifani yangilang.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: NewsDoc) {
    if (!confirm("Yangiliklarni o'chirishni tasdiqlaysizmi?")) return;
    // initialNews dan kelgan yozuvlar (raqamli ID) o'chirilmaydi
    const isStatic = initialNews.some((n) => String(n.id) === item.id);
    if (isStatic) { alert("Namuna yangiliklar o'chirilmaydi. Firestore'ga o'z yangiliklaringizni qo'shing."); return; }
    await deleteNews(item.id, newsImages(item)).catch(() => {});
    setNews((prev) => prev.filter((n) => n.id !== item.id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Yangiliklar</h2>
        <p className="mt-1 text-gray-500">Saytning yangiliklar bo'limini boshqaring.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Forma */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900">
            {editingId ? "Yangilikni tahrirlash" : "Yangi yangilik"}
          </h3>

          <Field label="Sarlavha *">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Yangilik sarlavhasi" required className="input" />
          </Field>

          <Field label="Bo'lim">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Qisqa matn *">
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              rows={3} placeholder="Yangilik qisqacha mazmuni..." required className="input resize-none" />
          </Field>

          <Field label="To'liq matn (ixtiyoriy)">
            <textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)}
              rows={5} placeholder={"Yangilik to'liq matni...\n\nIkki satr oralig'i — yangi paragraf."} className="input resize-none" />
            {images.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Rasmni matn ichiga joylashtirish uchun pastdagi rasm ostidagi "Matnga qo'shish" tugmasini bosing.
              </p>
            )}
          </Field>

          {/* Rasmlar */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-700">
              Rasmlar (ixtiyoriy, bir nechtasini tanlash mumkin — birinchisi muqova bo'ladi)
            </span>

            {images.length > 0 && (
              <div className="mb-2 space-y-2">
                {images.map((url, i) => (
                  <div key={url} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2">
                    <div className="relative shrink-0 overflow-hidden rounded-lg">
                      <Image src={url} alt={`Rasm ${i + 1}`} width={56} height={56} className="h-14 w-14 object-cover" />
                      <span className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] font-medium text-white">
                        {i + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      {i === 0 ? (
                        <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                          Muqova
                        </span>
                      ) : (
                        <button type="button" onClick={() => makeCover(url)}
                          className="block text-[11px] font-medium text-primary hover:underline">
                          Muqova qil
                        </button>
                      )}
                      <button type="button" onClick={() => insertImageToken(i)}
                        className="block text-[11px] text-gray-500 hover:text-primary hover:underline">
                        Matnga qo'shish
                      </button>
                    </div>
                    <button type="button" onClick={() => removeImage(url)}
                      className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6 text-sm transition-colors ${
              uploading ? "border-gray-200 text-gray-400" : "border-gray-300 text-gray-500 hover:border-primary hover:text-primary"
            }`}>
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4-4m0 0l4 4m-4-4v8M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M16 12l-4-4m0 0l-4 4" />
              </svg>
              {uploading ? "Yuklanmoqda…" : "Rasmlar tanlash"}
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={handleFilesChange} disabled={uploading} />
            </label>
          </div>

          {/* YouTube video (ixtiyoriy) */}
          <div>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />
              </svg>
              YouTube videosi (ixtiyoriy)
            </span>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`input ${videoUrl.trim() && !parseYouTubeId(videoUrl) ? "border-red-300" : ""}`}
            />
            {videoUrl.trim() && !parseYouTubeId(videoUrl) && (
              <p className="mt-1 text-xs text-red-500">
                Havola tanilmadi — video saqlanmaydi. YouTube manzilini tekshiring.
              </p>
            )}
            {parseYouTubeId(videoUrl) && (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={youTubeThumbnail(parseYouTubeId(videoUrl)!)}
                  alt="Video muqovasi"
                  className="h-12 w-20 shrink-0 rounded object-cover"
                />
                <p className="text-xs text-green-600">
                  ✓ Video tanildi — maqola ichida ko&apos;rinadi
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving || uploading}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
              {saving ? "Saqlanmoqda…" : editingId ? "O'zgarishlarni saqlash" : "Saqlash va e'lon qilish"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:border-gray-300 transition-colors">
                Bekor
              </button>
            )}
          </div>
          {saved && <p className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">✓ Saqlandi.</p>}
        </form>

        {/* Ro'yxat */}
        <div className="space-y-3 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">
            {loading ? "Yuklanmoqda…" : `Jami: ${news.length} ta yangilik`}
          </h3>
          {news.map((item) => {
            const cover = newsImages(item)[0];
            return (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex gap-3 min-w-0">
                {cover && (
                  <Image src={cover} alt={item.title} width={64} height={64}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {item.category}
                  </span>
                  <h4 className="mt-1 font-semibold text-gray-900 truncate">{item.title}</h4>
                  <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{item.excerpt}</p>
                  <time className="mt-1 block text-xs text-gray-400">{formatDateUz(item.date)}</time>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => startEdit(item)} title="Tahrirlash"
                  className="rounded-lg p-2 text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(item)} title="O'chirish"
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
