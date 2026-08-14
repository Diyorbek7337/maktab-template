import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  // /admin/login sahifasi himoyalanmaydi
  if (isLoginPage) {
    // Allaqachon kirgan bo'lsa — admin'ga yo'naltir
    const session = req.cookies.get("admin_session")?.value;
    const secret = process.env.ADMIN_SECRET;
    if (session && secret && session === secret) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Boshqa barcha /admin/* sahifalari uchun cookie tekshir
  const session = req.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_SECRET;

  if (!session || !secret || session !== secret) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
