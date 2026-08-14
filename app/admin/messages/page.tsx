"use client";

import { useEffect, useState } from "react";
import { getMessages, markMessageRead, deleteMessage, type Message } from "@/lib/firestore";
import { formatDateUz } from "@/lib/data";

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    getMessages().then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleOpen(msg: Message) {
    setOpen(open === msg.id ? null : msg.id);
    if (!msg.read) {
      await markMessageRead(msg.id).catch(() => {});
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xabarni o'chirishni tasdiqlaysizmi?")) return;
    await deleteMessage(id).catch(() => {});
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (open === id) setOpen(null);
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Xabarlar</h2>
          <p className="mt-1 text-gray-500">Saytdan kelgan murojaatlar.</p>
        </div>
        {unread > 0 && (
          <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
            {unread} ta yangi
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Yuklanmoqda…</p>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-gray-400">
          <svg className="h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p>Hali xabar yo'q</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border bg-white transition-all ${!msg.read ? "border-primary/40 shadow-sm" : "border-gray-200"}`}
            >
              {/* Sarlavha qatori */}
              <button
                onClick={() => handleOpen(msg)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                {/* O'qilmagan nuqta */}
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${!msg.read ? "bg-primary" : "bg-transparent"}`} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold text-gray-900 ${!msg.read ? "text-primary" : ""}`}>
                      {msg.name}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                      {msg.subject}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-sm text-gray-500">
                    <span>{msg.phone}</span>
                    {msg.createdAt && (
                      <span className="text-xs text-gray-400">
                        {formatDateUz(msg.createdAt.toDate().toISOString())}
                      </span>
                    )}
                    <span className="truncate text-gray-400">{msg.body}</span>
                  </div>
                </div>

                <svg
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open === msg.id ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Kengaytirilgan matn */}
              {open === msg.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2 mb-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Telefon</p>
                      <a href={`tel:${msg.phone.replace(/\s/g, "")}`} className="text-sm font-medium text-primary hover:underline">
                        {msg.phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Mavzu</p>
                      <p className="text-sm font-medium text-gray-700">{msg.subject}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Xabar</p>
                    <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {msg.body}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={`tel:${msg.phone.replace(/\s/g, "")}`}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
                    >
                      📞 Qo'ng'iroq qilish
                    </a>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
