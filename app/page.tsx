import type { Metadata } from "next";
import { schoolConfig } from "@/school.config";
import Navbar from "@/components/site/Navbar";

export const metadata: Metadata = {
  title: schoolConfig.name,
  description: schoolConfig.slogan,
  openGraph: {
    title: schoolConfig.name,
    description: schoolConfig.slogan,
    images: schoolConfig.logo ? [{ url: schoolConfig.logo }] : [],
  },
};
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Schedule from "@/components/site/Schedule";
import History from "@/components/site/History";
import OlympiadWinners from "@/components/site/OlympiadWinners";
import Gallery from "@/components/site/Gallery";
import Clubs from "@/components/site/Clubs";
import Alumni from "@/components/site/Alumni";
import News from "@/components/site/News";
import UsefulLinks from "@/components/site/UsefulLinks";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      {/* Yo'nalishlar, o'qituvchilar va rahbariyat bu yerda EMAS — ular
          alohida sahifalarda va menyudan ochiladi. Bosh sahifa yangilik va
          kundalik ma'lumot uchun qoldi; yo'nalishlarga Hero'dagi tugma
          ham olib boradi. */}
      <main>
        <Hero />
        <About />
        <News />
        <Schedule />
        <Gallery />
        <Clubs />
        <OlympiadWinners />
        <Alumni />
        <History />
        <UsefulLinks />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
