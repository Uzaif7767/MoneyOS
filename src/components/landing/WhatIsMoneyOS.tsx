"use client";

import React from "react";
import { WalletIcon, PieChartIcon, ShieldCheckIcon } from "@/components/ui/icons";

export function WhatIsMoneyOS() {
  return (
    <section className="py-20 md:py-28 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Clear Financial Purpose
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Your money, in one clear view.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Most finance apps confuse you with complex charts or force you to connect bank accounts.
            MoneyOS gives you complete clarity by answering the only three questions that actually matter:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Question 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <WalletIcon className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-emerald-400 mb-2">Question 01</div>
            <h3 className="text-xl font-bold text-white mb-3">
              &quot;How much money do I have?&quot;
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instantly see your total current balance across accounts in one clean space, without manual spreadsheet math or guesswork.
            </p>
          </div>

          {/* Question 2 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-cyan-400 mb-2">Question 02</div>
            <h3 className="text-xl font-bold text-white mb-3">
              &quot;Where is my money going?&quot;
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track expenses in real-time across essential categories. Spot spending patterns and know exactly what your monthly lifestyle costs.
            </p>
          </div>

          {/* Question 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono text-emerald-400 mb-2">Question 03 — The MoneyOS Secret</div>
            <h3 className="text-xl font-bold text-white mb-3">
              &quot;How much can I safely spend?&quot;
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Know your true daily spendable limit after taking into account upcoming bills, savings goals, and your chosen Safety Buffer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
