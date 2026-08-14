import type { Metadata } from "next";
import type { ReactNode } from "react";
import { schoolConfig } from "@/school.config";
import { getThemeStyle } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: schoolConfig.name,
    template: `%s | ${schoolConfig.shortName}`,
  },
  description: schoolConfig.slogan,
  keywords: [
    schoolConfig.shortName,
    schoolConfig.name,
    "maktab",
    "ta'lim",
    "umumiy o'rta ta'lim",
    "Surxondaryo",
    "Sho'rchi tumani",
  ],
  openGraph: {
    title: schoolConfig.name,
    description: schoolConfig.slogan,
    type: "website",
    locale: "uz_UZ",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Rang shu yerda BIR MARTA o'rnatiladi. <html> ostidagi hamma narsa —
  // bosh sahifa ham, /admin ham — shu o'zgaruvchilardan rang oladi.
  return (
    <html lang="uz" style={getThemeStyle()}>
      <body>{children}</body>
    </html>
  );
}
