"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { schoolConfig } from "@/school.config";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

function parseStatValue(value: string): { num: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { num: 0, suffix: value };
  return { num: parseInt(match[1], 10), suffix: match[2] };
}

function AnimatedCounter({ value, duration = 1800 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState("0");
  const { num, suffix } = parseStatValue(value);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num);
      setDisplay(current.toString());
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [inView, num, duration]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-gray-50">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <motion.div
          className="max-w-2xl"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            Rasmiy veb-sayt
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-4xl md:text-5xl font-bold leading-tight text-gray-900"
          >
            {schoolConfig.name}
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 text-lg text-gray-600">
            {schoolConfig.slogan}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <a
              href="/yonalishlar"
              className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Yo'nalishlar
            </a>
            <a
              href="#contact"
              className="rounded-lg border-2 border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              Biz bilan bog'lanish
            </a>
          </motion.div>
        </motion.div>

        {/* Statistika — animatsiyali hisoblagichlar */}
        <motion.div
          className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {schoolConfig.stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={scaleIn}
              className="rounded-xl border border-gray-200 bg-white p-5 text-center"
            >
              <div className="text-3xl font-bold text-primary">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
