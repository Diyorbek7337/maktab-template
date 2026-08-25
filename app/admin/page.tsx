"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { schoolConfig } from "@/school.config";
import { getMessages, getTeachers, getClubs, getAlumni, getWinners, getGallery, getMajors } from "@/lib/firestore";

interface StatCard {
  label: string;
  value: string;
  hint: string;
  href: string;
  icon: React.ReactNode;
}

const iconTeacher = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14v7M3 9v7" />
  </svg>
);
const iconInbox = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const iconGallery = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
const iconClub = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const iconMedal = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);
const iconAlumni = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const iconMajor = (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    majors: string; majorsHint: string | null;
    teachers: string; teachersHint: string | null;
    unreadMessages: string;
    gallery: string; galleryHint: string | null;
    clubs: string; clubsHint: string | null;
    winners: string; winnersHint: string | null;
    alumni: string; alumniHint: string | null;
  }>({
    majors: "—", majorsHint: null,
    teachers: "—", teachersHint: null,
    unreadMessages: "—",
    gallery: "—", galleryHint: null,
    clubs: "—", clubsHint: null,
    winners: "—", winnersHint: null,
    alumni: "—", alumniHint: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getMajors(),
      getTeachers(),
      getMessages(),
      getGallery(),
      getClubs(),
      getWinners(),
      getAlumni(),
    ]).then(([majors, teachers, messages, gallery, clubs, winners, alumni]) => {
      // Firestore bo'sh bo'lganda sayt config'dagi namunalarni ko'rsatadi —
      // panel ham AYNAN shu qoidaga bo'ysunishi kerak. Ilgari u Firestore'ni
      // to'g'ridan-to'g'ri sanardi va saytda 8 ta yo'nalish turgan holda
      // "0" deb ko'rsatib, adminni chalg'itardi.
      const fromDb = <T,>(r: PromiseSettledResult<T[]>): T[] | null =>
        r.status === "fulfilled" ? r.value : null;

      const resolve = <T,>(r: PromiseSettledResult<T[]>, fallback: readonly unknown[]) => {
        const rows = fromDb(r);
        if (rows === null) return { value: "—", hint: "yuklanmadi" };
        if (rows.length === 0 && fallback.length > 0) {
          return { value: String(fallback.length), hint: "namuna (bazada yo'q)" };
        }
        return { value: String(rows.length), hint: null };
      };

      const m = resolve(majors, schoolConfig.majors);
      const t = resolve(teachers, schoolConfig.teachers);
      const c = resolve(clubs, schoolConfig.clubs);
      const w = resolve(winners, schoolConfig.olympiadWinners);
      const a = resolve(alumni, schoolConfig.alumni);
      const g = resolve(gallery, []);

      const msgRows = fromDb(messages);
      const unread = msgRows ? msgRows.filter((x) => !x.read).length : null;

      setStats({
        majors: m.value, majorsHint: m.hint,
        teachers: t.value, teachersHint: t.hint,
        unreadMessages: unread === null ? "—" : unread > 0 ? `${unread} yangi` : "0",
        gallery: g.value, galleryHint: g.hint,
        clubs: c.value, clubsHint: c.hint,
        winners: w.value, winnersHint: w.hint,
        alumni: a.value, alumniHint: a.hint,
      });
      setLoading(false);
    });
  }, []);

  const cards: StatCard[] = [
    { label: "Yo'nalishlar",     value: stats.majors,         hint: stats.majorsHint   ?? "jami mutaxassislik", href: "/admin/majors",   icon: iconMajor   },
    { label: "O'qituvchilar",    value: stats.teachers,       hint: stats.teachersHint ?? "jami pedagog",       href: "/admin/teachers", icon: iconTeacher },
    { label: "Xabarlar",         value: stats.unreadMessages, hint: "o'qilmagan",                              href: "/admin/messages", icon: iconInbox   },
    { label: "Galereya",         value: stats.gallery,        hint: stats.galleryHint  ?? "rasm va video",      href: "/admin/gallery",  icon: iconGallery },
    { label: "To'garaklar",      value: stats.clubs,          hint: stats.clubsHint    ?? "faol seksiyalar",    href: "/admin/clubs",    icon: iconClub    },
    { label: "Musobaqa g'oliblari", value: stats.winners,     hint: stats.winnersHint  ?? "jami g'oliblar",     href: "/admin/olympiad", icon: iconMedal   },
    { label: "Bitiruvchilar",    value: stats.alumni,         hint: stats.alumniHint   ?? "qayd etilgan",       href: "/admin/alumni",   icon: iconAlumni  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Boshqaruv paneli</h2>
        <p className="mt-1 text-gray-500">
          {schoolConfig.shortName} kontentini shu yerdan boshqaring.
        </p>
      </div>

      {/* Statistik kartalar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">{c.label}</div>
              <span className="text-primary/40 group-hover:text-primary transition-colors">{c.icon}</span>
            </div>
            <div className={`mt-2 text-3xl font-bold ${loading ? "text-gray-200 animate-pulse" : "text-primary"}`}>
              {c.value}
            </div>
            <div className="mt-1 text-xs text-gray-400">{c.hint}</div>
          </Link>
        ))}
      </div>

      {/* Tezkor amallar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Tezkor amallar</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/news"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            + Yangilik qo'shish
          </Link>
          <Link
            href="/admin/majors"
            className="rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            + Yo'nalish qo'shish
          </Link>
          <Link
            href="/admin/schedule"
            className="rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            Dars jadvalini tahrirlash
          </Link>
          <Link
            href="/admin/gallery"
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
          >
            + Rasm yuklash
          </Link>
        </div>
      </div>
    </div>
  );
}
