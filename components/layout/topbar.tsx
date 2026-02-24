import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

export function TopBar({ userName }: { userName: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
      <div>
        <h1 className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Founder AI Agent Operating System</h1>
        <p className="text-sm font-semibold">Operational command center for AI agent execution and leverage growth.</p>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action="/api/auth/logout" method="post">
          <Button variant="ghost" className="border border-border/70">
            Logout ({userName})
          </Button>
        </form>
      </div>
    </header>
  );
}
