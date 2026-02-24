import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { lessonProgressSchema } from "@/lib/validations/schemas";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const tracks = await prisma.learningTrack.findMany({
    include: {
      lessons: {
        orderBy: { sortOrder: "asc" },
        include: {
          progress: {
            where: { userId: user.id },
            take: 1,
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return ok(tracks);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const payload = await request.json();
  const parsed = lessonProgressSchema.safeParse(payload);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: parsed.data.lessonId } });
  if (!lesson) {
    return fail("Lesson not found", 404);
  }

  const progress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: parsed.data.lessonId,
      },
    },
    update: {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
      notes: parsed.data.notes,
    },
    create: {
      userId: user.id,
      lessonId: parsed.data.lessonId,
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
      notes: parsed.data.notes,
    },
  });

  return ok(progress, { status: 201 });
}
