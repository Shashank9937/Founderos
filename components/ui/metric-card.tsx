import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <Card className="space-y-2">
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl font-bold">{value}</CardTitle>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
