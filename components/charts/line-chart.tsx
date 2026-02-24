"use client";

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type Series = {
  key: string;
  color: string;
  name: string;
};

type LineChartCardProps = {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  xKey: string;
  series: Series[];
};

export function LineChartCard({ title, description, data, xKey, series }: LineChartCardProps) {
  return (
    <Card className="h-[320px]">
      <div className="mb-3">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip />
          <Legend />
          {series.map((item) => (
            <Line key={item.key} dataKey={item.key} stroke={item.color} strokeWidth={2} dot={false} name={item.name} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
