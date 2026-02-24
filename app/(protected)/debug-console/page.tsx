import { InlineForm } from "@/components/forms/inline-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function diagnosticsFromContent(content: unknown) {
  if (!content || typeof content !== "object") {
    return null;
  }

  const data = content as { output?: Record<string, string>; input?: Record<string, string> };
  return {
    input: data.input,
    output: data.output,
  };
}

export default async function DebugConsolePage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const diagnostics = await prisma.strategyEntry.findMany({
    where: {
      userId: user.id,
      entryType: "DEBUG_DIAGNOSTIC",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 7</p>
        <h2 className="text-2xl font-bold">Agent Debugging Console</h2>
        <p className="text-sm text-muted-foreground">
          Submit expected vs actual behavior with prompt/input/output samples to diagnose ambiguity, missing guardrails, tool dependency risk, and context overload.
        </p>
      </section>

      <InlineForm endpoint="/api/debug-console" submitLabel="Run Structured Diagnostic">
        <h3 className="text-sm font-semibold">Debug Input</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Expected behavior</span>
            <textarea name="expectedBehavior" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Actual behavior</span>
            <textarea name="actualBehavior" required className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Agent prompt</span>
            <textarea name="agentPrompt" required className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Sample input</span>
            <textarea name="sampleInput" required className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="text-xs">Sample output</span>
            <textarea name="sampleOutput" required className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>
      </InlineForm>

      <section className="grid gap-4 xl:grid-cols-2">
        {diagnostics.map((entry) => {
          const diagnostic = diagnosticsFromContent(entry.content);
          const output = diagnostic?.output;

          return (
            <Card key={entry.id} className="space-y-2 border-border/70 bg-card/80">
              <CardTitle>{entry.title}</CardTitle>
              <CardDescription>Created: {entry.createdAt.toISOString().slice(0, 10)}</CardDescription>

              <div className="space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Prompt Ambiguity:</span> {output?.ambiguity ?? "-"}</p>
                <p><span className="font-medium text-foreground">Missing Guardrails:</span> {output?.guardrails ?? "-"}</p>
                <p><span className="font-medium text-foreground">Tool Dependency Risk:</span> {output?.toolRisk ?? "-"}</p>
                <p><span className="font-medium text-foreground">Context Overload:</span> {output?.contextRisk ?? "-"}</p>
                <p><span className="font-medium text-foreground">Suggested Fix:</span> {output?.schemaGap ?? "-"}</p>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
