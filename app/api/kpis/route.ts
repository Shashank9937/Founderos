import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { kpiSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const kpis = await prisma.kPI.findMany({
    where: { userId: user.id },
    include: { goal: true },
    orderBy: { updatedAt: "desc" },
  });

  return ok(kpis);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = kpiSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const goal = await prisma.goal.findFirst({
    where: {
      id: parsed.data.goalId,
      userId: user.id,
    },
  });

  if (!goal) {
    return fail("Goal not found", 404);
  }

  const kpi = await prisma.kPI.create({
    data: {
      userId: user.id,
      goalId: parsed.data.goalId,
      name: parsed.data.name,
      unit: parsed.data.unit,
      currentValue: parsed.data.currentValue,
      targetValue: parsed.data.targetValue,
      periodLabel: parsed.data.periodLabel,
    },
  });

  return ok(kpi, { status: 201 });
}
