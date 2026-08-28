import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// UX-level gate only. The real security boundary is the requireRole()/requireSuperAdmin()
// check inside every Server Action and admin layout — see lib/auth-guards.ts.
export default auth((request) => {
  const { pathname } = request.nextUrl;
  const role = request.auth?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (!role || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
      const loginUrl = new URL("/login", request.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/account")) {
    if (!role) {
      const loginUrl = new URL("/login", request.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
