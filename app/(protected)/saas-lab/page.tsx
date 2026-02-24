import { GoalCategory, GoalStatus } from "@prisma/client";
import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function pretty(value: unknown) {
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

export default async function SaasLabPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [plans, goals] = await Promise.all([
    prisma.saaSPlan.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 10 }),
    prisma.goal.findMany({ where: { userId: user.id }, include: { kpis: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 8</p>
        <h2 className="text-2xl font-bold">SaaS Commercialization Lab</h2>
        <p className="text-sm text-muted-foreground">
          Convert internal founder systems into monetizable SaaS products with ICP clarity, value proposition rigor, pricing experiments, feature gating, and GTM roadmap execution.
        </p>
      </section>

      <InlineForm endpoint="/api/saas-plans" submitLabel="Save Commercialization Plan">
        <h3 className="text-sm font-semibold">Create SaaS Plan</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Plan Name</span>
            <input name="planName" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">ICP Builder Output</span>
            <textarea name="icpDefinition" required className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Problem Statement</span>
            <textarea name="problemStatement" required className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Value Proposition Generator Output</span>
            <textarea name="valueProposition" required className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Pricing Experiment Tracker (JSON)</span>
            <textarea name="pricingExperiments" required className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Feature Gating System (JSON)</span>
            <textarea name="featureGates" required className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Subscription Tiers (JSON)</span>
            <textarea name="subscriptionTiers" required className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
          </label>
          <label className="space-y-1">
            <span className="text-xs">GTM Roadmap (JSON)</span>
            <textarea name="gtmRoadmap" required className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
          </label>
        </div>
      </InlineForm>

      <section className="grid gap-4 xl:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="space-y-2 border-border/70 bg-card/80">
            <CardTitle>{plan.planName}</CardTitle>
            <CardDescription>{plan.icpDefinition}</CardDescription>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Problem:</span> {plan.problemStatement}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Value Proposition:</span> {plan.valueProposition}
            </p>
            <div className="grid gap-2 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Pricing Experiments</span></p>
              <pre className="max-h-36 overflow-auto rounded border border-border/60 bg-background/40 p-2">{pretty(plan.pricingExperiments)}</pre>
              <p><span className="font-medium text-foreground">Feature Gating</span></p>
              <pre className="max-h-36 overflow-auto rounded border border-border/60 bg-background/40 p-2">{pretty(plan.featureGates)}</pre>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <InlineForm endpoint="/api/goals" submitLabel="Create Goal">
          <h3 className="text-sm font-semibold">Execution Goals</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs">Goal Title</span>
              <input name="title" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs">Description</span>
              <textarea name="description" className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Category</span>
              <select name="category" defaultValue={GoalCategory.GROWTH} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {Object.values(GoalCategory).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs">Status</span>
              <select name="status" defaultValue={GoalStatus.NOT_STARTED} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {Object.values(GoalStatus).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs">Progress %</span>
              <input type="number" name="progress" min={0} max={100} defaultValue={0} required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Target Date</span>
              <input type="date" name="targetDate" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </label>
          </div>
        </InlineForm>

        <InlineForm endpoint="/api/kpis" submitLabel="Add KPI">
          <h3 className="text-sm font-semibold">KPI Tracker</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs">Goal</span>
              <select name="goalId" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>{goal.title}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs">KPI Name</span>
              <input name="name" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Unit</span>
              <input name="unit" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Current Value</span>
              <input type="number" step="0.01" name="currentValue" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-xs">Target Value</span>
              <input type="number" step="0.01" name="targetValue" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs">Period Label</span>
              <input name="periodLabel" defaultValue="Monthly" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </label>
          </div>
        </InlineForm>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <h3 className="mb-3 text-sm font-semibold">Goal and KPI Status</h3>
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
            {goals.map((goal) => (
              <TR key={goal.id}>
                <TD>{goal.title}</TD>
                <TD>
                  <Badge>{goal.status}</Badge>
                </TD>
                <TD>{goal.progress}%</TD>
                <TD>
                  {goal.kpis.map((kpi) => (
                    <p key={kpi.id} className="text-xs text-muted-foreground">
                      {kpi.name}: {kpi.currentValue}/{kpi.targetValue} {kpi.unit}
                    </p>
                  ))}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
