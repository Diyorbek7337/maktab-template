"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { schoolConfig, type StaffMember } from "@/school.config";
import { getStaff } from "@/lib/firestore";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

const PREVIEW_COUNT = 3;

export default function Administration() {
  const [administration, setAdministration] = useState<StaffMember[]>(schoolConfig.administration);

  useEffect(() => {
    getStaff()
      .then((data) => { if (data.length) setAdministration(data); })
      .catch(() => {});
  }, []);
  const preview = administration.slice(0, PREVIEW_COUNT);

  return (
    <section id="administration" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14">

        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Rahbariyat
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Texnikum ma'muriyati</h2>
          <p className="mt-3 text-gray-500">Texnikumimiz jamoasi va rahbariyati bilan tanishing</p>
        </motion.div>

        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {preview.map((member) => (
            <motion.div
              key={member.name}
              variants={scaleIn}
              className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50 p-6 text-center transition-shadow hover:shadow-md"
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

        {administration.length > PREVIEW_COUNT && (
          <motion.div
            className="mt-8 text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Link
              href="/mamuriyat"
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
            >
              Barcha ma'muriyatni ko'rish
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        )}

      </div>
    </section>
  );
}
