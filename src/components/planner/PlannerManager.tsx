"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  PlannerIcon,
  CalendarIcon,
  WalletIcon,
  BillsIcon,
  PieChartIcon,
  GoalsIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@/components/ui/icons";
import { PlannerInputForm } from "@/components/planner/PlannerInputForm";

interface PlanningPillar {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const planningPillars: PlanningPillar[] = [
  {
    title: "Organize Expected Income",
    description:
      "Map out all recurring salary, freelance earnings, and inflow sources expected during the month.",
    icon: WalletIcon,
    tag: "Inflow Structure",
  },
  {
    title: "Account for Fixed Bills",
    description:
      "Lock in recurring bill payments, subscriptions, and mandatory overhead before allocating spendable cash.",
    icon: BillsIcon,
    tag: "Fixed Commitments",
  },
  {
    title: "Plan Everyday Spending",
    description:
      "Set sensible variable budgets for groceries, dining, transport, and discretionary day-to-day choices.",
    icon: PieChartIcon,
    tag: "Variable Budget",
  },
  {
    title: "Allocate Savings",
    description:
      "Direct money into short-term targets, long-term wealth goals, or emergency fund deposits.",
    icon: GoalsIcon,
    tag: "Wealth Building",
  },
  {
    title: "Protect a Safety Buffer",
    description:
      "Keep an untouched reserve margin to prevent overdrafts and absorb unexpected mid-month spikes.",
    icon: ShieldCheckIcon,
    tag: "Risk Mitigation",
  },
  {
    title: "Understand Remaining Cash",
    description:
      "Gain total clarity on unassigned cash flow so every single unit of money has a clear purpose.",
    icon: CheckCircleIcon,
    tag: "Complete Balance",
  },
];

export function PlannerManager() {
  // Generate planning month options dynamically based on the current system date
  const monthOptions = useMemo(() => {
    const now = new Date();
    const options = [];

    // Current month, next month, and month after next
    for (let offset = 0; offset <= 2; offset++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const monthName = targetDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const year = targetDate.getFullYear();
      const monthNumber = String(targetDate.getMonth() + 1).padStart(2, "0");
      const isNextMonth = offset === 1;

      options.push({
        id: `${year}-${monthNumber}`,
        label: `${monthName} ${year}`,
        isDefault: isNextMonth,
        subtitle:
          offset === 0
            ? "Current Month"
            : offset === 1
            ? "Upcoming Planning Month"
            : "Future Month",
      });
    }

    return options;
  }, []);

  // Default to the upcoming month (offset 1) or first option
  const [selectedMonthId, setSelectedMonthId] = useState<string>(
    () => monthOptions.find((m) => m.isDefault)?.id || monthOptions[0].id
  );

  const selectedMonthObj = useMemo(
    () => monthOptions.find((m) => m.id === selectedMonthId) || monthOptions[0],
    [monthOptions, selectedMonthId]
  );

  // State to track whether active input workflow is open
  const [isFormActive, setIsFormActive] = useState<boolean>(true);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Monthly Money Planner"
        description="Build a clear plan for your upcoming month."
        badgeText="Financial Inputs"
        badgeIcon={PlannerIcon}
      />

      {/* 2. Planning Month Context Bar */}
      <section
        aria-label="Planning Month Context"
        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs transition-all"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Target Planning Context
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedMonthObj.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                  {selectedMonthObj.subtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Month Selector Controls */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto max-w-full">
            {monthOptions.map((option) => {
              const isSelected = option.id === selectedMonthId;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedMonthId(option.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                    isSelected
                      ? "bg-white text-emerald-800 shadow-2xs font-bold border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Setup Introductory Planner Banner or Active Input Workflow */}
      {!isFormActive ? (
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
          {/* Intro Banner */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upcoming Financial Blueprint</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                Design Your Financial Strategy for {selectedMonthObj.label}
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                The Monthly Money Planner gives you proactive control over your financial commitments.
                Structure your income, protect your essential bills, set clear spending boundaries, and secure your savings targets for {selectedMonthObj.label}.
              </p>
            </div>
          </div>

          {/* Core Pillars Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-1">
                What Your Monthly Plan Will Cover
              </h3>
              <p className="text-xs text-slate-500">
                A comprehensive blueprint designed to protect your cash flow and financial health.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planningPillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200 flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-white text-emerald-600 border border-slate-200/80 shadow-2xs group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/60 text-slate-600">
                          {pillar.tag}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                        {pillar.title}
                      </h4>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Start Planning Primary CTA Section */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                <span className="font-semibold text-slate-700 block sm:inline">
                  Ready to plan {selectedMonthObj.label}?
                </span>{" "}
                Prepare your financial targets before the month starts.
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormActive(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  <span>Start Planning</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Planning Financial Inputs ({selectedMonthObj.label})
            </h3>
            <button
              type="button"
              onClick={() => setIsFormActive(false)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
            >
              View Planning Pillars Overview
            </button>
          </div>

          <PlannerInputForm
            key={selectedMonthId}
            selectedMonthId={selectedMonthId}
            selectedMonthLabel={selectedMonthObj.label}
          />
        </div>
      )}
    </div>
  );
}
