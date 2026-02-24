import { FailureScenarioType } from "@prisma/client";
import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function FailureAnalysisPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [agents, failureModes] = await Promise.all([
    prisma.agent.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.agentFailureMode.findMany({
      where: { agent: { userId: user.id } },
      include: { agent: true },
      orderBy: [{ agentId: "asc" }, { scenarioType: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Failure Mode Analysis Panel</p>
        <h2 className="text-2xl font-bold">Predict and contain agent failure before production damage</h2>
        <p className="text-sm text-muted-foreground">
          Every agent includes five core failure scenarios: wrong output format, tool failure, hallucination, context misinterpretation, and irreversible action risk.
        </p>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <Table>
          <THead>
            <TR>
              <TH>Agent</TH>
              <TH>Failure Scenario</TH>
              <TH>Likely Cause</TH>
              <TH>Guardrail</TH>
              <TH>Manual Confirmation</TH>
            </TR>
          </THead>
          <TBody>
            {failureModes.map((mode) => (
              <TR key={mode.id}>
                <TD>{mode.agent.name}</TD>
                <TD>
                  <p className="font-medium">{mode.scenarioType}</p>
                  <p className="text-xs text-muted-foreground">{mode.scenarioDescription}</p>
                </TD>
                <TD className="text-xs text-muted-foreground">{mode.likelyCause}</TD>
                <TD className="text-xs text-muted-foreground">{mode.guardrail}</TD>
                <TD>
                  <Badge>{mode.manualConfirmationRequired ? "Enabled" : "Disabled"}</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </section>

      <InlineForm endpoint="/api/failure-modes" submitLabel="Save Guardrail">
        <h3 className="text-sm font-semibold">Define/Update Guardrails Per Scenario</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs">Agent</span>
            <select name="agentId" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs">Failure Scenario</span>
            <select name="scenarioType" defaultValue={FailureScenarioType.WRONG_OUTPUT_FORMAT} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {Object.values(FailureScenarioType).map((scenario) => (
                <option key={scenario} value={scenario}>
                  {scenario}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Scenario Description</span>
            <textarea name="scenarioDescription" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Likely Cause</span>
            <textarea name="likelyCause" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Guardrail</span>
            <textarea name="guardrail" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Add confirmation step before destructive action</span>
            <select name="manualConfirmationRequired" defaultValue="true" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
        </div>
      </InlineForm>
    </div>
  );
}
