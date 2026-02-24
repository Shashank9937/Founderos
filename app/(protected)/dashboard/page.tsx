import { BarChartCard } from "@/components/charts/bar-chart";
import { LineChartCard } from "@/components/charts/line-chart";
import { PieChartCard } from "@/components/charts/pie-chart";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const summary = await getDashboardSummary(user.id);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Command Center</p>
        <h2 className="text-2xl font-bold">Founder AI Agent Operating System</h2>
        <p className="text-sm text-muted-foreground">
          Train CEO-level systems thinking, enforce execution, and convert internal operations into monetizable SaaS assets.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Agents" value={String(summary.headline.totalAgents)} hint={`${summary.headline.liveAgents} live`} />
        <MetricCard label="Automation Score" value={`${summary.headline.avgAutomationScore}/100`} hint="Automation worthiness average" />
        <MetricCard label="Time Saved / Week" value={`${summary.headline.totalTimeSavedPerWeek}h`} hint="Agent log aggregate" />
        <MetricCard label="Learning Progress" value={`${summary.headline.learningCompletionPercent}%`} hint="Lesson completion" />
        <MetricCard label="MRR" value={formatCurrency(summary.headline.latestMRR)} hint="Latest financial snapshot" />
        <MetricCard label="Runway" value={`${summary.headline.latestRunwayMonths} months`} />
        <MetricCard label="Leverage Score" value={String(summary.headline.latestLeverageScore)} />
        <MetricCard label="Systems Built" value={String(summary.headline.systemsBuiltCount)} />
        <MetricCard label="Active Goals" value={String(summary.headline.activeGoals)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartCard
          title="Leverage Growth"
          description="Leverage score and automation coverage trend"
          data={summary.charts.leverageTrend}
          xKey="period"
          series={[
            { key: "leverage", color: "#38bdf8", name: "Leverage" },
            { key: "coverage", color: "#22c55e", name: "Coverage %" },
          ]}
        />

        <LineChartCard
          title="Finance Pulse"
          description="MRR vs burn rate"
          data={summary.charts.financeTrend}
          xKey="period"
          series={[
            { key: "mrr", color: "#a3e635", name: "MRR" },
            { key: "burn", color: "#f97316", name: "Burn" },
          ]}
        />

        <BarChartCard
          title="Automation Score Trend"
          description="Recent automation checklist outcomes"
          data={summary.charts.automationTrend}
          xKey="date"
          yKey="score"
          color="#fb923c"
        />

        <PieChartCard
          title="Agent Status Distribution"
          description="Operational state of each registered agent"
          data={summary.charts.statusDistribution}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
          <h3 className="mb-3 text-sm font-semibold">Structured Agent Logs</h3>
          <Table>
            <THead>
              <TR>
                <TH>Agent</TH>
                <TH>Status</TH>
                <TH>Trigger</TH>
                <TH>Time Saved</TH>
              </TR>
            </THead>
            <TBody>
              {summary.recentLogs.map((log) => (
                <TR key={log.id}>
                  <TD>{log.agentName}</TD>
                  <TD>
                    <Badge>{log.status}</Badge>
                  </TD>
                  <TD>{log.triggerType}</TD>
                  <TD>{log.timeSavedPerWeek}h</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <div className="rounded-lg border border-border/70 bg-card/80 p-4">
          <h3 className="text-sm font-semibold">Top 5 Automation Opportunities by ROI</h3>
          <p className="mt-1 text-xs text-muted-foreground">Auto-ranked from roadmap engine and strategy entries.</p>
          <ul className="mt-3 space-y-2">
            {summary.opportunities.length ? (
              summary.opportunities.map((item, index) => (
                <li key={`${item.task}-${index}`} className="rounded-md border border-border/60 bg-background/30 p-2 text-sm">
                  <p className="font-medium">{index + 1}. {item.task}</p>
                  <p className="text-xs text-muted-foreground">ROI score: {item.roiScore} | Estimated hours: {item.estimatedHours}</p>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No roadmap opportunity entries yet.</li>
            )}
          </ul>

          <div className="mt-4 rounded-md border border-border/60 bg-background/30 p-2 text-xs text-muted-foreground">
            Latest debug highlight: {summary.debugHighlight}
          </div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <h3 className="mb-3 text-sm font-semibold">Goal Execution Overview</h3>
        <Table>
          <THead>
            <TR>
              <TH>Goal</TH>
              <TH>Status</TH>
              <TH>Progress</TH>
              <TH>KPIs</TH>
            </TR>
          </THead>
          <TBody>
            {summary.goals.map((goal) => (
              <TR key={goal.id}>
                <TD>{goal.title}</TD>
                <TD>
                  <Badge>{goal.status}</Badge>
                </TD>
                <TD>{goal.progress}%</TD>
                <TD>{goal.kpiCount}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
