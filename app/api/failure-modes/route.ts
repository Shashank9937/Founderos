import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { failureModeSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");

  const where = agentId
    ? {
        agentId,
        agent: { userId: user.id },
      }
    : {
        agent: { userId: user.id },
      };

  const modes = await prisma.agentFailureMode.findMany({
    where,
    include: { agent: { select: { name: true } } },
    orderBy: [{ agentId: "asc" }, { scenarioType: "asc" }],
  });

  return ok(modes);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = failureModeSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const agent = await prisma.agent.findFirst({
    where: {
      id: parsed.data.agentId,
      userId: user.id,
    },
  });

  if (!agent) {
    return fail("Agent not found", 404);
  }

  const mode = await prisma.agentFailureMode.upsert({
    where: {
      agentId_scenarioType: {
        agentId: parsed.data.agentId,
        scenarioType: parsed.data.scenarioType,
      },
    },
    update: {
      scenarioDescription: parsed.data.scenarioDescription,
      likelyCause: parsed.data.likelyCause,
      guardrail: parsed.data.guardrail,
      manualConfirmationRequired: parsed.data.manualConfirmationRequired,
    },
    create: {
      agentId: parsed.data.agentId,
      scenarioType: parsed.data.scenarioType,
      scenarioDescription: parsed.data.scenarioDescription,
      likelyCause: parsed.data.likelyCause,
      guardrail: parsed.data.guardrail,
      manualConfirmationRequired: parsed.data.manualConfirmationRequired,
    },
  });

  return ok(mode, { status: 201 });
}
