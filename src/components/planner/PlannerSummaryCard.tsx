"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import type { PlannerCalculationResult } from "@/types";
import {
  WalletIcon,
  BillsIcon,
  PieChartIcon,
  GoalsIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  TagIcon,
  HeartIcon,
  CalendarIcon,
} from "@/components/ui/icons";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface PlannerSummaryCardProps {
  calc: PlannerCalculationResult;
  monthLabel: string;
}

export function PlannerSummaryCard({ calc, monthLabel }: PlannerSummaryCardProps) {
  const isSurplus = calc.isAffordable;

  return (
    <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-white">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calculated Plan Summary</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-white tracking-tight pt-1">
              Financial Blueprint for {monthLabel}
            </CardTitle>
            <CardDescription className="text-xs text-slate-300">
              Deterministic breakdown based on your saved planner draft inputs ({calc.daysInMonth} days in {monthLabel}).
            </CardDescription>
          </div>

          {/* Top Status Pill */}
          <div className="shrink-0">
            {isSurplus ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Affordable Strategy</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Plan Shortfall</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-8">
        {/* ====================================================== */}
        {/* 1. FINANCIAL HIERARCHY FLOW VISUALIZER                 */}
        {/* ====================================================== */}
        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Financial Allocation Hierarchy
          </span>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            {/* Step 1: Income */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Income</span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900">{formatCurrency(calc.totalPlannedIncome)}</p>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Planned</span>
            </div>

            <div className="hidden sm:flex items-center justify-center text-slate-300">
              <ArrowRightIcon className="w-4 h-4" />
            </div>

            {/* Step 2: Spending */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Spending</span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900">{formatCurrency(calc.totalPlannedSpending)}</p>
              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Commitments</span>
            </div>

            <div className="hidden sm:flex items-center justify-center text-slate-300">
              <ArrowRightIcon className="w-4 h-4" />
            </div>

            {/* Step 3: Savings */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">3. Savings Goal</span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900">{formatCurrency(calc.savingsGoalAmount)}</p>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Target</span>
            </div>

            <div className="hidden sm:flex items-center justify-center text-slate-300">
              <ArrowRightIcon className="w-4 h-4" />
            </div>

            {/* Step 4: Safety Buffer */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">4. Safety Buffer</span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900">{formatCurrency(calc.safetyBuffer)}</p>
              <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Reserve</span>
            </div>

            <div className="hidden sm:flex items-center justify-center text-slate-300">
              <ArrowRightIcon className="w-4 h-4" />
            </div>

            {/* Step 5: Remaining */}
            <div className={`p-3 rounded-xl border shadow-2xs space-y-1 ${
              isSurplus ? "bg-emerald-50/60 border-emerald-200" : "bg-rose-50/60 border-rose-200"
            }`}>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">5. Remaining</span>
              <p className={`text-xs sm:text-sm font-extrabold ${isSurplus ? "text-emerald-800" : "text-rose-800"}`}>
                {formatCurrency(calc.remainingMoney)}
              </p>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isSurplus ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
              }`}>
                {isSurplus ? "Surplus" : "Shortfall"}
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* 2. PRIMARY SUMMARY HIGHLIGHTS GRID                     */}
        {/* ====================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Income */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Planned Income</span>
              <div className="p-2 rounded-xl bg-white text-emerald-600 border border-emerald-200/60 shadow-2xs">
                <WalletIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              {formatCurrency(calc.totalPlannedIncome)}
            </p>
            {calc.expectedIncomeDate && (
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                <span>Expected: {calc.expectedIncomeDate}</span>
              </p>
            )}
          </div>

          {/* Card 2: Total Planned Spending */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Planned Spending</span>
              <div className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
                <BillsIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {formatCurrency(calc.totalPlannedSpending)}
            </p>
            <p className="text-[11px] text-slate-500">
              Calculated sum of 8 spending categories
            </p>
          </div>

          {/* Card 3: Planned Daily Spending */}
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Daily Spending Rate</span>
              <div className="p-2 rounded-xl bg-white text-purple-600 border border-purple-200/60 shadow-2xs">
                <PieChartIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-950">
              {formatCurrency(calc.plannedDailySpending)}
              <span className="text-xs font-normal text-purple-700"> / day</span>
            </p>
            <p className="text-[11px] text-purple-700 font-medium">
              Over {calc.daysInMonth} days in {monthLabel}
            </p>
          </div>

          {/* Card 4: Remaining Money */}
          <div className={`p-5 rounded-2xl border space-y-2 ${
            isSurplus
              ? "bg-emerald-500/10 border-emerald-200 text-emerald-950"
              : "bg-rose-500/10 border-rose-200 text-rose-950"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">Remaining Money</span>
              <div className={`p-2 rounded-xl bg-white border shadow-2xs ${
                isSurplus ? "text-emerald-600 border-emerald-200" : "text-rose-600 border-rose-200"
              }`}>
                {isSurplus ? <CheckCircleIcon className="w-4 h-4" /> : <AlertCircleIcon className="w-4 h-4" />}
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold">
              {formatCurrency(calc.remainingMoney)}
            </p>
            <p className="text-[11px] font-semibold">
              {isSurplus ? "Unassigned Surplus Cash" : `Exceeds Income by ${formatCurrency(calc.shortfallAmount)}`}
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* 3. 25% RECOMMENDED SAVINGS BENCHMARK                   */}
        {/* ====================================================== */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white space-y-3 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GoalsIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  Recommended Savings Benchmark (25%)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                Standard financial guideline recommending 25% allocation of planned monthly income toward savings and wealth targets.
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Calculated Benchmark</span>
              <span className="text-lg font-extrabold text-white">{formatCurrency(calc.recommendedSavings)}</span>
              <span className="text-[10px] text-slate-300 block">25% of {formatCurrency(calc.totalPlannedIncome)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex items-center justify-between flex-wrap gap-2">
            <span>
              <strong>Your Entered Target:</strong> {formatCurrency(calc.savingsGoalAmount)}
              {calc.savingsGoalAmount > 0 ? (
                calc.savingsGoalAmount >= calc.recommendedSavings ? (
                  <span className="text-emerald-300 ml-1.5 font-bold">(Exceeds 25% recommendation)</span>
                ) : (
                  <span className="text-amber-300 ml-1.5 font-bold">(Below 25% recommendation)</span>
                )
              ) : (
                <span className="text-slate-400 ml-1.5">(No savings goal entered yet)</span>
              )}
            </span>
            <span className="italic text-[10px] text-slate-400">
              * Informational recommendation only; does not overwrite your goal.
            </span>
          </div>
        </div>

        {/* ====================================================== */}
        {/* 4. DETERMINISTIC STATUS & AFFORDABILITY ALERTS         */}
        {/* ====================================================== */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Deterministic Plan Status
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Alert 1: Overall Plan Affordability */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              calc.isAffordable ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900" : "bg-rose-50/70 border-rose-200/80 text-rose-900"
            }`}>
              {calc.isAffordable ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Overall Cash Flow Status</p>
                <p className="text-xs">
                  {calc.isAffordable
                    ? `Plan has ${formatCurrency(calc.remainingMoney)} remaining.`
                    : `Plan exceeds available income by ${formatCurrency(calc.shortfallAmount)}.`}
                </p>
              </div>
            </div>

            {/* Alert 2: Savings Goal Status */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              calc.isSavingsGoalAffordable ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900" : "bg-amber-50/70 border-amber-200/80 text-amber-900"
            }`}>
              {calc.isSavingsGoalAffordable ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Savings Target Feasibility</p>
                <p className="text-xs">
                  {calc.savingsGoalAmount === 0
                    ? "No savings target set for this month."
                    : calc.isSavingsGoalAffordable
                    ? "Savings target fits within current plan."
                    : `Savings target creates a shortfall of ${formatCurrency(calc.savingsGoalShortfall)}.`}
                </p>
              </div>
            </div>

            {/* Alert 3: Safety Buffer Status */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              calc.isSafetyBufferMaintainable ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-900" : "bg-amber-50/70 border-amber-200/80 text-amber-900"
            }`}>
              {calc.isSafetyBufferMaintainable ? (
                <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Safety Buffer Status</p>
                <p className="text-xs">
                  {calc.safetyBuffer === 0
                    ? "No safety buffer set for this month."
                    : calc.isSafetyBufferMaintainable
                    ? "Safety buffer is fully maintained."
                    : `Safety buffer creates a shortfall of ${formatCurrency(calc.safetyBufferShortfall)}.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* 5. DETAILED CATEGORY SPENDING BREAKDOWN GRID            */}
        {/* ====================================================== */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Detailed Planned Spending Categories
            </h4>
            <span className="text-xs font-bold text-slate-700">
              Total: {formatCurrency(calc.totalPlannedSpending)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Fixed Expenses */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fixed Expenses</span>
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(calc.fixedExpensesTotal)}</span>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <BillsIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 2. Planned Bills */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planned Bills</span>
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(calc.plannedBillsTotal)}</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <BillsIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 3. Subscriptions */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subscriptions</span>
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(calc.subscriptionsTotal)}</span>
              </div>
              <div className="p-2 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                <TagIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 4. Everyday Living */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Everyday Living</span>
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(calc.everydayLivingTotal)}</span>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <PieChartIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 5. Family & Personal */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Family &amp; Personal</span>
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(calc.familyPersonalTotal)}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <HeartIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 6. Debt / EMI */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Debt / EMI</span>
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(calc.debtEmiTotal)}</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                <TagIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 7. Lifestyle & Discretionary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lifestyle &amp; Leisure</span>
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(calc.lifestyleDiscretionaryTotal)}</span>
              </div>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                <SparklesIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 8. One-Time Expenses */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">One-Time Planned</span>
                <span className="text-xs font-extrabold text-slate-800">{formatCurrency(calc.oneTimeExpensesTotal)}</span>
              </div>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                <CalendarIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
