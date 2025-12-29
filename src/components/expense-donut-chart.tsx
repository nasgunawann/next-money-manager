"use client";

import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getCategoryIconComponent } from "@/constants/category-icons";

const RADIAN = Math.PI / 180;

interface ExpenseData {
  name: string;
  value: number;
  color: string;
  icon?: string;
  [key: string]: string | number | undefined;
}

interface ExpenseDonutChartProps {
  data: ExpenseData[];
  totalExpense: number;
  currency?: string;
}

export function ExpenseDonutChart({
  data,
  totalExpense,
  currency,
}: ExpenseDonutChartProps) {
  const renderIconLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    payload?: { color: string; icon: string };
    value?: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, payload, value } =
      props;
    if (
      !totalExpense ||
      !cx ||
      !cy ||
      !midAngle ||
      !innerRadius ||
      !outerRadius ||
      !payload ||
      !value
    )
      return null;
    const percent = (value / totalExpense) * 100;
    if (percent < 5) return null; // hide on tiny slices to avoid overlap

    const radius = (innerRadius + outerRadius) / 2.05;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const IconComp = getCategoryIconComponent(payload.icon);
    return (
      <g
        transform={`translate(${x},${y})`}
        pointerEvents="none"
        style={{
          animation: "fade-icon 320ms ease forwards",
          opacity: 0,
          transformOrigin: "center center",
        }}
      >
        <circle r={11} fill={payload.color} opacity={0.95} />
        <g transform="translate(-8 -8)">
          <IconComp className="h-4 w-4 text-white" />
        </g>
      </g>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes fade-icon {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      <div className="flex justify-center">
        <div className="relative w-full max-w-[400px] aspect-square">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                strokeWidth={0}
                animationDuration={500}
                isAnimationActive={true}
                label={renderIconLabel}
                labelLine={false}
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-3xl md:text-2xl font-bold text-foreground">
              {formatCurrency(totalExpense, currency)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total Pengeluaran
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
