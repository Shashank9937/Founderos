import { fail, ok } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/session";
import { getRoadmapOpportunities } from "@/lib/dashboard";

const integrationSteps = [
  "Map processes",
  "Identify repetitive tasks",
  "Estimate time cost",
  "Calculate ROI",
  "Build MVP agent",
  "Test with edge cases",
  "Scale or abandon",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const opportunities = await getRoadmapOpportunities(user.id);

  return ok({
    steps: integrationSteps,
    opportunities,
  });
}
