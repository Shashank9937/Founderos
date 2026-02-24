import { StrategyEntryType } from "@prisma/client";
import { InlineForm } from "@/components/forms/inline-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { getRoadmapOpportunities } from "@/lib/dashboard";

const steps = [
  "Map processes",
  "Identify repetitive tasks",
  "Estimate time cost",
  "Calculate ROI",
  "Build MVP agent",
  "Test with edge cases",
  "Scale or abandon",
];

export default async function IntegrationRoadmapPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const opportunities = await getRoadmapOpportunities(user.id);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 6</p>
        <h2 className="text-2xl font-bold">AI Integration Roadmap Engine</h2>
        <p className="text-sm text-muted-foreground">
          Build AI integrations using a disciplined sequence that prioritizes ROI and de-risks edge cases before scale.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step} className="border-border/70 bg-card/80">
            <CardTitle>{index + 1}. {step}</CardTitle>
            <CardDescription>Required stage in the roadmap execution flow.</CardDescription>
          </Card>
        ))}
      </section>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <h3 className="mb-3 text-sm font-semibold">Top 5 Automation Opportunities Ranked by ROI</h3>
        <Table>
          <THead>
            <TR>
              <TH>Task</TH>
              <TH>Automation Score</TH>
              <TH>Monthly Hours</TH>
              <TH>ROI</TH>
              <TH>Recommendation</TH>
            </TR>
          </THead>
          <TBody>
            {opportunities.map((item) => (
              <TR key={item.task}>
                <TD>{item.task}</TD>
                <TD>{item.automationScore}/100</TD>
                <TD>{item.estimatedMonthlyHours}h</TD>
                <TD>{item.roi}</TD>
                <TD>{item.recommendation}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <InlineForm endpoint="/api/strategy-entries" submitLabel="Save Opportunity Ranking">
        <h3 className="text-sm font-semibold">Persist Custom Opportunity Ranking</h3>
        <input type="hidden" name="entryType" value={StrategyEntryType.ROI_OPPORTUNITY} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Title</span>
            <input name="title" defaultValue="Top Automation Opportunities" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Content JSON (ranked array)</span>
            <textarea
              name="content"
              defaultValue='{"ranked": [{"task": "", "roiScore": 0, "estimatedHours": 0}]}'
              className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            />
          </label>
        </div>
      </InlineForm>
    </div>
  );
}
