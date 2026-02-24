import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { Role } from "@prisma/client";

function getSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("JWT_SECRET is required");
  }

  return new TextEncoder().encode(value);
}

export const AUTH_COOKIE = "faos_token";

export type AuthPayload = JWTPayload & {
  sub: string;
  role: Role;
  email: string;
  name: string;
};

export async function signAuthToken(payload: {
  userId: string;
  role: Role;
  email: string;
  name: string;
}) {
  return new SignJWT({
    role: payload.role,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "7d")
    .sign(getSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.role !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return payload as AuthPayload;
  } catch {
    return null;
  }
}
