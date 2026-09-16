"use client";

import React from "react";
import {
  LayoutDashboardIcon,
  ExpensesIcon,
  BillsIcon,
  GoalsIcon,
  InsightsIcon,
  CheckCircleIcon,
} from "@/components/ui/icons";

export function CoreFeatures() {
  const features = [
    {
      id: "dashboard",
      icon: LayoutDashboardIcon,
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      title: "Dashboard",
      subtitle: "See your financial picture at a glance.",
      description:
        "One central command center displaying your real balance, total income, current spending, Safe-to-Spend daily pool, upcoming bills, and goal targets.",
      bullets: [
        "Real-time balance & income tracking",
        "Safe-to-Spend pool calculation",
        "Unified financial snapshot",
      ],
    },
    {
      id: "expenses",
      icon: ExpensesIcon,
      accent: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
      title: "Expenses",
      subtitle: "Know where your money is going.",
      description:
        "Quickly record expenses across standardized categories. Search, filter, edit, and keep complete visibility on daily outgoings.",
      bullets: [
        "Standardized expense categories",
        "Instant search and filter options",
        "Seamless edit & transaction logs",
      ],
    },
    {
      id: "bills",
      icon: BillsIcon,
      accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
      title: "Bills",
      subtitle: "Stay ahead of upcoming commitments.",
      description:
        "Never get surprised by late fees again. Track recurring and one-off bills with clear due dates, payment status, and automated safe-spend deductions.",
      bullets: [
        "Due-date notification awareness",
        "Recurring vs one-time bill tracking",
        "Paid / Pending status management",
      ],
    },
    {
      id: "goals",
      icon: GoalsIcon,
      accent: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
      title: "Goals",
      subtitle: "Turn savings intentions into visible progress.",
      description:
        "Set target amounts and dates for emergency funds, vacations, or major purchases. Track progress step-by-step with dedicated allocations.",
      bullets: [
        "Target amount & target date planning",
        "Visual progress percentage bars",
        "Protected savings allocations",
      ],
    },
    {
      id: "insights",
      icon: InsightsIcon,
      accent: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
      title: "Insights",
      subtitle: "Understand your spending patterns.",
      description:
        "Gain clarity with visual category breakdowns, spending trends, daily averages, month-end projections, and actionable observations.",
      bullets: [
        "Category distribution breakdown",
        "Daily average & month-end projection",
        "Smart financial pattern observations",
      ],
    },
  ];

  return (
    <section id="features" className="py-24 md:py-32 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Built for Complete Control
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Everything you need for smart money management.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            MoneyOS V1 comes equipped with purpose-built modules designed to work seamlessly together.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-5">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} border flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-emerald-400 mb-3">
                      {item.subtitle}
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-2">
                  {item.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
