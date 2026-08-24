"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { getMajors, addMajor, deleteMajor, type MajorDoc } from "@/lib/firestore";
import { schoolConfig } from "@/school.config";

const blank = () => ({
  name: "",
  duration: "",
  qualification: "",
  description: "",
  image: "",
});

export default function MajorsAdminPage() {
  const [majors, setMajors] = useState<MajorDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getMajors();
      setMajors(data.length ? data : schoolConfig.majors.map((m, i) => ({ ...m, id: `config-${i}` })));
    } catch {
      setMajors(schoolConfig.majors.map((m, i) => ({ ...m, id: `config-${i}` })));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.duration.trim() || !form.qualification.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      await addMajor({
        name: form.name.trim(),
        duration: form.duration.trim(),
        qualification: form.qualification.trim(),
        description: form.description.trim(),
        image: form.image.trim() || undefined,
      });
      setForm(blank());
      setShowForm(false);
      await load();
    } catch {
      alert("Saqlashda xatolik. Firebase config ni tekshiring.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, image?: string) {
    if (id.startsWith("config-")) {
      setMajors((prev) => prev.filter((m) => m.id !== id));
      return;
    }
    if (!confirm("Yo'nalishni o'chirishni tasdiqlaysizmi?")) return;
    await deleteMajor(id, image).catch(() => {});
    setMajors((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kasb-hunar yo'nalishlari</h2>
          <p className="mt-1 text-gray-500">Texnikumda o'qitiladigan mutaxassisliklarni boshqaring.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {showForm ? "Bekor qilish" : "+ Yangi yo'nalish"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Yangi yo'nalish qo'shish</h3>

          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            folder="majors"
            label="Yo'nalish rasmi (ixtiyoriy)"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yo'nalish nomi *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Kompyuter tarmoqlari va tizimlari"
              required
              className="input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">O'qish muddati *</label>
              <input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="2 yil 10 oy"
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beriladigan malaka *</label>
              <input
                value={form.qualification}
                onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
                placeholder="Tarmoq muhandisi yordamchisi"
                required
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Yo'nalish haqida qisqacha ma'lumot..."
              required
              className="input resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda…" : "Saqlash"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Yuklanmoqda…</p>
      ) : majors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-gray-400">
          <svg className="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M12 14l9-5-9-5-9 5 9 5z" />
          </svg>
          <p>Hali yo'nalish qo'shilmagan</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {majors.map((major) => (
            <div key={major.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{major.name}</h3>
                <button
                  onClick={() => handleDelete(major.id, major.image)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
              <div className="mb-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{major.duration}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">{major.qualification}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-3">{major.description}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && majors.every((m) => m.id.startsWith("config-")) && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Firestore bo'sh bo'lganda saytda <code>school.config.ts</code> dagi ma'lumotlar ko'rsatiladi.
        </p>
      )}
    </div>
  );
}
