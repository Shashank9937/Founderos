import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { goalSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: { kpis: true },
    orderBy: { updatedAt: "desc" },
  });

  return ok(goals);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = goalSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      status: parsed.data.status,
      progress: parsed.data.progress,
      targetDate: parsed.data.targetDate,
    },
  });

  return ok(goal, { status: 201 });
}
