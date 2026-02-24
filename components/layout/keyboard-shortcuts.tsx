"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const routes: Record<string, Route> = {
  "1": "/dashboard",
  "2": "/agent-log",
  "3": "/agent-builder",
  "4": "/automation-worthiness",
  "5": "/failure-analysis",
  "6": "/ceo-learning",
  "7": "/finance-strategy",
  "8": "/leverage",
  "9": "/integration-roadmap",
  "0": "/debug-console",
  "-": "/saas-lab",
};

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!event.altKey) {
        return;
      }

      const target = routes[event.key];
      if (target) {
        event.preventDefault();
        router.push(target);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return null;
}
