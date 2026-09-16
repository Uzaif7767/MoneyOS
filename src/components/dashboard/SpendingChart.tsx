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
import type { Expense } from "@/types";
import { PieChartIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingChartProps {
  expenses: Expense[];
}

export function SpendingChart({ expenses }: SpendingChartProps) {
  // If there are no expense records, display a genuine empty state
  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 my-2 min-h-[220px]">
        <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
          <PieChartIcon className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Spending Data Recorded</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          When you record your expenses, your real category spending breakdown chart will appear here.
        </p>
      </div>
    );
  }

  // Aggregate spending by category from real expense documents
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((exp) => {
    const category = exp.category?.trim() || "Uncategorized";
    categoryTotals[category] = (categoryTotals[category] || 0) + (Number(exp.amount) || 0);
  });

  const labels = Object.keys(categoryTotals);
  const dataValues = Object.values(categoryTotals);

  const colors = [
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
    "#64748b", // slate-500
  ];

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "#ffffff",
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
          padding: 14,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"doughnut">) => {
            const value = context.raw || 0;
            return ` ${formatCurrency(Number(value))}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-60 w-full pt-2">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
