import { AgentStatus, AgentType } from "@prisma/client";
import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { agentTypeGuidance } from "@/lib/calculations";
import { prisma } from "@/lib/db/prisma";

export default async function AgentBuilderPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const agents = await prisma.agent.findMany({
    where: { userId: user.id },
    include: {
      workflows: { orderBy: { stepNumber: "asc" } },
      failureModes: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 2</p>
        <h2 className="text-2xl font-bold">AI Agent Builder (Framework Aligned)</h2>
        <p className="text-sm text-muted-foreground">
          Every agent must define Perception, Brain, Tools, Memory, exact input/output schema, workflow steps, guardrails, and fallback behavior.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Automation worthiness must be scored first. Complete the Automation Score module before creating new agents.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Simplest working version first: start with a single-task agent before escalating to multi-step or multi-agent orchestration.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {Object.entries(agentTypeGuidance).map(([type, guidance]) => (
          <Card key={type} className="space-y-2 border-border/70 bg-card/80">
            <CardTitle>{guidance.label}</CardTitle>
            <CardDescription>Complexity: {guidance.complexity}</CardDescription>
            <p className="text-xs text-muted-foreground">When to use: {guidance.whenToUse}</p>
            <p className="text-xs text-muted-foreground">Common mistake: {guidance.mistakes}</p>
          </Card>
        ))}
      </section>

      <InlineForm endpoint="/api/agents" submitLabel="Create Agent with 4-Core Components">
        <h3 className="text-sm font-semibold">Define New Agent (Input → Output Strict Mode)</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs">Agent Name</span>
            <input name="name" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Agent Type</span>
            <select name="agentType" defaultValue={AgentType.SINGLE_TASK} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {Object.values(AgentType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">What it does</span>
            <textarea name="whatItDoes" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Trigger Type</span>
            <input name="triggerType" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Status</span>
            <select name="status" defaultValue={AgentStatus.BUILDING} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {Object.values(AgentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Perception: What inputs are received?</span>
            <textarea name="perceptionDefinition" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Perception Input Format Examples (JSON or newline list)</span>
            <textarea
              name="perceptionExamples"
              required
              placeholder='[{"sender":"user@company.com","subject":"Request"}]'
              className="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Brain: Model Logic</span>
            <textarea name="brainModelLogic" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Brain: Decision Rules</span>
            <textarea name="decisionRules" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Deterministic Task?</span>
            <select name="isDeterministic" defaultValue="false" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="false">Probabilistic</option>
              <option value="true">Deterministic</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs">Manual Approval Required?</span>
            <select name="manualApprovalRequired" defaultValue="true" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Tools (Email, Web Search, Database, File System, API, CRM, etc.)</span>
            <textarea name="toolsUsed" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Memory: Short-term context</span>
            <textarea name="memoryShortTerm" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Memory: Long-term storage</span>
            <textarea name="memoryLongTerm" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Learning Loop Enabled?</span>
            <select name="learningLoopEnabled" defaultValue="true" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs">Confirmation before destructive action?</span>
            <select name="destructiveActionConfirmation" defaultValue="true" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Exact Input Schema (JSON)</span>
            <textarea name="inputSchema" required className="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Exact Output Schema (JSON)</span>
            <textarea name="outputSchema" required className="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Output Example</span>
            <textarea name="outputExample" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Workflow Steps (numbered, newline separated)</span>
            <textarea name="workflowSteps" required className="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Guardrails (newline separated)</span>
            <textarea name="guardrails" required className="min-h-[84px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Fallback Behavior</span>
            <textarea name="fallbackBehavior" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Estimated Time Saved / Week (hours)</span>
            <input
              type="number"
              name="timeSavedPerWeek"
              min={0}
              step="0.5"
              defaultValue={0}
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </label>
        </div>
      </InlineForm>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <h3 className="mb-3 text-sm font-semibold">Registered Agents</h3>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Type</TH>
              <TH>Status</TH>
              <TH>Workflow Steps</TH>
              <TH>Failure Scenarios</TH>
              <TH>Guardrails</TH>
            </TR>
          </THead>
          <TBody>
            {agents.map((agent) => {
              const guardrails = Array.isArray(agent.guardrails) ? agent.guardrails.length : 0;
              return (
                <TR key={agent.id}>
                  <TD>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.whatItDoes}</p>
                  </TD>
                  <TD>{agent.agentType}</TD>
                  <TD>
                    <Badge>{agent.status}</Badge>
                  </TD>
                  <TD>{agent.workflows.length}</TD>
                  <TD>{agent.failureModes.length}</TD>
                  <TD>{guardrails}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </section>
    </div>
  );
}
