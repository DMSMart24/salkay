import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  if (pathname.startsWith("/admin")) {
    requestHeaders.set("x-salkay-admin", "1");
  }

  const isLogin = pathname === "/admin/login";
  if (pathname.startsWith("/admin") && !isLogin) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url, {
        headers: requestHeaders,
      });
    }
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
