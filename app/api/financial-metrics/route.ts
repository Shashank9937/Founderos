import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { computeGrossMargin, computeRunwayMonths, parseJsonString } from "@/lib/calculations";
import { financialMetricSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const metrics = await prisma.financialMetric.findMany({
    where: { userId: user.id },
    orderBy: { periodStart: "desc" },
    take: 24,
  });

  return ok(metrics);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = financialMetricSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const grossMargin = computeGrossMargin(parsed.data.revenue, parsed.data.costStructure);
  const runwayMonths = computeRunwayMonths(parsed.data.cashReserve, parsed.data.burnRate);

  const metric = await prisma.financialMetric.create({
    data: {
      userId: user.id,
      periodStart: parsed.data.periodStart,
      scenarioName: parsed.data.scenarioName,
      revenue: parsed.data.revenue,
      costStructure: parsed.data.costStructure,
      grossMargin,
      cac: parsed.data.cac,
      ltv: parsed.data.ltv,
      burnRate: parsed.data.burnRate,
      runwayMonths,
      arr: parsed.data.arr,
      mrr: parsed.data.mrr,
      unitEconomics: parseJsonString(parsed.data.unitEconomics, {
        notes: parsed.data.unitEconomics,
      }),
    },
  });

  return ok(metric, { status: 201 });
}
