"use client";

import { motion } from "framer-motion";
import { schoolConfig } from "@/school.config";
import { fadeUp, slideLeft, slideRight } from "@/lib/animations";

export default function History() {
  const { history } = schoolConfig;
  if (!history.length) return null;

  return (
    <section id="history" className="bg-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-20">

        <motion.div
          className="text-center"
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
            {history[0].year}-yildan buyon ta'lim va tarbiya maskani
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mt-16">
          {/* Markaziy chiziq — desktop */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:block" />

          {/* Chiziq — mobil */}
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:hidden" />

          <div className="space-y-10 md:space-y-0">
            {history.map((event, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={event.year} className="relative md:flex md:items-center md:gap-8 md:py-6">

                  {/* Desktop: chap tomon */}
                  <motion.div
                    className={`hidden md:flex md:w-1/2 ${isLeft ? "justify-end pr-10" : "justify-start pl-10 order-2"}`}
                    variants={isLeft ? slideLeft : slideRight}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                  >
                    {isLeft && <EventCard event={event} />}
                  </motion.div>

                  {/* Markaziy yil doirasi — desktop */}
                  <motion.div
                    className="absolute left-1/2 hidden -translate-x-1/2 md:flex"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-primary shadow-md shadow-primary/20">
                      <span className="text-xs font-bold leading-none text-white text-center">
                        {event.year}
                      </span>
                    </div>
                  </motion.div>

                  {/* Desktop: o'ng tomon */}
                  <motion.div
                    className={`hidden md:flex md:w-1/2 ${isLeft ? "justify-start pl-10 order-2" : "justify-end pr-10"}`}
                    variants={isLeft ? slideRight : slideLeft}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.5 }}
                  >
                    {!isLeft && <EventCard event={event} />}
                  </motion.div>

                  {/* Mobil ko'rinish */}
                  <motion.div
                    className="flex gap-5 pl-14 md:hidden"
                    variants={slideRight}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}
                  >
                    {/* Yil — chiziq ustida */}
                    <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-primary shadow-md shadow-primary/20">
                      <span className="text-[10px] font-bold leading-none text-white text-center">
                        {event.year}
                      </span>
                    </div>
                    <EventCard event={event} />
                  </motion.div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

function EventCard({ event }: { event: { year: number; title: string; description?: string } }) {
  return (
    <div className="group max-w-sm rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-primary hover:shadow-md">
      <div className="mb-1 text-xs font-semibold text-primary md:hidden">{event.year}</div>
      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
        {event.title}
      </h3>
      {event.description && (
        <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{event.description}</p>
      )}
    </div>
  );
}
