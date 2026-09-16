"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { CategoryBreakdownItem } from "@/lib/insightsCalculator";
import { formatCurrency } from "@/lib/utils";
import { PieChartIcon } from "@/components/ui/icons";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownChartProps {
  categories: CategoryBreakdownItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#10b981", // emerald-500
  Travel: "#3b82f6", // blue-500
  Shopping: "#8b5cf6", // violet-500
  Rent: "#f59e0b", // amber-500
  Bills: "#ef4444", // red-500
  Recharge: "#06b6d4", // cyan-500
  Entertainment: "#ec4899", // pink-500
  Health: "#14b8a6", // teal-500
  Other: "#64748b", // slate-500
};

export function CategoryBreakdownChart({ categories }: CategoryBreakdownChartProps) {
  const activeCategories = categories.filter((c) => c.amount > 0);

  if (activeCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 min-h-[260px]">
        <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
          <PieChartIcon className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Category Data</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          No expenses recorded for this period. Add expenses to view category allocations.
        </p>
      </div>
    );
  }

  const labels = activeCategories.map((c) => c.category);
  const dataValues = activeCategories.map((c) => c.amount);
  const backgroundColors = activeCategories.map(
    (c) => CATEGORY_COLORS[c.category] || "#64748b"
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 10,
          padding: 12,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context: TooltipItem<"doughnut">) => {
            const val = context.raw || 0;
            const item = activeCategories[context.dataIndex];
            const pct = item ? ` (${item.percentage.toFixed(1)}%)` : "";
            return ` ${formatCurrency(Number(val))}${pct}`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="h-56 sm:h-64 w-full pt-1">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Breakdown detail list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        {activeCategories.map((cat) => (
          <div
            key={cat.category}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[cat.category] || "#64748b" }}
              />
              <span className="font-medium text-slate-700 truncate">{cat.category}</span>
            </div>
            <div className="text-right pl-2 shrink-0">
              <span className="font-semibold text-slate-900">{formatCurrency(cat.amount)}</span>
              <span className="text-slate-400 ml-1">({cat.percentage.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
