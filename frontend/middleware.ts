import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // This will match all paths that:
    // - have at least one character after "/"
    // - do NOT start with /_next/static, /_next/image, /favicon.ico, /hub, or /auth.
    //   (thus "/auth/signin", "/" and any "/hub" route are not processed by this middleware)
    "/((?!_next/static|_next/image|favicon.ico|hub|auth).+)",
  ],
};
