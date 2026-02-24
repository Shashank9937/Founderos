import { FailureScenarioType } from "@prisma/client";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { parseJsonString, parseLineList } from "@/lib/calculations";
import { agentSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const agents = await prisma.agent.findMany({
    where: { userId: user.id },
    include: {
      failureModes: true,
      workflows: { orderBy: { stepNumber: "asc" } },
      automationScores: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return ok(agents);
}

const scenarioTemplates: Array<{
  scenarioType: FailureScenarioType;
  scenarioDescription: string;
  likelyCause: string;
}> = [
  {
    scenarioType: FailureScenarioType.WRONG_OUTPUT_FORMAT,
    scenarioDescription: "Agent returns wrong output shape or missing fields.",
    likelyCause: "Output contract not explicit or validator missing.",
  },
  {
    scenarioType: FailureScenarioType.TOOL_FAILURE,
    scenarioDescription: "Agent cannot complete due to dependency/API failure.",
    likelyCause: "Missing retries, timeout handling, and tool health checks.",
  },
  {
    scenarioType: FailureScenarioType.HALLUCINATION,
    scenarioDescription: "Agent invents unsupported facts.",
    likelyCause: "No citation requirement and weak grounding.",
  },
  {
    scenarioType: FailureScenarioType.CONTEXT_MISINTERPRETATION,
    scenarioDescription: "Agent misunderstands user context or intent.",
    likelyCause: "Ambiguous prompt and context overflow.",
  },
  {
    scenarioType: FailureScenarioType.IRREVERSIBLE_ACTION_RISK,
    scenarioDescription: "Agent attempts irreversible action without confirmation.",
    likelyCause: "Approval gate missing before destructive actions.",
  },
];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = agentSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const automationEvaluations = await prisma.automationScore.count({
    where: { userId: user.id },
  });

  if (automationEvaluations === 0) {
    return fail("Run Automation Worthiness evaluation before creating an agent.", 400);
  }

  const toolsUsed = parseLineList(parsed.data.toolsUsed);
  const workflowSteps = parseLineList(parsed.data.workflowSteps);
  const guardrails = parseLineList(parsed.data.guardrails);

  const perceptionExamples = parseJsonString(
    parsed.data.perceptionExamples,
    parseLineList(parsed.data.perceptionExamples).map((value) => ({ example: value })),
  );

  const inputSchema = parseJsonString(parsed.data.inputSchema, {
    format: "text",
    value: parsed.data.inputSchema,
  });

  const outputSchema = parseJsonString(parsed.data.outputSchema, {
    format: "text",
    value: parsed.data.outputSchema,
  });

  const agent = await prisma.agent.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      whatItDoes: parsed.data.whatItDoes,
      agentType: parsed.data.agentType,
      triggerType: parsed.data.triggerType,
      status: parsed.data.status,
      perceptionDefinition: parsed.data.perceptionDefinition,
      perceptionExamples,
      brainModelLogic: parsed.data.brainModelLogic,
      decisionRules: parsed.data.decisionRules,
      isDeterministic: parsed.data.isDeterministic,
      toolsUsed,
      manualApprovalRequired: parsed.data.manualApprovalRequired,
      memoryShortTerm: parsed.data.memoryShortTerm,
      memoryLongTerm: parsed.data.memoryLongTerm,
      learningLoopEnabled: parsed.data.learningLoopEnabled,
      inputSchema,
      outputSchema,
      outputExample: parsed.data.outputExample,
      workflowSteps,
      guardrails,
      fallbackBehavior: parsed.data.fallbackBehavior,
      destructiveActionConfirmation: parsed.data.destructiveActionConfirmation,
      timeSavedPerWeek: parsed.data.timeSavedPerWeek,
    },
  });

  if (workflowSteps.length > 0) {
    await prisma.agentWorkflow.createMany({
      data: workflowSteps.map((step, index) => ({
        agentId: agent.id,
        stepNumber: index + 1,
        stepTitle: `Step ${index + 1}`,
        stepDetail: step,
        inputContract: "Defined in agent input schema",
        outputContract: "Defined in agent output schema",
        fallbackAction: parsed.data.fallbackBehavior,
      })),
    });
  }

  await prisma.agentFailureMode.createMany({
    data: scenarioTemplates.map((template, index) => ({
      agentId: agent.id,
      scenarioType: template.scenarioType,
      scenarioDescription: template.scenarioDescription,
      likelyCause: template.likelyCause,
      guardrail:
        guardrails[index] ??
        "Define explicit validation checks, retries, and manual approval before external actions.",
      manualConfirmationRequired:
        template.scenarioType === FailureScenarioType.IRREVERSIBLE_ACTION_RISK
          ? parsed.data.destructiveActionConfirmation
          : false,
    })),
  });

  await prisma.agentLog.create({
    data: {
      userId: user.id,
      agentId: agent.id,
      agentName: parsed.data.name,
      whatItDoes: parsed.data.whatItDoes,
      agentType: parsed.data.agentType,
      toolsUsed,
      triggerType: parsed.data.triggerType,
      inputDefinition: JSON.stringify(inputSchema),
      outputDefinition: JSON.stringify(outputSchema),
      status: parsed.data.status,
      timeSavedPerWeek: parsed.data.timeSavedPerWeek,
      failureNotes: "Failure mode panel initialized with 5 scenarios.",
      lessonsLearned: "Agent created with explicit Perception/Brain/Tools/Memory contracts.",
    },
  });

  return ok(agent, { status: 201 });
}
