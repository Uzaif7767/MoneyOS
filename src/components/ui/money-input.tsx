"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
  currencySymbol?: string;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, error, currencySymbol = "₹", disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full group">
        <span
          className={cn(
            "absolute left-3.5 text-sm font-semibold pointer-events-none select-none transition-colors",
            disabled ? "text-slate-300" : "text-slate-500 group-focus-within:text-emerald-600"
          )}
        >
          {currencySymbol}
        </span>
        <input
          type="number"
          step="any"
          inputMode="decimal"
          disabled={disabled}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-2 text-sm text-slate-900 shadow-2xs transition-all font-medium placeholder:text-slate-400 placeholder:font-normal focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 hover:border-slate-300",
            error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 hover:border-rose-500",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
