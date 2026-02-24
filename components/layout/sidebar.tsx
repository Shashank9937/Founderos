"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string; key: string }> = [
  { href: "/dashboard", label: "Command Center", key: "Alt+1" },
  { href: "/agent-log", label: "Agent Log", key: "Alt+2" },
  { href: "/agent-builder", label: "Agent Builder", key: "Alt+3" },
  { href: "/automation-worthiness", label: "Automation Score", key: "Alt+4" },
  { href: "/failure-analysis", label: "Failure Analysis", key: "Alt+5" },
  { href: "/ceo-learning", label: "CEO Learning", key: "Alt+6" },
  { href: "/finance-strategy", label: "Finance & Strategy", key: "Alt+7" },
  { href: "/leverage", label: "Leverage Dashboard", key: "Alt+8" },
  { href: "/integration-roadmap", label: "AI Roadmap", key: "Alt+9" },
  { href: "/debug-console", label: "Debug Console", key: "Alt+0" },
  { href: "/saas-lab", label: "SaaS Lab", key: "Alt+-" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-80 border-r border-border/70 bg-card/70 px-4 py-5 backdrop-blur lg:block">
      <div className="mb-6 rounded-lg border border-border/70 bg-background/40 p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Founder OS</p>
        <p className="mt-1 text-sm font-semibold">AI Agent Operating System</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Train CEO thinking, force execution, and commercialize systems.
        </p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-70">{item.key}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
