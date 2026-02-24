import { AgentType, AutomationRecommendation } from "@prisma/client";

export type AutomationChecklistInput = {
  doneThreePlusPerWeek: boolean;
  predictableWorkflow: boolean;
  clearInputsOutputs: boolean;
  errorToleranceAcceptable: boolean;
  timeSavedMeaningful: boolean;
};

export function parseLineList(value: string) {
  return value
    .split(/\r?\n|,/) 
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseJsonString(value: string, fallback: unknown) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function computeAutomationScore(input: AutomationChecklistInput) {
  return Object.values(input).filter(Boolean).length * 20;
}

export function getAutomationRecommendation(score: number): AutomationRecommendation {
  if (score < 40) {
    return AutomationRecommendation.DO_NOT_AUTOMATE;
  }

  if (score < 60) {
    return AutomationRecommendation.BUILD_SIMPLE_SCRIPT;
  }

  if (score < 80) {
    return AutomationRecommendation.BUILD_SINGLE_TASK_AGENT;
  }

  return AutomationRecommendation.BUILD_MULTI_STEP_AGENT;
}

export function recommendationLabel(value: AutomationRecommendation) {
  switch (value) {
    case AutomationRecommendation.DO_NOT_AUTOMATE:
      return "Do not automate";
    case AutomationRecommendation.BUILD_SIMPLE_SCRIPT:
      return "Build simple script";
    case AutomationRecommendation.BUILD_SINGLE_TASK_AGENT:
      return "Build single-task agent";
    case AutomationRecommendation.BUILD_MULTI_STEP_AGENT:
      return "Build multi-step agent";
    default:
      return value;
  }
}

export function computeGrossMargin(revenue: number, costStructure: number) {
  if (revenue <= 0) {
    return 0;
  }

  return Number((((revenue - costStructure) / revenue) * 100).toFixed(2));
}

export function computeRunwayMonths(cashReserve: number, burnRate: number) {
  if (burnRate <= 0) {
    return 0;
  }

  return Number((cashReserve / burnRate).toFixed(2));
}

export function computeLeverageScore(input: {
  timeSaved: number;
  revenueImpact: number;
  automationDepth: number;
  recurringRevenuePercent: number;
  delegationScore: number;
  founderDependencyPercent: number;
}) {
  return Number(
    (
      input.timeSaved * input.revenueImpact * input.automationDepth +
      input.recurringRevenuePercent +
      input.delegationScore -
      input.founderDependencyPercent
    ).toFixed(2),
  );
}

export const agentTypeGuidance: Record<
  AgentType,
  {
    label: string;
    complexity: string;
    whenToUse: string;
    mistakes: string;
  }
> = {
  SINGLE_TASK: {
    label: "Single-task Agent",
    complexity: "Low",
    whenToUse: "For high-frequency, repeatable tasks with narrow scope and clear schema outputs.",
    mistakes: "Trying to handle end-to-end workflows in one prompt without control checkpoints.",
  },
  MULTI_STEP: {
    label: "Multi-step Agent",
    complexity: "Medium",
    whenToUse: "For deterministic workflow chains requiring handoffs, validations, and checkpoints.",
    mistakes: "Skipping explicit step contracts and failing to define fallback behavior per step.",
  },
  MULTI_AGENT: {
    label: "Multi-agent System",
    complexity: "High",
    whenToUse: "For complex operations where specialist agents need orchestration and conflict resolution.",
    mistakes: "No coordinator policy, overlapping responsibilities, and missing shared memory protocol.",
  },
};

export function parseBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return false;
}
