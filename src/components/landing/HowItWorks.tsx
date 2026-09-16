"use client";

import React from "react";
import { UserCheckIcon, PlusIcon, TargetIcon, SparklesIcon } from "@/components/ui/icons";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: UserCheckIcon,
      title: "Set up your money",
      description: "Enter your monthly income, starting balance, and optional Safety Buffer during quick onboarding.",
    },
    {
      step: "02",
      icon: PlusIcon,
      title: "Track what you spend",
      description: "Log expenses in seconds and keep your recurring bills updated as they come due.",
    },
    {
      step: "03",
      icon: TargetIcon,
      title: "Set your goals",
      description: "Define targets for emergency reserves, major purchases, or future planning.",
    },
    {
      step: "04",
      icon: SparklesIcon,
      title: "Understand and plan",
      description: "Check your Daily Safe Spend before spending and review intelligent Insights over time.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            How MoneyOS works.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            No complicated setup. No bank linking required. Get absolute clarity in under two minutes.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 group hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold font-mono text-slate-700 group-hover:text-emerald-400/80 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
