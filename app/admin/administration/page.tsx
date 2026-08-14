"use client";

import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  getStaff, addStaff, deleteStaff, updateStaffOrder, type StaffDoc,
} from "@/lib/firestore";
import { schoolConfig } from "@/school.config";

const blank = () => ({ name: "", position: "", image: "" });

export default function AdministrationAdminPage() {
  const [staff, setStaff] = useState<StaffDoc[]>([]);
  const [form, setForm] = useState(blank());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    getStaff()
      .then((data) => {
        if (data.length) {
          setStaff(data);
        } else {
          // Birinchi ochilganda config dan Firestore ga ko'chiramiz
          setStaff(
            schoolConfig.administration.map((m, i) => ({ ...m, id: `config-${i}`, order: i }))
          );
        }
      })
      .catch(() => {
        setStaff(
          schoolConfig.administration.map((m, i) => ({ ...m, id: `config-${i}`, order: i }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.position.trim()) return;
    setSaving(true);
    try {
      const order = staff.length;
      const id = await addStaff(
        {
          name: form.name.trim(),
          position: form.position.trim(),
          ...(form.image ? { image: form.image } : {}),
        },
        order
      );
      setStaff((prev) => [...prev, { id, ...form, name: form.name.trim(), position: form.position.trim(), order }]);
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
    if (id.startsWith("config-")) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    await deleteStaff(id).catch(() => {});
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }

  // Drag-and-drop tartib o'zgartirish
  function onDragStart(id: string) { setDragId(id); }

  function onDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setStaff((prev) => {
      const from = prev.findIndex((s) => s.id === dragId);
      const to   = prev.findIndex((s) => s.id === overId);
      const next = [...prev];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next.map((s, i) => ({ ...s, order: i }));
    });
  }

  async function onDragEnd() {
    setDragId(null);
    // Firestore da tartibni yangilaymiz
    staff.forEach((s) => {
      if (!s.id.startsWith("config-")) updateStaffOrder(s.id, s.order ?? 0).catch(() => {});
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Rahbariyat</h2>
        <p className="mt-1 text-gray-500">
          Ma'muriyat a'zolarini qo'shing, o'chiring va tartibini o'zgartiring (sudrab torting).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Forma */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <ImageUpload
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            folder="administration"
            label="Xodim rasmi (ixtiyoriy)"
          />

          <Field label="Ism Familiya">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Aliyev Vali Akramovich"
              className="input"
            />
          </Field>

          <Field label="Lavozim">
            <input
              value={form.position}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
              placeholder="Direktor o'rinbosari"
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
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              ✓ Xodim qo'shildi.
            </p>
          )}

          <p className="text-xs text-gray-400">
            💡 Ro'yxatdagi xodimlarni sudrab tortib tartibini o'zgartiring.
          </p>
        </form>

        {/* Ro'yxat */}
        <div className="space-y-2 lg:col-span-3">
          <h3 className="text-sm font-medium text-gray-500">
            {loading ? "Yuklanmoqda…" : `Jami: ${staff.length} nafar`}
          </h3>

          {staff.map((member, i) => (
            <div
              key={member.id}
              draggable
              onDragStart={() => onDragStart(member.id)}
              onDragOver={(e) => onDragOver(e, member.id)}
              onDragEnd={onDragEnd}
              className={`flex cursor-grab items-center gap-4 rounded-xl border bg-white p-4 transition-all active:cursor-grabbing ${
                dragId === member.id ? "border-primary shadow-md opacity-60" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Tartib raqami */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                {i + 1}
              </span>

              {/* Avatar */}
              {member.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.image} alt={member.name}
                  className="h-12 w-12 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 truncate">{member.name}</div>
                <div className="mt-0.5 text-sm text-primary truncate">{member.position}</div>
              </div>

              {/* Drag handle icon */}
              <svg className="h-5 w-5 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>

              <button
                onClick={() => handleDelete(member.id)}
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
