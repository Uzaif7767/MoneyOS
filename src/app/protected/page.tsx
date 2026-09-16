import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/services/dashboardService";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ExpensesIcon,
  BillsIcon,
  GoalsIcon,
  InsightsIcon,
  ArrowRightIcon,
  WalletIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
} from "@/components/ui/icons";

export const metadata = {
  title: "Dashboard | MoneyOS",
  description: "Live financial overview, Safe-to-Spend pool, and activity breakdown.",
};

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default async function DashboardPage() {
  const user = await currentUser();
  const dashboardData = await getDashboardData();

  const {
    userProfile,
    expenses,
    bills,
    goals,
    totalSpending,
    upcomingBillsTotal,
    goalAllocationTotal,
    safeToSpendPool,
    dailySafeSpend,
    daysUntilNextIncome,
  } = dashboardData;

  // Real user display name from Firestore profile or Clerk
  const displayName =
    userProfile?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "User";

  const hasBalance =
    userProfile?.currentBalance !== undefined &&
    userProfile?.currentBalance !== null;

  const hasIncome =
    userProfile?.monthlyIncome !== undefined &&
    userProfile?.monthlyIncome !== null;

  const isSafeToSpendCalculated =
    safeToSpendPool !== null && dailySafeSpend !== null && daysUntilNextIncome !== null;

  return (
    <div className="space-y-8 pb-4">
      {/* 1. Greeting Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span>Live Financial Overview (INR ₹)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Here is your MoneyOS financial dashboard displaying your live account metrics, safe-to-spend pool, and categorical breakdown in Indian Rupees (₹).
          </p>
        </div>
      </div>

      {/* Primary Financial KPI Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* 2. Current Balance */}
        <Card className="relative overflow-hidden border-slate-200/90">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-semibold text-slate-500 text-xs uppercase tracking-wide">Current Balance</CardDescription>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <WalletIcon className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasBalance ? (
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate" title={formatCurrency(userProfile.currentBalance)}>
                  {formatCurrency(userProfile.currentBalance)}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Available cash recorded in profile
                </p>
              </div>
            ) : (
              <div className="py-2">
                <Badge variant="outline" className="mb-2 text-slate-600 border-slate-300">
                  No Balance Recorded
                </Badge>
                <p className="text-xs text-slate-500">
                  No current balance set in profile.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Income & Spending Summary */}
        <Card className="border-slate-200/90">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-semibold text-slate-500 text-xs uppercase tracking-wide">Income & Spending</CardDescription>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <TrendingUpIcon className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <TrendingUpIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                Monthly Income
              </span>
              <span className="font-bold text-slate-900">
                {hasIncome ? formatCurrency(userProfile.monthlyIncome) : "Not set"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm pt-2 border-t border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <TrendingDownIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Logged Expenses
              </span>
              <span className="font-bold text-slate-900">
                {expenses.length > 0 ? formatCurrency(totalSpending) : formatCurrency(0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Safe-to-Spend & Daily Safe Spend (MoneyOS Priority Box) */}
        <Card className="border-emerald-200/90 bg-gradient-to-br from-emerald-50/40 via-white to-white shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-bold text-emerald-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                Safe to Spend
              </CardDescription>
              <div className="p-2.5 rounded-xl bg-emerald-100/80 text-emerald-700 border border-emerald-200/60">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isSafeToSpendCalculated ? (
              <div className="space-y-2.5">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight truncate" title={formatCurrency(dailySafeSpend)}>
                    {formatCurrency(dailySafeSpend)} <span className="text-xs font-normal text-slate-500">/ day</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Safe-to-Spend Pool: <span className="font-bold text-slate-900">{formatCurrency(safeToSpendPool)}</span>
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-emerald-100 space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span>Days to next income:</span>
                    <span className="font-bold text-slate-800">{daysUntilNextIncome} day{daysUntilNextIncome === 1 ? "" : "s"} ({formatDate(userProfile?.nextIncomeDate)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unpaid Bills:</span>
                    <span>-{formatCurrency(upcomingBillsTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goal Allocation:</span>
                    <span>-{formatCurrency(goalAllocationTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Buffer:</span>
                    <span>-{formatCurrency(userProfile?.safetyBuffer)}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-100/80 text-right">
                    <Link
                      href="/protected/help#safe-to-spend"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                    >
                      <span>How Safe-to-Spend works</span>
                      <ArrowRightIcon className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <Badge variant="amber" className="mb-2">
                  Setup Required
                </Badge>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Safe-to-Spend requires Current Balance, Safety Buffer, and Next Income Date in your user profile.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Spending Overview & Insights Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5. Spending Overview Chart Area */}
        <Card className="lg:col-span-2 border-slate-200/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Spending Overview
                </CardTitle>
                <CardDescription className="mt-0.5">
                  Categorical breakdown of your logged expenses (in ₹).
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-semibold bg-slate-50">
                {expenses.length} Expense{expenses.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SpendingChart expenses={expenses} />
          </CardContent>
        </Card>

        {/* 9. Insights Link Card */}
        <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white border-0 flex flex-col justify-between p-6 sm:p-7 shadow-md">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <InsightsIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              Financial Intelligence
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Deep Financial Insights</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Analyze cash flow metrics, category breakdowns, and commitment ratios in Indian Rupees (₹).
            </p>
          </div>
          <div className="pt-6">
            <Link
              href="/protected/insights"
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-2xs"
            >
              <span>Explore Insights</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Grid: Upcoming Bills & Recent Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6. Upcoming Bills */}
        <Card className="border-slate-200/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BillsIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  Upcoming Bills
                </CardTitle>
                <CardDescription className="mt-0.5">
                  Scheduled obligations from your records.
                </CardDescription>
              </div>
              <Link
                href="/protected/bills"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-2 border border-slate-200">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-800">No Upcoming Bills</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  You currently have no scheduled or due bills recorded.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bills.slice(0, 4).map((bill) => {
                  const isOverdue = !bill.isPaid && new Date(bill.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 transition-colors hover:bg-slate-50"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900">{bill.title}</p>
                          {bill.isRecurring && (
                            <Badge variant="secondary" className="text-[10px] py-0 capitalize font-medium">
                              {bill.frequency || "Recurring"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Due: {formatDate(bill.dueDate)}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          {formatCurrency(bill.amount)}
                        </p>
                        {bill.isPaid ? (
                          <Badge variant="emerald" className="text-[10px] py-0">Paid</Badge>
                        ) : isOverdue ? (
                          <Badge variant="destructive" className="text-[10px] py-0">Overdue</Badge>
                        ) : (
                          <Badge variant="amber" className="text-[10px] py-0">Pending</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7. Recent Expenses */}
        <Card className="border-slate-200/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ExpensesIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                  Recent Expenses
                </CardTitle>
                <CardDescription className="mt-0.5">
                  Latest recorded transactions.
                </CardDescription>
              </div>
              <Link
                href="/protected/expenses"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-2 border border-slate-200">
                  <ExpensesIcon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-800">No Recent Expenses</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  No expense transactions have been logged yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.slice(0, 4).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 transition-colors hover:bg-slate-50"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {expense.note || expense.notes || expense.title || expense.category}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span>{expense.category || "General"}</span>
                        <span>•</span>
                        <span>{formatDate(expense.date || expense.createdAt)}</span>
                      </div>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      -{formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 8. Goals Section */}
      <Card className="border-slate-200/90">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GoalsIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                Savings Goals
              </CardTitle>
              <CardDescription className="mt-0.5">
                Active financial targets and milestone progress.
              </CardDescription>
            </div>
            <Link
              href="/protected/goals"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <span>View goals</span>
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-2 border border-slate-200">
                <GoalsIcon className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Goals Created</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                You currently have no savings goals set up in your account.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const target = Number(goal.targetAmount) || 1;
                const current = Number(goal.currentAmount) || 0;
                const percentage = Math.min(Math.round((current / target) * 100), 100);

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {goal.name || goal.title}
                        </h4>
                        {goal.targetDate && (
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Target Date: {formatDate(goal.targetDate)}
                          </p>
                        )}
                      </div>
                      <Badge variant="emerald" className="text-xs font-bold">
                        {percentage}%
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2.5 bg-slate-200/80" />
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Saved: {formatCurrency(current)}</span>
                      <span>Target: {formatCurrency(target)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
