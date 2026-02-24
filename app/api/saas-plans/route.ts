import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { parseJsonString } from "@/lib/calculations";
import { saasPlanSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const plans = await prisma.saaSPlan.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return ok(plans);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = saasPlanSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const plan = await prisma.saaSPlan.create({
    data: {
      userId: user.id,
      planName: parsed.data.planName,
      icpDefinition: parsed.data.icpDefinition,
      problemStatement: parsed.data.problemStatement,
      valueProposition: parsed.data.valueProposition,
      pricingExperiments: parseJsonString(parsed.data.pricingExperiments, {
        text: parsed.data.pricingExperiments,
      }),
      featureGates: parseJsonString(parsed.data.featureGates, {
        text: parsed.data.featureGates,
      }),
      subscriptionTiers: parseJsonString(parsed.data.subscriptionTiers, {
        text: parsed.data.subscriptionTiers,
      }),
      gtmRoadmap: parseJsonString(parsed.data.gtmRoadmap, {
        text: parsed.data.gtmRoadmap,
      }),
    },
  });

  return ok(plan, { status: 201 });
}
