import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Sahifa topilmadi",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4 py-20">
        <div className="text-center">
          <p className="text-6xl font-bold text-primary/30">404</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 sm:text-3xl">
            Sahifa topilmadi
          </h1>
          <p className="mx-auto mt-3 max-w-md text-gray-500">
            Siz qidirayotgan sahifa mavjud emas yoki manzili o'zgargan bo'lishi
            mumkin.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Bosh sahifaga qaytish
            </Link>
            <Link
              href="/yonalishlar"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
            >
              Yo'nalishlar
            </Link>
            <Link
              href="/news"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
            >
              Yangiliklar
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
