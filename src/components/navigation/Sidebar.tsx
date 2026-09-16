"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LogoIcon,
  HomeIcon,
  ExpensesIcon,
  BillsIcon,
  GoalsIcon,
  InsightsIcon,
  SparklesIcon,
  PlannerIcon,
  HelpIcon,
  SettingsIcon,
} from "@/components/ui/icons";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/protected", icon: HomeIcon },
  { name: "Expenses", href: "/protected/expenses", icon: ExpensesIcon },
  { name: "Bills", href: "/protected/bills", icon: BillsIcon },
  { name: "Goals", href: "/protected/goals", icon: GoalsIcon },
  { name: "Insights", href: "/protected/insights", icon: InsightsIcon },
  { name: "AI Coach", href: "/protected/ai-coach", icon: SparklesIcon },
  { name: "Monthly Planner", href: "/protected/planner", icon: PlannerIcon },
  { name: "Help & Learn", href: "/protected/help", icon: HelpIcon },
  { name: "Settings", href: "/protected/settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/90 z-30 shadow-2xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/protected" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 border border-emerald-100">
            <LogoIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-none">
              MoneyOS
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block mt-0.5">
              Personal Finance
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/protected"
              ? pathname === "/protected"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-2xs border border-emerald-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? "text-emerald-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <UserButton showName />
        </div>
      </div>
    </aside>
  );
}
