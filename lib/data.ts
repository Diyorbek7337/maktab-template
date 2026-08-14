// Namuna ma'lumotlar. Haqiqiy loyihada bu yerni bazaga (API) ulaysiz.

const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export function formatDateUz(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export interface NewsItem {
  id: number;
  slug: string;   // URL uchun: "imtihon-boshlandi"
  title: string;
  date: string;   // "2026-06-10"
  category: string;
  excerpt: string;
  content?: string;
  image?: string;
}

export interface ScheduleEntry {
  time: string; // "08:30 – 09:15"
  subject: string;
  teacher: string;
  room: string;
}

export const WEEKDAYS = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const initialNews: NewsItem[] = [
  {
    id: 1,
    slug: "yakuniy-imtihonlar-2026",
    title: "2025–2026 o'quv yili yakuniy imtihonlari boshlandi",
    date: "2026-06-10",
    category: "E'lon",
    excerpt:
      "9 va 11-sinf o'quvchilari uchun yakuniy davlat attestatsiyasi jadvali e'lon qilindi.",
    content:
      "2025–2026 o'quv yili yakuniy davlat attestatsiyasi 2026-yil 10-iyundan boshlanadi. 9-sinf o'quvchilari uchun matematika va ona tili fanlari bo'yicha yozma imtihonlar belgilangan. 11-sinf o'quvchilari esa davlat test sinovlaridan o'tadi.\n\nImtihon jadvali maktab ma'muriyatidan va rasmiy e'lonlar taxtasidan oldindan e'lon qilingan. Barcha o'quvchilar imtihon sanasidan kamida 30 daqiqa oldin maktabda bo'lishlari shart.\n\nQo'shimcha ma'lumot uchun sinf rahbarlariga murojaat qiling.",
  },
  {
    id: 2,
    slug: "olimpiada-golibi-2026",
    title: "Maktabimiz o'quvchisi viloyat fan olimpiadasida g'olib bo'ldi",
    date: "2026-06-05",
    category: "Yutuq",
    excerpt:
      "Matematika fanidan o'tkazilgan viloyat bosqichida o'quvchimiz birinchi o'rinni egalladi.",
    content:
      "Viloyat fan olimpiadasining matematika bo'yicha yakuniy bosqichi muvaffaqiyatli tugadi. Maktabimizning 10-sinf o'quvchisi birinchi o'rinni qo'lga kiritdi.\n\nO'quvchi algebra va geometriya bo'limlari bo'yicha barcha masalalarni to'liq hal qilib, hakamlar hay'atidan yuqori baho oldi. U respublika bosqichida maktabimizni va viloyatimizni vakillik qiladi.\n\nMaktab direktori va o'qituvchilar jamoasi g'olibni tabriklab, muvaffaqiyatlari uchun minnatdorchilik bildirdi.",
  },
  {
    id: 3,
    slug: "yangi-kompyuter-sinfi-2026",
    title: "Yangi kompyuter sinfi ochildi",
    date: "2026-05-28",
    category: "Yangilik",
    excerpt:
      "Zamonaviy jihozlangan 30 o'rinli kompyuter sinfi o'quvchilar foydalanishiga topshirildi.",
    content:
      "Maktabimizda zamonaviy 30 o'rinli kompyuter sinfi rasman ochildi. Sinf yangi avlod kompyuterlari, tezkor internet ulanishi va multimedia jihozlari bilan to'liq jihozlangan.\n\nYangi sinf informatika darslarini yanada samarali o'tkazish imkonini beradi. Bundan tashqari, o'quvchilar darsdan tashqari vaqtlarda ham kompyuter sinfidan foydalanishlari mumkin bo'ladi.\n\nSinfni jihozlash loyihasi mahalliy hokimiyat va ota-onalar yordami bilan amalga oshirildi.",
  },
];

export const initialSchedule: Record<Weekday, ScheduleEntry[]> = {
  Dushanba: [
    { time: "08:30 – 09:15", subject: "Matematika", teacher: "N. Karimova", room: "201" },
    { time: "09:25 – 10:10", subject: "Ona tili", teacher: "S. Yusupov", room: "105" },
    { time: "10:20 – 11:05", subject: "Ingliz tili", teacher: "D. Ahmedova", room: "302" },
    { time: "11:15 – 12:00", subject: "Fizika", teacher: "B. Tursunov", room: "204" },
  ],
  Seshanba: [
    { time: "08:30 – 09:15", subject: "Kimyo", teacher: "G. Rasulova", room: "203" },
    { time: "09:25 – 10:10", subject: "Tarix", teacher: "F. Olimov", room: "108" },
    { time: "10:20 – 11:05", subject: "Geometriya", teacher: "N. Karimova", room: "201" },
  ],
  Chorshanba: [
    { time: "08:30 – 09:15", subject: "Biologiya", teacher: "Z. Hamidova", room: "205" },
    { time: "09:25 – 10:10", subject: "Adabiyot", teacher: "S. Yusupov", room: "105" },
    { time: "10:20 – 11:05", subject: "Informatika", teacher: "A. Qodirov", room: "301" },
  ],
  Payshanba: [
    { time: "08:30 – 09:15", subject: "Matematika", teacher: "N. Karimova", room: "201" },
    { time: "09:25 – 10:10", subject: "Geografiya", teacher: "M. Sodiqova", room: "107" },
  ],
  Juma: [
    { time: "08:30 – 09:15", subject: "Ingliz tili", teacher: "D. Ahmedova", room: "302" },
    { time: "09:25 – 10:10", subject: "Jismoniy tarbiya", teacher: "R. Aliyev", room: "Sport zal" },
  ],
  Shanba: [
    { time: "08:30 – 09:15", subject: "Tarbiyaviy soat", teacher: "Sinf rahbari", room: "—" },
  ],
};
