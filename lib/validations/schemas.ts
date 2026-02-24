import {
  AgentStatus,
  AgentType,
  FailureScenarioType,
  GoalCategory,
  GoalStatus,
  StrategyEntryType,
} from "@prisma/client";
import { z } from "zod";

function normalizeOptionalId(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
  }

  return false;
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const agentSchema = z.object({
  name: z.string().min(3),
  whatItDoes: z.string().min(10),
  agentType: z.nativeEnum(AgentType),
  triggerType: z.string().min(3),
  status: z.nativeEnum(AgentStatus).default(AgentStatus.BUILDING),
  perceptionDefinition: z.string().min(12),
  perceptionExamples: z.string().min(2),
  brainModelLogic: z.string().min(12),
  decisionRules: z.string().min(12),
  isDeterministic: z.preprocess(normalizeBoolean, z.boolean()),
  toolsUsed: z.string().min(2),
  manualApprovalRequired: z.preprocess(normalizeBoolean, z.boolean()),
  memoryShortTerm: z.string().min(10),
  memoryLongTerm: z.string().min(10),
  learningLoopEnabled: z.preprocess(normalizeBoolean, z.boolean()),
  inputSchema: z.string().min(2),
  outputSchema: z.string().min(2),
  outputExample: z.string().min(10),
  workflowSteps: z.string().min(5),
  guardrails: z.string().min(5),
  fallbackBehavior: z.string().min(10),
  destructiveActionConfirmation: z.preprocess(normalizeBoolean, z.boolean()),
  timeSavedPerWeek: z.coerce.number().min(0).max(168).default(0),
});

export const agentLogSchema = z.object({
  agentId: z.preprocess(normalizeOptionalId, z.string().optional()),
  agentName: z.string().min(3),
  whatItDoes: z.string().min(10),
  agentType: z.nativeEnum(AgentType),
  toolsUsed: z.string().min(2),
  triggerType: z.string().min(3),
  inputDefinition: z.string().min(2),
  outputDefinition: z.string().min(2),
  status: z.nativeEnum(AgentStatus),
  timeSavedPerWeek: z.coerce.number().min(0).max(168),
  failureNotes: z.string().trim().optional(),
  lessonsLearned: z.string().trim().optional(),
});

export const automationScoreSchema = z.object({
  agentId: z.preprocess(normalizeOptionalId, z.string().optional()),
  taskName: z.string().min(3),
  doneThreePlusPerWeek: z.preprocess(normalizeBoolean, z.boolean()),
  predictableWorkflow: z.preprocess(normalizeBoolean, z.boolean()),
  clearInputsOutputs: z.preprocess(normalizeBoolean, z.boolean()),
  errorToleranceAcceptable: z.preprocess(normalizeBoolean, z.boolean()),
  timeSavedMeaningful: z.preprocess(normalizeBoolean, z.boolean()),
  notes: z.string().trim().optional(),
});

export const failureModeSchema = z.object({
  agentId: z.string().min(5),
  scenarioType: z.nativeEnum(FailureScenarioType),
  scenarioDescription: z.string().min(8),
  likelyCause: z.string().min(8),
  guardrail: z.string().min(8),
  manualConfirmationRequired: z.preprocess(normalizeBoolean, z.boolean()),
});

export const lessonProgressSchema = z.object({
  lessonId: z.string().min(5),
  completed: z.preprocess(normalizeBoolean, z.boolean()),
  notes: z.string().trim().optional(),
});

export const financialMetricSchema = z.object({
  periodStart: z.coerce.date(),
  scenarioName: z.string().trim().default("Base"),
  revenue: z.coerce.number().min(0),
  costStructure: z.coerce.number().min(0),
  cac: z.coerce.number().min(0),
  ltv: z.coerce.number().min(0),
  burnRate: z.coerce.number().min(0),
  cashReserve: z.coerce.number().min(0),
  mrr: z.coerce.number().min(0),
  arr: z.coerce.number().min(0),
  unitEconomics: z.string().min(2),
});

export const strategyEntrySchema = z.object({
  entryType: z.nativeEnum(StrategyEntryType),
  title: z.string().min(3),
  content: z.string().min(2),
});

export const leverageScoreSchema = z.object({
  periodStart: z.coerce.date(),
  timeSaved: z.coerce.number().min(0),
  revenueImpact: z.coerce.number().min(0),
  automationDepth: z.coerce.number().min(0),
  recurringRevenuePercent: z.coerce.number().min(0).max(100),
  delegationScore: z.coerce.number().min(0),
  founderDependencyPercent: z.coerce.number().min(0).max(100),
  hoursReplaced: z.coerce.number().min(0),
  automationCoverage: z.coerce.number().min(0).max(100),
  revenuePerEmployee: z.coerce.number().min(0),
  revenuePerHour: z.coerce.number().min(0),
  systemsBuiltCount: z.coerce.number().int().min(0),
});

export const goalSchema = z.object({
  title: z.string().min(3),
  description: z.string().trim().optional(),
  category: z.nativeEnum(GoalCategory),
  status: z.nativeEnum(GoalStatus).default(GoalStatus.NOT_STARTED),
  progress: z.coerce.number().int().min(0).max(100),
  targetDate: z.preprocess(normalizeOptionalId, z.coerce.date().optional()),
});

export const kpiSchema = z.object({
  goalId: z.string().min(5),
  name: z.string().min(2),
  unit: z.string().min(1),
  currentValue: z.coerce.number(),
  targetValue: z.coerce.number(),
  periodLabel: z.string().min(2),
});

export const saasPlanSchema = z.object({
  planName: z.string().min(3),
  icpDefinition: z.string().min(10),
  problemStatement: z.string().min(10),
  valueProposition: z.string().min(10),
  pricingExperiments: z.string().min(2),
  featureGates: z.string().min(2),
  subscriptionTiers: z.string().min(2),
  gtmRoadmap: z.string().min(2),
});

export const debugConsoleSchema = z.object({
  expectedBehavior: z.string().min(8),
  actualBehavior: z.string().min(8),
  agentPrompt: z.string().min(10),
  sampleInput: z.string().min(2),
  sampleOutput: z.string().min(2),
});
