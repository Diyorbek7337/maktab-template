"use client";

import { useState } from "react";

interface Props {
  /** Nechta namuna yozuv ko'chiriladi */
  count: number;
  /** "yo'nalish", "o'qituvchi" kabi — xabar matni uchun */
  itemLabel: string;
  onSeed: () => Promise<void>;
}

/**
 * Firestore bo'sh bo'lganda sayt `school.config.ts` dagi namuna
 * ma'lumotlarni ko'rsatadi. Ular haqiqiy yozuv emas — tahrirlab ham,
 * o'chirib ham bo'lmaydi, va admin BITTA yangi yozuv qo'shishi bilan
 * config'dagi hammasi saytdan yo'qoladi.
 *
 * Bu banner shu holatni tushuntiradi va bir bosishda namunalarni
 * bazaga ko'chiradi — shundan keyin har biri to'liq boshqariladi.
 */
export default function SeedBanner({ count, itemLabel, onSeed }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setBusy(true);
    setError("");
    try {
      await onSeed();
    } catch {
      setError("Ko'chirishda xatolik. Qayta urinib ko'ring.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 font-semibold text-amber-900">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            Hozir saytda namuna ma'lumotlar ko'rinmoqda
          </h3>
          <p className="mt-1.5 text-sm text-amber-800">
            {count} ta namuna {itemLabel} <code className="rounded bg-amber-100 px-1">school.config.ts</code> faylidan
            olinmoqda. Ular haqiqiy yozuv emas — tahrirlab yoki o'chirib bo'lmaydi.
            Yangi {itemLabel} qo'shsangiz, namunalar saytdan butunlay yo'qoladi.
          </p>
          <p className="mt-1.5 text-sm text-amber-800">
            Ularni bazaga ko'chirsangiz, har biri alohida tahrirlanadigan va
            o'chiriladigan bo'ladi.
          </p>
          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
        </div>

        <button
          onClick={handleClick}
          disabled={busy}
          className="shrink-0 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-60"
        >
          {busy ? "Ko'chirilmoqda…" : `${count} ta namunani bazaga ko'chirish`}
        </button>
      </div>
    </div>
  );
}
