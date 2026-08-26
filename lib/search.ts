import { schoolConfig } from "@/school.config";
import { getNews, getMajors, getTeachers, getClubs, getAlumni } from "./firestore";
import { initialNews, majorSlug } from "./data";

/**
 * Sayt bo'ylab qidiruv.
 *
 * Firestore'da to'liq matnli qidiruv YO'Q — u faqat aniq moslik yoki
 * prefiks bo'yicha ishlaydi, ya'ni "tarmoq" so'zi bo'yicha "Kompyuter
 * tarmoqlari" ni topib bo'lmaydi. Shuning uchun cheklangan hajmdagi
 * ma'lumot bir marta yuklanadi va brauzerda qidiriladi. Bu saytdagi
 * ma'lumot hajmiga (o'nlab yo'nalish/o'qituvchi, yuzlab yangilik) mos
 * va so'z ichidan qidirishga imkon beradi.
 */

/** Qidiruvga tortiladigan eng yangi yangiliklar soni */
const NEWS_LIMIT = 300;

export type SearchKind = "news" | "major" | "teacher" | "club" | "alumni";

export interface SearchResult {
  kind: SearchKind;
  title: string;
  subtitle?: string;
  href: string;
}

/** Ichki: qidiriladigan birlashtirilgan matn (UI ga chiqmaydi) */
interface IndexedResult extends SearchResult {
  _text: string;
}

/**
 * Yuklangan indeks. Tarkibi ichki narsa — chaqiruvchi uni faqat
 * `search()` ga uzatadi, o'zi ochib ko'rmaydi.
 */
export type SearchIndex = IndexedResult[];

export const KIND_LABEL: Record<SearchKind, string> = {
  news: "Yangiliklar",
  major: "Yo'nalishlar",
  teacher: "O'qituvchilar",
  club: "To'garaklar",
  alumni: "Bitiruvchilar",
};

/**
 * Matnni solishtirish uchun soddalashtiradi.
 *
 * O'zbek tilida apostrof turli belgilar bilan yoziladi (' ' ʻ ʼ `) —
 * foydalanuvchi "yonalish" deb yozsa ham "yo'nalish" topilishi kerak,
 * shuning uchun apostroflar butunlay olib tashlanadi.
 */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/['''`ʻʼ‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Barcha so'zlar matnda uchrasa — moslik (tartib muhim emas) */
function matches(haystack: string, terms: string[]): boolean {
  const text = normalize(haystack);
  return terms.every((t) => text.includes(t));
}

// Bir sessiyada takror yuklamaslik uchun
let cache: IndexedResult[] | null = null;
let pending: Promise<IndexedResult[]> | null = null;

async function buildIndex(): Promise<IndexedResult[]> {
  const [news, majors, teachers, clubs, alumni] = await Promise.all([
    getNews(NEWS_LIMIT).catch(() => []),
    getMajors().catch(() => []),
    getTeachers().catch(() => []),
    getClubs().catch(() => []),
    getAlumni().catch(() => []),
  ]);

  // Firestore bo'sh bo'lsa sayt config'dagi namunalarni ko'rsatadi —
  // qidiruv ham xuddi shu manbadan qidirishi kerak.
  const newsList = news.length ? news : initialNews;
  const majorList = majors.length ? majors : schoolConfig.majors;
  const teacherList = teachers.length ? teachers : schoolConfig.teachers;
  const clubList = clubs.length ? clubs : schoolConfig.clubs;
  const alumniList = alumni.length ? alumni : schoolConfig.alumni;

  return [
    ...majorList.map((m) => ({
      kind: "major" as const,
      title: m.name,
      subtitle: `${m.duration} · ${m.qualification}`,
      href: `/yonalishlar/${majorSlug(m.name)}`,
      _text: `${m.name} ${m.qualification} ${m.description}`,
    })),
    ...newsList.map((n) => ({
      kind: "news" as const,
      title: n.title,
      subtitle: n.excerpt,
      href: `/news/${n.slug}`,
      _text: `${n.title} ${n.excerpt} ${n.content ?? ""} ${n.category}`,
    })),
    ...teacherList.map((t) => ({
      kind: "teacher" as const,
      title: t.name,
      subtitle: `${t.subject} · ${t.experience} yil`,
      href: "/#teachers",
      _text: `${t.name} ${t.subject} ${t.achievement ?? ""}`,
    })),
    ...clubList.map((c) => ({
      kind: "club" as const,
      title: c.name,
      subtitle: c.category,
      href: "/#clubs",
      _text: `${c.name} ${c.category} ${c.description} ${c.teacher ?? ""}`,
    })),
    ...alumniList.map((a) => ({
      kind: "alumni" as const,
      title: a.name,
      subtitle: `${a.graduationYear}-yil · ${a.achievement}`,
      href: "/#alumni",
      _text: `${a.name} ${a.achievement} ${a.workplace ?? ""}`,
    })),
  ];
}

/** Indeksni yuklaydi (bir marta) va keshda saqlaydi */
export function loadSearchIndex(): Promise<IndexedResult[]> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = buildIndex()
      .then((rows) => { cache = rows; return rows; })
      .catch((err) => { pending = null; throw err; });
  }
  return pending;
}

/** Natijalarni turi bo'yicha guruhlaydi (ko'rsatish tartibida) */
export const KIND_ORDER: SearchKind[] = ["major", "news", "teacher", "club", "alumni"];

export function search(rows: IndexedResult[], q: string, max = 20): SearchResult[] {
  const terms = normalize(q).split(" ").filter(Boolean);
  if (!terms.length) return [];

  const hits = rows.filter((r) => matches(r._text, terms));

  // Sarlavhada uchraganlari yuqorida tursin
  hits.sort((a, b) => {
    const at = matches(a.title, terms) ? 0 : 1;
    const bt = matches(b.title, terms) ? 0 : 1;
    if (at !== bt) return at - bt;
    return KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);
  });

  return hits.slice(0, max);
}
