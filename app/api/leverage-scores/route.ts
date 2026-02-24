import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { computeLeverageScore } from "@/lib/calculations";
import { leverageScoreSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const scores = await prisma.leverageScore.findMany({
    where: { userId: user.id },
    orderBy: { periodStart: "desc" },
    take: 24,
  });

  return ok(scores);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = leverageScoreSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const leverageScore = computeLeverageScore({
    timeSaved: parsed.data.timeSaved,
    revenueImpact: parsed.data.revenueImpact,
    automationDepth: parsed.data.automationDepth,
    recurringRevenuePercent: parsed.data.recurringRevenuePercent,
    delegationScore: parsed.data.delegationScore,
    founderDependencyPercent: parsed.data.founderDependencyPercent,
  });

  const created = await prisma.leverageScore.create({
    data: {
      userId: user.id,
      periodStart: parsed.data.periodStart,
      timeSaved: parsed.data.timeSaved,
      revenueImpact: parsed.data.revenueImpact,
      automationDepth: parsed.data.automationDepth,
      recurringRevenuePercent: parsed.data.recurringRevenuePercent,
      delegationScore: parsed.data.delegationScore,
      founderDependencyPercent: parsed.data.founderDependencyPercent,
      leverageScore,
      hoursReplaced: parsed.data.hoursReplaced,
      automationCoverage: parsed.data.automationCoverage,
      revenuePerEmployee: parsed.data.revenuePerEmployee,
      revenuePerHour: parsed.data.revenuePerHour,
      systemsBuiltCount: parsed.data.systemsBuiltCount,
    },
  });

  return ok(created, { status: 201 });
}
