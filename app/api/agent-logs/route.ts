import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { parseLineList } from "@/lib/calculations";
import { agentLogSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const logs = await prisma.agentLog.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return ok(logs);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = agentLogSchema.safeParse(payload);
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

  const log = await prisma.agentLog.create({
    data: {
      userId: user.id,
      agentId: parsed.data.agentId,
      agentName: parsed.data.agentName,
      whatItDoes: parsed.data.whatItDoes,
      agentType: parsed.data.agentType,
      toolsUsed: parseLineList(parsed.data.toolsUsed),
      triggerType: parsed.data.triggerType,
      inputDefinition: parsed.data.inputDefinition,
      outputDefinition: parsed.data.outputDefinition,
      status: parsed.data.status,
      timeSavedPerWeek: parsed.data.timeSavedPerWeek,
      failureNotes: parsed.data.failureNotes,
      lessonsLearned: parsed.data.lessonsLearned,
    },
  });

  return ok(log, { status: 201 });
}
