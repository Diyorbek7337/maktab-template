"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { schoolConfig } from "@/school.config";
import SearchDialog from "./SearchDialog";

/**
 * Menyu tuzilishi.
 *
 * Yo'nalishlar, o'qituvchilar va rahbariyat bosh sahifadan alohida
 * sahifalarga chiqarilgach, menyuda 7 ta band to'planib qolgan edi.
 * Texnikum haqidagi bo'limlar bitta ochiladigan guruhga yig'ildi —
 * yuqori darajada 6 ta band qoladi va keyinchalik yangi sahifa
 * qo'shilsa ham menyu kengayib ketmaydi.
 */
type NavItem =
  | { kind: "link"; href: string; label: string; hash?: boolean }
  | { kind: "group"; label: string; items: { href: string; label: string; hash?: boolean }[] };

const navItems: NavItem[] = [
  { kind: "link", href: "#hero", label: "Bosh sahifa", hash: true },
  {
    kind: "group",
    label: "Texnikum",
    items: [
      { href: "#about", label: "Texnikum haqida", hash: true },
      { href: "/oqituvchilar", label: "O'qituvchilar" },
      { href: "/mamuriyat", label: "Ma'muriyat" },
      { href: "#history", label: "Tarix", hash: true },
    ],
  },
  { kind: "link", href: "/yonalishlar", label: "Yo'nalishlar" },
  { kind: "link", href: "/news", label: "Yangiliklar" },
  { kind: "link", href: "/gallery", label: "Galereya" },
  { kind: "link", href: "#contact", label: "Aloqa", hash: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState<string | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Ctrl/Cmd+K — qidiruvni klaviaturadan ochish
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Ochiladigan menyu: tashqariga bosilganda va Escape'da yopiladi
  useEffect(() => {
    if (!groupOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!groupRef.current?.contains(e.target as Node)) setGroupOpen(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setGroupOpen(null); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [groupOpen]);

  // Sahifa almashganda menyular yopilsin
  useEffect(() => { setOpen(false); setGroupOpen(null); }, [pathname]);

  // Bosh sahifada emas bo'lsa hash havolalar ishlamaydi — /#about ga yo'naltiramiz
  function href(item: { href: string; hash?: boolean }) {
    if (item.hash && pathname !== "/") return `/${item.href}`;
    return item.href;
  }

  const linkClass = "text-sm text-gray-600 hover:text-primary transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          {schoolConfig.logo ? (
            <Image
              src={schoolConfig.logo}
              alt={schoolConfig.shortName}
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">
              {schoolConfig.number}
            </span>
          )}
          <span className="font-semibold text-gray-900">{schoolConfig.shortName}</span>
        </Link>

        {/* Desktop menyu */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) =>
            item.kind === "link" ? (
              item.hash ? (
                <a key={item.href} href={href(item)} className={linkClass}>{item.label}</a>
              ) : (
                <Link key={item.href} href={item.href} className={linkClass}>{item.label}</Link>
              )
            ) : (
              <div key={item.label} ref={groupRef} className="relative">
                <button
                  onClick={() => setGroupOpen(groupOpen === item.label ? null : item.label)}
                  aria-expanded={groupOpen === item.label}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 ${linkClass}`}
                >
                  {item.label}
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    className={`transition-transform ${groupOpen === item.label ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {groupOpen === item.label && (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    {item.items.map((sub) =>
                      sub.hash ? (
                        <a
                          key={sub.href}
                          href={href(sub)}
                          onClick={() => setGroupOpen(null)}
                          className="block px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          {sub.label}
                        </a>
                      ) : (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setGroupOpen(null)}
                          className="block px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-primary/5 hover:text-primary"
                        >
                          {sub.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          )}

          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Saytdan qidirish"
            title="Qidirish (Ctrl+K)"
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-primary hover:text-primary"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Qidirish
          </button>

          {/* "Admin panel" tugmasi ataylab yo'q: u tashrifchilarga kerak emas
              va panel manzilini bexosdan e'lon qilib turardi. Xodimlar
              /admin manzilini to'g'ridan-to'g'ri kiritadi. */}
        </nav>

        {/* Mobil: qidiruv + menyu */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-gray-700 hover:text-primary"
            aria-label="Saytdan qidirish"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 text-gray-700 hover:text-primary"
            aria-label="Menyuni ochish"
            aria-expanded={open}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobil menyu — guruh ichma-ich ochiladi, alohida bosqich kerak emas */}
      {open && (
        <nav className="md:hidden max-h-[70vh] overflow-y-auto border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) =>
            item.kind === "link" ? (
              item.hash ? (
                <a
                  key={item.href}
                  href={href(item)}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </Link>
              )
            ) : (
              <div key={item.label} className="pt-1">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {item.label}
                </p>
                {item.items.map((sub) =>
                  sub.hash ? (
                    <a
                      key={sub.href}
                      href={href(sub)}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {sub.label}
                    </a>
                  ) : (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {sub.label}
                    </Link>
                  )
                )}
              </div>
            )
          )}
        </nav>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
