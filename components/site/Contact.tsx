"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { schoolConfig } from "@/school.config";
import { sendMessage } from "@/lib/firestore";
import { fadeUp, stagger, slideLeft, slideRight } from "@/lib/animations";

const SUBJECTS = [
  "Umumiy savol",
  "Talabani qabul qilish",
  "Dars jadvali",
  "To'lov va hujjatlar",
  "O'qituvchi bilan bog'lanish",
  "Shikoyat",
  "Taklif",
];

const blank = () => ({ name: "", phone: "", subject: SUBJECTS[0], body: "" });

export default function Contact() {
  const { address, phones, email, workingHours, mapEmbedUrl } = schoolConfig;
  const [form, setForm] = useState(blank());
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.body.trim()) return;
    setStatus("sending");

    try {
      await sendMessage({
        name: form.name.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        body: form.body.trim(),
      });

      // Telegram bildirishnoma (xatolik bo'lsa ham xabar saqlanadi)
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).catch(() => {});

      setStatus("sent");
      setForm(blank());
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">Aloqa</span>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">Biz bilan bog'laning</h2>
        </motion.div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">

          {/* Chap: aloqa ma'lumotlari + xarita */}
          <motion.div
            className="space-y-5"
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <ContactRow label="Manzil" value={address} icon="pin" />
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Icon name="phone" />
                <span className="text-sm font-medium text-gray-500">Telefonlar</span>
              </div>
              <div className="ml-9 space-y-1">
                {phones.map((p) => (
                  <a key={p} href={`tel:${p.replace(/\s/g, "")}`}
                    className="block text-gray-900 hover:text-primary transition-colors">{p}</a>
                ))}
              </div>
            </div>
            <ContactRow
              label="Email"
              value={<a href={`mailto:${email}`} className="hover:text-primary transition-colors">{email}</a>}
              icon="mail"
            />
            <ContactRow label="Ish vaqti" value={workingHours} icon="clock" />

            <div className="overflow-hidden rounded-xl border border-gray-200">
              {mapEmbedUrl ? (
                <iframe src={mapEmbedUrl} className="h-52 w-full" loading="lazy" title="Joylashuv" />
              ) : (
                <div className="flex h-52 items-center justify-center bg-primary/5 text-sm text-gray-400">
                  Xarita havolasini config'ga qo'shing
                </div>
              )}
            </div>
          </motion.div>

          {/* O'ng: xabar yuborish formasi */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900">Xabar yuborish</h3>
              <p className="mt-1 text-sm text-gray-500">Savollaringizga tez orada javob beramiz.</p>

              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex flex-col items-center gap-3 rounded-xl bg-green-50 border border-green-200 py-10 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Xabar yuborildi!</p>
                    <p className="mt-1 text-sm text-green-600">Tez orada siz bilan bog'lanamiz.</p>
                  </div>
                  <button onClick={() => setStatus("idle")} className="mt-2 text-sm text-green-700 underline">
                    Yana xabar yuborish
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-4"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Ismingiz *">
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Karimov Jasur"
                        required
                        className="input"
                      />
                    </Field>
                    <Field label="Telefon *">
                      <input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+998 90 123 45 67"
                        required
                        className="input"
                      />
                    </Field>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <Field label="Mavzu">
                      <select
                        value={form.subject}
                        onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                        className="input"
                      >
                        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <Field label="Xabar *">
                      <textarea
                        value={form.body}
                        onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                        rows={4}
                        placeholder="Savolingizni yozing..."
                        required
                        className="input resize-none"
                      />
                    </Field>
                  </motion.div>

                  {status === "error" && (
                    <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                      Xatolik yuz berdi. Qayta urinib ko'ring.
                    </p>
                  )}

                  <motion.button
                    variants={fadeUp}
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {status === "sending" ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Yuborilmoqda…
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Xabar yuborish
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function ContactRow({ label, value, icon }: { label: string; value: React.ReactNode; icon: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} />
      <div>
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />,
    mail: <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 5L2 7" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  };
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center text-primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{paths[name]}</svg>
    </span>
  );
}
