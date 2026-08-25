import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

// Middleware Edge runtime'da ishlaydi — shu sababli `lib/auth.ts` faqat
// `jose` va Web Crypto'ga tayanadi (`node:crypto` bu yerda mavjud emas).
//
// Ilgari cookie ichida ADMIN_SECRET'ning O'ZI turardi va oddiy `===` bilan
// solishtirilardi. Endi cookie'da imzolangan, muddati cheklangan JWT bor:
// sirning o'zi hech qachon brauzerga yuborilmaydi va token muddati o'tgach
// avtomatik yaroqsiz bo'ladi.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const session = await verifySessionToken(token);

  // /admin/login — himoyalanmaydi
  if (pathname === "/admin/login") {
    if (session) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Qolgan barcha /admin/* sahifalari uchun haqiqiy sessiya talab qilinadi
  if (!session) {
    const loginUrl = new URL("/admin/login", req.url);
    // Ochiq yo'naltirish (open redirect) bo'lmasligi uchun faqat sayt ichidagi
    // nisbiy yo'l uzatiladi.
    if (pathname.startsWith("/admin/")) {
      loginUrl.searchParams.set("from", pathname);
    }

    const res = NextResponse.redirect(loginUrl);
    // Muddati o'tgan/buzilgan cookie qayta yuborilmasin
    if (token) res.cookies.delete(ADMIN_COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
