"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

type CashFlowChartProps = {
  data: {
    name: string;
    income: number;
    expense: number;
  }[];
};

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(value as number)}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          }}
          formatter={(value) => formatCurrency(value as number)}
        />
        <Legend />
        <Bar
          dataKey="income"
          name="Receita"
          fill="hsl(var(--chart-2))"
          activeBar={<Rectangle fill="hsl(var(--accent))" />}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expense"
          name="Despesa"
          fill="hsl(var(--chart-1))"
          activeBar={<Rectangle fill="hsl(var(--primary))" />}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
