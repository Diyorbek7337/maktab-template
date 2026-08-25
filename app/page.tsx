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
import Administration from "@/components/site/Administration";
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
      <main>
        <Hero />
        <About />
        <Majors />
        <History />
        <Administration />
        <Teachers />
        <Schedule />
        <OlympiadWinners />
        <Gallery />
        <Clubs />
        <Alumni />
        <News />
        <UsefulLinks />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
