"use client";

import React from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

export function FeatureEcosystem() {
  const nodes = [
    { label: "Income & Setup", detail: "Initial Financial Baseline", color: "border-blue-500/30 text-blue-400 bg-blue-950/20" },
    { label: "Dashboard", detail: "Unified Control Center", color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/30" },
    { label: "Expenses + Bills + Goals", detail: "Active Data Inputs", color: "border-amber-500/30 text-amber-400 bg-amber-950/20" },
    { label: "Insights", detail: "Pattern Engine & Projections", color: "border-purple-500/30 text-purple-400 bg-purple-950/20" },
    { label: "Safe-to-Spend Pool", detail: "Actionable Daily Limit", color: "border-cyan-500/40 text-cyan-300 bg-cyan-950/40" },
  ];

  return (
    <section className="py-20 bg-slate-950/90 border-t border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Integrated Data Architecture
          </div>
          <h3 className="text-2xl sm:text-4xl font-bold text-white">
            One connected money system.
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            Every module feeds into the next, automatically adjusting your daily Safe-to-Spend limit in real time.
          </p>
        </div>

        {/* Node Flow Diagram */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-3 max-w-6xl mx-auto">
          {nodes.map((node, idx) => (
            <React.Fragment key={idx}>
              <div className={`p-4 rounded-xl border ${node.color} text-center w-full lg:w-48 shadow-lg hover:scale-105 transition-transform`}>
                <div className="text-xs font-bold text-white mb-0.5">{node.label}</div>
                <div className="text-[10px] text-slate-400">{node.detail}</div>
              </div>

              {idx < nodes.length - 1 && (
                <div className="text-slate-600 my-1 lg:my-0">
                  <ArrowRightIcon className="w-5 h-5 rotate-90 lg:rotate-0 text-emerald-400/60" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
