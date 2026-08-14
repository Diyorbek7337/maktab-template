"use client";

import { useEffect, useState } from "react";
import { WEEKDAYS, initialSchedule, type Weekday, type ScheduleEntry } from "@/lib/data";
import { getSchedule, saveFullSchedule } from "@/lib/firestore";

export default function ScheduleAdminPage() {
  const [schedule, setSchedule] = useState<Record<Weekday, ScheduleEntry[]>>(initialSchedule);
  const [activeDay, setActiveDay] = useState<Weekday>("Dushanba");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const [time, setTime]       = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [room, setRoom]       = useState("");

  useEffect(() => {
    getSchedule()
      .then((data) => { if (data) setSchedule(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!time.trim() || !subject.trim()) return;
    const entry: ScheduleEntry = {
      time: time.trim(),
      subject: subject.trim(),
      teacher: teacher.trim() || "—",
      room: room.trim() || "—",
    };
    setSchedule((prev) => ({ ...prev, [activeDay]: [...prev[activeDay], entry] }));
    setTime(""); setSubject(""); setTeacher(""); setRoom("");
  }

  function handleRemove(index: number) {
    setSchedule((prev) => ({
      ...prev,
      [activeDay]: prev[activeDay].filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveFullSchedule(schedule);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Saqlashda xatolik. Firebase config ni tekshiring.");
    } finally {
      setSaving(false);
    }
  }

  const rows = schedule[activeDay];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dars jadvali</h2>
          <p className="mt-1 text-gray-500">Kun bo'yicha darslarni qo'shing va boshqaring.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">✓ Saqlandi</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Saqlanmoqda…" : "💾 Saqlash"}
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400">Jadval yuklanmoqda…</p>}

      {/* Kun tablari */}
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              day === activeDay
                ? "bg-primary text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary",
            ].join(" ")}
          >
            {day}
            {schedule[day].length > 0 && (
              <span className={`ml-1.5 text-xs ${day === activeDay ? "text-white/70" : "text-gray-400"}`}>
                ({schedule[day].length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Qo'shish formasi */}
      <form
        onSubmit={handleAdd}
        className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-5"
      >
        <input value={time} onChange={(e) => setTime(e.target.value)}
          placeholder="08:30 – 09:15" className="input" />
        <input value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder="Fan nomi" required className="input" />
        <input value={teacher} onChange={(e) => setTeacher(e.target.value)}
          placeholder="O'qituvchi" className="input" />
        <input value={room} onChange={(e) => setRoom(e.target.value)}
          placeholder="Xona" className="input" />
        <button type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
          + Qo'shish
        </button>
      </form>

      {/* Jadval */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-primary/5 text-primary">
              <th className="px-4 py-3 font-semibold">Vaqt</th>
              <th className="px-4 py-3 font-semibold">Fan</th>
              <th className="px-4 py-3 font-semibold">O'qituvchi</th>
              <th className="px-4 py-3 font-semibold">Xona</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  {activeDay} uchun darslar qo'shilmagan.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.time}</td>
                  <td className="px-4 py-3 text-gray-700">{row.subject}</td>
                  <td className="px-4 py-3 text-gray-500">{row.teacher}</td>
                  <td className="px-4 py-3 text-gray-500">{row.room}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleRemove(i)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        ⚠️ O'zgarishlar "Saqlash" tugmasini bosgandagina Firestore'ga yoziladi.
      </p>
    </div>
  );
}
