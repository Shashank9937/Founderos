import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { recommendationLabel } from "@/lib/calculations";
import { prisma } from "@/lib/db/prisma";

const checklistItems = [
  "Task done 3+ times per week",
  "Predictable workflow",
  "Clear inputs and outputs",
  "Error tolerance acceptable",
  "Time saved is meaningful",
];

export default async function AutomationWorthinessPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [scores, agents] = await Promise.all([
    prisma.automationScore.findMany({
      where: { userId: user.id },
      include: { agent: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.agent.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Automation Worthiness Framework</p>
        <h2 className="text-2xl font-bold">Should this workflow be automated?</h2>
        <p className="text-sm text-muted-foreground">
          Score each workflow before building. Recommendation is generated automatically from a 0-100 checklist score.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-5">
        {checklistItems.map((item) => (
          <Card key={item} className="border-border/70 bg-card/80">
            <CardTitle className="text-sm">Checklist</CardTitle>
            <CardDescription>{item}</CardDescription>
          </Card>
        ))}
      </section>

      <InlineForm endpoint="/api/automation-scores" submitLabel="Calculate Automation Score">
        <h3 className="text-sm font-semibold">Run Automation Evaluation</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Task Name</span>
            <input name="taskName" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Link to Agent (optional)</span>
            <select name="agentId" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">None</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>

          {[
            ["doneThreePlusPerWeek", "Task done 3+ times per week?"],
            ["predictableWorkflow", "Predictable workflow?"],
            ["clearInputsOutputs", "Clear inputs/outputs?"],
            ["errorToleranceAcceptable", "Error tolerance acceptable?"],
            ["timeSavedMeaningful", "Time saved meaningful?"],
          ].map(([name, label]) => (
            <label key={name} className="space-y-1">
              <span className="text-xs">{label}</span>
              <select name={name} defaultValue="true" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
          ))}

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Notes</span>
            <textarea name="notes" className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>
      </InlineForm>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <h3 className="mb-3 text-sm font-semibold">Automation Score History</h3>
        <Table>
          <THead>
            <TR>
              <TH>Task</TH>
              <TH>Linked Agent</TH>
              <TH>Score</TH>
              <TH>Recommendation</TH>
              <TH>Notes</TH>
            </TR>
          </THead>
          <TBody>
            {scores.map((item) => (
              <TR key={item.id}>
                <TD>{item.taskName}</TD>
                <TD>{item.agent?.name ?? "-"}</TD>
                <TD>{item.score}/100</TD>
                <TD>
                  <Badge>{recommendationLabel(item.recommendation)}</Badge>
                </TD>
                <TD className="max-w-[280px] text-xs text-muted-foreground">{item.notes ?? "-"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
