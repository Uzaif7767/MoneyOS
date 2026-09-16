"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description: string;
  badgeText?: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badgeText,
  badgeIcon: BadgeIcon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all",
        className
      )}
    >
      <div className="space-y-1 min-w-0 flex-1">
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200/60">
            {BadgeIcon ? (
              <BadgeIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
            <span>{badgeText}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
          {action}
        </div>
      )}
    </div>
  );
}
