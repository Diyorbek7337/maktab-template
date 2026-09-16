import { schoolConfig } from "@/school.config";

/**
 * Qabul shartlari — barcha yo'nalishlar uchun bir xil, shuning uchun har
 * yo'nalishda takrorlanmaydi, config'dagi `admission` blokidan olinadi.
 * Yo'nalishlar ro'yxatida ham, har bir yo'nalish sahifasida ham ishlatiladi.
 */
export default function AdmissionInfo({ title = "Qabul shartlari" }: { title?: string }) {
  const a = schoolConfig.admission;

  const facts: [string, string][] = [
    ["Qabul muddati", a.period],
    ["Kimlar qabul qilinadi", a.requirement],
    ["Ta'lim shakli", a.studyForm],
    ["O'qish muddati", a.duration],
    ["Bitirganda beriladi", a.document],
  ];

  return (
    <section className="rounded-2xl border border-primary/20 bg-white p-6 sm:p-8">
      <span className="text-sm font-semibold uppercase tracking-wide text-primary">Qabul</span>
      <h2 className="mt-2 text-2xl font-bold text-gray-900">{title}</h2>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
            <dd className="mt-1 font-semibold text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>

      {a.benefits.length > 0 && (
        <ul className="mt-6 space-y-2.5">
          {a.benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-gray-700">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      )}

      {a.chair && (
        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-primary">{a.chair.position}</p>
            <p className="font-semibold text-gray-900">{a.chair.name}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${a.chair.phone.replace(/\s/g, "")}`}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              📞 {a.chair.phone}
            </a>
            <a
              href="/#contact"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary"
            >
              Ariza qoldirish
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
