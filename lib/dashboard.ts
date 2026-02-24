import { unstable_cache } from "next/cache";
import { AgentStatus, StrategyEntryType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { recommendationLabel } from "@/lib/calculations";

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

async function buildDashboardSummary(userId: string) {
  const [agents, logs, automationScores, lessons, lessonProgress, financialMetrics, leverageScores, goals, strategyEntries] =
    await Promise.all([
      prisma.agent.findMany({
        where: { userId },
        select: { id: true, status: true },
      }),
      prisma.agentLog.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: {
          id: true,
          agentName: true,
          status: true,
          triggerType: true,
          timeSavedPerWeek: true,
          lessonsLearned: true,
        },
      }),
      prisma.automationScore.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: {
          score: true,
          createdAt: true,
          recommendation: true,
          taskName: true,
        },
      }),
      prisma.lesson.count(),
      prisma.lessonProgress.findMany({
        where: { userId },
        select: { completed: true },
      }),
      prisma.financialMetric.findMany({
        where: { userId },
        orderBy: { periodStart: "asc" },
        take: 12,
        select: {
          periodStart: true,
          mrr: true,
          burnRate: true,
          runwayMonths: true,
        },
      }),
      prisma.leverageScore.findMany({
        where: { userId },
        orderBy: { periodStart: "asc" },
        take: 12,
        select: {
          periodStart: true,
          leverageScore: true,
          automationCoverage: true,
          systemsBuiltCount: true,
        },
      }),
      prisma.goal.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          status: true,
          progress: true,
          _count: { select: { kpis: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.strategyEntry.findMany({
        where: {
          userId,
          entryType: {
            in: [StrategyEntryType.DEBUG_DIAGNOSTIC, StrategyEntryType.ROI_OPPORTUNITY],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          title: true,
          entryType: true,
          content: true,
        },
      }),
    ]);

  const statusCounts = Object.values(AgentStatus).reduce<Record<AgentStatus, number>>((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<AgentStatus, number>);

  for (const agent of agents) {
    statusCounts[agent.status] += 1;
  }

  const latestFinance = financialMetrics.at(-1);
  const latestLeverage = leverageScores.at(-1);

  const completedLessons = lessonProgress.filter((entry) => entry.completed).length;
  const totalLessons = lessons;
  const learningCompletionPercent = totalLessons > 0 ? Number(((completedLessons / totalLessons) * 100).toFixed(1)) : 0;

  const avgAutomationScore =
    automationScores.length > 0
      ? Number((automationScores.reduce((sum, item) => sum + item.score, 0) / automationScores.length).toFixed(1))
      : 0;

  const totalTimeSavedPerWeek = Number(logs.reduce((sum, item) => sum + item.timeSavedPerWeek, 0).toFixed(1));

  const recentDebug = strategyEntries.find((entry) => entry.entryType === StrategyEntryType.DEBUG_DIAGNOSTIC);
  const roiEntry = strategyEntries.find((entry) => entry.entryType === StrategyEntryType.ROI_OPPORTUNITY);

  return {
    headline: {
      totalAgents: agents.length,
      liveAgents: statusCounts.LIVE,
      avgAutomationScore,
      totalTimeSavedPerWeek,
      learningCompletionPercent,
      latestMRR: latestFinance?.mrr ?? 0,
      latestRunwayMonths: latestFinance?.runwayMonths ?? 0,
      latestLeverageScore: latestLeverage?.leverageScore ?? 0,
      systemsBuiltCount: latestLeverage?.systemsBuiltCount ?? agents.length,
      activeGoals: goals.filter((goal) => goal.status !== "COMPLETED").length,
    },
    charts: {
      statusDistribution: Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      })),
      automationTrend: automationScores.map((entry) => ({
        date: entry.createdAt.toISOString().slice(0, 10),
        score: entry.score,
      })),
      leverageTrend: leverageScores.map((entry) => ({
        period: entry.periodStart.toISOString().slice(0, 10),
        leverage: entry.leverageScore,
        coverage: entry.automationCoverage,
      })),
      financeTrend: financialMetrics.map((entry) => ({
        period: entry.periodStart.toISOString().slice(0, 10),
        mrr: entry.mrr,
        burn: entry.burnRate,
        runway: entry.runwayMonths,
      })),
    },
    recentLogs: logs,
    opportunities:
      roiEntry && typeof roiEntry.content === "object" && roiEntry.content
        ? ((roiEntry.content as { ranked?: Array<{ task?: string; roiScore?: number; estimatedHours?: number }> })
            .ranked ?? [])
            .map((item) => ({
              task: item.task ?? "Unnamed task",
              roiScore: asNumber(item.roiScore),
              estimatedHours: asNumber(item.estimatedHours),
            }))
            .slice(0, 5)
        : [],
    goals: goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      status: goal.status,
      progress: goal.progress,
      kpiCount: goal._count.kpis,
    })),
    debugHighlight: recentDebug?.title ?? "No diagnostic recorded yet",
  };
}

const getDashboardSummaryCached = unstable_cache(buildDashboardSummary, ["dashboard-summary"], {
  revalidate: 20,
});

export async function getDashboardSummary(userId: string) {
  return getDashboardSummaryCached(userId);
}

async function buildRoadmapOpportunities(userId: string) {
  const [scores, logs] = await Promise.all([
    prisma.automationScore.findMany({
      where: { userId },
      select: {
        agentId: true,
        taskName: true,
        score: true,
        recommendation: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.agentLog.findMany({
      where: { userId },
      select: { agentId: true, timeSavedPerWeek: true },
    }),
  ]);

  const logByAgent = new Map<string, number>();
  for (const log of logs) {
    if (!log.agentId) {
      continue;
    }

    logByAgent.set(log.agentId, (logByAgent.get(log.agentId) ?? 0) + log.timeSavedPerWeek);
  }

  return scores
    .map((score) => {
      const weeklyTime = score.agentId ? logByAgent.get(score.agentId) ?? 0 : 0;
      const monthlyTimeCost = Number((weeklyTime * 4).toFixed(1));
      const roi = Number((score.score * 0.6 + monthlyTimeCost * 1.3).toFixed(1));

      return {
        task: score.taskName,
        automationScore: score.score,
        recommendation: recommendationLabel(score.recommendation),
        estimatedMonthlyHours: monthlyTimeCost,
        roi,
      };
    })
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 5);
}

const getRoadmapOpportunitiesCached = unstable_cache(buildRoadmapOpportunities, ["roadmap-opportunities"], {
  revalidate: 30,
});

export async function getRoadmapOpportunities(userId: string) {
  return getRoadmapOpportunitiesCached(userId);
}
