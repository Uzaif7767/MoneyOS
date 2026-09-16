"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccordionItem, AccordionGroup } from "@/components/ui/accordion";
import {
  BookOpenIcon,
  HelpIcon,
  SearchIcon,
  XIcon,
  ShieldCheckIcon,
  WalletIcon,
  ExpensesIcon,
  BillsIcon,
  GoalsIcon,
  InsightsIcon,
  SettingsIcon,
  PlusIcon,
  RupeeSignIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  EditIcon,
} from "@/components/ui/icons";

interface TopicSection {
  id: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: TopicSection[] = [
  { id: "welcome", title: "Getting Started", badge: "Overview", icon: BookOpenIcon },
  { id: "dashboard", title: "Dashboard", badge: "Overview", icon: WalletIcon },
  { id: "safe-to-spend", title: "Safe-to-Spend", badge: "Core Formula", icon: ShieldCheckIcon },
  { id: "expenses", title: "Expenses", badge: "Tracking", icon: ExpensesIcon },
  { id: "bills", title: "Bills", badge: "Commitments", icon: BillsIcon },
  { id: "goals", title: "Goals", badge: "Savings", icon: GoalsIcon },
  { id: "insights", title: "Insights", badge: "Analytics", icon: InsightsIcon },
  { id: "setup", title: "Financial Setup", badge: "Settings", icon: SettingsIcon },
  { id: "best-practices", title: "Best Practices", badge: "Guidance", icon: TrendingUpIcon },
  { id: "faq", title: "FAQ", badge: "Questions", icon: HelpIcon },
];

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  // Handle hash scrolling and highlighting when navigating via direct hash link (e.g. /protected/help#safe-to-spend)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setHighlightedSection(hash);
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <PageHeader
        title="Help & Learn Center"
        description="Understand MoneyOS, master Safe-to-Spend calculations, and make smarter decisions with your money dashboard."
        badgeText="Documentation & Knowledge Base"
        badgeIcon={BookOpenIcon}
      />

      {/* Search & Section Quick Jump Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="relative">
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics (e.g., Safe-to-Spend, Bills, Expenses, Buffer)..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              aria-label="Clear search"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full min-w-0 pb-1 pt-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "all"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            All Topics
          </button>
          {SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              onClick={() => setActiveTab(sec.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === sec.id
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              <sec.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{sec.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* SECTION 1 — WELCOME / GETTING STARTED */}
      {(activeTab === "all" || activeTab === "welcome") && matchesSearch("welcome getting started problem overview balance income safe to spend") && (
        <Card
          id="welcome"
          className={`transition-all duration-300 ${
            highlightedSection === "welcome"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 1
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Overview</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              Welcome to MoneyOS — Personal Finance System
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              MoneyOS is built to help you answer the three fundamental daily money questions without confusion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-slate-900">How much money do I have?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tracks your live liquid balance across accounts as entered in your Financial Setup.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-slate-900">Where is my money going?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Categorizes daily expenses, upcoming bills, and goal savings contributions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-slate-900">How much can I safely spend?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calculates your real Safe-to-Spend pool and Daily Safe Spend limit before your next payday.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
                <AlertCircleIcon className="w-4 h-4 text-amber-600" />
                <span>Important Disclaimer</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                MoneyOS is a personal financial tracking and planning dashboard based strictly on user-entered data. It does not provide financial advice, legal counsel, or guaranteed financial outcomes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 2 — DASHBOARD EXPLAINED */}
      {(activeTab === "all" || activeTab === "dashboard") && matchesSearch("dashboard balance income spending safe to spend upcoming bills expenses goals") && (
        <Card
          id="dashboard"
          className={`transition-all duration-300 ${
            highlightedSection === "dashboard"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 2
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Dashboard Anatomy</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              Understanding Your Dashboard
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Every card on your dashboard reflects live financial data stored in your MoneyOS profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Balance</span>
                  <WalletIcon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-600">
                  Your total liquid funds entered in Settings. Serves as the starting point for Safe-to-Spend.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Income</span>
                  <TrendingUpIcon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-600">
                  Configured monthly earnings. Helps calculate cashflow and projected month-end status.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spending</span>
                  <ExpensesIcon className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-600">
                  Sum of all logged expenses for the current active month in Indian Rupees (₹).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Safe-to-Spend</span>
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600">
                  Uncommitted money safely available to spend until your next income date.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900">Additional Dashboard Widgets:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">1</div>
                  <div>
                    <strong className="text-slate-900 block">Spending Chart:</strong>
                    Visual breakdown of expenses by category (Food, Travel, Shopping, etc.) and daily trends.
                  </div>
                </li>
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">2</div>
                  <div>
                    <strong className="text-slate-900 block">Upcoming Bills:</strong>
                    List of unpaid bills due before your next payday, deducted automatically from your Safe-to-Spend pool.
                  </div>
                </li>
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">3</div>
                  <div>
                    <strong className="text-slate-900 block">Recent Expenses:</strong>
                    Quick log of recent spending transactions with instant edit and deletion controls.
                  </div>
                </li>
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">4</div>
                  <div>
                    <strong className="text-slate-900 block">Goals Progress:</strong>
                    Progress bars for active savings goals showing target amounts and contributions.
                  </div>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 3 — SAFE-TO-SPEND EXPLAINED */}
      {(activeTab === "all" || activeTab === "safe-to-spend") && matchesSearch("safe to spend calculation pool formula buffer bills goals balance") && (
        <Card
          id="safe-to-spend"
          className={`transition-all duration-300 ${
            highlightedSection === "safe-to-spend"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 3 — Core Feature
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Formula & Breakdown</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              How Safe-to-Spend Works
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Safe-to-Spend prevents overspending by reserving money for upcoming bills, goals, and emergency safety buffers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-slate-700">
            {/* Safe-to-Spend Pool Formula Visual */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                  1. Safe-to-Spend Pool Formula
                </span>
                <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
                  Calculated in INR (₹)
                </span>
              </div>
              <div className="font-mono text-xs sm:text-sm bg-slate-950/80 p-4 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full min-w-0 text-emerald-300">
                Safe-to-Spend Pool = Current Balance - Upcoming Bills - Goal Allocation - Safety Buffer
              </div>
            </div>

            {/* Daily Safe Spend Formula Visual */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <RupeeSignIcon className="w-4 h-4 text-emerald-400" />
                  2. Daily Safe Spend Limit Formula
                </span>
                <span className="text-[11px] bg-emerald-900/60 text-emerald-200 px-2.5 py-0.5 rounded-full font-mono">
                  Min 1-Day Guard
                </span>
              </div>
              <div className="font-mono text-xs sm:text-sm bg-slate-950/80 p-4 rounded-xl border border-emerald-800/60 overflow-x-auto max-w-full min-w-0 text-emerald-300">
                Daily Safe Spend = Safe-to-Spend Pool ÷ Days Until Next Income
              </div>
            </div>

            {/* Component Explanations */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-base">Detailed Formula Components:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Current Balance</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    The current available balance entered/stored in MoneyOS. Serves as your gross available capital.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Upcoming Bills</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Total unpaid bills that are scheduled before your next income date.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Goal Allocation</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Money allocated toward savings goals according to existing MoneyOS calculations.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Safety Buffer</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Money you choose to keep reserved & untouched for emergencies.
                  </p>
                </div>
              </div>
            </div>

            {/* Special Logic Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                  <span>Minimum 1-Day Guard</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If your next income date is today or in the past, MoneyOS enforces a minimum 1-day guard safeguard to prevent division by zero.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/70 text-rose-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                  <AlertCircleIcon className="w-4 h-4 text-rose-600" />
                  <span>Negative Safe-to-Spend Pool</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  If your upcoming bills, goal allocations, and safety buffer exceed your available balance, the calculated pool turns negative (red). This warns you that existing commitments exceed liquid cash.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 4 — EXPENSES */}
      {(activeTab === "all" || activeTab === "expenses") && matchesSearch("expenses category food travel shopping rent bills recharge entertainment health other edit delete") && (
        <Card
          id="expenses"
          className={`transition-all duration-300 ${
            highlightedSection === "expenses"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 4
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Expense Management</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              Managing Daily Expenses
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Log daily outlays, track spending across 9 V1 categories, and search/filter transaction records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <PlusIcon className="w-4 h-4 text-emerald-600" />
                  <span>Adding Expenses</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Use the quick <strong>+ Add</strong> action on mobile or the form on the Expenses page with title, amount (₹), date, and category.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <EditIcon className="w-4 h-4 text-blue-600" />
                  <span>Editing & Deleting</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click the Edit or Trash icon on any expense row to modify details or remove an entry instantly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <SearchIcon className="w-4 h-4 text-purple-600" />
                  <span>Search & Filter</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Filter transactions by category or search notes/names to quickly review specific past purchases.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Current MoneyOS V1 Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Food",
                  "Travel",
                  "Shopping",
                  "Rent",
                  "Bills",
                  "Recharge",
                  "Entertainment",
                  "Health",
                  "Other",
                ].map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/70"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 5 — BILLS */}
      {(activeTab === "all" || activeTab === "bills") && matchesSearch("bills commitments due date paid unpaid recurring monthly yearly safe-to-spend") && (
        <Card
          id="bills"
          className={`transition-all duration-300 ${
            highlightedSection === "bills"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 5
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Financial Commitments</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              Bills & Recurring Payments
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Keep track of fixed recurring obligations and avoid surprises before your next payday.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <h5 className="font-bold text-slate-900 text-xs">What is a Bill?</h5>
                <p className="text-xs text-slate-600">
                  A scheduled financial obligation (e.g. Rent, Electricity, Internet, Subscriptions) with a specified due date.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <h5 className="font-bold text-slate-900 text-xs">Frequency Options</h5>
                <p className="text-xs text-slate-600">
                  Bills can be configured as <strong>Monthly</strong> or <strong>Yearly</strong> recurring payments.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <h5 className="font-bold text-slate-900 text-xs">Paid / Unpaid Status</h5>
                <p className="text-xs text-slate-600">
                  Toggle bills as Paid when settled. Unpaid bills due before your next payday automatically deduct from Safe-to-Spend.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <h5 className="font-bold text-slate-900 text-xs">Safe-to-Spend Impact</h5>
                <p className="text-xs text-slate-600">
                  Marking a bill as Paid unlocks that reserved money back into your active Safe-to-Spend pool.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 6 — GOALS */}
      {(activeTab === "all" || activeTab === "goals") && matchesSearch("goals target savings contribution progress allocation safe-to-spend") && (
        <Card
          id="goals"
          className={`transition-all duration-300 ${
            highlightedSection === "goals"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 6
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Savings & Targets</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              Savings Goals Tracking
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Set dedicated financial targets, log contributions, and track savings progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs">1. Creating a Goal</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Define a goal name (e.g. Emergency Fund, New Laptop), target amount in ₹, optional target date, and initial savings amount.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs">2. Adding Contributions</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deposit funds toward your goal as you save. The visual progress bar updates to show percentage completion.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs">3. Safe-to-Spend Allocation</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Money allocated to active goals is treated as reserved capital and excluded from your daily spendable cash pool.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 7 — INSIGHTS */}
      {(activeTab === "all" || activeTab === "insights") && matchesSearch("insights analytics period comparison this month last month 3 months smart observations projection non-ai") && (
        <Card
          id="insights"
          className={`transition-all duration-300 ${
            highlightedSection === "insights"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 7
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Analytics & Observations</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              Financial Insights Engine
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Review spending patterns, time period comparisons, and deterministic smart observations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Time Periods</span>
                <p className="text-xs text-slate-600">
                  Switch view between <strong>This Month</strong>, <strong>Last Month</strong>, and <strong>Last 3 Months</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Metrics</span>
                <p className="text-xs text-slate-600">
                  View daily average spend, category breakdowns, period comparison trends, and month-end spending projections.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Observations</span>
                <p className="text-xs text-slate-600">
                  Automated smart callouts highlighting top spending categories, unusual spikes, and goal pacing.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Logic (Rule-Based Analytics)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                MoneyOS V1 smart observations are calculated using pure mathematical rules and logic. They do not rely on probabilistic AI or external machine learning models.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 8 — FINANCIAL SETUP */}
      {(activeTab === "all" || activeTab === "setup") && matchesSearch("financial setup onboarding settings balance income next income date safety buffer reserve") && (
        <Card
          id="setup"
          className={`transition-all duration-300 ${
            highlightedSection === "setup"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 8
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Settings & Parameters</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              Financial Setup & Parameters
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Configure baseline parameters that drive all calculations across your MoneyOS dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs">Monthly Income (₹)</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your regular expected earnings each month. Used for cashflow overview and month-end projections.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs">Current Balance (₹)</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The actual available liquid balance in your bank accounts / cash reserves right now.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs">Next Income Date</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The date of your next salary or payday. Used to count remaining days for Daily Safe Spend.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs">Safety Buffer Amount (₹)</h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  An emergency reserve you choose to keep untouched. <strong>Note:</strong> Safety Buffer is a reserve, NOT a monthly expense.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 9 — BEST PRACTICES */}
      {(activeTab === "all" || activeTab === "best-practices") && matchesSearch("best practices guidance updates habits accuracy safe-to-spend") && (
        <Card
          id="best-practices"
          className={`transition-all duration-300 ${
            highlightedSection === "best-practices"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 9
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Habits & Guidance</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              MoneyOS Best Practices
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Simple daily habits to ensure your dashboard stays accurate and useful.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Log Expenses Promptly</h5>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Record expenses as soon as they occur so your daily Safe-to-Spend limit stays accurate.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Keep Balance Updated</h5>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Reconcile your Current Balance in Settings whenever you receive external cash or unrecorded income.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Mark Bills Paid Promptly</h5>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Marking bills paid releases reserved funds back into your active Safe-to-Spend pool.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold shrink-0">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Review Insights Regularly</h5>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Check Insights weekly to spot category overspending before it impacts your end-of-month buffer.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 10 — FAQ */}
      {(activeTab === "all" || activeTab === "faq") && matchesSearch("faq questions safe-to-spend negative buffer bills goals ai data source") && (
        <Card
          id="faq"
          className={`transition-all duration-300 ${
            highlightedSection === "faq"
              ? "ring-2 ring-emerald-500 border-emerald-300"
              : "border-slate-200/90"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald">
                Section 10 — FAQ
              </Badge>
              <span className="text-xs font-semibold text-slate-400">Frequently Asked Questions</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 font-extrabold">
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-slate-600 text-sm">
              Clear, direct answers regarding MoneyOS V1 behavior, formulas, and data management.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccordionGroup>
              <AccordionItem
                id="faq-1"
                title="What is MoneyOS?"
                badgeText="Overview"
                badgeVariant="emerald"
              >
                MoneyOS is a clean personal finance tracking system designed to give you instant clarity on your liquid balance, expense history, upcoming bills, savings goals, and daily Safe-to-Spend limit.
              </AccordionItem>

              <AccordionItem
                id="faq-2"
                title="What is Safe-to-Spend?"
                badgeText="Core Concept"
                badgeVariant="emerald"
              >
                Safe-to-Spend is the portion of your available balance that remains uncommitted after setting aside funds for upcoming bills due before your next payday, active goal allocations, and your emergency safety buffer.
              </AccordionItem>

              <AccordionItem
                id="faq-3"
                title="How is Daily Safe Spend calculated?"
                badgeText="Formula"
                badgeVariant="blue"
              >
                Daily Safe Spend is calculated by dividing your Safe-to-Spend Pool by the number of days remaining until your next income date (enforcing a minimum 1-day guard to prevent division by zero).
              </AccordionItem>

              <AccordionItem
                id="faq-4"
                title="Why can Safe-to-Spend become negative?"
                badgeText="Alert Status"
                badgeVariant="amber"
              >
                Safe-to-Spend becomes negative (red) if your total upcoming bills, goal allocations, and safety buffer exceed your currently available balance. It warns you that your current obligations exceed your liquid funds.
              </AccordionItem>

              <AccordionItem
                id="faq-5"
                title="What is the Safety Buffer?"
                badgeText="Settings"
                badgeVariant="slate"
              >
                The Safety Buffer is an amount of money you choose to keep reserved and untouched for emergency situations. It is subtracted from your available cash when computing Safe-to-Spend, but it is NOT a monthly expense.
              </AccordionItem>

              <AccordionItem
                id="faq-6"
                title="How do bills affect Safe-to-Spend?"
                badgeText="Bills"
                badgeVariant="emerald"
              >
                Unpaid bills scheduled before your next income date are automatically subtracted from your available balance to form your Safe-to-Spend pool. Marking a bill as Paid removes that deduction.
              </AccordionItem>

              <AccordionItem
                id="faq-7"
                title="How do goals affect Safe-to-Spend?"
                badgeText="Goals"
                badgeVariant="emerald"
              >
                Money allocated to active savings goals is set aside as reserved capital, reducing your immediate Safe-to-Spend pool so you don&apos;t accidentally spend money meant for savings.
              </AccordionItem>

              <AccordionItem
                id="faq-8"
                title="Why does my Dashboard change after adding an expense?"
                badgeText="Real-time Data"
                badgeVariant="blue"
              >
                Adding an expense reduces your current liquid balance, which immediately updates your total spending card, category breakdown charts, and Safe-to-Spend calculations.
              </AccordionItem>

              <AccordionItem
                id="faq-9"
                title="How do I edit or delete an expense?"
                badgeText="Expenses"
                badgeVariant="slate"
              >
                Go to the Expenses tab or Recent Expenses card on your Dashboard and click the Edit (pencil) or Delete (trash) icon on any transaction row.
              </AccordionItem>

              <AccordionItem
                id="faq-10"
                title="How do I mark a bill as paid?"
                badgeText="Bills"
                badgeVariant="slate"
              >
                Navigate to the Bills page and toggle the status switch on any bill row between Unpaid and Paid.
              </AccordionItem>

              <AccordionItem
                id="faq-11"
                title="How do I contribute to a goal?"
                badgeText="Goals"
                badgeVariant="slate"
              >
                Navigate to the Goals page, select an active goal, and click Add Contribution to deposit money toward your savings target.
              </AccordionItem>

              <AccordionItem
                id="faq-12"
                title="What does Insights show?"
                badgeText="Analytics"
                badgeVariant="blue"
              >
                Insights provides spending summaries, category pie charts, month-over-month comparisons (This Month, Last Month, Last 3 Months), daily average calculations, and smart rule-based observations.
              </AccordionItem>

              <AccordionItem
                id="faq-13"
                title="Does MoneyOS use AI?"
                badgeText="Architecture"
                badgeVariant="amber"
              >
                No. MoneyOS V1 uses deterministic, rule-based mathematical formulas and logic to compute metrics and smart observations. It does not use artificial intelligence or probabilistic model generation.
              </AccordionItem>

              <AccordionItem
                id="faq-14"
                title="Where does my financial data come from?"
                badgeText="Data Privacy"
                badgeVariant="emerald"
              >
                All financial data in MoneyOS comes directly from the inputs you provide during onboarding, settings setup, and transaction logging. MoneyOS does not connect to external bank accounts or auto-sync with UPI/Google Pay in V1.
              </AccordionItem>
            </AccordionGroup>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
