import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { computeAutomationScore, getAutomationRecommendation } from "@/lib/calculations";
import { automationScoreSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const scores = await prisma.automationScore.findMany({
    where: { userId: user.id },
    include: { agent: true },
    orderBy: { updatedAt: "desc" },
  });

  return ok(scores);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = automationScoreSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  if (parsed.data.agentId) {
    const agent = await prisma.agent.findFirst({
      where: {
        id: parsed.data.agentId,
        userId: user.id,
      },
    });

    if (!agent) {
      return fail("Agent not found", 404);
    }
  }

  const score = computeAutomationScore({
    doneThreePlusPerWeek: parsed.data.doneThreePlusPerWeek,
    predictableWorkflow: parsed.data.predictableWorkflow,
    clearInputsOutputs: parsed.data.clearInputsOutputs,
    errorToleranceAcceptable: parsed.data.errorToleranceAcceptable,
    timeSavedMeaningful: parsed.data.timeSavedMeaningful,
  });

  const created = await prisma.automationScore.create({
    data: {
      userId: user.id,
      agentId: parsed.data.agentId,
      taskName: parsed.data.taskName,
      doneThreePlusPerWeek: parsed.data.doneThreePlusPerWeek,
      predictableWorkflow: parsed.data.predictableWorkflow,
      clearInputsOutputs: parsed.data.clearInputsOutputs,
      errorToleranceAcceptable: parsed.data.errorToleranceAcceptable,
      timeSavedMeaningful: parsed.data.timeSavedMeaningful,
      score,
      recommendation: getAutomationRecommendation(score),
      notes: parsed.data.notes,
    },
  });

  return ok(created, { status: 201 });
}
