"use client";

import React, { useState } from "react";
import {
  PieChartIcon,
  GoalsIcon,
  BillsIcon,
  ExpensesIcon,
  TrendingUpIcon,
  CalendarIcon,
  TargetIcon,
} from "@/components/ui/icons";

export function InteractivePreviews() {
  const [activeTab, setActiveTab] = useState<"expenses" | "bills" | "goals" | "insights">("insights");

  return (
    <section id="previews" className="py-24 md:py-32 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Interactive Product Tour
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Designed for total clarity.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Explore conceptual previews of the core MoneyOS interface modules.
          </p>

          {/* Tab Navigation Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "insights"
                  ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
              Insights
            </button>

            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "expenses"
                  ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <ExpensesIcon className="w-4 h-4" />
              Expenses
            </button>

            <button
              onClick={() => setActiveTab("bills")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "bills"
                  ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <BillsIcon className="w-4 h-4" />
              Bills
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "goals"
                  ? "bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950/40"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <GoalsIcon className="w-4 h-4" />
              Goals
            </button>
          </div>
        </div>

        {/* Tab Content Preview Container */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {activeTab === "insights" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-cyan-400" />
                    Spending Insights & Projections
                  </h3>
                  <p className="text-xs text-slate-400">Automated category distribution analysis</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  September Overview
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Daily Average Spend</div>
                  <div className="text-xl font-bold text-white">₹1,240 <span className="text-xs text-slate-400 font-normal">/ day</span></div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Month-End Projection</div>
                  <div className="text-xl font-bold text-cyan-300">₹37,200</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400">Highest Category</div>
                  <div className="text-xl font-bold text-amber-300">Rent (45%)</div>
                </div>
              </div>

              {/* Category Breakdown Bars */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-300">Category Breakdown</div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Rent & Housing</span>
                      <span className="font-semibold text-white">₹20,000 (48%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full w-[48%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Food & Groceries</span>
                      <span className="font-semibold text-white">₹10,500 (25%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[25%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Shopping & Lifestyle</span>
                      <span className="font-semibold text-white">₹6,200 (15%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full w-[15%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ExpensesIcon className="w-5 h-5 text-blue-400" />
                    Categorized Expense Tracker
                  </h3>
                  <p className="text-xs text-slate-400">Supported MoneyOS standard categories</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  "Food",
                  "Travel",
                  "Shopping",
                  "Rent",
                  "Bills",
                  "Recharge",
                  "Entertainment",
                  "Health",
                  "Other",
                ].map((cat, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-xs font-medium text-slate-300 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    {cat}
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="font-semibold text-white">Instant Search & Filter</div>
                <div>Filter transactions by date range, specific categories, or note keywords in real time.</div>
              </div>
            </div>
          )}

          {activeTab === "bills" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BillsIcon className="w-5 h-5 text-amber-400" />
                    Upcoming Commitments & Recurring Bills
                  </h3>
                  <p className="text-xs text-slate-400">Never get caught off-guard by due dates</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white">Broadband Fiber Connection</div>
                    <div className="text-xs text-slate-400">Due: 24th September • Recurring Monthly</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">₹1,199</div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white">Electricity & Utility</div>
                    <div className="text-xs text-slate-400">Due: 15th September • Monthly</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">₹3,450</div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      Paid
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "goals" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <GoalsIcon className="w-5 h-5 text-purple-400" />
                    Savings Progress & Target Allocations
                  </h3>
                  <p className="text-xs text-slate-400">Protected financial milestones</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">Emergency Fund (6 Months)</span>
                    <span className="font-mono text-emerald-400">₹1,20,000 / ₹1,50,000 (80%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[80%]" />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">Annual Tech Upgrade Goal</span>
                    <span className="font-mono text-purple-400">₹45,000 / ₹60,000 (75%)</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full w-[75%]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
