"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ExpensesIcon,
  BillsIcon,
  GoalsIcon,
  PlusIcon,
} from "@/components/ui/icons";

interface MobileNavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
}

const mobileNavItems: MobileNavItem[] = [
  { name: "Home", href: "/protected", icon: HomeIcon },
  { name: "Expenses", href: "/protected/expenses", icon: ExpensesIcon },
  { name: "Add", icon: PlusIcon, isAction: true },
  { name: "Bills", href: "/protected/bills", icon: BillsIcon },
  { name: "Goals", href: "/protected/goals", icon: GoalsIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key="quick-add-action"
                href="/protected/expenses?action=add"
                aria-label="Quick Add Expense"
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-13 h-13 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-500 active:scale-95 transition-all ring-4 ring-white">
                  <PlusIcon className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1">
                  Add
                </span>
              </Link>
            );
          }

          const href = item.href!;
          const isActive =
            href === "/protected"
              ? pathname === "/protected"
              : pathname.startsWith(href);

          return (
            <Link
              key={item.name}
              href={href}
              className={`flex flex-col items-center justify-center py-1.5 px-1.5 sm:px-3 min-w-[48px] sm:min-w-[54px] min-h-[48px] rounded-xl transition-all ${
                isActive
                  ? "text-emerald-700 font-bold bg-emerald-50/70"
                  : "text-slate-500 hover:text-slate-900 active:bg-slate-100"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110 text-emerald-600" : "text-slate-400"
                }`}
              />
              <span className="text-[10px] mt-1 font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
