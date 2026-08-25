"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminAuthGate from "@/components/admin/AdminAuthGate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Login sahifasi shu layout ostida turadi, lekin panel chetlari (sidebar,
  // menyu havolalari, "Administrator" yozuvi) unga KERAK EMAS — ilgari ular
  // kirmagan odamga ham ko'rinib, panel ochiqdek taassurot qoldirardi.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminAuthGate>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          {/* Yuqori panel */}
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <h1 className="text-sm font-medium text-gray-500">Boshqaruv tizimi</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Administrator</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                A
              </span>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AdminAuthGate>
  );
}
