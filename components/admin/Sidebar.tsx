"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { schoolConfig } from "@/school.config";
import { auth } from "@/lib/firebase";

const menu = [
  { href: "/admin",                  label: "Boshqaruv paneli",     icon: "grid"     },
  { href: "/admin/majors",           label: "Yo'nalishlar",         icon: "major"    },
  { href: "/admin/news",             label: "Yangiliklar",          icon: "news"     },
  { href: "/admin/administration",   label: "Rahbariyat",           icon: "users"    },
  { href: "/admin/teachers",         label: "O'qituvchilar",        icon: "teacher"  },
  { href: "/admin/olympiad",         label: "Musobaqa g'oliblari",  icon: "medal"    },
  { href: "/admin/gallery",          label: "Galereya",             icon: "image"    },
  { href: "/admin/schedule",         label: "Dars jadvali",         icon: "calendar" },
  { href: "/admin/clubs",            label: "To'garaklar",          icon: "club"     },
  { href: "/admin/alumni",           label: "Bitiruvchilar",         icon: "alumni"   },
  { href: "/admin/messages",         label: "Xabarlar",             icon: "inbox"    },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await Promise.all([
      fetch("/api/admin/logout", { method: "POST" }),
      signOut(auth).catch(() => {}),
    ]);
    router.replace("/admin/login");
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-white">
          {schoolConfig.number}
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-gray-900">{schoolConfig.shortName}</div>
          <div className="text-xs text-gray-400">Admin panel</div>
        </div>
      </div>

      {/* Menyu */}
      <nav className="flex-1 space-y-1 p-3">
        {menu.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-primary/10 hover:text-primary",
              ].join(" ")}
            >
              <MenuIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quyi tugmalar */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <MenuIcon name="back" />
          Saytni ko'rish
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <MenuIcon name="logout" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}

function MenuIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </>
    ),
    major: (
      <>
        <rect width="20" height="14" x="2" y="7" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </>
    ),
    news: (
      <>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
      </>
    ),
    calendar: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18M8 2v4M16 2v4" />
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    teacher: (
      <>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </>
    ),
    medal: (
      <>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </>
    ),
    image: (
      <>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </>
    ),
    club: (
      <>
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </>
    ),
    alumni: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    inbox: (
      <>
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </>
    ),
    back: <path d="m15 18-6-6 6-6" />,
    logout: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  };

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {paths[name]}
    </svg>
  );
}
