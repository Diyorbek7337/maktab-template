"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithCustomToken, setPersistence, browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type State = "checking" | "ready" | "failed";

/**
 * Admin panelda ikkita alohida sessiya bor:
 *   1. httpOnly cookie (8 soat) — sahifalarga kirishni middleware boshqaradi
 *   2. Firebase Auth sessiyasi — Firestore'ga o'qish/yozish uchun
 *
 * Ular turli muddatda tugaydi va bir-biridan bexabar bo'lishi mumkin.
 * Ilgari bu komponent Firebase sessiyasi bor bo'lsa cookie'ni umuman
 * tekshirmasdi — natijada cookie o'lgan, Firebase esa tirik holatda panel
 * ochilaverar, lekin har bir saqlash "Saqlab bo'lmadi" bilan tugardi.
 *
 * Endi COOKIE yagona haqiqat manbasi: har safar u tekshiriladi va undan
 * yangi Firebase sessiyasi olinadi. Cookie yaroqsiz bo'lsa — login sahifasi.
 */
export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");

  const authenticate = useCallback(async (signal?: { cancelled: boolean }) => {
    try {
      const res = await fetch("/api/admin/firebase-token", { method: "POST" });

      if (!res.ok) {
        // Cookie yo'q, muddati o'tgan yoki imzosi mos emas
        if (!signal?.cancelled) router.replace("/admin/login");
        return;
      }

      const { token } = await res.json();

      // Cookie tirik ekan — Firebase sessiyasini undan qayta tiklaymiz.
      // Har safar yangi token olinadi, shuning uchun eskirgan yoki
      // yangilanmay qolgan sessiya muammosi bo'lmaydi.
      await setPersistence(auth, browserSessionPersistence);
      await signInWithCustomToken(auth, token);

      if (!signal?.cancelled) setState("ready");
    } catch {
      // Tarmoq uzilishi — bu cookie yaroqsizligini bildirmaydi,
      // shuning uchun login'ga yubormaymiz, qayta urinish taklif qilamiz.
      if (!signal?.cancelled) setState("failed");
    }
  }, [router]);

  useEffect(() => {
    const signal = { cancelled: false };
    authenticate(signal);
    return () => { signal.cancelled = true; };
  }, [authenticate]);

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Sessiya tekshirilmoqda…
        </div>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-800">Serverga ulanib bo'lmadi</p>
          <p className="mt-1 text-sm text-red-600">
            Internet aloqasini tekshiring va qayta urinib ko'ring.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => { setState("checking"); authenticate(); }}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Qayta urinish
            </button>
            <button
              onClick={() => router.replace("/admin/login")}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors"
            >
              Kirish sahifasi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
