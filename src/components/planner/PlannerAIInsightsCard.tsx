"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  PieChartIcon,
  RefreshIcon,
  ShieldCheckIcon,
} from "@/components/ui/icons";
import { generatePlannerInsightsAction } from "@/lib/actions/plannerAIActions";
import type { PlannerAIInsights } from "@/lib/ai/planner";

interface PlannerAIInsightsCardProps {
  planningMonthId: string;
  monthLabel: string;
}

export function PlannerAIInsightsCard({
  planningMonthId,
  monthLabel,
}: PlannerAIInsightsCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [insights, setInsights] = useState<PlannerAIInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState<boolean>(false);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generatePlannerInsightsAction(planningMonthId);
      setHasRequested(true);

      if (result.success && result.insights) {
        setInsights(result.insights);
        setError(null);
      } else {
        setInsights(null);
        setError(result.error || "AI planning insights are temporarily unavailable.");
      }
    } catch (err) {
      console.error("Failed to generate AI insights:", err);
      setHasRequested(true);
      setInsights(null);
      setError("AI planning insights are temporarily unavailable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-white">
      {/* Card Header */}
      <CardHeader className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI-generated insights</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-white tracking-tight pt-1">
              AI Planning Insights
            </CardTitle>
            <CardDescription className="text-xs text-slate-300">
              Server-side AI evaluation of your saved monthly plan structure for {monthLabel}.
            </CardDescription>
          </div>

          {/* Trigger Action Button */}
          <div className="shrink-0">
            <Button
              type="button"
              onClick={handleGenerateInsights}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Analyzing Plan...</span>
                </>
              ) : hasRequested ? (
                <>
                  <RefreshIcon className="w-4 h-4 shrink-0" />
                  <span>Regenerate AI Insights</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4 shrink-0" />
                  <span>Generate AI Insights</span>
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
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Get AI-Powered Budget Analysis</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click <strong>&quot;Generate AI Insights&quot;</strong> above to request a server-side evaluation of your saved plan for {monthLabel}.
              </p>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Note: Deterministic MoneyOS calculations are authoritative. AI provides informational interpretation layer only.
            </p>
          </div>
        )}

        {/* State 2: Loading State */}
        {isLoading && (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-4 animate-pulse">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <SparklesIcon className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-sm font-bold text-slate-800">Processing Server-Side Groq AI Request...</p>
              <p className="text-xs text-slate-500">
                Aggregating sanitized planner totals and fetching structured insights.
              </p>
            </div>
          </div>
        )}

        {/* State 3: Error / Unavailable State */}
        {!isLoading && error && (
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Insights Temporarily Unavailable
                </h4>
                <p className="text-xs leading-relaxed text-amber-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* State 4: Validated Structured AI Response Display */}
        {!isLoading && insights && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            {/* 1. Summary Block */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-slate-50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  Executive Summary
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                {insights.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 2. Key Observations List */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <PieChartIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Key Observations
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {insights.observations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Actionable Suggestions List */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Practical Suggestions
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {insights.suggestions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="italic">
                * MoneyOS AI observations are informational interpretation layer only.
              </span>
              <span className="font-semibold text-slate-500">Read-Only Insights</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
