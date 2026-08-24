"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { getTeachers, addTeacher, deleteTeacher, type TeacherDoc } from "@/lib/firestore";
import { schoolConfig } from "@/school.config";

const SUBJECTS = ["Kompyuter tarmoqlari", "Buxgalteriya hisobi", "Tikuvchilik texnologiyasi",
  "Avtomexanika", "Elektr ta'minoti", "Oshpazlik", "Sartaroshlik", "Qurilish ishlari",
  "Matematika", "Ingliz tili", "Ona tili va adabiyot", "Informatika", "Jismoniy tarbiya", "Boshqa"];

const blank = () => ({ name: "", subject: SUBJECTS[0], experience: 1, achievement: "", image: "" });

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<TeacherDoc[]>([]);
  const [form, setForm] = useState(blank());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getTeachers()
      .then(setTeachers)
      .catch(() => {
        // Firebase konfiguratsiya qilinmagan bo'lsa config dan ko'rsatamiz
        setTeachers(schoolConfig.teachers.map((t, i) => ({ ...t, id: String(i) })));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      const id = await addTeacher({
        name: form.name.trim(),
        subject: form.subject,
        experience: form.experience,
        ...(form.achievement ? { achievement: form.achievement.trim() } : {}),
        ...(form.image ? { image: form.image } : {}),
      });
      setTeachers((prev) => [{ id, ...form, name: form.name.trim() }, ...prev]);
      setForm(blank());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Saqlashda xatolik. Firebase config ni tekshiring.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, image?: string) {
    if (!confirm("O'qituvchini o'chirishni tasdiqlaysizmi?")) return;
    await deleteTeacher(id, image).catch(() => {});
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">O'qituvchilar</h2>
        <p className="mt-1 text-gray-500">Eng yaxshi o'qituvchilarni qo'shing va boshqaring.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Forma */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">

          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            folder="teachers"
          />

          <Field label="Ism Familiya">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Karimova Nilufar Hasanovna"
              className="input"
            />
          </Field>

          <Field label="Fan">
            <select
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="input"
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Tajriba (yil)">
            <input
              type="number"
              min={1}
              max={50}
              value={form.experience}
              onChange={(e) => setForm((f) => ({ ...f, experience: Number(e.target.value) }))}
              className="input"
            />
          </Field>

          <Field label="Yutuq / Unvon (ixtiyoriy)">
            <input
              value={form.achievement}
              onChange={(e) => setForm((f) => ({ ...f, achievement: e.target.value }))}
              placeholder="Respublika a'lochisi..."
              className="input"
            />
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saqlanmoqda…" : "Qo'shish"}
          </button>

          {saved && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">✓ O'qituvchi qo'shildi.</p>
          )}
        </form>

        {/* Ro'yxat */}
        <div className="space-y-3 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">
            {loading ? "Yuklanmoqda…" : `Jami: ${teachers.length} nafar`}
          </h3>

          {teachers.map((t) => (
            <div key={t.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
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
              </div>
              <button
                onClick={() => handleDelete(t.id, t.image)}
                className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
              >
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
