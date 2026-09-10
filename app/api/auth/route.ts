import { createHash, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

function tokenFor(password: string) {
  return createHash("sha256").update(`from-scratch-dashboard:${password}`).digest("hex");
}

export async function POST(request: Request) {
  const configured = process.env.DASHBOARD_PASSWORD;
  if (!configured) {
    return NextResponse.json({ error: "Dashboard password is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const supplied = Buffer.from(body.password ?? "");
  const expected = Buffer.from(configured);
  const valid = supplied.length === expected.length && timingSafeEqual(supplied, expected);

  if (!valid) return NextResponse.json({ error: "That password isn’t right." }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("fs-dashboard", tokenFor(configured), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("fs-dashboard", "", { path: "/", maxAge: 0 });
  return response;
}
