"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  AlertCircleIcon,
  PieChartIcon,
  RefreshIcon,
  ShieldCheckIcon,
  WalletIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";
import { generateAIPlanAction } from "@/lib/actions/plannerAIActions";
import type { AIProposedPlanResult, AIProposedAllocations } from "@/lib/ai/planner";

interface PlannerAIPlanCardProps {
  planningMonthId: string;
  monthLabel: string;
  savedSavingsGoal?: number;
}

export function PlannerAIPlanCard({
  planningMonthId,
  monthLabel,
  savedSavingsGoal = 0,
}: PlannerAIPlanCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIProposedPlanResult | null>(null);
  const [hasRequested, setHasRequested] = useState<boolean>(false);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const res = await generateAIPlanAction(planningMonthId);
      setHasRequested(true);
      setResult(res);
    } catch (err) {
      console.error("Failed to generate AI plan:", err);
      setHasRequested(true);
      setResult({
        success: false,
        error: "AI plan could not be validated. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const proposal = result?.proposal;
  const recalculated = result?.recalculatedSummary;

  const categoryLabels: Record<keyof AIProposedAllocations, string> = {
    fixedExpenses: "Fixed Expenses",
    plannedBills: "Planned Bills",
    subscriptions: "Subscriptions",
    foodAndDailyLiving: "Food & Daily Living",
    transport: "Transport",
    housing: "Housing",
    familyPersonal: "Family & Personal",
    debtEmi: "Debt & EMI",
    lifestyleDiscretionary: "Lifestyle & Discretionary",
    oneTimeExpenses: "One-Time Expenses",
    savings: "Suggested Savings",
    safetyBuffer: "Safety Buffer Reserve",
  };

  return (
    <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-white">
      {/* Card Header */}
      <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI-generated proposal</span>
              </span>
              <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                Informational Only
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-white tracking-tight pt-1">
              AI Proposed Monthly Plan
            </CardTitle>
            <CardDescription className="text-xs text-slate-300 leading-relaxed">
              Suggested next-month allocation proposal for {monthLabel}.{" "}
              <strong className="text-amber-300 font-semibold">
                This proposal does not change your saved planner inputs.
              </strong>
            </CardDescription>
          </div>

          {/* Explicit Trigger Action Button */}
          <div className="shrink-0">
            <Button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Generating AI Plan...</span>
                </>
              ) : hasRequested ? (
                <>
                  <RefreshIcon className="w-4 h-4 shrink-0" />
                  <span>Regenerate AI Plan</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 shrink-0" />
                  <span>Generate AI Plan</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* State 1: Initial (Not yet requested) */}
        {!hasRequested && !isLoading && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center border border-indigo-200/60">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Request AI Proposed Allocation Plan</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click <strong>&quot;Generate AI Plan&quot;</strong> above to get a complete proposed monthly allocation based on your saved inputs for {monthLabel}.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 max-w-lg mx-auto">
              <strong>Note:</strong> Deterministic MoneyOS calculations are authoritative. The AI proposal is a suggested allocation and does not automatically alter your saved planner inputs.
            </div>
          </div>
        )}

        {/* State 2: Loading State */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-4 animate-pulse">
            <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <SparklesIcon className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-sm font-bold text-slate-800">Generating AI Proposed Plan...</p>
              <p className="text-xs text-slate-500">
                Calling server-side Groq provider with sanitized planner context and validating allocations.
              </p>
            </div>
          </div>
        )}

        {/* State 3: Error / Validation Failure State */}
        {!isLoading && result && !result.success && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  AI Plan Generation Unavailable
                </h4>
                <p className="text-xs leading-relaxed text-amber-800">
                  {result.error || "AI plan could not be validated. Please try again."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 4: Validated AI Proposed Plan Display */}
        {!isLoading && result?.success && proposal && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            {/* 1. Executive Summary */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/50 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-indigo-700 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                  Proposed Strategy Overview
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                {proposal.summary}
              </p>
            </div>

            {/* 2. Proposed Allocations Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-600" />
                  <span>Proposed Monthly Allocations</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Informational Breakdown
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(Object.keys(proposal.allocations) as (keyof AIProposedAllocations)[]).map((key) => {
                  const val = proposal.allocations[key];
                  const label = categoryLabels[key] || key;
                  const isSavings = key === "savings";
                  const isBuffer = key === "safetyBuffer";

                  return (
                    <div
                      key={key}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-1 transition-all ${
                        isSavings
                          ? "bg-emerald-50/60 border-emerald-200/80"
                          : isBuffer
                          ? "bg-teal-50/60 border-teal-200/80"
                          : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60"
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-600 block">
                        {label}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{val.toLocaleString("en-IN")}
                        </span>
                        {isSavings && savedSavingsGoal > 0 && (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Saved Goal: ₹{savedSavingsGoal.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Deterministic Recalculation Callout */}
            {recalculated && (
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-sm border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                      Deterministic Proposal Check
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Calculated by MoneyOS Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Planned Income
                    </span>
                    <span className="text-lg font-extrabold text-white">
                      ₹{recalculated.plannedMonthlyIncome.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Total Proposed Allocations
                    </span>
                    <span className="text-lg font-extrabold text-indigo-300">
                      ₹{recalculated.totalProposedAllocations.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                      Recalculated Proposed Remaining
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 justify-center sm:justify-start">
                      <span
                        className={`text-lg font-extrabold ${
                          recalculated.recalculatedRemainingMoney >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        ₹{recalculated.recalculatedRemainingMoney.toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                          recalculated.recalculatedRemainingMoney >= 0
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {recalculated.recalculatedRemainingMoney >= 0 ? "Surplus" : "Shortfall"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                  * MoneyOS recalculates total proposed allocations and remaining money deterministically from the AI proposal values.
                </p>
              </div>
            )}

            {/* 4. Trade-offs & Considerations */}
            {proposal.tradeoffs && proposal.tradeoffs.length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <ShieldCheckIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Trade-offs & Allocation Considerations
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {proposal.tradeoffs.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <ArrowRightIcon className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Disclaimer */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <span className="italic text-center sm:text-left">
                * This proposal does not change your saved planner inputs. Deterministic MoneyOS calculations remain authoritative.
              </span>
              <span className="font-semibold text-slate-500 shrink-0">AI Proposal Mode</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
