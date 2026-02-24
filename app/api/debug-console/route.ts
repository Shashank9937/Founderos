import { StrategyEntryType } from "@prisma/client";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { buildDiagnostics } from "@/lib/agent-debugging";
import { debugConsoleSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const diagnostics = await prisma.strategyEntry.findMany({
    where: {
      userId: user.id,
      entryType: StrategyEntryType.DEBUG_DIAGNOSTIC,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return ok(diagnostics);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = debugConsoleSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const diagnostic = buildDiagnostics(parsed.data);

  const stored = await prisma.strategyEntry.create({
    data: {
      userId: user.id,
      entryType: StrategyEntryType.DEBUG_DIAGNOSTIC,
      title: `Diagnostic - ${new Date().toISOString().slice(0, 10)}`,
      content: {
        input: parsed.data,
        output: diagnostic,
      },
    },
  });

  return ok({
    diagnostic,
    stored,
  });
}
