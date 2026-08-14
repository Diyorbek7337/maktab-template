"use client";

import { useEffect, useState } from "react";
import { getClubs, addClub, deleteClub, type ClubDoc } from "@/lib/firestore";
import { schoolConfig, type ClubCategory } from "@/school.config";

const CATEGORIES: ClubCategory[] = ["Sport", "San'at", "Fan", "Texnologiya", "Til", "Boshqa"];

const blank = () => ({
  name: "",
  description: "",
  category: "Fan" as ClubCategory,
  teacher: "",
  schedule: "",
  capacity: "" as string | number,
  image: "",
});

export default function ClubsAdminPage() {
  const [clubs, setClubs] = useState<ClubDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    getClubs()
      .then(setClubs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      await addClub({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        teacher: form.teacher.trim() || undefined,
        schedule: form.schedule.trim() || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
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
    await deleteClub(id).catch(() => {});
    setClubs((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">To'garaklar va seksiyalar</h2>
          <p className="mt-1 text-gray-500">Maktabdagi qo'shimcha ta'lim to'garaklarini boshqarish.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {showForm ? "Bekor qilish" : "+ Yangi to'garak"}
        </button>
      </div>

      {/* Qo'shish formasi */}
      {showForm && (
        <form onSubmit={handleAdd} className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Yangi to'garak qo'shish</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Robototexnika"
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ClubCategory }))}
                className="input"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="To'garak haqida qisqacha ma'lumot..."
              required
              className="input resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mas'ul o'qituvchi</label>
              <input
                value={form.teacher}
                onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                placeholder="Karimov Jasur"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mashg'ulot vaqti</label>
              <input
                value={form.schedule}
                onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                placeholder="Seshanba, Payshanba 15:00"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">O'rin soni</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="20"
                className="input"
              />
            </div>
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

      {/* Ro'yxat */}
      {loading ? (
        <p className="text-gray-400">Yuklanmoqda…</p>
      ) : clubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-gray-400">
          <svg className="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p>Hali to'garak qo'shilmagan</p>
          <p className="text-sm mt-1">Yuqoridagi tugma orqali qo'shing</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <div key={club.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{club.name}</h3>
                  <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                    {club.category}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(club.id)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{club.description}</p>
              <div className="space-y-1 text-xs text-gray-500">
                {club.teacher && <p>👤 {club.teacher}</p>}
                {club.schedule && <p>🕐 {club.schedule}</p>}
                {club.capacity && <p>👥 {club.capacity} nafar</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Config fallback eslatmasi */}
      {!loading && clubs.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Firestore bo'sh bo'lganda saytda <code>school.config.ts</code> dagi ma'lumotlar ko'rsatiladi.
        </p>
      )}
    </div>
  );
}
