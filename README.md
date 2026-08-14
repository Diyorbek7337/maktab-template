# Maktab White-label shabloni (Next.js + Tailwind)

Bitta kod bazasi — har bir maktabga alohida sotiladigan sayt + admin panel.
Yangi maktab uchun **faqat `school.config.ts`** ni tahrirlaysiz: nom, manzil,
telefon, direktor, ijtimoiy havolalar **va rang**. Qolgan hamma narsa avtomatik
o'zgaradi.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # ishlab chiqarish uchun
```

- Bosh sahifa: `/`
- Admin panel: `/admin`
  - Yangilik qo'shish: `/admin/news`
  - Dars jadvali: `/admin/schedule`

## Yangi maktabga moslash

`school.config.ts` ni oching va qiymatlarni o'zgartiring. Masalan rangni:

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

## Eslatma

- Yangiliklar va dars jadvali hozir namuna ma'lumotlar bilan (`lib/data.ts`)
  va brauzer xotirasida (state) ishlaydi. Ishlab chiqarishda bularni
  baza/API ga ulang — UI tayyor.
- Bu tuzilma "har maktab = alohida build/deploy" rejasiga mos. Bitta
  deploy'dan subdomen bo'yicha ko'p maktab kerak bo'lsa, config'ni fayldan
  emas, subdomen bo'yicha tanlash kerak bo'ladi.
