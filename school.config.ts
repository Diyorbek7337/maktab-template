// ============================================
// TEXNIKUM KONFIGURATSIYASI
// Yangi kasb-hunar texnikumiga sotganda FAQAT shu fayldagi
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

export type OlympiadLevel = "Texnikum" | "Tuman" | "Viloyat" | "Respublika" | "Xalqaro";
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

export interface Major {
  name: string;         // "Kompyuter tarmoqlari va tizimlari"
  duration: string;     // "2 yil 10 oy"
  qualification: string; // beriladigan malaka: "Tarmoq muhandisi yordamchisi"
  description: string;
  image?: string;
}

export interface SchoolTheme {
  primary: string; // asosiy rang (HEX), masalan "#2563eb"
  primaryHover: string; // hover rangi (HEX)
}

export interface SchoolStat {
  value: string; // "1200+"
  label: string; // "Talabalar"
}

export interface SchoolConfig {
  // --- Asosiy ma'lumotlar ---
  number: string;
  name: string;
  shortName: string;
  slogan: string;
  logo?: string;        // texnikum gerbi yoki logotipi: "/gerb.png"
  schoolImage?: string; // texnikum binosi rasmi URL

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

  // --- Texnikum tarixi ---
  history: HistoryEvent[];

  // --- Kasb-hunar yo'nalishlari ---
  majors: Major[];

  // --- Eng yaxshi o'qituvchilar ---
  teachers: Teacher[];

  // --- Olimpiada va kasbiy mahorat musobaqalari g'oliblari ---
  olympiadWinners: OlympiadWinner[];

  // --- To'garaklar va seksiyalar ---
  clubs: Club[];

  // --- Bitiruvchilar ---
  alumni: Alumni[];

  // --- Foydali manbalar ---
  usefulLinks: UsefulLink[];

  // --- MAXFIY qiymatlar bu faylda SAQLANMAYDI ---
  // Bu fayl git'ga commit qilinadi, shuning uchun sirlar .env.local da:
  //   ADMIN_PASSWORD       — admin panelga kirish paroli
  //   ADMIN_SECRET         — sessiya JWT'sini imzolash kaliti
  //   TELEGRAM_BOT_TOKEN   — @BotFather dan olingan token
  //   TELEGRAM_CHAT_ID     — bildirishnoma yuboriladigan chat ID

  // --- Havolalar ---
  social: SocialLinks;
  mapEmbedUrl?: string;

  // --- Brending ---
  theme: SchoolTheme;
}

// ============================================
// QIYMATLAR — har bir texnikum uchun shu yerni tahrirlang
// ============================================

export const schoolConfig: SchoolConfig = {
  number: "1",
  name: "Sho'rchi tumani 1-son kasb-hunar texnikumi",
  shortName: "1-KHT",
  slogan: "Kasb — kelajak kaliti. Har bir talabaning muvaffaqiyati uchun.",
  logo: "/gerb.png", // texnikum gerbi — public/gerb.png fayliga qo'ying
  schoolImage: "", // texnikum binosi rasmi: "/school.jpg" yoki tashqi URL

  address: "Surxondaryo viloyati, Sho'rchi tumani, Mustaqillik ko'chasi, 1-uy",
  phones: ["+998 90 123 45 67", "+998 91 234 56 78"],
  email: "info@texnikum1.uz",
  workingHours: "Dushanba–Shanba, 08:00–18:00",

  director: {
    name: "Aliyev Vali Akramovich",
    position: "Texnikum direktori",
    quote:
      "Texnikumimiz eshigi har bir yoshga ochiq. Biz nazariy bilim bilan birga amaliy kasb-mahorat beramiz — bitiruvchilarimiz ish bozorida talab qilinadi.",
  },

  administration: [
    { name: "Aliyev Vali Akramovich", position: "Direktor" },
    { name: "Karimova Nilufar Hasanovna", position: "O'quv-ishlab chiqarish ishlari bo'yicha direktor o'rinbosari" },
    { name: "Tursunov Bobur Salimovich", position: "Tarbiya ishlari bo'yicha direktor o'rinbosari" },
    { name: "Yusupova Sarvinoz Mirzaevna", position: "Bosh buxgalter" },
    { name: "Qodirov Anvar Behruzovich", position: "Xo'jalik mudiri" },
    { name: "Hamidova Zulfiya Rahimovna", position: "Psixolog" },
  ],

  stats: [
    { value: "1200+", label: "Talabalar" },
    { value: "85", label: "O'qituvchilar" },
    // Diqqat: bu raqam quyidagi `majors` ro'yxati bilan mos bo'lishi kerak.
    // Yangi yo'nalish qo'shsangiz, shu qiymatni ham yangilang.
    { value: "8", label: "Yo'nalishlar" },
    { value: "30+", label: "Yillik tajriba" },
  ],

  history: [
    {
      year: 1995,
      title: "Texnikum tashkil etildi",
      description: "Sho'rchi tumanida 1-son kasb-hunar texnikumi rasman ochildi. Dastlabki yili 480 nafar talaba ta'lim oldi.",
    },
    {
      year: 2001,
      title: "Yangi o'quv-ishlab chiqarish binosi qurildi",
      description: "3 qavatli zamonaviy o'quv binosi va ustaxonalar ishga tushirildi, talabalar soni 800 nafardan oshdi.",
    },
    {
      year: 2008,
      title: "Kompyuter sinfi ochildi",
      description: "Birinchi kompyuter sinfi jihozlandi va axborot texnologiyalari yo'nalishi tashkil etildi.",
    },
    {
      year: 2015,
      title: "Viloyat ko'rik-tanlovida g'olib",
      description: "Texnikumimiz \"Yilning eng yaxshi kasb-hunar texnikumi\" tanlovida viloyat bosqichida birinchi o'rinni egalladi.",
    },
    {
      year: 2019,
      title: "Zamonaviy ustaxonalar",
      description: "Elektr-texnika, tikuvchilik va avtomexanika yo'nalishlari uchun yangi jihozlangan ustaxonalar talabalarga topshirildi.",
    },
    {
      year: 2023,
      title: "Raqamli ta'lim bosqichi",
      description: "Barcha sinflarda interaktiv taxtalar o'rnatildi, o'qituvchilar raqamli ta'lim texnologiyalariga o'qitildi.",
    },
  ],

  majors: [
    {
      name: "Kompyuter tarmoqlari va tizimlari",
      duration: "2 yil 10 oy",
      qualification: "Tarmoq muhandisi yordamchisi",
      description: "Kompyuter tarmoqlarini o'rnatish va sozlash, tizim ma'muriyati, veb-dasturlash asoslari.",
    },
    {
      name: "Buxgalteriya hisobi va audit",
      duration: "2 yil 10 oy",
      qualification: "Buxgalter yordamchisi",
      description: "Moliyaviy hisobot, 1C dasturi, soliq hisob-kitobi va audit asoslari.",
    },
    {
      name: "Tikuvchilik ishlab chiqarish texnologiyasi",
      duration: "1 yil 10 oy",
      qualification: "Tikuvchi-texnolog",
      description: "Kiyim-kechak konstruksiyasi, tikuv mashinalarida ishlash, zamonaviy modellashtirish.",
    },
    {
      name: "Avtomobillarga texnik xizmat ko'rsatish va ta'mirlash",
      duration: "2 yil 10 oy",
      qualification: "Avtomexanik",
      description: "Zamonaviy avtomobil diagnostikasi, dvigatel va elektr jihozlarini ta'mirlash.",
    },
    {
      name: "Elektr ta'minoti tizimlari",
      duration: "2 yil 10 oy",
      qualification: "Elektrik-montyor",
      description: "Elektr tarmoqlarini o'rnatish, xavfsizlik texnikasi, sanoat va maishiy elektr jihozlari.",
    },
    {
      name: "Oshpazlik va restoran xizmati",
      duration: "1 yil 10 oy",
      qualification: "Oshpaz",
      description: "Milliy va jahon oshxonasi taomlari, oshxona sanitariyasi, restoran xizmat ko'rsatish madaniyati.",
    },
    {
      name: "Sartaroshlik va go'zallik xizmati",
      duration: "1 yil 10 oy",
      qualification: "Sartarosh-stilist",
      description: "Zamonaviy soch turmagi, bo'yash texnikalari, mijozlar bilan ishlash madaniyati.",
    },
    {
      name: "Qurilish va ta'mirlash ishlari",
      duration: "2 yil 10 oy",
      qualification: "Qurilish ustasi",
      description: "Bino qurilishi asoslari, ichki-tashqi pardozlash ishlari, zamonaviy qurilish materiallari.",
    },
  ],

  teachers: [
    {
      name: "Karimova Nilufar Hasanovna",
      subject: "Kompyuter tarmoqlari",
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
      subject: "Avtomexanika",
      experience: 15,
      achievement: "\"Yilning eng yaxshi ustoz-murabbiysi\" 2023",
    },
    {
      name: "Hamidova Zulfiya Rahimovna",
      subject: "Buxgalteriya hisobi",
      experience: 10,
      achievement: "Respublika metodist o'qituvchisi",
    },
    {
      name: "Olimov Farhodjon Hamidovich",
      subject: "Elektr ta'minoti",
      experience: 14,
      achievement: "Kasbiy mahorat musobaqalarida 3 marta g'oliblar tayyorlagan",
    },
    {
      name: "Sodiqova Malika Norqo'zievna",
      subject: "Tikuvchilik texnologiyasi",
      experience: 20,
      achievement: "O'zbekiston Respublikasi Faxriy o'qituvchisi",
    },
  ],

  olympiadWinners: [
    { student: "Rahimov Jasur", subject: "Veb-dasturlash", level: "Respublika", place: 1, year: 2026, teacher: "Karimova N." },
    { student: "Yusupova Kamola", subject: "Ingliz tili", level: "Viloyat", place: 1, year: 2026, teacher: "Ahmedova D." },
    { student: "Normatov Sherzod", subject: "Avtomexanika", level: "Viloyat", place: 2, year: 2025, teacher: "Tursunov B." },
    { student: "Abdullayeva Nilufar", subject: "Buxgalteriya hisobi", level: "Tuman", place: 1, year: 2026, teacher: "Hamidova Z." },
    { student: "Xoliqov Doniyor", subject: "Elektr montaj ishlari", level: "Viloyat", place: 3, year: 2025, teacher: "Olimov F." },
    { student: "Mirzayeva Sarvinoz", subject: "Tikuvchilik texnologiyasi", level: "Respublika", place: 2, year: 2024, teacher: "Sodiqova M." },
    { student: "Toshmatov Ulug'bek", subject: "Kompyuter tarmoqlari", level: "Xalqaro", place: 3, year: 2024 },
    { student: "Qodirov Asilbek", subject: "Oshpazlik mahorati", level: "Viloyat", place: 1, year: 2025 },
  ],

  alumni: [
    {
      name: "Karimov Sherzod",
      graduationYear: 2010,
      achievement: "Tarmoq muhandisi bo'lib ishga joylashdi, keyinchalik Toshkent axborot texnologiyalari universitetini sirtqi tugatdi",
      workplace: "\"Uzbektelekom\" AJ",
    },
    {
      name: "Nazarova Dilnoza",
      graduationYear: 2014,
      achievement: "Buxgalteriya yo'nalishini tugatgan, hozirda bosh buxgalter",
      workplace: "Surxondaryo viloyat sanoat korxonasi",
    },
    {
      name: "Toshmatov Bobur",
      graduationYear: 2016,
      achievement: "Kompyuter tarmoqlari yo'nalishi bitiruvchisi, IT mutaxassisi",
      workplace: "IT Park Tashkent",
    },
    {
      name: "Yusupova Maftuna",
      graduationYear: 2018,
      achievement: "Tikuvchilik texnologiyasini tugatgan, o'z tikuv atelyesini ochgan tadbirkor",
      workplace: "\"Maftuna Style\" atelye",
    },
    {
      name: "Qodirov Asilbek",
      graduationYear: 2020,
      achievement: "Avtomexanika yo'nalishi bitiruvchisi, ustaxona rahbari",
      workplace: "\"AvtoService Plus\" MChJ",
    },
    {
      name: "Rahimova Sarvinoz",
      graduationYear: 2022,
      achievement: "Oshpazlik yo'nalishini a'lo baholarga tugatgan, restoran oshxonasi boshlig'i",
      workplace: "Buyuk Ipak Yo'li mehmonxonasi",
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
      description: "Texnikum chempionati va tuman musobaqalariga tayyorgarlik ko'rish, jamoaviy o'yin madaniyati.",
      category: "Sport",
      teacher: "Razzaqov Sanjar",
      schedule: "Har kuni 16:00–18:00",
      capacity: 30,
    },
    {
      name: "Rasm to'garagi",
      description: "Suvli bo'yoq, qalam va raqamli rasm chizish. Texnikum ko'rik-tanlovlariga ishtirok.",
      category: "San'at",
      teacher: "Nazarova Gulnora",
      schedule: "Juma, Shanba 14:00–16:00",
      capacity: 15,
    },
    {
      name: "Tadbirkorlik asoslari",
      description: "O'z biznesini boshlash, moliyaviy savodxonlik va startap g'oyalarini rivojlantirish.",
      category: "Fan",
      teacher: "Karimova Nilufar",
      schedule: "Seshanba, Juma 15:00–17:00",
      capacity: 18,
    },
    {
      name: "Voleybol",
      description: "Qizlar va yigitlar uchun voleybol musobaqa va mashg'ulotlari.",
      category: "Sport",
      teacher: "Ibragimova Mohira",
      schedule: "Dushanba, Chorshanba, Juma 15:30–17:30",
      capacity: 24,
    },
  ],

  usefulLinks: [
    {
      title: "O'zbekiston Respublikasi Prezidentining rasmiy sayti",
      url: "https://president.uz/uz",
      logo: "https://president.uz/favicon.ico",
    },
    {
      title: "Maktabgacha va maktab ta'limi vazirligi",
      url: "https://gov.uz/oz/uzedu",
      logo: "https://gov.uz/favicon.ico",
    },
    {
      title: "Oliy ta'lim, fan va innovatsiyalar vazirligi",
      url: "https://gov.uz/oz/edu",
      logo: "https://gov.uz/favicon.ico",
    },
    {
      title: "Yagona interaktiv davlat xizmatlari portali",
      url: "https://my.gov.uz/uz",
      logo: "https://my.gov.uz/favicon.ico",
    },
  ],

  social: {
    telegram: "https://t.me/texnikum1",
    instagram: "https://instagram.com/texnikum1",
    facebook: "https://facebook.com/texnikum1",
    youtube: "https://youtube.com/@texnikum1",
  },

  mapEmbedUrl: "",

  // Telegram bildirishnoma uchun: @BotFather dan bot yarating va tokenni
  // .env.local ga TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID sifatida qo'shing.

  theme: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
  },
};
