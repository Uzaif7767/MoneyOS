"use client";

import Link from "next/link";
import React, { useState } from "react";
import type { InsightsRawData } from "@/lib/services/insightsService";
import {
  PeriodType,
  calculateInsights,
  ProcessedInsights,
} from "@/lib/insightsCalculator";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import {
  InsightsIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  RupeeSignIcon,
  ShieldCheckIcon,
  BillsIcon,
  GoalsIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  PieChartIcon,
} from "@/components/ui/icons";
import { SpendingTrendChart } from "./SpendingTrendChart";
import { CategoryBreakdownChart } from "./CategoryBreakdownChart";

interface InsightsManagerProps {
  initialData: InsightsRawData;
}

export function InsightsManager({ initialData }: InsightsManagerProps) {
  const [period, setPeriod] = useState<PeriodType>("this_month");

  const { expenses, bills, goals, safeToSpendPool, dailySafeSpend, daysUntilNextIncome } =
    initialData;

  // Dynamically compute rule-based insights for selected period
  const insights: ProcessedInsights = calculateInsights(expenses, bills, goals, period);

  const {
    overview,
    categories,
    trend,
    billsImpact,
    goalProgress,
    monthEndProjection,
    smartObservations,
  } = insights;

  const hasExpenses = expenses.length > 0;

  return (
    <div className="space-y-8 pb-6">
      {/* 1. Header & Period Selector */}
      <PageHeader
        title="Insights & Analytics"
        description="Real-time mathematical analysis of your spending, cash flow, bills, and savings goals."
        badgeText="Financial Intelligence"
        badgeIcon={InsightsIcon}
        action={
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/protected/help#insights"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 underline transition-colors shrink-0"
            >
              Help & Guide →
            </Link>
            <div className="w-full sm:w-44 shrink-0">
              <label htmlFor="period-select" className="sr-only">
                Select Analysis Period
              </label>
              <Select
                id="period-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodType)}
                className="w-full bg-white font-semibold text-slate-800 border-slate-300 h-11"
              >
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
              </Select>
            </div>
          </div>
        }
      />

      {/* Global No Data Notice Banner */}
      {!hasExpenses && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-2xs">
          <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-amber-900">No Expense Data Recorded Yet</p>
            <p className="text-amber-700 font-medium">
              Insights and charts are calculated strictly from real financial activity. Log expenses in the Expenses tab to see real-time analytics.
            </p>
          </div>
        </div>
      )}

      {/* 2. Spending Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending Card */}
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total Spending
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <RupeeSignIcon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(overview.periodTotal)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                {overview.changeAmount !== null && overview.changePercentage !== null ? (
                  overview.changeAmount > 0 ? (
                    <Badge variant="destructive" className="px-1.5 py-0.5 text-[10px] gap-0.5 font-bold">
                      <TrendingUpIcon className="w-3 h-3" />
                      +{overview.changePercentage.toFixed(1)}%
                    </Badge>
                  ) : overview.changeAmount < 0 ? (
                    <Badge variant="emerald" className="px-1.5 py-0.5 text-[10px] gap-0.5 font-bold">
                      <TrendingDownIcon className="w-3 h-3" />
                      {overview.changePercentage.toFixed(1)}%
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="px-1.5 py-0.5 text-[10px]">
                      0.0%
                    </Badge>
                  )
                ) : null}
                <span className="text-slate-500">
                  {overview.previousPeriodTotal !== null
                    ? `vs prev (${formatCurrency(overview.previousPeriodTotal)})`
                    : "No prev data"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Average Spend Card */}
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Daily Average
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <CalendarIcon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(overview.dailyAverage)}
                <span className="text-xs font-normal text-slate-500 ml-1">/ day</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Across {overview.daysCount} active days
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Month-End Projection Card */}
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Month-End Est.
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <TrendingUpIcon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                {monthEndProjection
                  ? formatCurrency(monthEndProjection.projectedMonthEnd)
                  : "N/A"}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {monthEndProjection
                  ? `@ ${formatCurrency(monthEndProjection.dailyAverage)}/day pace`
                  : "Requires current month spending"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Safe-to-Spend Context Card */}
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Safe-to-Spend Pool
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheckIcon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-700">
                {safeToSpendPool !== null ? formatCurrency(safeToSpendPool) : "Setup Needed"}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {safeToSpendPool !== null && dailySafeSpend !== null
                  ? `${formatCurrency(dailySafeSpend)}/day (${daysUntilNextIncome}d to income)`
                  : "Complete onboarding first"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Month-End Projection Detailed Banner */}
      {period === "this_month" && (
        <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  <TrendingUpIcon className="w-3.5 h-3.5" />
                  Rule-Based Month-End Projection
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  {monthEndProjection
                    ? `Estimated Month-End Total: ${formatCurrency(monthEndProjection.projectedMonthEnd)}`
                    : "Month-End Spending Projection"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {monthEndProjection
                    ? `You have spent ${formatCurrency(
                        monthEndProjection.spentSoFar
                      )} over ${monthEndProjection.elapsedDays} elapsed days in ${
                        monthEndProjection.monthName
                      }. Assuming your current spending pace of ${formatCurrency(
                        monthEndProjection.dailyAverage
                      )}/day continues for the remaining ${
                        monthEndProjection.totalDaysInMonth - monthEndProjection.elapsedDays
                      } days, your projected month-end total will be ${formatCurrency(
                        monthEndProjection.projectedMonthEnd
                      )}.`
                    : "Logged expenses in the current month generate a mathematical projection based on your daily spending pace."}
                </p>
              </div>

              {monthEndProjection && (
                <div className="shrink-0 bg-white/10 backdrop-blur-xs rounded-2xl p-5 border border-white/10 text-center w-full sm:w-auto min-w-0 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                    Projection Formula
                  </span>
                  <div className="text-xs font-bold text-emerald-400">
                    ₹{monthEndProjection.dailyAverage.toFixed(0)}/day × {monthEndProjection.totalDaysInMonth} days
                  </div>
                  <div className="text-[11px] text-slate-400 border-t border-white/10 pt-1 mt-1 font-medium">
                    Day {monthEndProjection.elapsedDays} of {monthEndProjection.totalDaysInMonth}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Smart Observations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
              Smart Observations
            </h2>
            <p className="text-xs text-slate-500">
              Rule-based observations derived strictly from your verified financial data.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] text-slate-500 font-bold">
            Rule-Based V1
          </Badge>
        </div>

        {smartObservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {smartObservations.map((obs) => {
              const borderStyles = {
                info: "border-blue-200 bg-blue-50/40 text-blue-900",
                success: "border-emerald-200 bg-emerald-50/40 text-emerald-900",
                warning: "border-amber-200 bg-amber-50/40 text-amber-900",
                alert: "border-rose-200 bg-rose-50/40 text-rose-900",
              };

              const iconStyles = {
                info: "text-blue-600 bg-blue-100",
                success: "text-emerald-600 bg-emerald-100",
                warning: "text-amber-600 bg-amber-100",
                alert: "text-rose-600 bg-rose-100",
              };

              return (
                <div
                  key={obs.id}
                  className={`p-4 rounded-xl border ${borderStyles[obs.type]} flex items-start gap-3 transition-colors shadow-2xs`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${iconStyles[obs.type]}`}>
                    {obs.type === "alert" ? (
                      <AlertCircleIcon className="w-4 h-4" />
                    ) : obs.type === "success" ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <InsightsIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-bold text-slate-900">{obs.title}</h4>
                    <p className="text-slate-600 leading-relaxed font-normal">{obs.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
            No smart observations triggered for this period. Add expenses, bills, or goals to generate automated insights.
          </div>
        )}
      </div>

      {/* 5. Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                Spending Trend
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold">
                {insights.periodLabel}
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Actual spending over time in Indian Rupees (₹)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingTrendChart trendPoints={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                Category Breakdown
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-semibold">
                9 Locked Categories
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Distribution across standard V1 expense categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart categories={categories} />
          </CardContent>
        </Card>
      </div>

      {/* 6. Bills Impact & Goal Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bills Impact Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BillsIcon className="w-4 h-4 text-blue-600 shrink-0" />
                Bills Impact
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-semibold">
                {billsImpact.totalBillsCount} Total Bills
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Bill obligations and overdue payment tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {billsImpact.overdueBillsCount > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900 shadow-2xs">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{billsImpact.overdueBillsCount} Overdue Bill(s)</span>
                </div>
                <span className="font-extrabold text-rose-700">
                  {formatCurrency(billsImpact.overdueBillsAmount)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                  Unpaid Total
                </span>
                <div className="text-lg font-extrabold text-slate-900">
                  {formatCurrency(billsImpact.unpaidBillsAmount)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {billsImpact.unpaidBillsCount} pending bill(s)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide block">
                  Paid Total
                </span>
                <div className="text-lg font-extrabold text-emerald-800">
                  {formatCurrency(billsImpact.paidBillsAmount)}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {billsImpact.paidBillsCount} cleared bill(s)
                </div>
              </div>
            </div>

            {billsImpact.totalBillsAmount > 0 ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Bill Payment Clearance</span>
                  <span>
                    {(
                      (billsImpact.paidBillsAmount / billsImpact.totalBillsAmount) *
                      100
                    ).toFixed(0)}
                    % Cleared
                  </span>
                </div>
                <Progress
                  value={
                    (billsImpact.paidBillsAmount / billsImpact.totalBillsAmount) * 100
                  }
                  className="h-2.5 bg-slate-100"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2 font-medium">
                No bills recorded yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Goal Progress Overview Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GoalsIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                Goal Allocation Progress
              </CardTitle>
              <Badge variant="secondary" className="text-[10px] font-semibold">
                {goalProgress.goalsCount} Goal(s)
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Savings targets and total accumulated allocations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide block">
                  Total Saved
                </span>
                <div className="text-lg font-extrabold text-emerald-800">
                  {formatCurrency(goalProgress.totalSavedAmount)}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {goalProgress.completionPercentage.toFixed(1)}% of target
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                  Total Target
                </span>
                <div className="text-lg font-extrabold text-slate-900">
                  {formatCurrency(goalProgress.totalTargetAmount)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Remaining: {formatCurrency(goalProgress.remainingAmount)}
                </div>
              </div>
            </div>

            {goalProgress.totalTargetAmount > 0 ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Overall Goal Completion</span>
                    <span>{goalProgress.completionPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={goalProgress.completionPercentage}
                    className="h-2.5 bg-slate-100"
                  />
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100 max-h-36 overflow-y-auto">
                  {goalProgress.goalsList.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 font-medium"
                    >
                      <span className="font-semibold text-slate-800 truncate min-w-0 flex-1 pr-2">
                        {goal.name}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="text-slate-400 ml-1">
                          / {formatCurrency(goal.targetAmount)} ({goal.percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2 font-medium">
                No active savings goals recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
