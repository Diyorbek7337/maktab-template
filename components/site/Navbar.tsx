"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { schoolConfig } from "@/school.config";

const navLinks = [
  { href: "#hero",         label: "Bosh sahifa",     type: "hash" },
  { href: "#about",        label: "Texnikum haqida", type: "hash" },
  { href: "/yonalishlar",  label: "Yo'nalishlar",    type: "page" },
  { href: "/mamuriyat",    label: "Ma'muriyat",      type: "page" },
  { href: "/news",         label: "Yangiliklar",     type: "page" },
  { href: "#contact",      label: "Aloqa",           type: "hash" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Bosh sahifada emas bo'lsa hash linklar ishllamaydi — /#about ga yo'naltiramiz
  function resolveHref(href: string, type: string) {
    if (type === "hash" && pathname !== "/") return `/${href}`;
    return href;
  }

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
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.type === "page" ? (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={resolveHref(link.href, link.type)}
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            )
          )}
          {/* "Admin panel" tugmasi ataylab yo'q: u tashrifchilarga kerak emas
              va panel manzilini bexosdan e'lon qilib turardi. Xodimlar
              /admin manzilini to'g'ridan-to'g'ri kiritadi. */}
        </nav>

        {/* Mobil tugma */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-gray-700 hover:text-primary"
          aria-label="Menyuni ochish"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobil menyu */}
      {open && (
        <nav className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          {navLinks.map((link) =>
            link.type === "page" ? (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={resolveHref(link.href, link.type)}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </nav>
      )}
    </header>
  );
}
