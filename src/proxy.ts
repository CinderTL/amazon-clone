import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "mh_session";

async function verifyRole(token: string): Promise<string | null> {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return (payload.role as string) || null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const role = token ? await verifyRole(token) : null;

  if (pathname.startsWith("/seller")) {
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "SELLER" && role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/account") || pathname.startsWith("/checkout") || pathname === "/cart") {
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/seller/:path*", "/account/:path*", "/checkout/:path*", "/cart"],
};
