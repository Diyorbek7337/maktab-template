"use client";

import { useEffect, useRef, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SeedBanner from "@/components/admin/SeedBanner";
import {
  getTeachers, addTeacher, updateTeacher, deleteTeacher, seedCollection, type TeacherDoc,
} from "@/lib/firestore";
import { schoolConfig } from "@/school.config";

const SUBJECTS = ["Kompyuter tarmoqlari", "Buxgalteriya hisobi", "Tikuvchilik texnologiyasi",
  "Avtomexanika", "Elektr ta'minoti", "Oshpazlik", "Sartaroshlik", "Qurilish ishlari",
  "Matematika", "Ingliz tili", "Ona tili va adabiyot", "Informatika", "Jismoniy tarbiya", "Boshqa"];

const blank = () => ({ name: "", subject: SUBJECTS[0], experience: 1, achievement: "", image: "" });

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<TeacherDoc[]>([]);
  const [usingConfig, setUsingConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prevImage, setPrevImage] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getTeachers();
      setTeachers(data);
      setUsingConfig(data.length === 0);
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi. Sahifani yangilang yoki qaytadan kiring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSeed() {
    await seedCollection("teachers", schoolConfig.teachers);
    await load();
  }

  function startEdit(t: TeacherDoc) {
    setEditingId(t.id);
    setPrevImage(t.image);
    setForm({
      name: t.name,
      subject: SUBJECTS.includes(t.subject) ? t.subject : "Boshqa",
      experience: t.experience,
      achievement: t.achievement ?? "",
      image: t.image ?? "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setPrevImage(undefined);
    setForm(blank());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (!editingId && usingConfig) {
      const ok = confirm(
        `Diqqat: ${schoolConfig.teachers.length} ta namuna o'qituvchi hali bazaga ko'chirilmagan.\n\n` +
        `Hozir yangi o'qituvchi qo'shsangiz, namunalar saytdan yo'qoladi.\n\nBaribir davom etasizmi?`
      );
      if (!ok) return;
    }

    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      subject: form.subject,
      experience: form.experience,
      achievement: form.achievement.trim() || undefined,
      image: form.image.trim() || undefined,
    };

    try {
      if (editingId) await updateTeacher(editingId, payload, prevImage);
      else await addTeacher(payload);
      cancelEdit();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch {
      setError("Saqlab bo'lmadi. Sessiya tugagan bo'lishi mumkin — sahifani yangilang.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: TeacherDoc) {
    if (!confirm(`"${t.name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteTeacher(t.id, t.image);
      if (editingId === t.id) cancelEdit();
      await load();
    } catch {
      setError("O'chirib bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
    }
  }

  const shown = usingConfig ? schoolConfig.teachers : teachers;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">O'qituvchilar</h2>
        <p className="mt-1 text-gray-500">Eng yaxshi o'qituvchilarni qo'shing va boshqaring.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && usingConfig && (
        <SeedBanner count={schoolConfig.teachers.length} itemLabel="o'qituvchi" onSeed={handleSeed} />
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900">
            {editingId ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}
          </h3>

          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            folder="teachers"
          />

          <Field label="Ism Familiya">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Karimova Nilufar Hasanovna" className="input" />
          </Field>

          <Field label="Fan / yo'nalish">
            <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="input">
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Tajriba (yil)">
            <input type="number" min={1} max={50} value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: Number(e.target.value) }))} className="input" />
          </Field>

          <Field label="Yutuq / Unvon (ixtiyoriy)">
            <input value={form.achievement} onChange={(e) => setForm((f) => ({ ...f, achievement: e.target.value }))}
              placeholder="Respublika a'lochisi..." className="input" />
          </Field>

          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
              {saving ? "Saqlanmoqda…" : editingId ? "Saqlash" : "Qo'shish"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:border-gray-300 transition-colors">
                Bekor
              </button>
            )}
          </div>

          {saved && <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">✓ Saqlandi.</p>}
        </form>

        <div className="space-y-3 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">
            {loading ? "Yuklanmoqda…" : `Jami: ${shown.length} nafar`}
          </h3>

          {shown.map((t, i) => {
            const isReal = !usingConfig;
            const doc = t as TeacherDoc;
            return (
              <div key={isReal ? doc.id : `config-${i}`}
                className={`flex items-center gap-4 rounded-xl border bg-white p-4 ${isReal ? "border-gray-200" : "border-dashed border-gray-300"}`}>
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image} alt={t.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">{t.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">{t.subject}</span>
                    <span>{t.experience} yil</span>
                  </div>
                  {t.achievement && <p className="mt-1 truncate text-xs text-gray-400">{t.achievement}</p>}
                  {!isReal && <p className="mt-1 text-xs text-amber-600">Namuna — bazaga ko'chirilmagan</p>}
                </div>
                {isReal && (
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => startEdit(doc)} title="Tahrirlash"
                      className="rounded-lg p-2 text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(doc)} title="O'chirish"
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                )}
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
