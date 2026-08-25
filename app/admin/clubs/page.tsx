"use client";

import { useEffect, useRef, useState } from "react";
import SeedBanner from "@/components/admin/SeedBanner";
import {
  getClubs, addClub, updateClub, deleteClub, seedCollection, type ClubDoc,
} from "@/lib/firestore";
import { schoolConfig, type ClubCategory } from "@/school.config";

const CATEGORIES: ClubCategory[] = ["Sport", "San'at", "Fan", "Texnologiya", "Til", "Boshqa"];

const blank = () => ({
  name: "",
  description: "",
  category: "Fan" as ClubCategory,
  teacher: "",
  schedule: "",
  capacity: "" as string | number,
});

export default function ClubsAdminPage() {
  const [clubs, setClubs] = useState<ClubDoc[]>([]);
  const [usingConfig, setUsingConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getClubs();
      setClubs(data);
      setUsingConfig(data.length === 0);
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi. Sahifani yangilang yoki qaytadan kiring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSeed() {
    await seedCollection("clubs", schoolConfig.clubs);
    await load();
  }

  function startEdit(c: ClubDoc) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description,
      category: c.category,
      teacher: c.teacher ?? "",
      schedule: c.schedule ?? "",
      capacity: c.capacity ?? "",
    });
    setShowForm(true);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(blank());
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;

    if (!editingId && usingConfig) {
      const ok = confirm(
        `Diqqat: ${schoolConfig.clubs.length} ta namuna to'garak hali bazaga ko'chirilmagan.\n\n` +
        `Hozir yangi to'garak qo'shsangiz, namunalar saytdan yo'qoladi.\n\nBaribir davom etasizmi?`
      );
      if (!ok) return;
    }

    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      teacher: form.teacher.trim() || undefined,
      schedule: form.schedule.trim() || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
    };

    try {
      if (editingId) await updateClub(editingId, payload);
      else await addClub(payload);
      cancelEdit();
      await load();
    } catch {
      setError("Saqlab bo'lmadi. Sessiya tugagan bo'lishi mumkin — sahifani yangilang.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: ClubDoc) {
    if (!confirm(`"${c.name}" to'garagini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteClub(c.id, c.image);
      if (editingId === c.id) cancelEdit();
      await load();
    } catch {
      setError("O'chirib bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
    }
  }

  const shown = usingConfig ? schoolConfig.clubs : clubs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">To'garaklar va seksiyalar</h2>
          <p className="mt-1 text-gray-500">Texnikumdagi qo'shimcha ta'lim to'garaklarini boshqarish.</p>
        </div>
        <button
          onClick={() => (showForm ? cancelEdit() : setShowForm(true))}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {showForm ? "Bekor qilish" : "+ Yangi to'garak"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && usingConfig && (
        <SeedBanner count={schoolConfig.clubs.length} itemLabel="to'garak" onSeed={handleSeed} />
      )}

      <div ref={formRef}>
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
              {editingId ? "To'garakni tahrirlash" : "Yangi to'garak qo'shish"}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomi *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Robototexnika" required className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                <select value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ClubCategory }))}
                  className="input">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif *</label>
              <textarea value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="To'garak haqida qisqacha ma'lumot..." required className="input resize-none" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mas'ul o'qituvchi</label>
                <input value={form.teacher} onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                  placeholder="Karimov Jasur" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mashg'ulot vaqti</label>
                <input value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))}
                  placeholder="Seshanba, Payshanba 15:00" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O'rin soni</label>
                <input type="number" min={1} value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  placeholder="20" className="input" />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-60">
                {saving ? "Saqlanmoqda…" : editingId ? "O'zgarishlarni saqlash" : "Saqlash"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors">
                  Bekor qilish
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Yuklanmoqda…</p>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-gray-400">
          <p>Hali to'garak qo'shilmagan</p>
          <p className="text-sm mt-1">Yuqoridagi tugma orqali qo'shing</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((club, i) => {
            const isReal = !usingConfig;
            const doc = club as ClubDoc;
            return (
              <div key={isReal ? doc.id : `config-${i}`}
                className={`rounded-xl border bg-white p-5 ${isReal ? "border-gray-200" : "border-dashed border-gray-300"}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{club.name}</h3>
                    <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                      {club.category}
                    </span>
                  </div>
                  {isReal && (
                    <div className="flex shrink-0 gap-1">
                      <button onClick={() => startEdit(doc)} title="Tahrirlash"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(doc)} title="O'chirish"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{club.description}</p>
                <div className="space-y-1 text-xs text-gray-500">
                  {club.teacher && <p>👤 {club.teacher}</p>}
                  {club.schedule && <p>🕐 {club.schedule}</p>}
                  {club.capacity && <p>👥 {club.capacity} nafar</p>}
                </div>
                {!isReal && <p className="mt-3 text-xs text-amber-600">Namuna — bazaga ko'chirilmagan</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
