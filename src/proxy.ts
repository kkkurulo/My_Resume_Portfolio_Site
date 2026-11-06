import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/auth/token";

export async function proxy(request: NextRequest) {
  if (await isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
