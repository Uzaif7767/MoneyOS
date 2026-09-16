"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LogoIcon, SparklesIcon, PlannerIcon, HelpIcon, SettingsIcon } from "@/components/ui/icons";

export function MobileHeader() {
  return (
    <header className="flex md:hidden items-center justify-between px-3 sm:px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-40 shadow-2xs w-full max-w-full">
      <Link href="/protected" className="flex items-center gap-2 min-w-0">
        <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
          <LogoIcon className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-base text-slate-900 tracking-tight truncate">
          MoneyOS
        </span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <Link
          href="/protected/ai-coach"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-colors"
          aria-label="AI Coach"
        >
          <SparklesIcon className="w-5 h-5 text-emerald-600" />
        </Link>
        <Link
          href="/protected/planner"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-colors"
          aria-label="Monthly Planner"
        >
          <PlannerIcon className="w-5 h-5 text-slate-600" />
        </Link>
        <Link
          href="/protected/help"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-colors"
          aria-label="Help & Learn"
        >
          <HelpIcon className="w-5 h-5 text-slate-600" />
        </Link>
        <Link
          href="/protected/settings"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100/80 transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon className="w-5 h-5 text-slate-600" />
        </Link>
        <UserButton />
      </div>
    </header>
  );
}
