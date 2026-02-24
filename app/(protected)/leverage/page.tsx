import { LineChartCard } from "@/components/charts/line-chart";
import { InlineForm } from "@/components/forms/inline-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function LeveragePage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const leverageScores = await prisma.leverageScore.findMany({
    where: { userId: user.id },
    orderBy: { periodStart: "asc" },
    take: 18,
  });

  const latest = leverageScores.at(-1);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 5</p>
        <h2 className="text-2xl font-bold">Leverage Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Leverage Score = (Time Saved × Revenue Impact × Automation Depth) + Recurring Revenue % + Delegation Score - Founder Dependency %.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Leverage Score</CardTitle>
          <CardDescription>{latest?.leverageScore ?? 0}</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Hours Replaced</CardTitle>
          <CardDescription>{latest?.hoursReplaced ?? 0}h</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Automation Coverage</CardTitle>
          <CardDescription>{latest?.automationCoverage ?? 0}%</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Revenue / Employee</CardTitle>
          <CardDescription>{latest?.revenuePerEmployee ?? 0}</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Revenue / Hour</CardTitle>
          <CardDescription>{latest?.revenuePerHour ?? 0}</CardDescription>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartCard
          title="Leverage Score History"
          description="Operational leverage progression"
          data={leverageScores.map((entry) => ({
            period: entry.periodStart.toISOString().slice(0, 10),
            leverage: entry.leverageScore,
            dependency: entry.founderDependencyPercent,
          }))}
          xKey="period"
          series={[
            { key: "leverage", color: "#22c55e", name: "Leverage" },
            { key: "dependency", color: "#f97316", name: "Founder Dependency %" },
          ]}
        />

        <LineChartCard
          title="Operational Efficiency"
          description="Coverage, systems count, and hours replaced"
          data={leverageScores.map((entry) => ({
            period: entry.periodStart.toISOString().slice(0, 10),
            coverage: entry.automationCoverage,
            systems: entry.systemsBuiltCount,
            replaced: entry.hoursReplaced,
          }))}
          xKey="period"
          series={[
            { key: "coverage", color: "#38bdf8", name: "Coverage %" },
            { key: "systems", color: "#a855f7", name: "Systems" },
            { key: "replaced", color: "#facc15", name: "Hours Replaced" },
          ]}
        />
      </section>

      <InlineForm endpoint="/api/leverage-scores" submitLabel="Calculate Leverage Score">
        <h3 className="text-sm font-semibold">Record Leverage Snapshot</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs">Period Start</span>
            <input type="date" name="periodStart" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Time Saved</span>
            <input type="number" min={0} step="0.1" name="timeSaved" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Revenue Impact</span>
            <input type="number" min={0} step="0.1" name="revenueImpact" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Automation Depth</span>
            <input type="number" min={0} step="0.1" name="automationDepth" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Recurring Revenue %</span>
            <input type="number" min={0} max={100} step="0.1" name="recurringRevenuePercent" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Delegation Score</span>
            <input type="number" min={0} step="0.1" name="delegationScore" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Founder Dependency %</span>
            <input type="number" min={0} max={100} step="0.1" name="founderDependencyPercent" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Hours Replaced</span>
            <input type="number" min={0} step="0.1" name="hoursReplaced" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Automation Coverage %</span>
            <input type="number" min={0} max={100} step="0.1" name="automationCoverage" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Revenue / Employee</span>
            <input type="number" min={0} step="0.1" name="revenuePerEmployee" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Revenue / Hour</span>
            <input type="number" min={0} step="0.1" name="revenuePerHour" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Systems Built Count</span>
            <input type="number" min={0} name="systemsBuiltCount" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
        </div>
      </InlineForm>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <h3 className="mb-3 text-sm font-semibold">Leverage Log</h3>
        <Table>
          <THead>
            <TR>
              <TH>Period</TH>
              <TH>Leverage</TH>
              <TH>Hours Replaced</TH>
              <TH>Coverage</TH>
              <TH>Rev/Employee</TH>
              <TH>Rev/Hour</TH>
              <TH>Systems Built</TH>
            </TR>
          </THead>
          <TBody>
            {leverageScores
              .slice()
              .reverse()
              .map((entry) => (
                <TR key={entry.id}>
                  <TD>{entry.periodStart.toISOString().slice(0, 10)}</TD>
                  <TD>{entry.leverageScore}</TD>
                  <TD>{entry.hoursReplaced}</TD>
                  <TD>{entry.automationCoverage}%</TD>
                  <TD>{entry.revenuePerEmployee}</TD>
                  <TD>{entry.revenuePerHour}</TD>
                  <TD>{entry.systemsBuiltCount}</TD>
                </TR>
              ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
