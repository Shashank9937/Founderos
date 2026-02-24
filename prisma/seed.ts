import bcrypt from "bcryptjs";
import {
  AgentStatus,
  AgentType,
  AutomationRecommendation,
  FailureScenarioType,
  GoalCategory,
  GoalStatus,
  PrismaClient,
  Role,
  StrategyEntryType,
} from "@prisma/client";

const prisma = new PrismaClient();

type AutomationChecklist = {
  doneThreePlusPerWeek: boolean;
  predictableWorkflow: boolean;
  clearInputsOutputs: boolean;
  errorToleranceAcceptable: boolean;
  timeSavedMeaningful: boolean;
};

function computeAutomationScore(checklist: AutomationChecklist) {
  const checks = Object.values(checklist);
  return checks.filter(Boolean).length * 20;
}

function automationRecommendation(score: number): AutomationRecommendation {
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

function computeLeverageScore(input: {
  timeSaved: number;
  revenueImpact: number;
  automationDepth: number;
  recurringRevenuePercent: number;
  delegationScore: number;
  founderDependencyPercent: number;
}) {
  return (
    input.timeSaved * input.revenueImpact * input.automationDepth +
    input.recurringRevenuePercent +
    input.delegationScore -
    input.founderDependencyPercent
  );
}

async function createStandardFailureModes(agentId: string, destructiveNeedsConfirmation: boolean) {
  const scenarios: Array<{
    scenarioType: FailureScenarioType;
    scenarioDescription: string;
    likelyCause: string;
    guardrail: string;
    manualConfirmationRequired: boolean;
  }> = [
    {
      scenarioType: FailureScenarioType.WRONG_OUTPUT_FORMAT,
      scenarioDescription: "Agent returns unstructured output instead of required JSON schema.",
      likelyCause: "Prompt does not enforce schema strictly at generation time.",
      guardrail: "Run schema validation before marking task complete and auto-retry with strict formatter prompt.",
      manualConfirmationRequired: false,
    },
    {
      scenarioType: FailureScenarioType.TOOL_FAILURE,
      scenarioDescription: "Connected tool API times out or returns malformed payload.",
      likelyCause: "No timeout fallback path and missing retry policy.",
      guardrail: "Apply exponential retries, capture error context, and route task to queue when tool is unavailable.",
      manualConfirmationRequired: false,
    },
    {
      scenarioType: FailureScenarioType.HALLUCINATION,
      scenarioDescription: "Agent fabricates details when source evidence is missing.",
      likelyCause: "Response generation not grounded in retrieved context.",
      guardrail: "Require source citations from tool outputs and block unsupported claims.",
      manualConfirmationRequired: false,
    },
    {
      scenarioType: FailureScenarioType.CONTEXT_MISINTERPRETATION,
      scenarioDescription: "Agent misreads founder intent or customer segment context.",
      likelyCause: "Ambiguous instructions and long noisy context windows.",
      guardrail: "Insert a context summary step with explicit assumptions before execution.",
      manualConfirmationRequired: false,
    },
    {
      scenarioType: FailureScenarioType.IRREVERSIBLE_ACTION_RISK,
      scenarioDescription: "Agent attempts destructive action (send, delete, publish, purchase) without review.",
      likelyCause: "Missing approval gate for irreversible operations.",
      guardrail: "Add confirmation step before destructive action and include rollback instruction where possible.",
      manualConfirmationRequired: destructiveNeedsConfirmation,
    },
  ];

  await prisma.agentFailureMode.createMany({
    data: scenarios.map((scenario) => ({
      agentId,
      ...scenario,
    })),
  });
}

async function main() {
  await prisma.$transaction([
    prisma.kPI.deleteMany(),
    prisma.goal.deleteMany(),
    prisma.saaSPlan.deleteMany(),
    prisma.leverageScore.deleteMany(),
    prisma.strategyEntry.deleteMany(),
    prisma.financialMetric.deleteMany(),
    prisma.lessonProgress.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.learningTrack.deleteMany(),
    prisma.automationScore.deleteMany(),
    prisma.agentFailureMode.deleteMany(),
    prisma.agentWorkflow.deleteMany(),
    prisma.agentLog.deleteMany(),
    prisma.agent.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash("Founder@123", 12);

  const founder = await prisma.user.create({
    data: {
      email: "founder@faos.local",
      fullName: "Founder Operator",
      passwordHash,
      role: Role.FOUNDER,
    },
  });

  const emailTriageAgent = await prisma.agent.create({
    data: {
      userId: founder.id,
      name: "Email Triage Agent",
      whatItDoes: "Classifies inbound emails, drafts responses, and routes priority items to founder queue.",
      agentType: AgentType.SINGLE_TASK,
      triggerType: "Every 15 minutes from founder inbox",
      status: AgentStatus.LIVE,
      perceptionDefinition:
        "Receives inbound email payload with sender metadata, thread history, and labels from IMAP/Gmail webhook.",
      perceptionExamples: [
        {
          sender: "investor@fund.com",
          subject: "Follow-up on diligence",
          body: "Can you share this week\'s metrics by tomorrow?",
        },
        {
          sender: "support@customer.io",
          subject: "Refund request",
          body: "Please cancel and refund my subscription.",
        },
      ],
      brainModelLogic:
        "Applies intent classification (investor, customer support, sales, internal ops), urgency scoring, and response style rules.",
      decisionRules:
        "Investor and legal messages are always high priority. Refund requests require policy check before response. Unknown intent routes to manual review.",
      isDeterministic: false,
      toolsUsed: [
        "Email API",
        "CRM",
        "Knowledge Base",
        "Manual Approval Queue",
      ],
      manualApprovalRequired: true,
      memoryShortTerm: "Current email thread context and prior 5 messages.",
      memoryLongTerm: "Historical sender profile, past response outcomes, and escalation history in PostgreSQL.",
      learningLoopEnabled: true,
      inputSchema: {
        type: "object",
        required: ["sender", "subject", "body", "threadId"],
      },
      outputSchema: {
        type: "object",
        required: ["category", "priority", "recommendedAction", "draftReply"],
      },
      outputExample:
        '{"category":"Customer Support","priority":"High","recommendedAction":"Escalate to billing ops","draftReply":"Thanks for reaching out. I\'ve flagged this for immediate refund review."}',
      workflowSteps: [
        "1. Parse inbound email and normalize fields.",
        "2. Score urgency and intent with classification prompt.",
        "3. Validate against response policy and generate draft.",
        "4. Route to manual approval if destructive or financially sensitive.",
      ],
      guardrails: [
        "No email send without policy validation",
        "Never expose internal metrics unless sender is verified",
        "Force JSON output schema validation",
      ],
      fallbackBehavior:
        "When confidence < 0.7, mark as Manual Review and send a concise context summary to founder inbox.",
      destructiveActionConfirmation: true,
      timeSavedPerWeek: 8,
    },
  });

  const marketIntelAgent = await prisma.agent.create({
    data: {
      userId: founder.id,
      name: "Market Intelligence Agent",
      whatItDoes: "Monitors competitors, pricing moves, and market signals, then generates weekly intelligence brief.",
      agentType: AgentType.MULTI_STEP,
      triggerType: "Weekly every Monday at 07:00",
      status: AgentStatus.TESTING,
      perceptionDefinition:
        "Ingests web search snapshots, competitor release notes, customer reviews, and public financial updates.",
      perceptionExamples: [
        {
          competitor: "RivalOps",
          signal: "Launched usage-based plan",
          source: "pricing page",
        },
        {
          competitor: "FlowDesk",
          signal: "50 new enterprise logos announced",
          source: "press release",
        },
      ],
      brainModelLogic:
        "Runs signal extraction, trend clustering, and strategic implication scoring to prioritize founder action items.",
      decisionRules:
        "Only include signals with at least 2 independent sources. Highlight items that impact CAC, churn, or win rate.",
      isDeterministic: false,
      toolsUsed: [
        "Web Search",
        "Database",
        "API Calls",
        "File System",
      ],
      manualApprovalRequired: false,
      memoryShortTerm: "Current weekly signal set.",
      memoryLongTerm: "Historical market signal database and prior strategic decisions.",
      learningLoopEnabled: true,
      inputSchema: {
        type: "object",
        required: ["competitorList", "timeRange", "focusMetrics"],
      },
      outputSchema: {
        type: "object",
        required: ["topSignals", "threatLevel", "recommendedMoves"],
      },
      outputExample:
        '{"topSignals":["Competitor A reduced annual pricing by 15%"],"threatLevel":"Medium","recommendedMoves":["Test annual prepay incentive"]}',
      workflowSteps: [
        "1. Collect signals from approved source list.",
        "2. Remove duplicates and validate source trust.",
        "3. Score strategic impact by CAC/LTV/Burn effect.",
        "4. Publish weekly intelligence brief and action recommendations.",
      ],
      guardrails: [
        "No single-source claims",
        "Explicitly flag low-confidence findings",
        "Separate facts from inferences",
      ],
      fallbackBehavior:
        "If source fetch fails for >30% of competitors, publish partial brief with missing-source audit list.",
      destructiveActionConfirmation: true,
      timeSavedPerWeek: 6,
    },
  });

  const leadResearchAgent = await prisma.agent.create({
    data: {
      userId: founder.id,
      name: "Lead Research Agent",
      whatItDoes: "Orchestrates prospect discovery, enrichment, and qualification through a coordinated multi-agent flow.",
      agentType: AgentType.MULTI_AGENT,
      triggerType: "On-demand from sales sprint board",
      status: AgentStatus.BUILDING,
      perceptionDefinition:
        "Receives ICP constraints, target geography, company size bands, and vertical priorities.",
      perceptionExamples: [
        {
          icp: "B2B SaaS companies with 20-200 employees",
          region: "North America",
          budgetSignal: "Series A or above",
        },
      ],
      brainModelLogic:
        "Coordinator agent delegates to discovery, enrichment, and qualification specialist agents with shared scoring rubric.",
      decisionRules:
        "Prospect must meet at least 3 ICP constraints and show one active buying signal before entering outreach queue.",
      isDeterministic: false,
      toolsUsed: [
        "Web Search",
        "CRM",
        "Database",
        "API Calls",
      ],
      manualApprovalRequired: true,
      memoryShortTerm: "Current prospect batch and scoring context.",
      memoryLongTerm: "Lead qualification outcomes and conversion feedback loop.",
      learningLoopEnabled: true,
      inputSchema: {
        type: "object",
        required: ["icp", "targetCount", "mustHaveSignals"],
      },
      outputSchema: {
        type: "object",
        required: ["qualifiedLeads", "disqualifiedLeads", "confidence"],
      },
      outputExample:
        '{"qualifiedLeads":[{"company":"OrbitFlow","score":87}],"disqualifiedLeads":[{"company":"Acme","reason":"No buying signal"}],"confidence":0.81}',
      workflowSteps: [
        "1. Discovery agent compiles candidate accounts.",
        "2. Enrichment agent validates firmographic and technographic data.",
        "3. Qualification agent applies ICP scoring and risk filters.",
        "4. Coordinator agent assembles final list and routes to CRM.",
      ],
      guardrails: [
        "No lead export without confidence score",
        "Block personal data scraping beyond policy scope",
        "Enforce evidence fields for every qualification decision",
      ],
      fallbackBehavior:
        "If enrichment coverage drops below threshold, return narrowed list with missing-data flags instead of forcing completion.",
      destructiveActionConfirmation: true,
      timeSavedPerWeek: 10,
    },
  });

  const financeReportAgent = await prisma.agent.create({
    data: {
      userId: founder.id,
      name: "Finance Report Agent",
      whatItDoes: "Builds weekly finance and strategy report with variance analysis, burn trends, and runway alerts.",
      agentType: AgentType.MULTI_STEP,
      triggerType: "Every Friday at 18:00",
      status: AgentStatus.LIVE,
      perceptionDefinition:
        "Pulls MRR, costs, payroll, ad spend, receivables, and cash balance from integrated finance systems.",
      perceptionExamples: [
        {
          mrr: 85000,
          burnRate: 52000,
          cashBalance: 630000,
        },
      ],
      brainModelLogic:
        "Applies deterministic finance formulas for gross margin, burn multiple, and runway, then summarizes strategy implications.",
      decisionRules:
        "All metric calculations are deterministic. Narrative commentary is probabilistic but must cite computed values.",
      isDeterministic: true,
      toolsUsed: [
        "Database",
        "API Calls",
        "File System",
        "Manual Approval Queue",
      ],
      manualApprovalRequired: true,
      memoryShortTerm: "Current week transactional aggregates.",
      memoryLongTerm: "Historical financial metric series and board meeting decisions.",
      learningLoopEnabled: true,
      inputSchema: {
        type: "object",
        required: ["periodStart", "periodEnd", "revenue", "costs", "cashBalance"],
      },
      outputSchema: {
        type: "object",
        required: ["kpis", "risks", "recommendedActions"],
      },
      outputExample:
        '{"kpis":{"grossMargin":71.4,"runwayMonths":12.1},"risks":["Paid CAC increased 18%"],"recommendedActions":["Cut low-ROI channel spend"]}',
      workflowSteps: [
        "1. Fetch and reconcile finance source data.",
        "2. Compute KPI set with deterministic formulas.",
        "3. Generate strategy narrative tied to KPI deltas.",
        "4. Require CFO/founder approval before distribution.",
      ],
      guardrails: [
        "No report publish if data reconciliation fails",
        "Block narrative claims without metric reference",
        "Require approval for external investor sharing",
      ],
      fallbackBehavior:
        "On reconciliation mismatch, produce exception report and queue manual finance review.",
      destructiveActionConfirmation: true,
      timeSavedPerWeek: 7,
    },
  });

  const agents = [emailTriageAgent, marketIntelAgent, leadResearchAgent, financeReportAgent];

  await prisma.agentLog.createMany({
    data: agents.map((agent) => ({
      userId: founder.id,
      agentId: agent.id,
      agentName: agent.name,
      whatItDoes: agent.whatItDoes,
      agentType: agent.agentType,
      toolsUsed: Array.isArray(agent.toolsUsed) ? (agent.toolsUsed as string[]) : [],
      triggerType: agent.triggerType,
      inputDefinition: JSON.stringify(agent.inputSchema),
      outputDefinition: JSON.stringify(agent.outputSchema),
      status: agent.status,
      timeSavedPerWeek: agent.timeSavedPerWeek,
      failureNotes: "Primary failure modes are tracked in Agent Failure Mode module.",
      lessonsLearned: "Explicit schemas + guardrails reduce regression and improve trust.",
    })),
  });

  await prisma.agentWorkflow.createMany({
    data: [
      {
        agentId: emailTriageAgent.id,
        stepNumber: 1,
        stepTitle: "Ingest Email",
        stepDetail: "Normalize inbound payload and parse thread context.",
        inputContract: "Raw email JSON",
        outputContract: "Normalized email record",
        fallbackAction: "Route unreadable payload to manual queue.",
      },
      {
        agentId: emailTriageAgent.id,
        stepNumber: 2,
        stepTitle: "Classify",
        stepDetail: "Assign intent and urgency labels.",
        inputContract: "Normalized email record",
        outputContract: "Intent + urgency",
        fallbackAction: "Set intent=unknown and request operator validation.",
      },
      {
        agentId: marketIntelAgent.id,
        stepNumber: 1,
        stepTitle: "Gather Signals",
        stepDetail: "Collect competitor and market events from whitelisted sources.",
        inputContract: "Competitor watchlist",
        outputContract: "Raw signal events",
        fallbackAction: "Record source outage and continue partial run.",
      },
      {
        agentId: marketIntelAgent.id,
        stepNumber: 2,
        stepTitle: "Score Impact",
        stepDetail: "Rank events by expected effect on revenue, CAC, and churn.",
        inputContract: "Raw signal events",
        outputContract: "Prioritized signal list",
        fallbackAction: "Publish low-confidence flag and hold recommendation confidence.",
      },
      {
        agentId: leadResearchAgent.id,
        stepNumber: 1,
        stepTitle: "Discover Accounts",
        stepDetail: "Multi-agent discovery of target companies.",
        inputContract: "ICP constraint set",
        outputContract: "Candidate account list",
        fallbackAction: "Narrow to highest confidence vertical subset.",
      },
      {
        agentId: leadResearchAgent.id,
        stepNumber: 2,
        stepTitle: "Enrich + Qualify",
        stepDetail: "Enrich candidate records and score against ICP rubric.",
        inputContract: "Candidate account list",
        outputContract: "Qualified lead list",
        fallbackAction: "Return enriched partial set with missing fields flagged.",
      },
      {
        agentId: financeReportAgent.id,
        stepNumber: 1,
        stepTitle: "Reconcile Data",
        stepDetail: "Pull and reconcile financial data from source systems.",
        inputContract: "Period and account mappings",
        outputContract: "Reconciled ledger snapshot",
        fallbackAction: "Produce reconciliation exception report.",
      },
      {
        agentId: financeReportAgent.id,
        stepNumber: 2,
        stepTitle: "Generate Report",
        stepDetail: "Calculate KPI metrics and compile executive report.",
        inputContract: "Reconciled ledger snapshot",
        outputContract: "Finance report package",
        fallbackAction: "Abort publish and request controller approval.",
      },
    ],
  });

  await createStandardFailureModes(emailTriageAgent.id, true);
  await createStandardFailureModes(marketIntelAgent.id, true);
  await createStandardFailureModes(leadResearchAgent.id, true);
  await createStandardFailureModes(financeReportAgent.id, true);

  const automationProfiles: Array<{ agentId: string; taskName: string; checklist: AutomationChecklist; notes: string }> = [
    {
      agentId: emailTriageAgent.id,
      taskName: "Inbox triage and prioritization",
      checklist: {
        doneThreePlusPerWeek: true,
        predictableWorkflow: true,
        clearInputsOutputs: true,
        errorToleranceAcceptable: true,
        timeSavedMeaningful: true,
      },
      notes: "High-volume repetitive process with measurable response-time gains.",
    },
    {
      agentId: marketIntelAgent.id,
      taskName: "Weekly market intelligence synthesis",
      checklist: {
        doneThreePlusPerWeek: true,
        predictableWorkflow: true,
        clearInputsOutputs: true,
        errorToleranceAcceptable: true,
        timeSavedMeaningful: true,
      },
      notes: "Well suited for multi-step automation with citation guardrails.",
    },
    {
      agentId: leadResearchAgent.id,
      taskName: "Prospect discovery and enrichment",
      checklist: {
        doneThreePlusPerWeek: true,
        predictableWorkflow: false,
        clearInputsOutputs: true,
        errorToleranceAcceptable: true,
        timeSavedMeaningful: true,
      },
      notes: "Use multi-agent pattern due to variable context and enrichment quality variance.",
    },
    {
      agentId: financeReportAgent.id,
      taskName: "Weekly finance reporting",
      checklist: {
        doneThreePlusPerWeek: true,
        predictableWorkflow: true,
        clearInputsOutputs: true,
        errorToleranceAcceptable: false,
        timeSavedMeaningful: true,
      },
      notes: "Automate calculations but preserve human approval for final distribution.",
    },
  ];

  await prisma.automationScore.createMany({
    data: automationProfiles.map((profile) => {
      const score = computeAutomationScore(profile.checklist);
      return {
        userId: founder.id,
        agentId: profile.agentId,
        taskName: profile.taskName,
        ...profile.checklist,
        score,
        recommendation: automationRecommendation(score),
        notes: profile.notes,
      };
    }),
  });

  const tracks = await prisma.$transaction([
    prisma.learningTrack.create({
      data: {
        slug: "ceo-foundations",
        title: "CEO Foundations",
        description: "Decision velocity, accountability, and operating cadence.",
        sortOrder: 1,
      },
    }),
    prisma.learningTrack.create({
      data: {
        slug: "financial-intelligence",
        title: "Financial Intelligence",
        description: "Unit economics, burn discipline, and capital allocation.",
        sortOrder: 2,
      },
    }),
    prisma.learningTrack.create({
      data: {
        slug: "strategic-thinking",
        title: "Strategic Thinking",
        description: "Positioning, competitive response, and market timing.",
        sortOrder: 3,
      },
    }),
    prisma.learningTrack.create({
      data: {
        slug: "operations-systems",
        title: "Operations & Systems",
        description: "Process design, quality control, and execution loops.",
        sortOrder: 4,
      },
    }),
    prisma.learningTrack.create({
      data: {
        slug: "growth-gtm",
        title: "Growth & GTM",
        description: "Demand generation, conversion, and retention strategy.",
        sortOrder: 5,
      },
    }),
    prisma.learningTrack.create({
      data: {
        slug: "capital-fundraising",
        title: "Capital & Fundraising",
        description: "Fundraising readiness and investor narrative design.",
        sortOrder: 6,
      },
    }),
    prisma.learningTrack.create({
      data: {
        slug: "ai-systems-thinking",
        title: "AI Systems Thinking",
        description: "Designing resilient AI agents and automation architecture.",
        sortOrder: 7,
      },
    }),
  ]);

  const lessons = await prisma.$transaction(
    tracks.map((track, index) =>
      prisma.lesson.create({
        data: {
          learningTrackId: track.id,
          title: `${track.title}: Execution Module`,
          coreConcept: "Translate high-level strategy into measurable operating systems.",
          whyItMattersAtScale:
            "As headcount and complexity grow, undocumented founder intuition creates bottlenecks and execution drift.",
          tacticalImplementation:
            "Define weekly scorecards, owner accountability, and explicit decision criteria for each core workflow.",
          commonFounderMistakes:
            "Acting as single point of decision, skipping process instrumentation, and optimizing for activity instead of outcomes.",
          executionChecklist: [
            "Define one measurable objective",
            "Assign direct owner and timeline",
            "Set leading and lagging KPIs",
            "Create review cadence with corrective actions",
          ],
          reflectionPrompt: "Which decision still depends on founder intuition and how can it be systematized this week?",
          sortOrder: index + 1,
        },
      }),
    ),
  );

  await prisma.lessonProgress.createMany({
    data: lessons.slice(0, 4).map((lesson, idx) => ({
      userId: founder.id,
      lessonId: lesson.id,
      completed: idx < 2,
      completedAt: idx < 2 ? new Date() : null,
      notes:
        idx < 2
          ? "Implemented checklist in weekly operating review."
          : "Planned for next sprint.",
    })),
  });

  const now = new Date();
  const monthlyMetrics = Array.from({ length: 6 }).map((_, idx) => {
    const periodStart = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const revenue = 68000 + idx * 7000;
    const costStructure = 32000 + idx * 2500;
    const grossMargin = Number((((revenue - costStructure) / revenue) * 100).toFixed(2));
    const mrr = revenue;
    const arr = mrr * 12;
    const burnRate = 52000 - idx * 1500;
    const runwayMonths = Number((650000 / Math.max(1, burnRate)).toFixed(2));

    return {
      userId: founder.id,
      periodStart,
      scenarioName: "Base",
      revenue,
      costStructure,
      grossMargin,
      cac: 1800 - idx * 60,
      ltv: 11000 + idx * 600,
      burnRate,
      runwayMonths,
      arr,
      mrr,
      unitEconomics: {
        paybackMonths: Number((1800 / Math.max(1, (11000 + idx * 600) / 24)).toFixed(2)),
        contributionMargin: grossMargin,
      },
    };
  });

  await prisma.financialMetric.createMany({ data: monthlyMetrics });

  await prisma.strategyEntry.createMany({
    data: [
      {
        userId: founder.id,
        entryType: StrategyEntryType.MARKET_SIZING,
        title: "Founder AI Agent OS Market Size",
        content: {
          tam: 12000000000,
          sam: 1800000000,
          som: 95000000,
          assumptions: [
            "Global SMB and startup ops software spend",
            "AI automation segment within operations stack",
            "Initial 3-year beachhead in founder-led SaaS teams",
          ],
        },
      },
      {
        userId: founder.id,
        entryType: StrategyEntryType.COMPETITIVE_MATRIX,
        title: "Competitive Matrix - Agent Ops Platforms",
        content: {
          axes: ["Execution Forcing", "Agent Framework Depth", "Commercialization Toolkit"],
          matrix: [
            { company: "Founder AI Agent OS", executionForcing: 9, frameworkDepth: 10, commercializationToolkit: 9 },
            { company: "Generic Workflow Tool", executionForcing: 4, frameworkDepth: 3, commercializationToolkit: 2 },
            { company: "Prompt Playground", executionForcing: 2, frameworkDepth: 5, commercializationToolkit: 1 },
          ],
        },
      },
      {
        userId: founder.id,
        entryType: StrategyEntryType.SWOT,
        title: "Current SWOT Snapshot",
        content: {
          strengths: ["Integrated learning + execution", "Native automation scoring"],
          weaknesses: ["Early GTM motion", "Limited direct integrations"],
          opportunities: ["Founder communities", "AI ops consulting funnel"],
          threats: ["Horizontal platform bundling", "Rapid model commoditization"],
        },
      },
      {
        userId: founder.id,
        entryType: StrategyEntryType.ROI_OPPORTUNITY,
        title: "Top Automation Opportunities",
        content: {
          ranked: [
            { task: "Inbound lead qualification", estimatedHours: 12, roiScore: 88 },
            { task: "Weekly investor update drafting", estimatedHours: 6, roiScore: 84 },
            { task: "Finance variance analysis", estimatedHours: 7, roiScore: 82 },
            { task: "Support escalation routing", estimatedHours: 9, roiScore: 79 },
            { task: "Competitor release monitoring", estimatedHours: 8, roiScore: 76 },
          ],
        },
      },
      {
        userId: founder.id,
        entryType: StrategyEntryType.DEBUG_DIAGNOSTIC,
        title: "Debug Console Baseline Example",
        content: {
          expectedBehavior: "Agent returns JSON with action plan and confidence.",
          actualBehavior: "Agent returned paragraph text with no schema.",
          diagnosis: [
            "Prompt lacks explicit response contract",
            "No output validator in post-processing",
            "Missing fallback when confidence is low",
          ],
          suggestedFix: "Add strict JSON schema instructions and enforce parser retry.",
        },
      },
      {
        userId: founder.id,
        entryType: StrategyEntryType.GTM_ROADMAP,
        title: "GTM Roadmap Q2",
        content: {
          milestones: [
            "Launch founder cohort beta",
            "Publish 4 case-study teardowns",
            "Close 15 design partners",
            "Introduce paid pro tier",
          ],
        },
      },
    ],
  });

  const leverageInputs = Array.from({ length: 6 }).map((_, idx) => {
    const periodStart = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
    const timeSaved = 10 + idx * 2;
    const revenueImpact = 1.3 + idx * 0.12;
    const automationDepth = 1.2 + idx * 0.2;
    const recurringRevenuePercent = 42 + idx * 3;
    const delegationScore = 18 + idx * 2;
    const founderDependencyPercent = 62 - idx * 4;

    return {
      userId: founder.id,
      periodStart,
      timeSaved,
      revenueImpact,
      automationDepth,
      recurringRevenuePercent,
      delegationScore,
      founderDependencyPercent,
      leverageScore: Number(
        computeLeverageScore({
          timeSaved,
          revenueImpact,
          automationDepth,
          recurringRevenuePercent,
          delegationScore,
          founderDependencyPercent,
        }).toFixed(2),
      ),
      hoursReplaced: 18 + idx * 3,
      automationCoverage: 24 + idx * 6,
      revenuePerEmployee: 64000 + idx * 5200,
      revenuePerHour: 72 + idx * 8,
      systemsBuiltCount: 4 + idx,
    };
  });

  await prisma.leverageScore.createMany({ data: leverageInputs });

  const primaryGoal = await prisma.goal.create({
    data: {
      userId: founder.id,
      title: "Scale agent operating system to repeatable SaaS motion",
      description: "Ship stable core modules, instrument execution loops, and convert internal ops to paid offerings.",
      category: GoalCategory.GROWTH,
      status: GoalStatus.IN_PROGRESS,
      progress: 58,
      targetDate: new Date(now.getFullYear(), now.getMonth() + 3, 30),
    },
  });

  await prisma.kPI.createMany({
    data: [
      {
        userId: founder.id,
        goalId: primaryGoal.id,
        name: "MRR",
        unit: "USD",
        currentValue: 85000,
        targetValue: 140000,
        periodLabel: "Monthly",
      },
      {
        userId: founder.id,
        goalId: primaryGoal.id,
        name: "Automation Coverage",
        unit: "%",
        currentValue: 42,
        targetValue: 70,
        periodLabel: "Monthly",
      },
      {
        userId: founder.id,
        goalId: primaryGoal.id,
        name: "Founder Dependency",
        unit: "%",
        currentValue: 46,
        targetValue: 30,
        periodLabel: "Monthly",
      },
    ],
  });

  await prisma.saaSPlan.create({
    data: {
      userId: founder.id,
      planName: "Founder AI Agent OS Commercialization Plan",
      icpDefinition: "Founder-led B2B SaaS companies (5-75 employees) with active weekly operations rhythm.",
      problemStatement:
        "Founders are overloaded by repeated operator work, inconsistent decision systems, and fragile AI automations.",
      valueProposition:
        "Turn chaotic founder operations into structured, measurable agent systems that save time and increase revenue leverage.",
      pricingExperiments: [
        { model: "Starter", price: 199, hypothesis: "Solo founders adopt execution command center quickly." },
        { model: "Growth", price: 599, hypothesis: "Teams pay for multi-agent orchestration and analytics." },
        { model: "Scale", price: 1499, hypothesis: "Includes commercialization lab and workflow consulting." },
      ],
      featureGates: {
        starter: ["Agent Log", "Automation Checklist", "CEO Learning"],
        growth: ["Failure Analysis", "Finance Strategy", "Debug Console", "Leverage Dashboard"],
        scale: ["Multi-agent Templates", "SaaS Lab", "Priority Integrations", "Dedicated Support"],
      },
      subscriptionTiers: [
        { name: "Starter", monthlyPrice: 199, seats: 1 },
        { name: "Growth", monthlyPrice: 599, seats: 5 },
        { name: "Scale", monthlyPrice: 1499, seats: 20 },
      ],
      gtmRoadmap: [
        "Niche founder cohort launch",
        "Case-study-driven inbound funnel",
        "Partner channel with operator communities",
        "Expansion via templates and integration marketplace",
      ],
    },
  });

  console.log("Seed complete");
  console.log("Email: founder@faos.local");
  console.log("Password: Founder@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
