"use client";

import React from "react";
import { AlertCircleIcon } from "@/components/ui/icons";

interface AICoachErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function AICoachError({ message, onRetry }: AICoachErrorProps) {
  // Use a user-friendly neutral error message, avoiding API stack trace exposure
  const displayMessage =
    message && !message.includes("http") && !message.includes("GROQ")
      ? message
      : "Something went wrong while getting a response.";

  return (
    <div
      role="alert"
      className="w-full max-w-3xl mx-auto my-2.5 sm:my-3 p-3 sm:p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 flex items-center justify-between gap-3 text-xs sm:text-sm shadow-2xs"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
        <span className="font-medium truncate">{displayMessage}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Try again"
          className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-950 font-semibold text-xs transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          Try again
        </button>
      )}
    </div>
  );
}

