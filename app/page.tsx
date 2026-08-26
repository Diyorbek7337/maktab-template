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
import Majors from "@/components/site/Majors";
import Schedule from "@/components/site/Schedule";
import History from "@/components/site/History";
import Teachers from "@/components/site/Teachers";
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
      {/* Tartib: tashrifchi ko'p qidiradigan narsa yuqorida.
          Yo'nalishlar va yangiliklar — eng talab qilinadigan ikkita bo'lim,
          shuning uchun ular boshida. Tarix eng uzun bo'lim bo'lgani va
          shoshilinch ma'lumot bo'lmagani uchun pastga tushirilgan. */}
      <main>
        <Hero />
        <About />
        <Majors />
        <News />
        <Teachers />
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
