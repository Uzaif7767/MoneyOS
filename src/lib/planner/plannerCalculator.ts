import type { PlannerDraft, RepeatablePlannerItem, PlannerCalculationResult } from "@/types";

export type { PlannerCalculationResult };

/**
 * Safely parses a monetary or numeric input to a non-negative finite number.
 * Defensive against NaN, Infinity, null, undefined, or negative values.
 */
export function toSafeNum(val: unknown): number {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num) || num < 0) return 0;
  return num;
}

export const toSafeNonNegative = toSafeNum;


/**
 * Calculates the exact number of calendar days in a given planning month ID (e.g. "2026-10").
 * Defaults to 30 days if the format is invalid or unparseable.
 */
export function getDaysInPlanningMonth(monthId: string): number {
  if (!monthId || typeof monthId !== "string") return 30;

  const parts = monthId.trim().split("-");
  if (parts.length < 2) return 30;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return 30;
  }

  // Passing month (1-indexed) with day=0 returns the last day of the previous month.
  // E.g. new Date(2026, 10, 0).getDate() => October 31st (31 days).
  const date = new Date(year, month, 0);
  const days = date.getDate();

  return isNaN(days) || days <= 0 ? 30 : days;
}

/**
 * Sums the 'amount' field of a list of repeatable planner items safely.
 */
export function sumRepeatableItems(items?: RepeatablePlannerItem[]): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, item) => acc + toSafeNonNegative(item?.amount), 0);
}

/**
 * Pure, deterministic calculation function for Monthly Money Planner draft inputs.
 * Accepts a partial or full PlannerDraft object and the planning month ID.
 * Returns a structured calculation result without side effects.
 */
export function calculatePlannerSummary(
  draft: Partial<PlannerDraft> | null,
  planningMonthId: string
): PlannerCalculationResult {
  const monthId = draft?.planningMonth || planningMonthId || "";
  const daysInMonth = getDaysInPlanningMonth(monthId);

  // A. Total Planned Income
  const totalPlannedIncome = toSafeNonNegative(draft?.monthlyIncome);

  // B. Fixed Expenses Total
  const fixedExpensesTotal = sumRepeatableItems(draft?.fixedExpenses);

  // C. Planned Bills Total
  const plannedBillsTotal = sumRepeatableItems(draft?.plannedBills);

  // D. Subscriptions Total
  const subscriptionsTotal = sumRepeatableItems(draft?.subscriptions);

  // E. Everyday Living Breakdown & Total
  const foodAndDailyLiving = toSafeNonNegative(draft?.foodAndDailyLiving);
  const transport = toSafeNonNegative(draft?.transport);
  const housing = toSafeNonNegative(draft?.housing);
  const everydayLivingTotal = foodAndDailyLiving + transport + housing;

  // F. Family / Personal Total
  const familyPersonalTotal = toSafeNonNegative(draft?.familyPersonal);

  // G. Debt / EMI Total
  const debtEmiTotal = sumRepeatableItems(draft?.debtEmi);

  // H. Lifestyle / Discretionary Total
  const lifestyleDiscretionaryTotal = toSafeNonNegative(
    draft?.lifestyleDiscretionary
  );

  // I. One-Time Expenses Total
  const oneTimeExpensesTotal = sumRepeatableItems(draft?.oneTimeExpenses);

  // J. Total Planned Spending (Commitments + Variable Living)
  const totalPlannedSpending =
    fixedExpensesTotal +
    plannedBillsTotal +
    subscriptionsTotal +
    everydayLivingTotal +
    familyPersonalTotal +
    debtEmiTotal +
    lifestyleDiscretionaryTotal +
    oneTimeExpensesTotal;

  // K. Recommended Savings (25% of planned monthly income)
  const recommendedSavings = totalPlannedIncome * 0.25;

  // L. User Savings Goal & Allocation
  const savingsGoalAmount = toSafeNonNegative(draft?.savingsGoalAmount);
  const savingsAllocation = savingsGoalAmount;

  // M. Safety Buffer
  const safetyBuffer = toSafeNonNegative(draft?.safetyBuffer);

  // N. Remaining Money
  const remainingMoney =
    totalPlannedIncome -
    totalPlannedSpending -
    savingsAllocation -
    safetyBuffer;

  // O. Planned Daily Spending (Variable daily categories: food & daily, transport, lifestyle)
  const variableDailySpendingTotal =
    foodAndDailyLiving + transport + lifestyleDiscretionaryTotal;
  const plannedDailySpending =
    daysInMonth > 0 ? variableDailySpendingTotal / daysInMonth : 0;

  // Affordability & Status Checks
  const isAffordable = remainingMoney >= 0;
  const shortfallAmount = Math.max(0, -remainingMoney);
  const surplusAmount = Math.max(0, remainingMoney);

  // Savings Target Status Check
  const incomeMinusSpending = totalPlannedIncome - totalPlannedSpending;
  const isSavingsGoalAffordable =
    savingsAllocation === 0 || incomeMinusSpending >= savingsAllocation;
  const savingsGoalShortfall = Math.max(
    0,
    savingsAllocation - incomeMinusSpending
  );

  // Safety Buffer Status Check
  const incomeMinusSpendingAndSavings =
    incomeMinusSpending - savingsAllocation;
  const isSafetyBufferMaintainable =
    safetyBuffer === 0 || incomeMinusSpendingAndSavings >= safetyBuffer;
  const safetyBufferShortfall = Math.max(
    0,
    safetyBuffer - incomeMinusSpendingAndSavings
  );

  return {
    planningMonth: monthId,
    daysInMonth,
    totalPlannedIncome,
    fixedExpensesTotal,
    plannedBillsTotal,
    subscriptionsTotal,
    everydayLivingTotal,
    familyPersonalTotal,
    debtEmiTotal,
    lifestyleDiscretionaryTotal,
    oneTimeExpensesTotal,
    totalPlannedSpending,
    savingsGoalAmount,
    savingsAllocation,
    recommendedSavings,
    safetyBuffer,
    remainingMoney,
    variableDailySpendingTotal,
    plannedDailySpending,
    isAffordable,
    shortfallAmount,
    surplusAmount,
    isSavingsGoalAffordable,
    savingsGoalShortfall,
    isSafetyBufferMaintainable,
    safetyBufferShortfall,
    expectedIncomeDate: draft?.expectedIncomeDate || "",
  };
}

export interface RecalculatedEditedProposalResult {
  updatedCategories: Array<{
    id: string;
    title: string;
    currentAmount: number;
    suggestedTotal: number;
    items: Array<{
      name: string;
      amount: number;
      reason?: string;
      isUserItem?: boolean;
    }>;
  }>;
  summary: {
    totalProposedSpending: number;
    totalProposedSavings: number;
    totalProposedSafetyBuffer: number;
    totalProposedAllocations: number;
    recalculatedRemainingMoney: number;
    plannedMonthlyIncome: number;
    isAffordable: boolean;
  };
}

/**
 * Deterministically recalculates category totals, spending, savings, safety buffer,
 * allocations, and remaining cash from an edited list of AI categories and items.
 */
export function recalculateEditedAIProposal(
  rawCategories: Array<{
    id: string;
    title: string;
    currentAmount?: number;
    suggestedTotal?: number;
    items: Array<{
      name: string;
      amount: number;
      reason?: string;
      isUserItem?: boolean;
    }>;
  }>,
  plannedMonthlyIncome: number
): RecalculatedEditedProposalResult {
  const cleanIncome = toSafeNum(plannedMonthlyIncome);

  let totalProposedSpending = 0;
  let totalProposedSavings = 0;
  let totalProposedSafetyBuffer = 0;

  const updatedCategories = rawCategories.map((cat) => {
    const validItems = (cat.items || []).map((item) => ({
      ...item,
      name: item.name ? String(item.name).trim() : "Item",
      amount: toSafeNum(item.amount),
    }));

    const suggestedTotal = Math.round(validItems.reduce((acc, item) => acc + item.amount, 0) * 100) / 100;

    if (cat.id === "savings_future") {
      for (const item of validItems) {
        if (/buffer|emergency/i.test(item.name)) {
          totalProposedSafetyBuffer += item.amount;
        } else {
          totalProposedSavings += item.amount;
        }
      }
    } else {
      totalProposedSpending += suggestedTotal;
    }

    return {
      ...cat,
      currentAmount: toSafeNum(cat.currentAmount),
      suggestedTotal,
      items: validItems,
    };
  });

  totalProposedSpending = Math.round(totalProposedSpending * 100) / 100;
  totalProposedSavings = Math.round(totalProposedSavings * 100) / 100;
  totalProposedSafetyBuffer = Math.round(totalProposedSafetyBuffer * 100) / 100;

  const totalProposedAllocations =
    Math.round((totalProposedSpending + totalProposedSavings + totalProposedSafetyBuffer) * 100) / 100;

  const recalculatedRemainingMoney =
    Math.round((cleanIncome - totalProposedAllocations) * 100) / 100;

  return {
    updatedCategories,
    summary: {
      totalProposedSpending,
      totalProposedSavings,
      totalProposedSafetyBuffer,
      totalProposedAllocations,
      recalculatedRemainingMoney,
      plannedMonthlyIncome: cleanIncome,
      isAffordable: recalculatedRemainingMoney >= 0,
    },
  };
}

