"use client";

import { useEffect, useRef, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SeedBanner from "@/components/admin/SeedBanner";
import {
  getStaff, addStaff, updateStaff, deleteStaff, updateStaffOrder, seedCollection, type StaffDoc,
} from "@/lib/firestore";
import { schoolConfig } from "@/school.config";

const blank = () => ({ name: "", position: "", image: "" });

export default function AdministrationAdminPage() {
  const [staff, setStaff] = useState<StaffDoc[]>([]);
  const [usingConfig, setUsingConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(blank());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prevImage, setPrevImage] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getStaff();
      setStaff(data);
      setUsingConfig(data.length === 0);
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi. Sahifani yangilang yoki qaytadan kiring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSeed() {
    await seedCollection("administration", schoolConfig.administration);
    await load();
  }

  function startEdit(m: StaffDoc) {
    setEditingId(m.id);
    setPrevImage(m.image);
    setForm({ name: m.name, position: m.position, image: m.image ?? "" });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    setPrevImage(undefined);
    setForm(blank());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.position.trim()) return;

    if (!editingId && usingConfig) {
      const ok = confirm(
        `Diqqat: ${schoolConfig.administration.length} ta namuna xodim hali bazaga ko'chirilmagan.\n\n` +
        `Hozir yangi xodim qo'shsangiz, namunalar saytdan yo'qoladi.\n\nBaribir davom etasizmi?`
      );
      if (!ok) return;
    }

    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      position: form.position.trim(),
      image: form.image.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateStaff(editingId, payload, prevImage);
      } else {
        // `staff.length` emas, mavjud eng katta `order` + 1.
        // O'rtadagi xodim o'chirilgach uzunlik kamayadi va yangi xodim
        // mavjud tartib raqami bilan to'qnashib, ro'yxat aralashib ketardi.
        const nextOrder = staff.reduce((max, s) => Math.max(max, s.order ?? 0), -1) + 1;
        await addStaff(payload, nextOrder);
      }
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

  async function handleDelete(m: StaffDoc) {
    if (!confirm(`"${m.name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await deleteStaff(m.id, m.image);
      if (editingId === m.id) cancelEdit();
      await load();
    } catch {
      setError("O'chirib bo'lmadi. Sahifani yangilab qayta urinib ko'ring.");
    }
  }

  // Drag-and-drop tartib o'zgartirish (faqat bazadagi yozuvlar uchun)
  function onDragStart(id: string) { setDragId(id); }

  function onDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setStaff((prev) => {
      const from = prev.findIndex((s) => s.id === dragId);
      const to = prev.findIndex((s) => s.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  async function onDragEnd() {
    setDragId(null);
    try {
      await Promise.all(staff.map((s) => updateStaffOrder(s.id, s.order ?? 0)));
    } catch {
      setError("Tartibni saqlab bo'lmadi. Sahifani yangilang.");
    }
  }

  const shown = usingConfig ? schoolConfig.administration : staff;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Rahbariyat</h2>
        <p className="mt-1 text-gray-500">
          Ma'muriyat a'zolarini qo'shing, tahrirlang va tartibini o'zgartiring (sudrab torting).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && usingConfig && (
        <SeedBanner count={schoolConfig.administration.length} itemLabel="xodim" onSeed={handleSeed} />
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="font-semibold text-gray-900">
            {editingId ? "Xodimni tahrirlash" : "Yangi xodim"}
          </h3>

          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            folder="administration"
            label="Xodim rasmi (ixtiyoriy)"
          />

          <Field label="Ism Familiya">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Aliyev Vali Akramovich" className="input" />
          </Field>

          <Field label="Lavozim">
            <input value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              placeholder="Direktor o'rinbosari" className="input" />
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

          {!usingConfig && (
            <p className="text-xs text-gray-400">
              💡 Ro'yxatdagi xodimlarni sudrab tortib tartibini o'zgartiring.
            </p>
          )}
        </form>

        <div className="space-y-2 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">
            {loading ? "Yuklanmoqda…" : `Jami: ${shown.length} nafar`}
          </h3>

          {shown.map((member, i) => {
            const isReal = !usingConfig;
            const doc = member as StaffDoc;
            return (
              <div
                key={isReal ? doc.id : `config-${i}`}
                draggable={isReal}
                onDragStart={isReal ? () => onDragStart(doc.id) : undefined}
                onDragOver={isReal ? (e) => onDragOver(e, doc.id) : undefined}
                onDragEnd={isReal ? onDragEnd : undefined}
                className={`flex items-center gap-4 rounded-xl border bg-white p-4 transition-all ${
                  isReal ? "cursor-grab active:cursor-grabbing" : "border-dashed"
                } ${
                  isReal && dragId === doc.id
                    ? "border-primary shadow-md opacity-60"
                    : isReal ? "border-gray-200 hover:border-gray-300" : "border-gray-300"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                  {i + 1}
                </span>

                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt={member.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {member.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate">{member.name}</div>
                  <div className="mt-0.5 text-sm text-primary truncate">{member.position}</div>
                  {!isReal && <p className="text-xs text-amber-600">Namuna — bazaga ko'chirilmagan</p>}
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
