"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const palette = ["#ea580c", "#0e7490", "#16a34a", "#9333ea", "#f59e0b", "#ef4444"];

type PieChartCardProps = {
  title: string;
  description?: string;
  data: { name: string; value: number }[];
};

export function PieChartCard({ title, description, data }: PieChartCardProps) {
  return (
    <Card className="h-[320px]">
      <div className="mb-3">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} fill="#8884d8" label>
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
