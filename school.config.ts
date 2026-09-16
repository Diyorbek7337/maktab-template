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
  experience?: number; // yillik tajriba (noma'lum bo'lsa ko'rsatilmaydi)
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

// "Kasbiy" — texnikum yo'nalishiga oid amaliy to'garaklar (tikuvchilik, elektr montaj)
export type ClubCategory = "Kasbiy" | "Sport" | "San'at" | "Fan" | "Texnologiya" | "Til" | "Boshqa";

export interface Club {
  name: string;
  description?: string;
  category: ClubCategory;
  teacher?: string;   // mas'ul o'qituvchi
  schedule?: string;  // "Seshanba, Payshanba 15:00"
  capacity?: number;  // necha nafar qabul qilinadi
  image?: string;
}

export interface Major {
  name: string;         // "Kompyuter tarmoqlari va tizimlari"
  duration: string;     // "2 yil 10 oy"
  qualification: string; // bitiruvchiga beriladi: malaka yoki hujjat ("Kasbiy diplom")
  description?: string;
  workplaces?: string;  // bitiruvchilar qayerda ishlay oladi
  image?: string;
}

export interface Admission {
  period: string;       // "Iyun–Iyul"
  requirement: string;  // kimlar qabul qilinadi
  studyForm: string;    // "Kunduzgi, byudjet asosida"
  duration: string;     // "2 yil"
  document: string;     // bitirganda beriladigan hujjat
  benefits: string[];   // qo'shimcha imkoniyatlar
  chair?: { name: string; position: string; phone: string };
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
    /** Faqat direktorning o'z so'zlari bo'lsa to'ldiring — bo'sh qolsa ko'rsatilmaydi */
    quote?: string;
    phone?: string;
  };

  // --- Ma'muriyat ---
  administration: StaffMember[];

  // --- Sahifa raqamlari ---
  stats: SchoolStat[];

  // --- Texnikum tarixi ---
  history: HistoryEvent[];

  // --- Kasb-hunar yo'nalishlari ---
  majors: Major[];

  // --- Qabul (barcha yo'nalishlar uchun umumiy shartlar) ---
  admission: Admission;

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
  /** Xaritani Google Maps ilovasida ochish havolasi (yo'l topish uchun) */
  mapLink?: string;

  // --- Brending ---
  theme: SchoolTheme;
}

// ============================================
// QIYMATLAR — har bir texnikum uchun shu yerni tahrirlang
// ============================================

export const schoolConfig: SchoolConfig = {
  number: "1",
  name: "Sho'rchi tumani 1-son texnikumi",
  shortName: "1-son texnikum",
  slogan: "Kasb — kelajak kaliti. Har bir talabaning muvaffaqiyati uchun.",
  logo: "/gerb.png", // texnikum gerbi — public/gerb.png fayliga qo'ying
  schoolImage: "", // texnikum binosi rasmi: "/school.jpg" yoki tashqi URL

  address: "Surxondaryo viloyati, Sho'rchi tumani, Mustaqillik ko'chasi, 64-uy",
  phones: ["+998 99 679 33 81"],
  email: "info@texnikum1.uz",
  workingHours: "Dushanba–Shanba, 08:00–16:00",

  director: {
    name: "Avazov G'ulom Jovliyevich",
    position: "Texnikum direktori",
    phone: "+998 99 679 33 81",
  },

  administration: [
    { name: "Avazov G'ulom Jovliyevich", position: "Direktor, qabul komissiyasi raisi" },
  ],

  stats: [
    { value: "65", label: "O'qituvchilar" },
    { value: "17", label: "Ustalar" },
    { value: "12", label: "Ustaxonalar" },
    { value: "750", label: "Bitiruvchilar" },
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
      name: "Raqamli axborotlarni qayta ishlash ustasi",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
    },
    {
      name: "Tikuvchi",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Tekstil firmalari va shaxsiy tikuv sexlarida",
    },
    {
      name: "Elektromontyor",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Zavod va fabrikalarda",
    },
    {
      name: "Payvandlovchi",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Zavod va fabrikalarda",
    },
    {
      name: "Qurilish ishlari ishchisi",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Qurilish sohasi va qurilish firmalarida",
    },
    {
      name: "Pardozlovchi",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Qurilish sohasi va qurilish firmalarida",
    },
    {
      name: "Elevator, tegirmon, yorma va omuxta yem ishlab chiqarish",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Un zavodlari va shu kabi korxonalarda",
    },
    {
      name: "Bino va inshootlar pardozlovchisi",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Qurilish sohasi va qurilish firmalarida",
    },
    {
      name: "Kompyuter va IT",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Pochta va boshqa korxonalarda texnik xodim sifatida",
    },
    {
      name: "Avtomobil servisi",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Avtomobilga xizmat ko'rsatish ustaxonalari va zavodlarda",
    },
    {
      name: "Moda va tikuv ishlab chiqarish texnologiyasi",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Tekstil firmalari va shaxsiy tikuv sexlarida",
    },
    {
      name: "Metallga qayta ishlov berish",
      duration: "2 yil",
      qualification: "Kasbiy diplom",
      workplaces: "Zavod va fabrikalarda",
    },
  ],

  admission: {
    period: "Iyun–Iyul",
    requirement: "9-sinfni tamomlaganlar",
    studyForm: "Kunduzgi, byudjet asosida",
    duration: "2 yil",
    document: "Kasbiy diplom",
    benefits: [
      "Yevropada ishlash uchun yo'llanma beriladi",
      "Shu yo'nalishdagi universitetlarga 2-bosqichdan suhbat asosida, kontrakt asosida o'qishga qabul qilinadi",
    ],
    chair: {
      name: "Avazov G'ulom Jovliyevich",
      position: "Qabul komissiyasi raisi",
      phone: "+998 99 679 33 81",
    },
  },

  teachers: [
    {
      name: "Qo'chqorov Haqnazar",
      subject: "Elektromontyor",
      experience: 30,
      achievement: "Shogirdlari viloyat texnikumlari o'rtasidagi «Kasbim — faxrim» ko'rik-tanlovida 1-o'rinni egalladi",
    },
    {
      name: "Ismoilov Raxmatilla",
      subject: "Payvandlovchi",
      experience: 15,
      achievement: "Payvandlovchi kasbi bo'yicha xalqaro sertifikat sohibi",
    },
    {
      name: "Turopov Ilhom",
      subject: "Payvandlovchi",
      experience: 15,
      achievement: "Payvandlovchi kasbi bo'yicha xalqaro sertifikat sohibi",
    },
    {
      name: "Abdurahmonov Shohjahon",
      subject: "Informatika",
      achievement: "Oliy toifali o'qituvchi",
    },
    {
      name: "Usanov Maqsudjon",
      subject: "Informatika",
      experience: 5,
      achievement: "Oliy toifali o'qituvchi",
    },
    {
      name: "Shaymurodov Yigitali",
      subject: "Ingliz tili",
      experience: 5,
      achievement: "Oliy toifali o'qituvchi",
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
    { name: "Yosh elektrik", description: "Elektr montaj to'garagi", category: "Kasbiy", teacher: "Esonov Boysoat", schedule: "Chorshanba, 14:00–16:00" },
    { name: "Mohir qo'llar", description: "Tikuvchilik to'garagi", category: "Kasbiy", teacher: "Ibragimov Xosiyat", schedule: "Seshanba, 13:00–15:00" },
    { name: "Futbol", category: "Sport", teacher: "Choriyev To'rabek", schedule: "Juma, 14:00–16:00" },
    { name: "Foundation IELTS", category: "Til", teacher: "Nazarov Bobomurod", schedule: "Payshanba, 13:00–15:00" },
    { name: "Yosh Temurbeklar", description: "Tarix to'garagi", category: "Fan", teacher: "Xudoyorov Shavkat", schedule: "Dushanba, 14:00–16:00" },
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

  // Koordinata: 38.038355, 67.781066. `output=embed` — API kalitisiz ishlaydigan ko'rinish
  mapEmbedUrl: "https://maps.google.com/maps?q=38.038355,67.781066&z=16&output=embed",
  mapLink: "https://maps.google.com/maps?q=38.038355,67.781066&ll=38.038355,67.781066&z=16",

  // Telegram bildirishnoma uchun: @BotFather dan bot yarating va tokenni
  // .env.local ga TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID sifatida qo'shing.

  theme: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
  },
};
