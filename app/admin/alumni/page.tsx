"use client";

import { useEffect, useRef, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SeedBanner from "@/components/admin/SeedBanner";
import {
  getAlumni, addAlumni, updateAlumni, deleteAlumni, seedCollection, type AlumniDoc,
} from "@/lib/firestore";
import { schoolConfig } from "@/school.config";

const blank = () => ({
  name: "",
  graduationYear: new Date().getFullYear(),
  achievement: "",
  workplace: "",
  image: "",
});

export default function AlumniAdminPage() {
  const [alumni, setAlumni] = useState<AlumniDoc[]>([]);
  const [usingConfig, setUsingConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prevImage, setPrevImage] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getAlumni();
      setAlumni(data);
      setUsingConfig(data.length === 0);
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi. Sahifani yangilang yoki qaytadan kiring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSeed() {
    await seedCollection("alumni", schoolConfig.alumni);
    await load();
  }

  function startEdit(a: AlumniDoc) {
    setEditingId(a.id);
    setPrevImage(a.image);
    setForm({
      name: a.name,
      graduationYear: a.graduationYear,
      achievement: a.achievement,
      workplace: a.workplace ?? "",
      image: a.image ?? "",
    });
    setShowForm(true);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setPrevImage(undefined);
    setForm(blank());
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.achievement.trim()) return;

    if (!editingId && usingConfig) {
      const ok = confirm(
        `Diqqat: ${schoolConfig.alumni.length} ta namuna bitiruvchi hali bazaga ko'chirilmagan.\n\n` +
        `Hozir yangi bitiruvchi qo'shsangiz, namunalar saytdan yo'qoladi.\n\nBaribir davom etasizmi?`
      );
      if (!ok) return;
    }

    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      graduationYear: Number(form.graduationYear),
      achievement: form.achievement.trim(),
      workplace: form.workplace.trim() || undefined,
      image: form.image.trim() || undefined,
    };

    try {
      if (editingId) await updateAlumni(editingId, payload, prevImage);
      else await addAlumni(payload);
      cancelEdit();
      await load();
    } catch {
      setError("Saqlab bo'lmadi. Sessiya tugagan bo'lishi mumkin — sahifani yangilang.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: AlumniDoc) {
    if (!confirm(`"${a.name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteAlumni(a.id, a.image);
      if (editingId === a.id) cancelEdit();
      await load();
    } catch {
      setError("O'chirib bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
    }
  }

  function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  }

  const shown = usingConfig ? schoolConfig.alumni : alumni;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bitiruvchilar</h2>
          <p className="mt-1 text-gray-500">Texnikum faxrli bitiruvchilarini boshqarish.</p>
        </div>
        <button
          onClick={() => (showForm ? cancelEdit() : setShowForm(true))}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {showForm ? "Bekor qilish" : "+ Yangi bitiruvchi"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && usingConfig && (
        <SeedBanner count={schoolConfig.alumni.length} itemLabel="bitiruvchi" onSeed={handleSeed} />
      )}

      <div ref={formRef}>
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
              {editingId ? "Bitiruvchini tahrirlash" : "Yangi bitiruvchi qo'shish"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To'liq ism *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Karimov Sherzod" required className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitirgan yili *</label>
                <input type="number" min={1990} max={2030} value={form.graduationYear}
                  onChange={(e) => setForm((f) => ({ ...f, graduationYear: Number(e.target.value) }))}
                  required className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yutuq / Kasbi *</label>
              <input value={form.achievement} onChange={(e) => setForm((f) => ({ ...f, achievement: e.target.value }))}
                placeholder="Tarmoq muhandisi bo'lib ishga joylashdi" required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ish joyi</label>
              <input value={form.workplace} onChange={(e) => setForm((f) => ({ ...f, workplace: e.target.value }))}
                placeholder="Kompaniya nomi" className="input" />
            </div>
            <ImageUpload
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              folder="alumni"
              label="Bitiruvchi rasmi (ixtiyoriy)"
            />
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
          <p>Hali bitiruvchi qo'shilmagan</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((person, i) => {
            const isReal = !usingConfig;
            const doc = person as AlumniDoc;
            return (
              <div key={isReal ? doc.id : `config-${i}`}
                className={`rounded-xl border bg-white p-5 flex gap-4 ${isReal ? "border-gray-200" : "border-dashed border-gray-300"}`}>
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
                    {isReal && (
                      <div className="flex shrink-0 gap-0.5">
                        <button onClick={() => startEdit(doc)} title="Tahrirlash"
                          className="rounded-lg p-1 text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(doc)} title="O'chirish"
                          className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">{person.achievement}</p>
                  {person.workplace && <p className="mt-1 text-xs text-gray-400">{person.workplace}</p>}
                  {!isReal && <p className="mt-1 text-xs text-amber-600">Namuna</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
