"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { getNews, addNews, deleteNews, type NewsDoc } from "@/lib/firestore";
import { initialNews, formatDateUz } from "@/lib/data";

const CATEGORIES = ["E'lon", "Yangilik", "Yutuq", "Tadbir"];

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
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview]   = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) {
      alert("Faqat rasm fayllari qabul qilinadi (JPEG, PNG, WebP, GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { alert("Fayl hajmi 5 MB dan oshmasin"); return; }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const storageRef = ref(storage, `news/${Date.now()}.${ext}`);
      await uploadBytes(storageRef, file);
      setImageUrl(await getDownloadURL(storageRef));
    } catch {
      alert("Firebase Storage ga yuklashda xatolik.");
      setPreview("");
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    setPreview(""); setImageUrl("");
    if (fileRef.current) fileRef.current.value = "";
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
        image: imageUrl || undefined,
      });
      setTitle(""); setExcerpt(""); setContent("");
      setCategory(CATEGORIES[0]); setImageUrl(""); setPreview("");
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

  async function handleDelete(id: string, image?: string) {
    if (!confirm("Yangiliklarni o'chirishni tasdiqlaysizmi?")) return;
    // initialNews dan kelgan yozuvlar (raqamli ID) o'chirilmaydi
    const isStatic = initialNews.some((n) => String(n.id) === id);
    if (isStatic) { alert("Namuna yangiliklar o'chirilmaydi. Firestore'ga o'z yangiliklaringizni qo'shing."); return; }
    await deleteNews(id, image).catch(() => {});
    setNews((prev) => prev.filter((n) => n.id !== id));
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
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={5} placeholder={"Yangilik to'liq matni...\n\nIkki satr oralig'i — yangi paragraf."} className="input resize-none" />
          </Field>

          {/* Rasm */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-gray-700">Muqova rasmi (ixtiyoriy)</span>
            {preview ? (
              <div className="relative overflow-hidden rounded-lg border border-gray-200">
                <Image src={preview} alt="preview" width={400} height={200} className="h-36 w-full object-cover" />
                <button type="button" onClick={clearImage}
                  className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-0.5 text-xs text-gray-600 hover:bg-white">
                  ✕ O'chirish
                </button>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-primary">
                    Yuklanmoqda…
                  </div>
                )}
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-6 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4-4m0 0l4 4m-4-4v8M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M16 12l-4-4m0 0l-4 4" />
                </svg>
                Rasm tanlash (max 5 MB)
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
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
          {news.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex gap-3 min-w-0">
                {item.image && (
                  <Image src={item.image} alt={item.title} width={64} height={64}
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
              <button onClick={() => handleDelete(item.id, item.image)}
                className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors">
                O'chirish
              </button>
            </div>
          ))}
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
