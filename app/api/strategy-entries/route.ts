import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { parseJsonString } from "@/lib/calculations";
import { strategyEntrySchema } from "@/lib/validations/schemas";
import { StrategyEntryType } from "@prisma/client";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const url = new URL(request.url);
  const entryType = url.searchParams.get("entryType");

  const normalizedType = Object.values(StrategyEntryType).find((value) => value === entryType);

  const entries = normalizedType
    ? await prisma.strategyEntry.findMany({
        where: {
          userId: user.id,
          entryType: normalizedType,
        },
        orderBy: { updatedAt: "desc" },
      })
    : await prisma.strategyEntry.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });

  return ok(entries);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = strategyEntrySchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const entry = await prisma.strategyEntry.create({
    data: {
      userId: user.id,
      entryType: parsed.data.entryType,
      title: parsed.data.title,
      content: parseJsonString(parsed.data.content, {
        text: parsed.data.content,
      }),
    },
  });

  return ok(entry, { status: 201 });
}
