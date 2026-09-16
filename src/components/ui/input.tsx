import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixText?: string;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefixText, error, disabled, ...props }, ref) => {
    if (prefixText) {
      return (
        <div className="relative flex items-center w-full group">
          <span
            className={cn(
              "absolute left-3.5 text-sm font-semibold pointer-events-none select-none transition-colors",
              disabled ? "text-slate-300" : "text-slate-500 group-focus-within:text-emerald-600"
            )}
          >
            {prefixText}
          </span>
          <input
            type={type}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-2 text-sm text-slate-900 shadow-2xs transition-all font-medium placeholder:text-slate-400 placeholder:font-normal focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-75",
              error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 hover:border-rose-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-2xs transition-all font-medium placeholder:text-slate-400 placeholder:font-normal focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/20 hover:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-75",
          error && "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20 hover:border-rose-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
