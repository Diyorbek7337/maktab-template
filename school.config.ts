// ============================================
// MAKTAB KONFIGURATSIYASI
// Yangi maktabga sotganda FAQAT shu fayldagi
// qiymatlarni o'zgartiring va xostingga yuklang.
// Nom, manzil, telefon, direktor, havolalar VA rang —
// hammasi shu yerdan butun saytga (va admin panelga) tarqaladi.
// ============================================

export interface SocialLinks {
  telegram?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export interface StaffMember {
  name: string;
  position: string;
  image?: string; // foto URL (ixtiyoriy)
}

export interface UsefulLink {
  title: string;
  url: string;
  logo?: string;
}

export interface HistoryEvent {
  year: number;
  title: string;
  description?: string;
}

export interface Teacher {
  name: string;
  subject: string;
  experience: number; // yillik tajriba
  achievement?: string; // unvon yoki yutuq
  image?: string;
}

export type OlympiadLevel = "Maktab" | "Tuman" | "Viloyat" | "Respublika" | "Xalqaro";
export type OlympiadPlace = 1 | 2 | 3;

export interface OlympiadWinner {
  student: string;
  subject: string;
  level: OlympiadLevel;
  place: OlympiadPlace;
  year: number;
  teacher?: string;
  image?: string;
}

export interface Alumni {
  name: string;
  graduationYear: number;
  achievement: string;  // "Toshkent tibbiyot akademiyasini tugatgan, kardiolog"
  workplace?: string;   // "Respublika ixtisoslashtirilgan kasalxonasi"
  image?: string;
}

export type ClubCategory = "Sport" | "San'at" | "Fan" | "Texnologiya" | "Til" | "Boshqa";

export interface Club {
  name: string;
  description: string;
  category: ClubCategory;
  teacher?: string;   // mas'ul o'qituvchi
  schedule?: string;  // "Seshanba, Payshanba 15:00"
  capacity?: number;  // necha nafar qabul qilinadi
  image?: string;
}

export interface SchoolTheme {
  primary: string; // asosiy rang (HEX), masalan "#2563eb"
  primaryHover: string; // hover rangi (HEX)
}

export interface SchoolStat {
  value: string; // "1200+"
  label: string; // "O'quvchilar"
}

export interface SchoolConfig {
  // --- Asosiy ma'lumotlar ---
  number: string;
  name: string;
  shortName: string;
  slogan: string;
  logo?: string;        // maktab gerbi yoki logotipi: "/gerb.png"
  schoolImage?: string; // maktab binosi rasmi URL

  // --- Aloqa ---
  address: string;
  phones: string[];
  email: string;
  workingHours: string;

  // --- Rahbariyat ---
  director: {
    name: string;
    position: string;
    quote: string;
  };

  // --- Ma'muriyat ---
  administration: StaffMember[];

  // --- Sahifa raqamlari ---
  stats: SchoolStat[];

  // --- Maktab tarixi ---
  history: HistoryEvent[];

  // --- Eng yaxshi o'qituvchilar ---
  teachers: Teacher[];

  // --- Olimpiada g'oliblari ---
  olympiadWinners: OlympiadWinner[];

  // --- To'garaklar va seksiyalar ---
  clubs: Club[];

  // --- Bitiruvchilar ---
  alumni: Alumni[];

  // --- Foydali manbalar ---
  usefulLinks: UsefulLink[];

  // --- Telegram bildirishnoma (xabar yuborilganda) ---
  telegramNotify?: {
    botToken: string; // @BotFather dan olingan token
    chatId: string;   // admin chat ID
  };

  // --- Havolalar ---
  social: SocialLinks;
  mapEmbedUrl?: string;

  // --- Brending ---
  theme: SchoolTheme;
}

// ============================================
// QIYMATLAR — har bir maktab uchun shu yerni tahrirlang
// ============================================

export const schoolConfig: SchoolConfig = {
  number: "15",
  name: "Sho'rchi tumani 15-umumiy o'rta ta'lim maktabi",
  shortName: "15-maktab",
  slogan: "Bilim — kelajak kaliti. Har bir o'quvchining muvaffaqiyati uchun.",
  logo: "/gerb.png", // maktab gerbi — public/gerb.png fayliga qo'ying
  schoolImage: "", // maktab binosi rasmi: "/school.jpg" yoki tashqi URL

  address: "Surxondaryo viloyati, Sho'rchi tumani, Mustaqillik ko'chasi, 1-uy",
  phones: ["+998 90 123 45 67", "+998 91 234 56 78"],
  email: "info@maktab15.uz",
  workingHours: "Dushanba–Shanba, 08:00–18:00",

  director: {
    name: "Aliyev Vali Akramovich",
    position: "Maktab direktori",
    quote:
      "Maktabimiz eshigi har bir bola uchun ochiq. Biz nafaqat bilim beramiz, balki kelajak fuqarolarini tarbiyalaymiz.",
  },

  administration: [
    { name: "Aliyev Vali Akramovich", position: "Direktor" },
    { name: "Karimova Nilufar Hasanovna", position: "O'quv ishlari bo'yicha direktor o'rinbosari" },
    { name: "Tursunov Bobur Salimovich", position: "Tarbiya ishlari bo'yicha direktor o'rinbosari" },
    { name: "Yusupova Sarvinoz Mirzaevna", position: "Bosh buxgalter" },
    { name: "Qodirov Anvar Behruzovich", position: "Xo'jalik mudiri" },
    { name: "Hamidova Zulfiya Rahimovna", position: "Psixolog" },
  ],

  stats: [
    { value: "1200+", label: "O'quvchilar" },
    { value: "85", label: "O'qituvchilar" },
    { value: "40", label: "Sinflar" },
    { value: "30+", label: "Yillik tajriba" },
  ],

  history: [
    {
      year: 1995,
      title: "Maktab tashkil etildi",
      description: "Sho'rchi tumanida 15-umumiy o'rta ta'lim maktabi rasman ochildi. Dastlabki yili 480 nafar o'quvchi ta'lim oldi.",
    },
    {
      year: 2001,
      title: "Yangi o'quv binosi qurildi",
      description: "3 qavatli zamonaviy o'quv binosi ishga tushirildi, o'quvchilar soni 800 nafardan oshdi.",
    },
    {
      year: 2008,
      title: "Kompyuter sinfi ochildi",
      description: "Birinchi kompyuter sinfi jihozlandi va informatika fani o'quv dasturiga kiritildi.",
    },
    {
      year: 2015,
      title: "Viloyat ko'rik-tanlovida g'olib",
      description: "Maktabimiz \"Yilning eng yaxshi maktabi\" tanlovida viloyat bosqichida birinchi o'rinni egalladi.",
    },
    {
      year: 2019,
      title: "Zamonaviy laboratoriyalar",
      description: "Fizika, kimyo va biologiya fanlari uchun yangi jihozlangan laboratoriyalar o'quvchilarga topshirildi.",
    },
    {
      year: 2023,
      title: "Raqamli ta'lim bosqichi",
      description: "Barcha sinflarda interaktiv taxtalar o'rnatildi, o'qituvchilar raqamli ta'lim texnologiyalariga o'qitildi.",
    },
  ],

  teachers: [
    {
      name: "Karimova Nilufar Hasanovna",
      subject: "Matematika",
      experience: 18,
      achievement: "O'zbekiston Respublikasi xalq ta'limi a'lochisi",
    },
    {
      name: "Ahmedova Dilnoza Baxtiyorovna",
      subject: "Ingliz tili",
      experience: 12,
      achievement: "Viloyat ko'rik-tanlovida I o'rin",
    },
    {
      name: "Tursunov Bobur Salimovich",
      subject: "Fizika",
      experience: 15,
      achievement: "\"Yilning eng yaxshi o'qituvchisi\" 2023",
    },
    {
      name: "Hamidova Zulfiya Rahimovna",
      subject: "Biologiya",
      experience: 10,
      achievement: "Respublika metodist o'qituvchisi",
    },
    {
      name: "Olimov Farhodjon Hamidovich",
      subject: "Kimyo",
      experience: 14,
      achievement: "Viloyat olimpiadasida 3 marta g'oliblar tayyorlagan",
    },
    {
      name: "Sodiqova Malika Norqo'zievna",
      subject: "Ona tili va adabiyot",
      experience: 20,
      achievement: "O'zbekiston Respublikasi Faxriy o'qituvchisi",
    },
  ],

  olympiadWinners: [
    { student: "Rahimov Jasur", subject: "Matematika", level: "Respublika", place: 1, year: 2026, teacher: "Karimova N." },
    { student: "Yusupova Kamola", subject: "Ingliz tili", level: "Viloyat", place: 1, year: 2026, teacher: "Ahmedova D." },
    { student: "Normatov Sherzod", subject: "Fizika", level: "Viloyat", place: 2, year: 2025, teacher: "Tursunov B." },
    { student: "Abdullayeva Nилуфар", subject: "Biologiya", level: "Tuman", place: 1, year: 2026, teacher: "Hamidova Z." },
    { student: "Xoliqov Doniyor", subject: "Kimyo", level: "Viloyat", place: 3, year: 2025, teacher: "Olimov F." },
    { student: "Mirzayeva Sarvinoz", subject: "Ona tili", level: "Respublika", place: 2, year: 2024, teacher: "Sodiqova M." },
    { student: "Toshmatov Ulug'bek", subject: "Informatika", level: "Xalqaro", place: 3, year: 2024 },
    { student: "Qodirov Asilbek", subject: "Tarix", level: "Viloyat", place: 1, year: 2025 },
  ],

  alumni: [
    {
      name: "Karimov Sherzod",
      graduationYear: 2010,
      achievement: "Toshkent davlat texnika universiteti, muhandis",
      workplace: "\"Uzbekneftegaz\" MJ",
    },
    {
      name: "Nazarova Dilnoza",
      graduationYear: 2014,
      achievement: "Toshkent tibbiyot akademiyasi, shifokor",
      workplace: "Surxondaryo viloyat klinik kasalxonasi",
    },
    {
      name: "Toshmatov Bobur",
      graduationYear: 2016,
      achievement: "Respublika matematika olimpiadasi g'olibi, IT mutaxassisi",
      workplace: "IT Park Tashkent",
    },
    {
      name: "Yusupova Maftuna",
      graduationYear: 2018,
      achievement: "O'zbekiston Milliy universiteti, huquqshunos",
      workplace: "Surxondaryo viloyat prokuraturasi",
    },
    {
      name: "Qodirov Asilbek",
      graduationYear: 2020,
      achievement: "INHA universiteti, iqtisodchi",
      workplace: "Xalqaro Moliya korporatsiyasi",
    },
    {
      name: "Rahimova Sarvinoz",
      graduationYear: 2022,
      achievement: "Westminster universiteti O'zbekistonda, marketing mutaxassisi",
      workplace: "Buyuk Ipak Yo'li Travel",
    },
  ],

  clubs: [
    {
      name: "Robototexnika",
      description: "Lego Mindstorms va Arduino yordamida robot yasash, dasturlash asoslarini o'rganish.",
      category: "Texnologiya",
      teacher: "Holmatov Jasur",
      schedule: "Seshanba, Payshanba 15:00–17:00",
      capacity: 20,
    },
    {
      name: "Ingliz tili klubi",
      description: "Chet tili muloqoti, ingliz tilidagi filmlar tahlili va nutq madaniyatini rivojlantirish.",
      category: "Til",
      teacher: "Ahmedova Dilnoza",
      schedule: "Dushanba, Chorshanba 15:00–16:30",
      capacity: 25,
    },
    {
      name: "Mini futbol",
      description: "Maktab chempionati va tuman musobaqalariga tayyorgarlik ko'rish, jamoaviy o'yin madaniyati.",
      category: "Sport",
      teacher: "Razzaqov Sanjar",
      schedule: "Har kuni 16:00–18:00",
      capacity: 30,
    },
    {
      name: "Rasm to'garagi",
      description: "Suvli bo'yoq, qalam va raqamli rasm chizish. Maktab ko'rik-tanlovlariga ishtirok.",
      category: "San'at",
      teacher: "Nazarova Gulnora",
      schedule: "Juma, Shanba 14:00–16:00",
      capacity: 15,
    },
    {
      name: "Matematika olimpiadasi",
      description: "Tuman, viloyat va respublika olimpiadalariga chuqur tayyorgarlik ko'rish.",
      category: "Fan",
      teacher: "Karimova Nilufar",
      schedule: "Seshanba, Juma 15:00–17:00",
      capacity: 18,
    },
    {
      name: "Voleybol",
      description: "Qizlar va o'g'il bolalar uchun voleybol musobaqa va mashg'ulotlari.",
      category: "Sport",
      teacher: "Ibragimova Mohira",
      schedule: "Dushanba, Chorshanba, Juma 15:30–17:30",
      capacity: 24,
    },
  ],

  usefulLinks: [
    {
      title: "O'zbekiston Respublikasi Prezidentining rasmiy sayti",
      url: "https://president.uz",
      logo: "https://president.uz/favicon.ico",
    },
    {
      title: "O'zbekiston Respublikasi Xalq ta'lim vazirligi rasmiy sayti",
      url: "https://uzedu.uz",
      logo: "https://uzedu.uz/favicon.ico",
    },
    {
      title: "Yagona interaktiv davlat xizmatlari portali",
      url: "https://my.gov.uz",
      logo: "https://my.gov.uz/favicon.ico",
    },
    {
      title: "Maktab ta'limi jurnali",
      url: "https://maktab.uz",
      logo: "https://maktab.uz/favicon.ico",
    },
    {
      title: "Edu.uz — ta'lim portali",
      url: "https://edu.uz",
      logo: "https://edu.uz/favicon.ico",
    },
  ],

  social: {
    telegram: "https://t.me/maktab15",
    instagram: "https://instagram.com/maktab15",
    facebook: "https://facebook.com/maktab15",
    youtube: "https://youtube.com/@maktab15",
  },

  mapEmbedUrl: "",

  // Telegram bildirishnoma uchun: @BotFather dan bot yarating
  // telegramNotify: { botToken: "123456:ABC...", chatId: "-1001234567890" },

  theme: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
  },
};
