"use client";

import { useEffect, useState } from "react";
import { getAlumni, addAlumni, deleteAlumni, type AlumniDoc } from "@/lib/firestore";
import ImageUpload from "@/components/admin/ImageUpload";

const blank = () => ({
  name: "",
  graduationYear: new Date().getFullYear(),
  achievement: "",
  workplace: "",
  image: "",
});

export default function AlumniAdminPage() {
  const [alumni, setAlumni] = useState<AlumniDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    getAlumni().then(setAlumni).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.achievement.trim()) return;
    setSaving(true);
    try {
      await addAlumni({
        name: form.name.trim(),
        graduationYear: Number(form.graduationYear),
        achievement: form.achievement.trim(),
        workplace: form.workplace.trim() || undefined,
        image: form.image.trim() || undefined,
      });
      setForm(blank());
      setShowForm(false);
      await load();
    } catch {
      alert("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await deleteAlumni(id).catch(() => {});
    setAlumni((prev) => prev.filter((a) => a.id !== id));
  }

  function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bitiruvchilar</h2>
          <p className="mt-1 text-gray-500">Maktab faxrli bitiruvchilarini boshqarish.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {showForm ? "Bekor qilish" : "+ Yangi bitiruvchi"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Yangi bitiruvchi qo'shish</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To'liq ism *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Karimov Sherzod"
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitirgan yili *</label>
              <input
                type="number"
                min={1990}
                max={2030}
                value={form.graduationYear}
                onChange={(e) => setForm((f) => ({ ...f, graduationYear: Number(e.target.value) }))}
                required
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yutuq / Kasbi *</label>
            <input
              value={form.achievement}
              onChange={(e) => setForm((f) => ({ ...f, achievement: e.target.value }))}
              placeholder="Toshkent davlat texnika universiteti, muhandis"
              required
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ish joyi</label>
            <input
              value={form.workplace}
              onChange={(e) => setForm((f) => ({ ...f, workplace: e.target.value }))}
              placeholder="Kompaniya nomi"
              className="input"
            />
          </div>
          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            folder="alumni"
            label="Bitiruvchi rasmi (ixtiyoriy)"
          />
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
      ) : alumni.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-gray-400">
          <svg className="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Hali bitiruvchi qo'shilmagan</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alumni.map((person) => (
            <div key={person.id} className="rounded-xl border border-gray-200 bg-white p-5 flex gap-4">
              <div className="shrink-0">
                {person.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={person.image} alt={person.name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(person.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{person.name}</p>
                    <p className="text-xs text-primary">{person.graduationYear}-yil bitiruvchisi</p>
                  </div>
                  <button
                    onClick={() => handleDelete(person.id)}
                    className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">{person.achievement}</p>
                {person.workplace && <p className="mt-1 text-xs text-gray-400">{person.workplace}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
