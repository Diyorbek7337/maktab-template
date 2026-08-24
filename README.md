# Kasb-hunar texnikumi White-label shabloni (Next.js + Tailwind + Firebase)

Bitta kod bazasi — har bir kasb-hunar texnikumiga alohida sotiladigan sayt + admin panel.
Yangi texnikum uchun **faqat `school.config.ts`** ni tahrirlaysiz: nom, manzil,
telefon, direktor, yo'nalishlar, ijtimoiy havolalar **va rang**. Qolgan hamma narsa
avtomatik o'zgaradi.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # ishlab chiqarish uchun
```

- Bosh sahifa: `/`
- Admin panel: `/admin`
  - Yo'nalishlar: `/admin/majors`
  - Yangilik qo'shish: `/admin/news`
  - Dars jadvali: `/admin/schedule`

## Yangi texnikumga moslash

`school.config.ts` ni oching va qiymatlarni o'zgartiring — jumladan `majors`
massivini o'z yo'nalishlaringiz (nomi, davomiyligi, beriladigan malaka,
tavsifi) bilan almashtiring. Rangni o'zgartirish uchun:

```ts
theme: {
  primary: "#eab308",      // sariq
  primaryHover: "#ca8a04",
}
```

Bosh sahifa ham, admin panel ham bir xilda shu rangga bo'yaladi —
chunki ikkalasi ham faqat `bg-primary`, `text-primary`, `hover:bg-primary-hover`
kabi dinamik klasslardan foydalanadi, hech qayerda qotirilgan (hardcode) rang yo'q.

## Rang qanday ishlaydi (texnik izoh)

1. `school.config.ts` da rang HEX (`#2563eb`) ko'rinishida.
2. `lib/theme.ts` uni RGB kanallariga (`37 99 235`) aylantiradi.
3. `app/layout.tsx` `<html>` ga `--primary-color` / `--primary-hover` ni o'rnatadi.
4. `tailwind.config.js` `primary` ni shu o'zgaruvchilarga ulaydi
   (`rgb(var(--primary-color) / <alpha-value>)`) — shu sabab `bg-primary/10`
   kabi shaffoflik ham ishlaydi.

`:root` (globals.css) dagi qiymatlar shunchaki zaxira (fallback) —
amalda config'dagi rang ustidan yoziladi.

## Ma'lumotlar bazasi (Firebase)

Yangiliklar, galereya, yo'nalishlar, o'qituvchilar, musobaqa g'oliblari,
bitiruvchilar va boshqa bo'limlar Firestore'ga saqlanadi (admin panel
orqali boshqariladi). `.env.local` ga Firebase loyihangiz kalitlarini
qo'shing — namuna uchun `.env.local.example`ga qarang (agar mavjud bo'lsa)
yoki `lib/firebase.ts` dagi o'zgaruvchi nomlariga qarab o'zingiz yarating.

Admin login `ADMIN_PASSWORD` (parol) va `ADMIN_SECRET` (sessiya kaliti)
muhit o'zgaruvchilari orqali ishlaydi — ikkalasi ham `.env.local`da,
kodga yozilmaydi.

## Eslatma

- Firestore bo'sh bo'lganda (yangi loyiha) sayt `school.config.ts` dagi
  namuna ma'lumotlarni ko'rsatadi — bu shunchaki boshlang'ich holat, admin
  paneldan o'z ma'lumotlaringizni qo'shishingiz bilan ular almashadi.
- Bu tuzilma "har texnikum = alohida build/deploy" rejasiga mos. Bitta
  deploy'dan subdomen bo'yicha ko'p texnikum kerak bo'lsa, config'ni
  fayldan emas, subdomen bo'yicha tanlash kerak bo'ladi.
