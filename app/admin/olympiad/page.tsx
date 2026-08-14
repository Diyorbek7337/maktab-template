"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { getWinners, addWinner, deleteWinner, type WinnerDoc } from "@/lib/firestore";
import { schoolConfig, type OlympiadLevel, type OlympiadPlace } from "@/school.config";

const LEVELS: OlympiadLevel[] = ["Maktab", "Tuman", "Viloyat", "Respublika", "Xalqaro"];
const PLACES: OlympiadPlace[] = [1, 2, 3];
const SUBJECTS = ["Matematika", "Fizika", "Kimyo", "Biologiya", "Ingliz tili",
  "Ona tili", "Tarix", "Geografiya", "Informatika", "Rus tili", "Boshqa"];

const medalLabel: Record<OlympiadPlace, string> = { 1: "🥇 I o'rin", 2: "🥈 II o'rin", 3: "🥉 III o'rin" };
const levelColor: Record<OlympiadLevel, string> = {
  Maktab: "text-gray-500", Tuman: "text-blue-600",
  Viloyat: "text-violet-600", Respublika: "text-green-700", Xalqaro: "text-amber-700",
};

const blank = () => ({
  student: "", subject: SUBJECTS[0], level: "Viloyat" as OlympiadLevel,
  place: 1 as OlympiadPlace, year: new Date().getFullYear(), teacher: "", image: "",
});

export default function OlympiadAdminPage() {
  const [winners, setWinners] = useState<WinnerDoc[]>([]);
  const [form, setForm] = useState(blank());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getWinners()
      .then(setWinners)
      .catch(() => {
        setWinners(schoolConfig.olympiadWinners.map((w, i) => ({ ...w, id: String(i) })));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.student.trim()) return;
    setSaving(true);

    try {
      const id = await addWinner({
        student: form.student.trim(),
        subject: form.subject,
        level: form.level,
        place: form.place,
        year: form.year,
        ...(form.teacher ? { teacher: form.teacher.trim() } : {}),
        ...(form.image ? { image: form.image } : {}),
      });
      setWinners((prev) => [{ id, ...form, student: form.student.trim() }, ...prev]);
      setForm(blank());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Saqlashda xatolik. Firebase config ni tekshiring.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("G'olibni ro'yxatdan o'chirishni tasdiqlaysizmi?")) return;
    await deleteWinner(id).catch(() => {});
    setWinners((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Olimpiada g'oliblari</h2>
        <p className="mt-1 text-gray-500">Fan olimpiadasi g'oliblarini qo'shing va boshqaring.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Forma */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">

          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            folder="olympiad"
            label="O'quvchi rasmi (ixtiyoriy)"
          />

          <Field label="O'quvchi ismi">
            <input
              value={form.student}
              onChange={(e) => setForm((f) => ({ ...f, student: e.target.value }))}
              placeholder="Rahimov Jasur"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fan">
              <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="input">
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Yil">
              <input
                type="number"
                min={2000}
                max={2030}
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Daraja">
              <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as OlympiadLevel }))} className="input">
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="O'rin">
              <select value={form.place} onChange={(e) => setForm((f) => ({ ...f, place: Number(e.target.value) as OlympiadPlace }))} className="input">
                {PLACES.map((p) => <option key={p} value={p}>{medalLabel[p]}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Tayyorlagan o'qituvchi (ixtiyoriy)">
            <input
              value={form.teacher}
              onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
              placeholder="Karimova N."
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
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">✓ G'olib qo'shildi.</p>
          )}
        </form>

        {/* Ro'yxat */}
        <div className="space-y-3 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">
            {loading ? "Yuklanmoqda…" : `Jami: ${winners.length} ta yozuv`}
          </h3>

          {winners.map((w) => (
            <div key={w.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
              {w.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.image} alt={w.student} className="h-14 w-14 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {w.student.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 truncate">{w.student}</span>
                  <span className="text-base">{["🥇","🥈","🥉"][w.place - 1]}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">{w.subject}</span>
                  <span className={`font-medium ${levelColor[w.level]}`}>{w.level}</span>
                  <span className="text-gray-400">{w.year}</span>
                </div>
                {w.teacher && <p className="mt-1 text-xs text-gray-400">O'qituvchi: {w.teacher}</p>}
              </div>
              <button
                onClick={() => handleDelete(w.id)}
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
