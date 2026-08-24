"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { schoolConfig, type StaffMember } from "@/school.config";
import { getStaff } from "@/lib/firestore";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

export default function MamuriyatPage() {
  const { director } = schoolConfig;
  const [administration, setAdministration] = useState<StaffMember[]>(schoolConfig.administration);

  useEffect(() => {
    getStaff()
      .then((data) => { if (data.length) setAdministration(data); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero banner */}
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.nav variants={fadeUp} className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-primary">Bosh sahifa</Link>
                <span>/</span>
                <span className="text-gray-900">Ma'muriyat</span>
              </motion.nav>
              <motion.span variants={fadeUp} className="text-sm font-semibold uppercase tracking-wide text-primary">
                Rahbariyat
              </motion.span>
              <motion.h1 variants={fadeUp} className="mt-2 text-3xl font-bold text-gray-900">
                Texnikum ma'muriyati
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-2 text-gray-500">
                {schoolConfig.name} rahbariyati va ma'muriyati
              </motion.p>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14">

          {/* Direktor — alohida katta karta */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="mb-6 text-lg font-semibold text-gray-700">Rahbar</h2>
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-primary/20 bg-white p-8 shadow-sm sm:flex-row">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
                <span className="text-5xl font-bold text-primary">{director.name.charAt(0)}</span>
              </div>
              <div>
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-2">
                  {director.position}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{director.name}</h3>
                <blockquote className="mt-3 border-l-4 border-primary/30 pl-4 italic text-gray-600">
                  "{director.quote}"
                </blockquote>
              </div>
            </div>
          </motion.div>

          {/* Qolgan ma'muriyat */}
          <div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="mb-6 text-lg font-semibold text-gray-700"
            >
              Ma'muriyat a'zolari
            </motion.h2>

            <motion.div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {administration.slice(1).map((member) => (
                <motion.div
                  key={member.name}
                  variants={scaleIn}
                  className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-md"
                >
                  {member.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/10"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/10">
                      <span className="text-3xl font-bold text-primary">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="mt-4 font-semibold text-gray-900">{member.name}</h3>
                  <p className="mt-1 text-sm text-primary">{member.position}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="mt-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Link href="/" className="text-sm font-medium text-primary hover:text-primary-hover">
              ← Bosh sahifaga qaytish
            </Link>
          </motion.div>

        </div>
      </main>
      <Footer />
    </>
  );
}
