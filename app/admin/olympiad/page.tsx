"use client";

import { useEffect, useRef, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SeedBanner from "@/components/admin/SeedBanner";
import { getWinners, addWinner, updateWinner, deleteWinner, seedCollection, type WinnerDoc } from "@/lib/firestore";
import { schoolConfig, type OlympiadLevel, type OlympiadPlace } from "@/school.config";

const LEVELS: OlympiadLevel[] = ["Texnikum", "Tuman", "Viloyat", "Respublika", "Xalqaro"];
const PLACES: OlympiadPlace[] = [1, 2, 3];
const SUBJECTS = ["Kompyuter tarmoqlari", "Buxgalteriya hisobi", "Tikuvchilik texnologiyasi",
  "Avtomexanika", "Elektr montaj ishlari", "Oshpazlik mahorati", "Matematika", "Ingliz tili", "Boshqa"];

const medalLabel: Record<OlympiadPlace, string> = { 1: "🥇 I o'rin", 2: "🥈 II o'rin", 3: "🥉 III o'rin" };
const levelColor: Record<OlympiadLevel, string> = {
  Texnikum: "text-gray-500", Tuman: "text-blue-600",
  Viloyat: "text-violet-600", Respublika: "text-green-700", Xalqaro: "text-amber-700",
};

const blank = () => ({
  student: "", subject: SUBJECTS[0], level: "Viloyat" as OlympiadLevel,
  place: 1 as OlympiadPlace, year: new Date().getFullYear(), teacher: "", image: "",
});

export default function OlympiadAdminPage() {
  const [winners, setWinners] = useState<WinnerDoc[]>([]);
  const [usingConfig, setUsingConfig] = useState(false);
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prevImage, setPrevImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getWinners();
      setWinners(data);
      setUsingConfig(data.length === 0);
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi. Sahifani yangilang yoki qaytadan kiring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSeed() {
    await seedCollection("olympiadWinners", schoolConfig.olympiadWinners);
    await load();
  }

  function startEdit(w: WinnerDoc) {
    setEditingId(w.id);
    setPrevImage(w.image);
    setForm({
      student: w.student,
      subject: SUBJECTS.includes(w.subject) ? w.subject : "Boshqa",
      level: w.level,
      place: w.place,
      year: w.year,
      teacher: w.teacher ?? "",
      image: w.image ?? "",
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
    if (!form.student.trim()) return;

    if (!editingId && usingConfig) {
      const ok = confirm(
        `Diqqat: ${schoolConfig.olympiadWinners.length} ta namuna g'olib hali bazaga ko'chirilmagan.\n\n` +
        `Hozir yangi yozuv qo'shsangiz, namunalar saytdan yo'qoladi.\n\nBaribir davom etasizmi?`
      );
      if (!ok) return;
    }

    setSaving(true);
    setError("");
    const payload = {
      student: form.student.trim(),
      subject: form.subject,
      level: form.level,
      place: form.place,
      year: form.year,
      teacher: form.teacher.trim() || undefined,
      image: form.image.trim() || undefined,
    };

    try {
      if (editingId) await updateWinner(editingId, payload, prevImage);
      else await addWinner(payload);
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

  async function handleDelete(w: WinnerDoc) {
    if (!confirm(`"${w.student}" ni ro'yxatdan o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteWinner(w.id, w.image);
      if (editingId === w.id) cancelEdit();
      await load();
    } catch {
      setError("O'chirib bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
    }
  }

  const shown = usingConfig ? schoolConfig.olympiadWinners : winners;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Musobaqa g'oliblari</h2>
        <p className="mt-1 text-gray-500">Fan olimpiadasi va kasbiy mahorat musobaqasi g'oliblarini qo'shing va boshqaring.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && usingConfig && (
        <SeedBanner count={schoolConfig.olympiadWinners.length} itemLabel="g'olib" onSeed={handleSeed} />
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Forma */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900">
            {editingId ? "Yozuvni tahrirlash" : "Yangi g'olib"}
          </h3>

          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            folder="olympiad"
            label="Talaba rasmi (ixtiyoriy)"
          />

          <Field label="Talaba ismi">
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

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Saqlanmoqda…" : editingId ? "Saqlash" : "Qo'shish"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:border-gray-300 transition-colors">
                Bekor
              </button>
            )}
          </div>

          {saved && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">✓ Saqlandi.</p>
          )}
        </form>

        {/* Ro'yxat */}
        <div className="space-y-3 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">
            {loading ? "Yuklanmoqda…" : `Jami: ${shown.length} ta yozuv`}
          </h3>

          {shown.map((w, i) => {
            const isReal = !usingConfig;
            const doc = w as WinnerDoc;
            return (
            <div key={isReal ? doc.id : `config-${i}`}
              className={`flex items-center gap-4 rounded-xl border bg-white p-4 ${isReal ? "border-gray-200" : "border-dashed border-gray-300"}`}>
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
