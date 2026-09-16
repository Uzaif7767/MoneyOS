import { ExpenseCategory, EXPENSE_CATEGORIES, Expense, Bill, Goal, UserProfile } from "@/types";
import { formatCurrency } from "@/lib/utils";

export type PeriodType = "this_month" | "last_month" | "last_3_months";

export interface CategoryBreakdownItem {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface SpendingTrendPoint {
  label: string;
  dateStr: string;
  amount: number;
}

export interface SpendingOverviewData {
  periodTotal: number;
  previousPeriodTotal: number | null;
  changeAmount: number | null;
  changePercentage: number | null;
  dailyAverage: number;
  daysCount: number;
}

export interface BillImpactData {
  totalBillsCount: number;
  totalBillsAmount: number;
  paidBillsCount: number;
  paidBillsAmount: number;
  unpaidBillsCount: number;
  unpaidBillsAmount: number;
  overdueBillsCount: number;
  overdueBillsAmount: number;
}

export interface GoalProgressData {
  totalTargetAmount: number;
  totalSavedAmount: number;
  remainingAmount: number;
  completionPercentage: number;
  goalsCount: number;
  goalsList: Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    percentage: number;
  }>;
}

export interface MonthEndProjectionData {
  spentSoFar: number;
  elapsedDays: number;
  totalDaysInMonth: number;
  dailyAverage: number;
  projectedMonthEnd: number;
  monthName: string;
}

export interface SmartObservation {
  id: string;
  type: "info" | "warning" | "success" | "alert";
  title: string;
  description: string;
}

export interface ProcessedInsights {
  period: PeriodType;
  periodLabel: string;
  overview: SpendingOverviewData;
  categories: CategoryBreakdownItem[];
  trend: SpendingTrendPoint[];
  billsImpact: BillImpactData;
  goalProgress: GoalProgressData;
  monthEndProjection: MonthEndProjectionData | null;
  smartObservations: SmartObservation[];
}

/**
 * Returns date range bounds for current period and previous period based on reference date.
 */
export function getPeriodBounds(period: PeriodType, refDate = new Date()) {
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-indexed

  let periodStart: Date;
  let periodEnd: Date;
  let prevPeriodStart: Date;
  let prevPeriodEnd: Date;

  if (period === "this_month") {
    periodStart = new Date(year, month, 1, 0, 0, 0, 0);
    periodEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    prevPeriodStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    prevPeriodEnd = new Date(year, month, 0, 23, 59, 59, 999);
  } else if (period === "last_month") {
    periodStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    periodEnd = new Date(year, month, 0, 23, 59, 59, 999);

    prevPeriodStart = new Date(year, month - 2, 1, 0, 0, 0, 0);
    prevPeriodEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);
  } else {
    // last_3_months (inclusive of current month)
    periodStart = new Date(year, month - 2, 1, 0, 0, 0, 0);
    periodEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

    prevPeriodStart = new Date(year, month - 5, 1, 0, 0, 0, 0);
    prevPeriodEnd = new Date(year, month - 2, 0, 23, 59, 59, 999);
  }

  return { periodStart, periodEnd, prevPeriodStart, prevPeriodEnd };
}

/**
 * Normalizes category string to one of the 9 locked expense categories.
 */
export function normalizeCategory(catStr?: string): ExpenseCategory {
  if (!catStr) return "Other";
  const trimmed = catStr.trim().toLowerCase();
  const found = EXPENSE_CATEGORIES.find((c) => c.toLowerCase() === trimmed);
  return found || "Other";
}

/**
 * Pure calculation engine for processing user financial data according to period.
 */
export function calculateInsights(
  expenses: Expense[],
  bills: Bill[],
  goals: Goal[],
  period: PeriodType,
  refDate = new Date()
): ProcessedInsights {
  const { periodStart, periodEnd, prevPeriodStart, prevPeriodEnd } = getPeriodBounds(period, refDate);

  // Filter expenses for current period and previous period
  const periodExpenses = expenses.filter((exp) => {
    const expTime = new Date(exp.date || exp.createdAt).getTime();
    return expTime >= periodStart.getTime() && expTime <= periodEnd.getTime();
  });

  const prevPeriodExpenses = expenses.filter((exp) => {
    const expTime = new Date(exp.date || exp.createdAt).getTime();
    return expTime >= prevPeriodStart.getTime() && expTime <= prevPeriodEnd.getTime();
  });

  // 1. Spending Overview Calculation
  const periodTotal = periodExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const previousPeriodTotalRaw = prevPeriodExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Determine if previous period has actual data recorded
  const hasPreviousPeriodData = prevPeriodExpenses.length > 0;
  const previousPeriodTotal = hasPreviousPeriodData ? previousPeriodTotalRaw : null;

  let changeAmount: number | null = null;
  let changePercentage: number | null = null;

  if (previousPeriodTotal !== null && previousPeriodTotal > 0) {
    changeAmount = periodTotal - previousPeriodTotal;
    changePercentage = ((periodTotal - previousPeriodTotal) / previousPeriodTotal) * 100;
  }

  // Calculate days count for daily average
  const todayMs = refDate.getTime();
  const actualEndMs = Math.min(periodEnd.getTime(), todayMs);
  const diffTime = Math.max(0, actualEndMs - periodStart.getTime());
  const elapsedDaysInPeriod = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const dailyAverage = periodTotal / elapsedDaysInPeriod;

  // 2. Category Breakdown Calculation
  const categoryMap: Record<ExpenseCategory, number> = {
    Food: 0,
    Travel: 0,
    Shopping: 0,
    Rent: 0,
    Bills: 0,
    Recharge: 0,
    Entertainment: 0,
    Health: 0,
    Other: 0,
  };

  periodExpenses.forEach((exp) => {
    const cat = normalizeCategory(exp.category);
    categoryMap[cat] += Number(exp.amount) || 0;
  });

  const categories: CategoryBreakdownItem[] = EXPENSE_CATEGORIES.map((cat) => {
    const amount = categoryMap[cat];
    const percentage = periodTotal > 0 ? (amount / periodTotal) * 100 : 0;
    return { category: cat, amount, percentage };
  });

  // Sort categories by amount descending
  categories.sort((a, b) => b.amount - a.amount);

  // 3. Spending Trend Data Generation
  const trend: SpendingTrendPoint[] = [];

  if (period === "this_month" || period === "last_month") {
    // Daily grouping
    const daysInMonth = periodEnd.getDate();
    const monthShort = periodStart.toLocaleDateString("en-IN", { month: "short" });

    // For "this_month", cap data points to current day if refDate is within this month
    const maxDay = period === "this_month" ? Math.min(daysInMonth, refDate.getDate()) : daysInMonth;

    for (let day = 1; day <= maxDay; day++) {
      const dayStr = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTotal = periodExpenses
        .filter((e) => (e.date || e.createdAt).split("T")[0] === dayStr)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      trend.push({
        label: `${monthShort} ${day}`,
        dateStr: dayStr,
        amount: dayTotal,
      });
    }
  } else {
    // 3 Months grouping by month
    for (let i = 2; i >= 0; i--) {
      const mDate = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
      const yearM = mDate.getFullYear();
      const monthM = mDate.getMonth();
      const mStart = new Date(yearM, monthM, 1, 0, 0, 0, 0).getTime();
      const mEnd = new Date(yearM, monthM + 1, 0, 23, 59, 59, 999).getTime();

      const mLabel = mDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const mTotal = expenses
        .filter((e) => {
          const t = new Date(e.date || e.createdAt).getTime();
          return t >= mStart && t <= mEnd;
        })
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      trend.push({
        label: mLabel,
        dateStr: `${yearM}-${String(monthM + 1).padStart(2, "0")}`,
        amount: mTotal,
      });
    }
  }

  // 4. Bill Impact Calculation
  const todayStr = refDate.toISOString().split("T")[0];
  let totalBillsAmount = 0;
  let paidBillsCount = 0;
  let paidBillsAmount = 0;
  let unpaidBillsCount = 0;
  let unpaidBillsAmount = 0;
  let overdueBillsCount = 0;
  let overdueBillsAmount = 0;

  bills.forEach((b) => {
    const amt = Number(b.amount) || 0;
    totalBillsAmount += amt;

    if (b.isPaid) {
      paidBillsCount++;
      paidBillsAmount += amt;
    } else {
      unpaidBillsCount++;
      unpaidBillsAmount += amt;

      if (b.dueDate && b.dueDate < todayStr) {
        overdueBillsCount++;
        overdueBillsAmount += amt;
      }
    }
  });

  const billsImpact: BillImpactData = {
    totalBillsCount: bills.length,
    totalBillsAmount,
    paidBillsCount,
    paidBillsAmount,
    unpaidBillsCount,
    unpaidBillsAmount,
    overdueBillsCount,
    overdueBillsAmount,
  };

  // 5. Goal Progress Calculation
  let totalTargetAmount = 0;
  let totalSavedAmount = 0;

  const goalsList = goals.map((g) => {
    const target = Number(g.targetAmount) || 0;
    const current = Number(g.currentAmount) || 0;
    totalTargetAmount += target;
    totalSavedAmount += current;

    const remaining = Math.max(0, target - current);
    const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;

    return {
      id: g.id,
      name: g.name || g.title || "Savings Goal",
      targetAmount: target,
      currentAmount: current,
      remainingAmount: remaining,
      percentage,
    };
  });

  const overallGoalPercentage =
    totalTargetAmount > 0 ? Math.min(100, (totalSavedAmount / totalTargetAmount) * 100) : 0;

  const goalProgress: GoalProgressData = {
    totalTargetAmount,
    totalSavedAmount,
    remainingAmount: Math.max(0, totalTargetAmount - totalSavedAmount),
    completionPercentage: overallGoalPercentage,
    goalsCount: goals.length,
    goalsList,
  };

  // 6. Month-End Projection Calculation (Strictly for "this_month" with real spending data)
  let monthEndProjection: MonthEndProjectionData | null = null;

  if (period === "this_month") {
    const currentDay = refDate.getDate();
    const totalDaysInMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0).getDate();
    const monthName = refDate.toLocaleDateString("en-IN", { month: "long" });

    if (currentDay > 0 && periodTotal > 0) {
      const dailyAvg = periodTotal / currentDay;
      const projectedMonthEnd = Math.round(dailyAvg * totalDaysInMonth);

      monthEndProjection = {
        spentSoFar: periodTotal,
        elapsedDays: currentDay,
        totalDaysInMonth,
        dailyAverage: dailyAvg,
        projectedMonthEnd,
        monthName,
      };
    }
  }

  // 7. Rule-Based Smart Observations Generation
  const smartObservations: SmartObservation[] = [];

  // Rule 1: Highest Spending Category
  const topCategory = categories.find((c) => c.amount > 0);
  if (topCategory && periodTotal > 0) {
    smartObservations.push({
      id: "obs-top-category",
      type: "info",
      title: `${topCategory.category} is Your Top Expense`,
      description: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(
        1
      )}% of your spending in this period (${formatCurrency(topCategory.amount)}).`,
    });
  }

  // Rule 2: Period-over-period spending change
  if (changePercentage !== null && previousPeriodTotal !== null && previousPeriodTotal > 0) {
    if (changePercentage > 5) {
      smartObservations.push({
        id: "obs-spend-up",
        type: "warning",
        title: "Higher Spending Pace",
        description: `Your spending increased by ${changePercentage.toFixed(
          1
        )}% (${formatCurrency(Math.abs(changeAmount!))}) compared to the previous period.`,
      });
    } else if (changePercentage < -5) {
      smartObservations.push({
        id: "obs-spend-down",
        type: "success",
        title: "Lower Spending Pace",
        description: `Great job! Your spending decreased by ${Math.abs(changePercentage).toFixed(
          1
        )}% (${formatCurrency(Math.abs(changeAmount!))}) compared to the previous period.`,
      });
    } else {
      smartObservations.push({
        id: "obs-spend-stable",
        type: "info",
        title: "Consistent Spending Pace",
        description: `Your total spending remains virtually stable compared to the previous period (${changePercentage >= 0 ? "+" : ""}${changePercentage.toFixed(
          1
        )}%).`,
      });
    }
  }

  // Rule 3: Overdue Bills Warning
  if (overdueBillsCount > 0) {
    smartObservations.push({
      id: "obs-overdue-bills",
      type: "alert",
      title: `${overdueBillsCount} Overdue Bill${overdueBillsCount > 1 ? "s" : ""}`,
      description: `You have ${overdueBillsCount} overdue bill${overdueBillsCount > 1 ? "s" : ""} totaling ${formatCurrency(
        overdueBillsAmount
      )}. Clearing overdue payments prevents late penalties.`,
    });
  }

  // Rule 4: Upcoming Unpaid Bills
  if (unpaidBillsCount > 0 && overdueBillsCount === 0) {
    smartObservations.push({
      id: "obs-unpaid-bills",
      type: "info",
      title: `${unpaidBillsCount} Upcoming Bill${unpaidBillsCount > 1 ? "s" : ""}`,
      description: `You have ${unpaidBillsCount} unpaid bill${unpaidBillsCount > 1 ? "s" : ""} totaling ${formatCurrency(
        unpaidBillsAmount
      )} scheduled before your next income cycle.`,
    });
  }

  // Rule 5: Goal Close to Completion or Achieved
  const nearCompleteGoal = goalsList.find((g) => g.percentage >= 75 && g.percentage < 100);
  const completedGoal = goalsList.find((g) => g.percentage >= 100);

  if (completedGoal) {
    smartObservations.push({
      id: "obs-goal-completed",
      type: "success",
      title: `Goal Achieved: ${completedGoal.name}`,
      description: `Congratulations! You have reached 100% of your ${formatCurrency(
        completedGoal.targetAmount
      )} target for "${completedGoal.name}".`,
    });
  } else if (nearCompleteGoal) {
    smartObservations.push({
      id: "obs-goal-near",
      type: "success",
      title: `Goal Target in Sight: ${nearCompleteGoal.name}`,
      description: `"${nearCompleteGoal.name}" is ${nearCompleteGoal.percentage.toFixed(
        0
      )}% complete. Only ${formatCurrency(nearCompleteGoal.remainingAmount)} remaining.`,
    });
  }

  // Rule 6: Projected Month-End Pace
  if (monthEndProjection) {
    smartObservations.push({
      id: "obs-month-projection",
      type: "info",
      title: "Month-End Spending Projection",
      description: `At your current pace of ${formatCurrency(
        monthEndProjection.dailyAverage
      )}/day over ${monthEndProjection.elapsedDays} elapsed days, estimated total month-end spending is ${formatCurrency(
        monthEndProjection.projectedMonthEnd
      )}.`,
    });
  }

  const periodLabels: Record<PeriodType, string> = {
    this_month: "This Month",
    last_month: "Last Month",
    last_3_months: "Last 3 Months",
  };

  return {
    period,
    periodLabel: periodLabels[period],
    overview: {
      periodTotal,
      previousPeriodTotal,
      changeAmount,
      changePercentage,
      dailyAverage,
      daysCount: elapsedDaysInPeriod,
    },
    categories,
    trend,
    billsImpact,
    goalProgress,
    monthEndProjection,
    smartObservations,
  };
}
