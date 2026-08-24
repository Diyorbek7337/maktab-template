"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getNews, addNews, deleteNews, type NewsDoc } from "@/lib/firestore";
import { initialNews, formatDateUz, newsImages } from "@/lib/data";
import { compressImage } from "@/lib/imageCompress";

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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;
    setSaving(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      const slug = `${slugify(title.trim())}-${Date.now()}`;
      await addNews({
        slug,
        title: title.trim(),
        category,
        excerpt: excerpt.trim(),
        content: content.trim() || undefined,
        date,
        images: images.length ? images : undefined,
        image: images[0] || undefined,
      });
      setTitle(""); setExcerpt(""); setContent("");
      setCategory(CATEGORIES[0]); setImages([]);
      if (fileRef.current) fileRef.current.value = "";
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch {
      alert("Saqlashda xatolik. Firebase config ni tekshiring.");
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

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Forma */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
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

          <button type="submit" disabled={saving || uploading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
            {saving ? "Saqlanmoqda…" : "Saqlash va e'lon qilish"}
          </button>
          {saved && <p className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">✓ Yangilik saytda chop etildi.</p>}
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
              <button onClick={() => handleDelete(item)}
                className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors">
                O'chirish
              </button>
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
