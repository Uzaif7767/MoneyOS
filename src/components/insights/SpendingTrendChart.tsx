"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { SpendingTrendPoint } from "@/lib/insightsCalculator";
import { formatCurrency } from "@/lib/utils";
import { TrendingUpIcon } from "@/components/ui/icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SpendingTrendChartProps {
  trendPoints: SpendingTrendPoint[];
}

export function SpendingTrendChart({ trendPoints }: SpendingTrendChartProps) {
  const hasData = trendPoints && trendPoints.some((p) => p.amount > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 min-h-[260px]">
        <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-3">
          <TrendingUpIcon className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Spending Recorded in Period</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          When you add expenses for this time period, your spending trend timeline will render here automatically.
        </p>
      </div>
    );
  }

  const labels = trendPoints.map((p) => p.label);
  const dataValues = trendPoints.map((p) => p.amount);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Spending",
        data: dataValues,
        borderColor: "#10b981", // emerald-500
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 12, weight: "bold" as const },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context: TooltipItem<"line">) => {
            const val = context.raw || 0;
            return ` Spending: ${formatCurrency(Number(val))}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 },
          color: "#64748b",
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.6)",
        },
        ticks: {
          font: { size: 10 },
          color: "#64748b",
          callback: (value: string | number) => {
            const num = Number(value);
            if (num >= 100000) return `₹${(num / 1000).toFixed(0)}k`;
            if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
            return `₹${num}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 sm:h-72 w-full pt-2">
      <Line data={chartData} options={options} />
    </div>
  );
}
