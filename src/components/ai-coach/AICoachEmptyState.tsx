"use client";

import React from "react";
import { SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";

interface AICoachEmptyStateProps {
  onSelectPrompt: (promptText: string) => void;
}

const STARTER_PROMPTS = [
  "How much can I safely spend today?",
  "Where did my money go this month?",
  "What bills are coming up?",
  "How are my savings goals doing?",
  "Give me a quick money overview",
  "Can I afford to spend ₹2,000 today?",
];

export function AICoachEmptyState({ onSelectPrompt }: AICoachEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 px-3 sm:py-8 sm:px-4 text-center max-w-2xl mx-auto my-auto w-full">
      {/* Icon Badge */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mb-4 sm:mb-5 shadow-2xs">
        <SparklesIcon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
      </div>

      {/* Hero Headings */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
        Ask MoneyOS AI Coach
      </h2>
      <p className="text-sm font-semibold text-emerald-700 mb-1">
        Your personal MoneyOS financial assistant
      </p>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 sm:mb-8 leading-relaxed">
        Ask questions about your daily safe spending limit, bills, savings goals, or monthly plan.
      </p>

      {/* Starter Prompts Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left">
        {STARTER_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-400 hover:bg-emerald-50/50 active:scale-[0.99] transition-all text-left group flex items-center justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-emerald-950 leading-snug">
              {prompt}
            </span>
            <span className="text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

