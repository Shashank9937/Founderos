import { StrategyEntryType } from "@prisma/client";
import { BarChartCard } from "@/components/charts/bar-chart";
import { LineChartCard } from "@/components/charts/line-chart";
import { InlineForm } from "@/components/forms/inline-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";

function contentToText(value: unknown) {
  if (!value) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "-";
  }
}

export default async function FinanceStrategyPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [metrics, strategyEntries] = await Promise.all([
    prisma.financialMetric.findMany({
      where: { userId: user.id },
      orderBy: { periodStart: "asc" },
      take: 12,
    }),
    prisma.strategyEntry.findMany({
      where: {
        userId: user.id,
        entryType: {
          in: [StrategyEntryType.MARKET_SIZING, StrategyEntryType.COMPETITIVE_MATRIX, StrategyEntryType.SWOT],
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 12,
    }),
  ]);

  const latest = metrics.at(-1);

  const marketSizingEntries = strategyEntries.filter((entry) => entry.entryType === StrategyEntryType.MARKET_SIZING);
  const competitiveEntries = strategyEntries.filter((entry) => entry.entryType === StrategyEntryType.COMPETITIVE_MATRIX);
  const swotEntries = strategyEntries.filter((entry) => entry.entryType === StrategyEntryType.SWOT);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 4</p>
        <h2 className="text-2xl font-bold">Finance & Strategy Intelligence</h2>
        <p className="text-sm text-muted-foreground">
          Capture core financial metrics, run scenario simulations, and build strategic artifacts for market sizing, competitive positioning, and SWOT.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Revenue</CardTitle>
          <CardDescription>{formatCurrency(latest?.revenue ?? 0)}</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Gross Margin</CardTitle>
          <CardDescription>{latest?.grossMargin ?? 0}%</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>CAC / LTV</CardTitle>
          <CardDescription>{(latest?.cac ?? 0).toFixed(0)} / {(latest?.ltv ?? 0).toFixed(0)}</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Burn / Runway</CardTitle>
          <CardDescription>{formatCurrency(latest?.burnRate ?? 0)} / {latest?.runwayMonths ?? 0} months</CardDescription>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <LineChartCard
          title="MRR and ARR"
          description="Revenue growth trend"
          data={metrics.map((metric) => ({
            period: metric.periodStart.toISOString().slice(0, 10),
            mrr: metric.mrr,
            arr: metric.arr,
          }))}
          xKey="period"
          series={[
            { key: "mrr", color: "#22c55e", name: "MRR" },
            { key: "arr", color: "#38bdf8", name: "ARR" },
          ]}
        />

        <BarChartCard
          title="Burn Rate"
          description="Scenario burn trend"
          data={metrics.map((metric) => ({
            period: metric.periodStart.toISOString().slice(0, 10),
            burn: metric.burnRate,
          }))}
          xKey="period"
          yKey="burn"
          color="#f97316"
        />
      </section>

      <InlineForm endpoint="/api/financial-metrics" submitLabel="Save Financial Snapshot">
        <h3 className="text-sm font-semibold">Financial Inputs + Real-time KPI Calculation</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs">Period Start</span>
            <input type="date" name="periodStart" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Scenario Name</span>
            <input name="scenarioName" defaultValue="Base" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Revenue</span>
            <input type="number" min={0} step="0.01" name="revenue" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Cost Structure</span>
            <input type="number" min={0} step="0.01" name="costStructure" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">CAC</span>
            <input type="number" min={0} step="0.01" name="cac" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">LTV</span>
            <input type="number" min={0} step="0.01" name="ltv" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Burn Rate</span>
            <input type="number" min={0} step="0.01" name="burnRate" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Cash Reserve (for runway calculation)</span>
            <input type="number" min={0} step="0.01" name="cashReserve" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">MRR</span>
            <input type="number" min={0} step="0.01" name="mrr" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">ARR</span>
            <input type="number" min={0} step="0.01" name="arr" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Unit Economics JSON</span>
            <textarea name="unitEconomics" required className="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
          </label>
        </div>
      </InlineForm>

      <section className="grid gap-4 xl:grid-cols-3">
        <InlineForm endpoint="/api/strategy-entries" submitLabel="Save TAM/SAM/SOM">
          <h3 className="text-sm font-semibold">Market Sizing Calculator</h3>
          <input type="hidden" name="entryType" value={StrategyEntryType.MARKET_SIZING} />
          <label className="space-y-1">
            <span className="text-xs">Title</span>
            <input name="title" defaultValue="Market Sizing" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Content (JSON: TAM/SAM/SOM)</span>
            <textarea
              name="content"
              defaultValue='{"tam": 0, "sam": 0, "som": 0, "assumptions": []}'
              className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            />
          </label>
        </InlineForm>

        <InlineForm endpoint="/api/strategy-entries" submitLabel="Save Competitive Matrix">
          <h3 className="text-sm font-semibold">Competitive Matrix Builder</h3>
          <input type="hidden" name="entryType" value={StrategyEntryType.COMPETITIVE_MATRIX} />
          <label className="space-y-1">
            <span className="text-xs">Title</span>
            <input name="title" defaultValue="Competitive Matrix" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Content (JSON)</span>
            <textarea
              name="content"
              defaultValue='{"axes": ["Feature", "Price", "Execution"], "matrix": []}'
              className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            />
          </label>
        </InlineForm>

        <InlineForm endpoint="/api/strategy-entries" submitLabel="Save SWOT">
          <h3 className="text-sm font-semibold">SWOT Builder</h3>
          <input type="hidden" name="entryType" value={StrategyEntryType.SWOT} />
          <label className="space-y-1">
            <span className="text-xs">Title</span>
            <input name="title" defaultValue="SWOT" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Content (JSON)</span>
            <textarea
              name="content"
              defaultValue='{"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}'
              className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            />
          </label>
        </InlineForm>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <h3 className="mb-3 text-sm font-semibold">Financial Metric History</h3>
        <Table>
          <THead>
            <TR>
              <TH>Period</TH>
              <TH>Scenario</TH>
              <TH>Revenue</TH>
              <TH>Gross Margin</TH>
              <TH>CAC</TH>
              <TH>LTV</TH>
              <TH>Burn</TH>
              <TH>Runway</TH>
            </TR>
          </THead>
          <TBody>
            {metrics
              .slice()
              .reverse()
              .map((metric) => (
                <TR key={metric.id}>
                  <TD>{metric.periodStart.toISOString().slice(0, 10)}</TD>
                  <TD>{metric.scenarioName}</TD>
                  <TD>{formatCurrency(metric.revenue)}</TD>
                  <TD>{metric.grossMargin}%</TD>
                  <TD>{formatCurrency(metric.cac)}</TD>
                  <TD>{formatCurrency(metric.ltv)}</TD>
                  <TD>{formatCurrency(metric.burnRate)}</TD>
                  <TD>{metric.runwayMonths} months</TD>
                </TR>
              ))}
          </TBody>
        </Table>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Market Sizing Entries</CardTitle>
          <CardDescription className="mt-2 whitespace-pre-wrap text-xs">{contentToText(marketSizingEntries[0]?.content)}</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>Competitive Matrix</CardTitle>
          <CardDescription className="mt-2 whitespace-pre-wrap text-xs">{contentToText(competitiveEntries[0]?.content)}</CardDescription>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardTitle>SWOT</CardTitle>
          <CardDescription className="mt-2 whitespace-pre-wrap text-xs">{contentToText(swotEntries[0]?.content)}</CardDescription>
        </Card>
      </section>
    </div>
  );
}
