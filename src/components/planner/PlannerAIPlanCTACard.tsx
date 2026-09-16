"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";

interface PlannerAIPlanCTACardProps {
  planningMonthId: string;
  monthLabel: string;
  hasExistingPlan?: boolean;
}

export function PlannerAIPlanCTACard({
  planningMonthId,
  monthLabel,
  hasExistingPlan = false,
}: PlannerAIPlanCTACardProps) {
  const targetHref = `/protected/planner/ai-plan?month=${encodeURIComponent(planningMonthId)}&auto=true`;

  return (
    <Card className="rounded-2xl border-slate-200/90 shadow-2xs overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Monthly Plan</span>
              </span>
              <span className="text-[11px] text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                Dedicated Page Proposal
              </span>
            </div>

            <CardTitle className="text-xl font-extrabold text-white tracking-tight pt-1">
              AI Proposed Monthly Plan ({monthLabel})
            </CardTitle>

            <CardDescription className="text-xs text-slate-300 leading-relaxed">
              Turn your saved planner inputs into a personalized monthly allocation proposal on a dedicated planning page.
            </CardDescription>
          </div>

          <div className="shrink-0">
            <Link
              href={targetHref}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-indigo-500 cursor-pointer"
            >
              <SparklesIcon className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>{hasExistingPlan ? "View AI Plan" : "Generate AI Plan"}</span>
              <ArrowRightIcon className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
