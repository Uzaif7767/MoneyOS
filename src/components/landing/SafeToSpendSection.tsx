"use client";

import React, { useState } from "react";
import { ShieldCheckIcon, CalendarIcon, TargetIcon, WalletIcon, ArrowRightIcon } from "@/components/ui/icons";

export function SafeToSpendSection() {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Illustrative mathematical demo data for interactive visual block
  const currentBalance = 75000;
  const upcomingBills = 15000;
  const goalAllocation = 10000;
  const safetyBuffer = 10000;

  const safeToSpendPool = currentBalance - upcomingBills - goalAllocation - safetyBuffer; // 40,000
  const daysUntilNextIncome = 20;
  const dailySafeSpend = Math.floor(safeToSpendPool / daysUntilNextIncome); // 2,000

  return (
    <section id="safe-to-spend" className="py-24 md:py-32 bg-slate-950 relative overflow-hidden border-t border-slate-900">
      {/* Background Subtle Accents */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheckIcon className="w-4 h-4" />
            Hero Feature Differentiation
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Know what you can <span className="text-emerald-400">safely spend</span>.
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Your bank balance is lying to you. It doesn&apos;t know your rent is due next week or that you&apos;re saving for a emergency fund.
            MoneyOS calculates your true spendable liquidity in real-time.
          </p>
        </div>

        {/* Visual Formula Engine Card */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900/80 border border-emerald-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8 flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                The Safe-to-Spend Formula
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Deterministic mathematical calculation (No guessing, no debt risk)
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Formula Engine Active
            </div>
          </div>

          {/* Formula Interactive Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center mb-8">
            {/* 1. Current Balance */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1 hover:border-slate-700 transition-colors">
              <div className="text-[11px] font-mono text-slate-400 uppercase">1. Balance</div>
              <div className="text-lg font-bold text-white">₹{currentBalance.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Current Total</div>
            </div>

            {/* Subtraction Symbol */}
            <div className="text-center font-bold text-slate-500 text-xl hidden md:block">−</div>

            {/* 2. Upcoming Bills */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1 hover:border-rose-500/30 transition-colors">
              <div className="text-[11px] font-mono text-rose-400 uppercase">2. Bills</div>
              <div className="text-lg font-bold text-rose-300">₹{upcomingBills.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Upcoming Due</div>
            </div>

            {/* Subtraction Symbol */}
            <div className="text-center font-bold text-slate-500 text-xl hidden md:block">−</div>

            {/* 3. Goals Allocation */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1 hover:border-amber-500/30 transition-colors">
              <div className="text-[11px] font-mono text-amber-400 uppercase">3. Goals</div>
              <div className="text-lg font-bold text-amber-300">₹{goalAllocation.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Target Savings</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center mb-10">
            {/* Subtraction Symbol */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1 hover:border-slate-700 transition-colors">
              <div className="text-[11px] font-mono text-cyan-400 uppercase">4. Buffer</div>
              <div className="text-lg font-bold text-cyan-300">₹{safetyBuffer.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Safety Buffer</div>
            </div>

            {/* Equals Symbol */}
            <div className="text-center font-bold text-slate-500 text-xl hidden md:block md:col-span-1">=</div>

            {/* Safe to Spend Pool Result */}
            <div className="md:col-span-3 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-950 border border-emerald-500/40 space-y-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-emerald-400 uppercase font-semibold">Safe-to-Spend Pool</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                  ₹{safeToSpendPool.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">Total unencumbered cash</div>
              </div>

              <div className="w-full sm:w-auto p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-center sm:text-right">
                <div className="text-[11px] font-mono text-slate-400">Daily Safe Spend Limit</div>
                <div className="text-xl font-bold text-cyan-300">
                  ₹{dailySafeSpend.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ day</span>
                </div>
                <div className="text-[10px] text-slate-500">({daysUntilNextIncome} days until income)</div>
              </div>
            </div>
          </div>

          {/* Safety Buffer Explanation Section */}
          <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              What is the Safety Buffer?
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              <strong>Safety Buffer</strong> is money you choose to keep reserved in your account instead of treating it as spendable liquidity.
              It protects you from unexpected micro-expenses without treating your reserve as a monthly expense.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
