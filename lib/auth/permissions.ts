import { Role } from "@prisma/client";

export type PermissionKey = "manageWorkspace" | "exportBriefs";

const permissionMap: Record<PermissionKey, Role[]> = {
  manageWorkspace: [Role.FOUNDER, Role.OPERATOR, Role.ANALYST, Role.ADMIN],
  exportBriefs: [Role.FOUNDER, Role.OPERATOR, Role.ANALYST, Role.ADMIN],
};

export function can(role: Role, permission: PermissionKey) {
  return permissionMap[permission].includes(role);
}
