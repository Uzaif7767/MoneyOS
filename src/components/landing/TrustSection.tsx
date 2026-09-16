"use client";

import React from "react";
import { ShieldCheckIcon, CheckCircleIcon, WalletIcon } from "@/components/ui/icons";

export function TrustSection() {
  const trustPoints = [
    {
      title: "Authenticated User Sessions",
      description:
        "Protected by Clerk authentication with secure session management and encrypted JWT validation.",
    },
    {
      title: "User-Scoped Data Isolation",
      description:
        "Your financial records are strictly isolated to your authenticated account in Firestore rules.",
    },
    {
      title: "Server-Side Credential Safety",
      description:
        "All Firebase Admin credentials and private API keys remain strictly server-side.",
    },
    {
      title: "Zero Sensitive Credentials Needed",
      description:
        "MoneyOS V1 requires NO UPI PINs, net banking passwords, or OTP accesses.",
    },
  ];

  return (
    <section id="trust" className="py-24 md:py-32 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheckIcon className="w-4 h-4" />
              Privacy & Trust Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Built around clarity and user control.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              MoneyOS respects your data privacy with responsible technical architecture.
            </p>
          </div>

          {/* Grid of Factual Security Statements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {trustPoints.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {item.title}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
