import { InlineForm } from "@/components/forms/inline-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function CeoLearningPage() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
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

  const totalLessons = tracks.reduce((sum, track) => sum + track.lessons.length, 0);
  const completedLessons = tracks.reduce(
    (sum, track) => sum + track.lessons.filter((lesson) => lesson.progress[0]?.completed).length,
    0,
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Module 3</p>
        <h2 className="text-2xl font-bold">CEO Learning System</h2>
        <p className="text-sm text-muted-foreground">
          Structured lessons for CEO foundations, finance, strategy, operations, growth, capital, and AI systems thinking.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Progress: {completedLessons}/{totalLessons} lessons complete
        </p>
      </section>

      <section className="space-y-4">
        {tracks.map((track) => (
          <Card key={track.id} className="space-y-3 border-border/70 bg-card/80">
            <div>
              <CardTitle>{track.title}</CardTitle>
              <CardDescription>{track.description}</CardDescription>
            </div>

            <div className="space-y-3">
              {track.lessons.map((lesson) => {
                const progress = lesson.progress[0];
                const checklist = Array.isArray(lesson.executionChecklist)
                  ? lesson.executionChecklist
                  : [];

                return (
                  <div key={lesson.id} className="rounded-md border border-border/60 bg-background/30 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold">{lesson.title}</h4>
                      <Badge>{progress?.completed ? "Completed" : "Pending"}</Badge>
                    </div>

                    <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                      <p><span className="font-medium text-foreground">Core concept:</span> {lesson.coreConcept}</p>
                      <p><span className="font-medium text-foreground">Why it matters at scale:</span> {lesson.whyItMattersAtScale}</p>
                      <p><span className="font-medium text-foreground">Tactical implementation:</span> {lesson.tacticalImplementation}</p>
                      <p><span className="font-medium text-foreground">Common founder mistakes:</span> {lesson.commonFounderMistakes}</p>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-medium">Execution checklist</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                        {checklist.map((item) => (
                          <li key={String(item)}>{String(item)}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Reflection prompt:</span> {lesson.reflectionPrompt}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </section>

      <InlineForm endpoint="/api/learning/progress" submitLabel="Update Lesson Progress">
        <h3 className="text-sm font-semibold">Mark Lesson Progress</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs">Lesson</span>
            <select name="lessonId" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {tracks.flatMap((track) => track.lessons).map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs">Completed?</span>
            <select name="completed" defaultValue="true" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs">Notes</span>
            <textarea name="notes" className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>
      </InlineForm>
    </div>
  );
}
