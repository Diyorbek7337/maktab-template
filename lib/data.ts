// Namuna ma'lumotlar. Haqiqiy loyihada bu yerni bazaga (API) ulaysiz.

const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export function formatDateUz(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Eski yozuvlarda bitta "image", yangilarida "images" massivi bo'lishi
// mumkin — ikkalasini ham bitta ro'yxatga birlashtiradi ([0] — muqova).
export function newsImages(item: { image?: string; images?: string[] }): string[] {
  if (item.images?.length) return item.images;
  return item.image ? [item.image] : [];
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
    slug: "bitiruv-malaka-imtihonlari-2026",
    title: "2025–2026 o'quv yili bitiruv malaka imtihonlari boshlandi",
    date: "2026-06-10",
    category: "E'lon",
    excerpt:
      "Bitiruvchi guruh talabalari uchun malaka berish imtihonlari jadvali e'lon qilindi.",
    content:
      "2025–2026 o'quv yili bitiruv malaka imtihonlari 2026-yil 10-iyundan boshlanadi. Bitiruvchi guruh talabalari o'z yo'nalishi bo'yicha nazariy va amaliy imtihonlardan o'tadi, muvaffaqiyatli topshirganlarga malaka guvohnomasi topshiriladi.\n\nImtihon jadvali texnikum ma'muriyatidan va rasmiy e'lonlar taxtasidan oldindan e'lon qilingan. Barcha talabalar imtihon sanasidan kamida 30 daqiqa oldin texnikumda bo'lishlari shart.\n\nQo'shimcha ma'lumot uchun guruh rahbarlariga murojaat qiling.",
  },
  {
    id: 2,
    slug: "kasbiy-mahorat-golibi-2026",
    title: "Texnikumimiz talabasi viloyat kasbiy mahorat musobaqasida g'olib bo'ldi",
    date: "2026-06-05",
    category: "Yutuq",
    excerpt:
      "Kompyuter tarmoqlari yo'nalishi bo'yicha o'tkazilgan viloyat bosqichida talabamiz birinchi o'rinni egalladi.",
    content:
      "Viloyat kasbiy mahorat musobaqasining kompyuter tarmoqlari yo'nalishi bo'yicha yakuniy bosqichi muvaffaqiyatli tugadi. Texnikumimizning 2-kurs talabasi birinchi o'rinni qo'lga kiritdi.\n\nTalaba tarmoq sozlash va nosozliklarni bartaraf etish bo'yicha amaliy topshiriqlarni to'liq bajarib, hakamlar hay'atidan yuqori baho oldi. U respublika bosqichida texnikumimizni va viloyatimizni vakillik qiladi.\n\nTexnikum direktori va o'qituvchilar jamoasi g'olibni tabriklab, muvaffaqiyatlari uchun minnatdorchilik bildirdi.",
  },
  {
    id: 3,
    slug: "yangi-kompyuter-sinfi-2026",
    title: "Yangi kompyuter sinfi ochildi",
    date: "2026-05-28",
    category: "Yangilik",
    excerpt:
      "Zamonaviy jihozlangan 30 o'rinli kompyuter sinfi talabalar foydalanishiga topshirildi.",
    content:
      "Texnikumimizda zamonaviy 30 o'rinli kompyuter sinfi rasman ochildi. Sinf yangi avlod kompyuterlari, tezkor internet ulanishi va multimedia jihozlari bilan to'liq jihozlangan.\n\nYangi sinf \"Kompyuter tarmoqlari va tizimlari\" yo'nalishi amaliy mashg'ulotlarini yanada samarali o'tkazish imkonini beradi. Bundan tashqari, talabalar darsdan tashqari vaqtlarda ham kompyuter sinfidan foydalanishlari mumkin bo'ladi.\n\nSinfni jihozlash loyihasi mahalliy hokimiyat va ijtimoiy hamkorlar yordami bilan amalga oshirildi.",
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
    { time: "08:30 – 09:15", subject: "Kompyuter tarmoqlari (amaliyot)", teacher: "Z. Hamidova", room: "Ustaxona-2" },
    { time: "09:25 – 10:10", subject: "Adabiyot", teacher: "S. Yusupov", room: "105" },
    { time: "10:20 – 11:05", subject: "Informatika", teacher: "A. Qodirov", room: "301" },
  ],
  Payshanba: [
    { time: "08:30 – 09:15", subject: "Matematika", teacher: "N. Karimova", room: "201" },
    { time: "09:25 – 10:10", subject: "Kasb etikasi", teacher: "M. Sodiqova", room: "107" },
  ],
  Juma: [
    { time: "08:30 – 09:15", subject: "Ingliz tili", teacher: "D. Ahmedova", room: "302" },
    { time: "09:25 – 10:10", subject: "Jismoniy tarbiya", teacher: "R. Aliyev", room: "Sport zal" },
  ],
  Shanba: [
    { time: "08:30 – 09:15", subject: "Tarbiyaviy soat", teacher: "Guruh rahbari", room: "—" },
  ],
};
