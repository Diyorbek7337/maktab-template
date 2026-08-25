"use client";

import { useEffect, useRef, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SeedBanner from "@/components/admin/SeedBanner";
import {
  getMajors, addMajor, updateMajor, deleteMajor, seedCollection, type MajorDoc,
} from "@/lib/firestore";
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
  /** Firestore bo'sh — saytda config'dagi namunalar ko'rinmoqda */
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
      const data = await getMajors();
      setMajors(data);
      setUsingConfig(data.length === 0);
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi. Internet aloqasini tekshiring yoki qaytadan kiring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSeed() {
    await seedCollection("majors", schoolConfig.majors);
    await load();
  }

  function startEdit(major: MajorDoc) {
    setEditingId(major.id);
    setPrevImage(major.image);
    setForm({
      name: major.name,
      duration: major.duration,
      qualification: major.qualification,
      description: major.description,
      image: major.image ?? "",
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
    if (!form.name.trim() || !form.duration.trim() || !form.qualification.trim() || !form.description.trim()) return;

    // Namunalar hali bazaga ko'chirilmagan bo'lsa, yangi yozuv qo'shish
    // ularni saytdan yo'q qiladi — admin buni bilib turishi kerak.
    if (!editingId && usingConfig) {
      const ok = confirm(
        `Diqqat: ${schoolConfig.majors.length} ta namuna yo'nalish hali bazaga ko'chirilmagan.\n\n` +
        `Hozir yangi yo'nalish qo'shsangiz, namunalar saytdan butunlay yo'qoladi.\n\n` +
        `Avval "Bazaga ko'chirish" tugmasini bosishni tavsiya qilamiz.\n\nBaribir davom etasizmi?`
      );
      if (!ok) return;
    }

    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      duration: form.duration.trim(),
      qualification: form.qualification.trim(),
      description: form.description.trim(),
      image: form.image.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateMajor(editingId, payload, prevImage);
      } else {
        await addMajor(payload);
      }
      cancelEdit();
      await load();
    } catch {
      setError(
        editingId
          ? "Saqlab bo'lmadi. Sessiya tugagan bo'lishi mumkin — sahifani yangilang."
          : "Qo'shib bo'lmadi. Sessiya tugagan bo'lishi mumkin — sahifani yangilang."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(major: MajorDoc) {
    if (!confirm(`"${major.name}" yo'nalishini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteMajor(major.id, major.image);
      if (editingId === major.id) cancelEdit();
      await load();
    } catch {
      setError("O'chirib bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
    }
  }

  // Saytda nima ko'rinayotgani: baza bo'sh bo'lsa config'dagi namunalar
  const shown: Array<MajorDoc | (typeof schoolConfig.majors)[number]> =
    usingConfig ? schoolConfig.majors : majors;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kasb-hunar yo'nalishlari</h2>
          <p className="mt-1 text-gray-500">Texnikumda o'qitiladigan mutaxassisliklarni boshqaring.</p>
        </div>
        <button
          onClick={() => (showForm ? cancelEdit() : setShowForm(true))}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          {showForm ? "Bekor qilish" : "+ Yangi yo'nalish"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && usingConfig && (
        <SeedBanner
          count={schoolConfig.majors.length}
          itemLabel="yo'nalish"
          onSeed={handleSeed}
        />
      )}

      <div ref={formRef}>
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
              {editingId ? "Yo'nalishni tahrirlash" : "Yangi yo'nalish qo'shish"}
            </h3>

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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                {saving ? "Saqlanmoqda…" : editingId ? "O'zgarishlarni saqlash" : "Saqlash"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors"
                >
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
          <svg className="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
          </svg>
          <p>Hali yo'nalish qo'shilmagan</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((major, i) => {
            const isReal = !usingConfig;
            const doc = major as MajorDoc;
            return (
              <div
                key={isReal ? doc.id : `config-${i}`}
                className={`rounded-xl border bg-white p-5 ${isReal ? "border-gray-200" : "border-dashed border-gray-300"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{major.name}</h3>
                  {isReal && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => startEdit(doc)}
                        title="Tahrirlash"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        title="O'chirish"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{major.duration}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">{major.qualification}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-3">{major.description}</p>
                {!isReal && (
                  <p className="mt-3 text-xs text-amber-600">Namuna — bazaga ko'chirilmagan</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
