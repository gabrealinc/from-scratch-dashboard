import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  const cookie = request.cookies.get("fs-dashboard")?.value;
  const expected = password
    ? createHash("sha256").update(`from-scratch-dashboard:${password}`).digest("hex")
    : null;

  if (cookie && expected && cookie === expected) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
