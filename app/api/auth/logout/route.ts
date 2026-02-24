import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/jwt";

export async function POST(request: NextRequest) {
  const origin = process.env.APP_URL ?? request.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/login", origin));
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
