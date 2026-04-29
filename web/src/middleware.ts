import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("tt_access")?.value;
  const refreshToken = request.cookies.get("tt_refresh")?.value;

  const hasSession = Boolean(accessToken || refreshToken);

  const isLoginPage = pathname === "/login";
  const isProtectedPage =
    pathname === "/" ||
    pathname === "/projects" ||
    pathname.startsWith("/projects/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  if (isLoginPage && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedPage && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/projects", "/projects/:path*", "/settings", "/settings/:path*"],
};
