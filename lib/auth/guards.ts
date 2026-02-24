import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { type AuthPayload } from "@/lib/auth/jwt";
import { can, type PermissionKey } from "@/lib/auth/permissions";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function requireSession(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return null;
  }

  return session;
}

export type PermissionResult = AuthPayload | "UNAUTHORIZED" | "FORBIDDEN";

export async function requirePermission(request: NextRequest, permission: PermissionKey): Promise<PermissionResult> {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return "UNAUTHORIZED";
  }

  if (!can(session.role as Role, permission)) {
    return "FORBIDDEN";
  }

  return session;
}
