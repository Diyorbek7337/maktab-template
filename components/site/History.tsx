"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion, useScroll, useTransform, useReducedMotion, useSpring,
} from "framer-motion";
import { schoolConfig } from "@/school.config";
import { fadeUp } from "@/lib/animations";

/**
 * Tarix — gorizontal tasma, sahifa aylantirilganda chapdan o'ngga siljiydi.
 *
 * Bunday effekt odatda bo'limni ekranga "yopishtirib" (sticky) qilinadi,
 * lekin u holda bo'lim bir necha ekran balandlik talab qiladi va sahifa
 * uzayib ketadi. Bu yerda yopishtirilmagan: tasma bo'lim ekrandan
 * o'tayotgan payt siljiydi. Natijada effekt saqlanadi, sahifa esa
 * qisqaradi (vertikal timeline 1323px edi).
 *
 * Sichqonchasi yo'q qurilmalarda tasmani barmoq bilan surish ham mumkin,
 * `prefers-reduced-motion` yoqilgan bo'lsa avtomatik siljish o'chadi.
 */
export default function History() {
  const { history } = schoolConfig;
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Bo'lim ekranga kirganda 0, chiqib ketganda 1
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Siljishni biroz yumshatamiz — aks holda harakat "sakrab" tuyuladi
  const smooth = useSpring(scrollYProgress, {
    stiffness: 60, damping: 20, restDelta: 0.001,
  });

  // Kartochkalar soniga qarab masofa: nechta ko'p bo'lsa, shuncha uzoq siljiydi
  const shift = Math.min(60, Math.max(0, history.length - 3) * 14);
  const x = useTransform(smooth, [0, 1], ["8%", `-${shift}%`]);

  // Tor ekranda scroll bilan siljitish yaramaydi: tasma ekrandan bir necha
  // barobar keng bo'lgani uchun oxirgi kartochkalar umuman ko'rinmay
  // qolardi. Shuning uchun telefonda tasma barmoq bilan suriladi.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const scrollDriven = wide && !reduceMotion;

  if (!history.length) return null;

  return (
    <section id="history" ref={sectionRef} className="overflow-hidden bg-white">
      <div className="py-14">

        <motion.div
          className="mx-auto max-w-6xl px-4 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Tarix
          </span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Texnikumimiz tarixi</h2>
          <p className="mt-3 text-gray-500">
            {history[0].year}-yildan buyon ta&apos;lim va tarbiya maskani
          </p>
        </motion.div>

        {/* Gorizontal tasma */}
        <div className="relative mt-12">
          {/* Yillar chizig'i — kartochkalar ostidan o'tadi */}
          <div className="pointer-events-none absolute left-0 right-0 top-[52px] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <motion.ol
            style={scrollDriven ? { x } : undefined}
            className={[
              "flex list-none gap-5 px-4",
              // Kompyuterda scroll siljitadi; telefonda va harakat
              // o'chirilganda foydalanuvchining o'zi suradi
              scrollDriven ? "" : "snap-x snap-mandatory overflow-x-auto pb-4",
            ].join(" ")}
          >
            {history.map((event, i) => (
              <li
                key={event.year}
                className="w-[280px] shrink-0 snap-start sm:w-[320px]"
              >
                {/* Yil belgisi */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    className="relative z-10 flex h-[104px] w-[104px] items-center justify-center rounded-full border-4 border-white bg-primary shadow-lg shadow-primary/25"
                  >
                    <span className="text-lg font-bold text-white">{event.year}</span>
                  </motion.div>
                </div>

                {/* Kartochka */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="group mt-5 h-full rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-primary hover:shadow-md"
                >
                  <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-primary">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {event.description}
                    </p>
                  )}
                </motion.div>
              </li>
            ))}
          </motion.ol>
        </div>

      </div>
    </section>
  );
}
