"use client";

import React from "react";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  WalletIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  CalendarIcon,
  TargetIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";

interface HeroSectionProps {
  userId?: string | null;
}

export function HeroSection({ userId }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-grid-pattern bg-radial-gradient">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm shadow-emerald-950/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Personal Money Management
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Take control of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              your money.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-8">
            Understand your spending, plan ahead, and know exactly what you can
            safely spend every single day.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            {!userId ? (
              <>
                <SignUpButton mode="modal">
                  <button className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2">
                    Get Started
                    <ArrowUpRightIcon className="w-5 h-5" />
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </>
            ) : (
              <Link
                href="/protected"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowUpRightIcon className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Core Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-400 max-w-2xl w-full mb-12 border-t border-b border-slate-800/60 py-4">
            <div className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>Real-time Safe Spend</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>Zero Bank Credentials Needed</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span>Private & Scoped Accounts</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative max-w-5xl mx-auto mt-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-75" />
          
          <div className="relative rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Window Topbar */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                  MoneyOS Dashboard Overview — Product Preview
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/50 text-[11px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Demo UI
              </div>
            </div>

            {/* Stylized Interface Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Balance */}
                <div className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Current Balance</span>
                    <WalletIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">₹85,000</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <span>Updated for September</span>
                  </div>
                </div>

                {/* Safe-to-Spend Pool */}
                <div className="p-4.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border border-emerald-500/30 space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-lg" />
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span>Safe-to-Spend Pool</span>
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-300">₹44,000</div>
                  <div className="text-[11px] text-emerald-400/80">Available after obligations</div>
                </div>

                {/* Daily Safe Spend */}
                <div className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Daily Safe Spend</span>
                    <TrendingUpIcon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-300">₹2,200 <span className="text-xs font-normal text-slate-400">/ day</span></div>
                  <div className="text-[11px] text-slate-400">20 days until next income</div>
                </div>

                {/* Safety Buffer */}
                <div className="p-4.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Safety Buffer</span>
                    <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-200">₹15,000</div>
                  <div className="text-[11px] text-slate-400">Reserved safety pool</div>
                </div>
              </div>

              {/* Middle Breakdown Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Expenses & Categories Preview */}
                <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <TrendingUpIcon className="w-4 h-4 text-emerald-400" />
                      Recent Activity & Categories
                    </h4>
                    <span className="text-xs text-slate-400">September 2026</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-semibold">
                          Food
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">Groceries & Supermarket</div>
                          <div className="text-[11px] text-slate-400">Today, 2:30 PM</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-200">− ₹1,850</div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-semibold">
                          Rent
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">Apartment Monthly Rent</div>
                          <div className="text-[11px] text-slate-400">1st of Month</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-200">− ₹20,000</div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-semibold">
                          Bills
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">Wi-Fi & Broadband</div>
                          <div className="text-[11px] text-slate-400">Auto-paid</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-200">− ₹999</div>
                    </div>
                  </div>
                </div>

                {/* Right: Upcoming Commitments */}
                <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                      <CalendarIcon className="w-4 h-4 text-amber-400" />
                      Upcoming Bills & Goals
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">Electricity Bill</span>
                          <span className="text-amber-400 font-semibold">₹2,500</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Due in 5 days</div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">Emergency Fund Goal</span>
                          <span className="text-emerald-400 font-semibold">₹3,500 / mo</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[65%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
                    ✨ Automated Safe-to-Spend syncs every time you add an expense.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
