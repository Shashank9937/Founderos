import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { AUTH_COOKIE, type AuthPayload, verifyAuthToken } from "@/lib/auth/jwt";

export async function getSessionFromRequest(request: NextRequest): Promise<AuthPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function getSessionFromCookies(): Promise<AuthPayload | null> {
  const store = cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return null;
  }

  const { prisma } = await import("@/lib/db/prisma");
  return prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
    },
  });
}
