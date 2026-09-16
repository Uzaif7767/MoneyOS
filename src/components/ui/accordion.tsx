"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/ui/icons";

export interface AccordionItemProps {
  id: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: "emerald" | "amber" | "blue" | "slate";
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function AccordionItem({
  id,
  title,
  subtitle,
  badgeText,
  badgeVariant = "emerald",
  children,
  isOpen,
  onToggle,
  className,
}: AccordionItemProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const active = isOpen !== undefined ? isOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const badgeStyles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    amber: "bg-amber-50 text-amber-700 border-amber-200/60",
    blue: "bg-blue-50 text-blue-700 border-blue-200/60",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[badgeVariant];

  return (
    <div
      id={id}
      className={cn(
        "bg-white rounded-2xl border transition-all duration-200 overflow-hidden",
        active
          ? "border-emerald-300/80 shadow-xs ring-2 ring-emerald-500/10"
          : "border-slate-200/90 hover:border-slate-300",
        className
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={active}
        aria-controls={`${id}-content`}
        className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 select-none focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 rounded-2xl"
      >
        <div className="space-y-1 pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
              {title}
            </span>
            {badgeText && (
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                  badgeStyles
                )}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-2 rounded-xl text-slate-400 bg-slate-50 transition-transform duration-200 shrink-0 mt-0.5",
            active ? "rotate-180 text-emerald-600 bg-emerald-50" : ""
          )}
        >
          <ChevronDownIcon className="w-5 h-5" />
        </div>
      </button>

      {active && (
        <div
          id={`${id}-content`}
          role="region"
          aria-labelledby={id}
          className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 text-sm text-slate-600 leading-relaxed animate-in fade-in-50 duration-200"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function AccordionGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3.5", className)}>{children}</div>;
}
