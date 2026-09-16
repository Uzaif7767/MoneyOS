"use client";

import React from "react";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowUpRightIcon, LogoIcon } from "@/components/ui/icons";

interface FinalCTAProps {
  userId?: string | null;
}

export function FinalCTA({ userId }: FinalCTAProps) {
  return (
    <section className="py-24 md:py-32 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
      {/* Subtle Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 p-10 sm:p-16 text-center space-y-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <LogoIcon className="w-6 h-6" />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to understand your money better?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Start organizing your personal finances with MoneyOS today. Take back control of your spending and plan with confidence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {!userId ? (
              <>
                <SignUpButton mode="modal">
                  <button className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2">
                    Get Started
                    <ArrowUpRightIcon className="w-5 h-5" />
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl hover:scale-[1.02] transition-all cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </>
            ) : (
              <Link
                href="/protected"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowUpRightIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
