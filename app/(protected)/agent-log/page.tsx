import { AgentStatus, AgentType } from "@prisma/client";
import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function AgentLogPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [logs, agents] = await Promise.all([
    prisma.agentLog.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.agent.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 1</p>
        <h2 className="text-2xl font-bold">Agent Log System (System of Record)</h2>
        <p className="text-sm text-muted-foreground">
          Every agent is tracked with explicit input/output contracts, trigger logic, status, time saved, failure notes, and lessons learned.
        </p>
      </section>

      <section className="overflow-x-auto rounded-lg border border-border/70 bg-card/80 p-3">
        <Table>
          <THead>
            <TR>
              <TH>Agent Name</TH>
              <TH>Type</TH>
              <TH>Status</TH>
              <TH>Tools</TH>
              <TH>Trigger</TH>
              <TH>Input</TH>
              <TH>Output</TH>
              <TH>Time Saved / Week</TH>
              <TH>Failure Notes</TH>
              <TH>Lessons Learned</TH>
            </TR>
          </THead>
          <TBody>
            {logs.map((log) => {
              const tools = Array.isArray(log.toolsUsed) ? log.toolsUsed.join(", ") : "-";
              return (
                <TR key={log.id}>
                  <TD>
                    <p className="font-medium">{log.agentName}</p>
                    <p className="text-xs text-muted-foreground">{log.whatItDoes}</p>
                  </TD>
                  <TD>{log.agentType}</TD>
                  <TD>
                    <Badge>{log.status}</Badge>
                  </TD>
                  <TD>{tools}</TD>
                  <TD>{log.triggerType}</TD>
                  <TD className="max-w-[220px] text-xs text-muted-foreground">{log.inputDefinition}</TD>
                  <TD className="max-w-[220px] text-xs text-muted-foreground">{log.outputDefinition}</TD>
                  <TD>{log.timeSavedPerWeek}h</TD>
                  <TD className="max-w-[220px] text-xs text-muted-foreground">{log.failureNotes ?? "-"}</TD>
                  <TD className="max-w-[220px] text-xs text-muted-foreground">{log.lessonsLearned ?? "-"}</TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </section>

      <InlineForm endpoint="/api/agent-logs" submitLabel="Create Agent Log Entry">
        <h3 className="text-sm font-semibold">Log New Agent Activity</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs">Agent Name</span>
            <input name="agentName" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Linked Agent (optional)</span>
            <select name="agentId" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">None</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs">Agent Type</span>
            <select name="agentType" defaultValue={AgentType.SINGLE_TASK} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {Object.values(AgentType).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs">Status</span>
            <select name="status" defaultValue={AgentStatus.BUILDING} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {Object.values(AgentStatus).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">What it does</span>
            <textarea name="whatItDoes" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Tools used (comma/newline separated)</span>
            <textarea name="toolsUsed" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Trigger Type</span>
            <input name="triggerType" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Input Definition</span>
            <textarea name="inputDefinition" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Output Definition</span>
            <textarea name="outputDefinition" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Time Saved / Week (hours)</span>
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

          <label className="space-y-1">
            <span className="text-xs">Failure Notes</span>
            <textarea name="failureNotes" className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Lessons Learned</span>
            <textarea name="lessonsLearned" className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>
      </InlineForm>
    </div>
  );
}
