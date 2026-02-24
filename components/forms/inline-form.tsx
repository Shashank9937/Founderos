"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";

type InlineFormProps = {
  endpoint: string;
  children: React.ReactNode;
  submitLabel?: string;
};

export function InlineForm({ endpoint, children, submitLabel = "Save" }: InlineFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      if (key.endsWith("[]")) {
        const normalizedKey = key.replace("[]", "");
        if (!Array.isArray(payload[normalizedKey])) {
          payload[normalizedKey] = [];
        }
        (payload[normalizedKey] as unknown[]).push(value);
        continue;
      }

      payload[key] = value;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Request failed");
        return;
      }

      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Unexpected network error");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border bg-card p-4">
      {children}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
