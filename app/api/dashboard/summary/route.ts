import { fail, ok } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/dashboard";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const summary = await getDashboardSummary(user.id);
  return ok(summary);
}
