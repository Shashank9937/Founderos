import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { AUTH_COOKIE, signAuthToken } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let payload: { email?: string; password?: string } = {};

  if (isJson) {
    payload = await request.json();
  } else {
    const formData = await request.formData();
    payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    if (isJson) {
      return NextResponse.json({ success: false, error: "Invalid credentials payload" }, { status: 400 });
    }
    return NextResponse.redirect(new URL("/login?error=invalid_payload", request.url));
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    if (isJson) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
  }

  const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!validPassword) {
    if (isJson) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
  }

  const token = await signAuthToken({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.fullName,
  });

  const response = isJson ? NextResponse.json({ success: true }) : NextResponse.redirect(new URL("/dashboard", request.url));

  response.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
