"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { schoolConfig } from "@/school.config";
import { fadeUp, stagger } from "@/lib/animations";

const quickLinks = [
  { href: "/", label: "Bosh sahifa" },
  { href: "#about", label: "Texnikum haqida" },
  { href: "#majors", label: "Yo'nalishlar" },
  { href: "/mamuriyat", label: "Ma'muriyat" },
  { href: "/news", label: "Yangiliklar" },
  { href: "#contact", label: "Aloqa" },
];

const socialIcons: Record<string, React.ReactNode> = {
  telegram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
};

export default function Footer() {
  const { name, number, address, phones, email, workingHours, social } = schoolConfig;
  const year = new Date().getFullYear();

  const socialEntries = Object.entries(social).filter(([, v]) => v) as [string, string][];

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 pt-14 pb-8">

        <motion.div
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Texnikum haqida */}
          <motion.div variants={fadeUp} className="lg:col-span-1">
            <div className="flex items-center gap-3">
              {schoolConfig.logo ? (
                <Image
                  src={schoolConfig.logo}
                  alt={schoolConfig.shortName}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-white shrink-0">
                  {number}
                </span>
              )}
              <span className="font-semibold text-white leading-tight">{name}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Bilim, tarbiya va rivojlanish uchun qulay muhit yaratuvchi zamonaviy ta'lim maskani.
            </p>
            {/* Ijtimoiy tarmoqlar */}
            {socialEntries.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialEntries.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                  >
                    {socialIcons[key] ?? key[0].toUpperCase()}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Tezkor havolalar */}
          <motion.div variants={fadeUp}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Tezkor havolalar
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Aloqa */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Aloqa ma'lumotlari
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-gray-400">{address}</span>
              </li>
              {phones.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <svg className="h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                  </svg>
                  <a href={`tel:${p.replace(/\s/g, "")}`} className="text-gray-400 hover:text-primary transition-colors">{p}</a>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <svg className="h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 5L2 7" />
                </svg>
                <a href={`mailto:${email}`} className="text-gray-400 hover:text-primary transition-colors">{email}</a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-4 w-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                <span className="text-gray-400">{workingHours}</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Pastki qator */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-6 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {year} {name}. Barcha huquqlar himoyalangan.
          </p>
          <button
            onClick={scrollTop}
            className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors"
          >
            Tepaga qaytish
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>

      </div>
    </footer>
  );
}
