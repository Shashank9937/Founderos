-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FOUNDER', 'OPERATOR', 'ANALYST', 'ADMIN');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('SINGLE_TASK', 'MULTI_STEP', 'MULTI_AGENT');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('LIVE', 'BUILDING', 'TESTING', 'PAUSED', 'FAILED', 'QUEUED');

-- CreateEnum
CREATE TYPE "FailureScenarioType" AS ENUM ('WRONG_OUTPUT_FORMAT', 'TOOL_FAILURE', 'HALLUCINATION', 'CONTEXT_MISINTERPRETATION', 'IRREVERSIBLE_ACTION_RISK');

-- CreateEnum
CREATE TYPE "AutomationRecommendation" AS ENUM ('DO_NOT_AUTOMATE', 'BUILD_SIMPLE_SCRIPT', 'BUILD_SINGLE_TASK_AGENT', 'BUILD_MULTI_STEP_AGENT');

-- CreateEnum
CREATE TYPE "StrategyEntryType" AS ENUM ('MARKET_SIZING', 'COMPETITIVE_MATRIX', 'SWOT', 'DEBUG_DIAGNOSTIC', 'ROI_OPPORTUNITY', 'GTM_ROADMAP', 'PRICING_EXPERIMENT', 'ICP_PROFILE', 'VALUE_PROPOSITION');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('EXECUTION', 'LEARNING', 'FINANCE', 'GROWTH', 'AI_SYSTEMS');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'AT_RISK', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FOUNDER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatItDoes" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "triggerType" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'BUILDING',
    "perceptionDefinition" TEXT NOT NULL,
    "perceptionExamples" JSONB NOT NULL,
    "brainModelLogic" TEXT NOT NULL,
    "decisionRules" TEXT NOT NULL,
    "isDeterministic" BOOLEAN NOT NULL,
    "toolsUsed" JSONB NOT NULL,
    "manualApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
    "memoryShortTerm" TEXT NOT NULL,
    "memoryLongTerm" TEXT NOT NULL,
    "learningLoopEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inputSchema" JSONB NOT NULL,
    "outputSchema" JSONB NOT NULL,
    "outputExample" TEXT NOT NULL,
    "workflowSteps" JSONB NOT NULL,
    "guardrails" JSONB NOT NULL,
    "fallbackBehavior" TEXT NOT NULL,
    "destructiveActionConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "timeSavedPerWeek" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,
    "agentName" TEXT NOT NULL,
    "whatItDoes" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "toolsUsed" JSONB NOT NULL,
    "triggerType" TEXT NOT NULL,
    "inputDefinition" TEXT NOT NULL,
    "outputDefinition" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL,
    "timeSavedPerWeek" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "failureNotes" TEXT,
    "lessonsLearned" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentWorkflow" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepTitle" TEXT NOT NULL,
    "stepDetail" TEXT NOT NULL,
    "inputContract" TEXT NOT NULL,
    "outputContract" TEXT NOT NULL,
    "fallbackAction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentFailureMode" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "scenarioType" "FailureScenarioType" NOT NULL,
    "scenarioDescription" TEXT NOT NULL,
    "likelyCause" TEXT NOT NULL,
    "guardrail" TEXT NOT NULL,
    "manualConfirmationRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentFailureMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,
    "taskName" TEXT NOT NULL,
    "doneThreePlusPerWeek" BOOLEAN NOT NULL,
    "predictableWorkflow" BOOLEAN NOT NULL,
    "clearInputsOutputs" BOOLEAN NOT NULL,
    "errorToleranceAcceptable" BOOLEAN NOT NULL,
    "timeSavedMeaningful" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL,
    "recommendation" "AutomationRecommendation" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningTrack" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "LearningTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "learningTrackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coreConcept" TEXT NOT NULL,
    "whyItMattersAtScale" TEXT NOT NULL,
    "tacticalImplementation" TEXT NOT NULL,
    "commonFounderMistakes" TEXT NOT NULL,
    "executionChecklist" JSONB NOT NULL,
    "reflectionPrompt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "scenarioName" TEXT NOT NULL DEFAULT 'Base',
    "revenue" DOUBLE PRECISION NOT NULL,
    "costStructure" DOUBLE PRECISION NOT NULL,
    "grossMargin" DOUBLE PRECISION NOT NULL,
    "cac" DOUBLE PRECISION NOT NULL,
    "ltv" DOUBLE PRECISION NOT NULL,
    "burnRate" DOUBLE PRECISION NOT NULL,
    "runwayMonths" DOUBLE PRECISION NOT NULL,
    "arr" DOUBLE PRECISION NOT NULL,
    "mrr" DOUBLE PRECISION NOT NULL,
    "unitEconomics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryType" "StrategyEntryType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeverageScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "timeSaved" DOUBLE PRECISION NOT NULL,
    "revenueImpact" DOUBLE PRECISION NOT NULL,
    "automationDepth" DOUBLE PRECISION NOT NULL,
    "recurringRevenuePercent" DOUBLE PRECISION NOT NULL,
    "delegationScore" DOUBLE PRECISION NOT NULL,
    "founderDependencyPercent" DOUBLE PRECISION NOT NULL,
    "leverageScore" DOUBLE PRECISION NOT NULL,
    "hoursReplaced" DOUBLE PRECISION NOT NULL,
    "automationCoverage" DOUBLE PRECISION NOT NULL,
    "revenuePerEmployee" DOUBLE PRECISION NOT NULL,
    "revenuePerHour" DOUBLE PRECISION NOT NULL,
    "systemsBuiltCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeverageScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaaSPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "icpDefinition" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "valueProposition" TEXT NOT NULL,
    "pricingExperiments" JSONB NOT NULL,
    "featureGates" JSONB NOT NULL,
    "subscriptionTiers" JSONB NOT NULL,
    "gtmRoadmap" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaaSPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Agent_userId_createdAt_idx" ON "Agent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentLog_userId_createdAt_idx" ON "AgentLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentLog_agentId_idx" ON "AgentLog"("agentId");

-- CreateIndex
CREATE INDEX "AgentWorkflow_agentId_idx" ON "AgentWorkflow"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentWorkflow_agentId_stepNumber_key" ON "AgentWorkflow"("agentId", "stepNumber");

-- CreateIndex
CREATE INDEX "AgentFailureMode_agentId_idx" ON "AgentFailureMode"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentFailureMode_agentId_scenarioType_key" ON "AgentFailureMode"("agentId", "scenarioType");

-- CreateIndex
CREATE INDEX "AutomationScore_userId_createdAt_idx" ON "AutomationScore"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationScore_agentId_idx" ON "AutomationScore"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningTrack_slug_key" ON "LearningTrack"("slug");

-- CreateIndex
CREATE INDEX "Lesson_learningTrackId_sortOrder_idx" ON "Lesson"("learningTrackId", "sortOrder");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_idx" ON "LessonProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "FinancialMetric_userId_periodStart_idx" ON "FinancialMetric"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "StrategyEntry_userId_createdAt_idx" ON "StrategyEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StrategyEntry_entryType_idx" ON "StrategyEntry"("entryType");

-- CreateIndex
CREATE INDEX "LeverageScore_userId_periodStart_idx" ON "LeverageScore"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "Goal_userId_createdAt_idx" ON "Goal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "KPI_userId_createdAt_idx" ON "KPI"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "KPI_goalId_idx" ON "KPI"("goalId");

-- CreateIndex
CREATE INDEX "SaaSPlan_userId_createdAt_idx" ON "SaaSPlan"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLog" ADD CONSTRAINT "AgentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentLog" ADD CONSTRAINT "AgentLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentWorkflow" ADD CONSTRAINT "AgentWorkflow_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentFailureMode" ADD CONSTRAINT "AgentFailureMode_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationScore" ADD CONSTRAINT "AutomationScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationScore" ADD CONSTRAINT "AutomationScore_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_learningTrackId_fkey" FOREIGN KEY ("learningTrackId") REFERENCES "LearningTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialMetric" ADD CONSTRAINT "FinancialMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyEntry" ADD CONSTRAINT "StrategyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeverageScore" ADD CONSTRAINT "LeverageScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaaSPlan" ADD CONSTRAINT "SaaSPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

