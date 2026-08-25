"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";

type State = "checking" | "ready" | "failed";

/**
 * Admin panel Firestore'ga yoza olishi uchun Firebase Auth sessiyasi kerak.
 * Cookie (8 soat) va Firebase sessiyasi (brauzer yopilguncha) turli muddatga
 * ega — ular rassinxron bo'lganda panel "kirgan" ko'rinib, lekin hamma
 * ma'lumot bo'sh chiqardi.
 *
 * Bu komponent Firebase sessiyasi yo'qligini aniqlab, cookie asosida uni
 * jimgina tiklaydi. Cookie ham yaroqsiz bo'lsa — login sahifasiga yuboradi.
 */
export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;

      if (user) {
        setState("ready");
        return;
      }

      // Firebase sessiyasi yo'q — cookie orqali yangi token so'raymiz
      try {
        const res = await fetch("/api/admin/firebase-token", { method: "POST" });
        if (!res.ok) {
          // Cookie ham yaroqsiz — qayta kirish kerak
          if (!cancelled) {
            setState("failed");
            router.replace("/admin/login");
          }
          return;
        }
        const { token } = await res.json();
        await signInWithCustomToken(auth, token);
        // onAuthStateChanged qayta ishga tushadi va "ready" qo'yadi
      } catch {
        if (!cancelled) setState("failed");
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

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
          <p className="font-medium text-red-800">Sessiyani tiklab bo'lmadi</p>
          <p className="mt-1 text-sm text-red-600">
            Qaytadan kirishga urinib ko'ring.
          </p>
          <button
            onClick={() => router.replace("/admin/login")}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Kirish sahifasiga o'tish
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
