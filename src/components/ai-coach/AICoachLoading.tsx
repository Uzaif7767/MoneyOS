"use client";

import React from "react";
import { SparklesIcon } from "@/components/ui/icons";

export function AICoachLoading() {
  return (
    <div
      className="flex items-start gap-2.5 sm:gap-3 w-full max-w-3xl mx-auto my-2.5 sm:my-3"
      role="status"
      aria-label="AI Coach is thinking"
    >
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
        <SparklesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 animate-pulse motion-reduce:animate-none" />
      </div>

      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-sm bg-white text-slate-700 border border-slate-200/90 rounded-tl-xs flex items-center gap-2 shadow-2xs">
        <div className="flex gap-1 items-center py-0.5">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s] motion-reduce:animate-none"></span>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s] motion-reduce:animate-none"></span>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-bounce motion-reduce:animate-none"></span>
        </div>
        <span className="text-xs font-medium text-slate-500 ml-1 select-none">
          Thinking...
        </span>
      </div>
    </div>
  );
}

