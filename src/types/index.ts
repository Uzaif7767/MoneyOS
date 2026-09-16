// Shared TypeScript definitions for MoneyOS

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends BaseEntity {
  clerkUserId: string; // Clerk User ID
  email: string;
  displayName?: string;
  photoUrl?: string;
  hasCompletedOnboarding?: boolean;
  onboardingCompletedAt?: string;
  monthlyIncome?: number;
  currentBalance?: number;
  nextIncomeDate?: string;
  safetyBuffer?: number;
}

export interface OnboardingData {
  monthlyIncome: number;
  currentBalance: number;
  nextIncomeDate: string;
  safetyBuffer: number;
  goalTitle?: string;
  goalTargetAmount?: number;
  goalTargetDate?: string;
}

export interface OnboardingFormErrors {
  monthlyIncome?: string;
  currentBalance?: string;
  nextIncomeDate?: string;
  safetyBuffer?: string;
  goalTitle?: string;
  goalTargetAmount?: string;
  goalTargetDate?: string;
  form?: string;
}

export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Shopping"
  | "Rent"
  | "Bills"
  | "Recharge"
  | "Entertainment"
  | "Health"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Shopping",
  "Rent",
  "Bills",
  "Recharge",
  "Entertainment",
  "Health",
  "Other",
];

export interface Expense extends BaseEntity {
  userId: string; // Clerk User ID
  amount: number;
  category: ExpenseCategory | string;
  date: string;
  note?: string;
  notes?: string;
  title?: string;
}

export type RecurrenceFrequency = "monthly" | "yearly";

export interface Bill extends BaseEntity {
  userId: string; // Clerk User ID
  title: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  frequency?: RecurrenceFrequency;
  note?: string;
  isPaid: boolean;
  category?: string;
}

export interface Goal extends BaseEntity {
  userId: string; // Clerk User ID
  name: string;
  title?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

export interface UserSettings extends BaseEntity {
  userId: string; // Clerk User ID
  currency: string;
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
}

export interface RepeatablePlannerItem {
  id: string;
  name: string;
  amount: number;
  dueDate?: string;
}

export interface PlannerDraft extends BaseEntity {
  userId: string; // Clerk User ID
  planningMonth: string; // Deterministic month ID, e.g., "2026-10"
  monthlyIncome: number;
  currentBalance: number;
  expectedIncomeDate: string;
  fixedExpenses: RepeatablePlannerItem[];
  plannedBills: RepeatablePlannerItem[];
  subscriptions: RepeatablePlannerItem[];
  foodAndDailyLiving: number;
  transport: number;
  housing: number;
  familyPersonal: number;
  debtEmi: RepeatablePlannerItem[];
  lifestyleDiscretionary: number;
  oneTimeExpenses: RepeatablePlannerItem[];
  savingsGoalAmount: number;
  safetyBuffer: number;
}
export interface PlannerCalculationResult {
  planningMonth: string;
  daysInMonth: number;

  // Income & Spending Totals
  totalPlannedIncome: number;
  fixedExpensesTotal: number;
  plannedBillsTotal: number;
  subscriptionsTotal: number;
  everydayLivingTotal: number;
  familyPersonalTotal: number;
  debtEmiTotal: number;
  lifestyleDiscretionaryTotal: number;
  oneTimeExpensesTotal: number;
  totalPlannedSpending: number;

  // Allocations & Reserves
  savingsGoalAmount: number;
  savingsAllocation: number;
  recommendedSavings: number; // 25% of planned monthly income
  safetyBuffer: number;

  // Balance & Daily Figures
  remainingMoney: number;
  variableDailySpendingTotal: number;
  plannedDailySpending: number;

  // Affordability & Status Checks
  isAffordable: boolean;
  shortfallAmount: number;
  surplusAmount: number;

  isSavingsGoalAffordable: boolean;
  savingsGoalShortfall: number;

  isSafetyBufferMaintainable: boolean;
  safetyBufferShortfall: number;

  expectedIncomeDate?: string;
}

export type PlannerPlanStatus = "draft" | "approved";

export interface PlannerPlan extends BaseEntity {
  userId: string; // Clerk User ID
  planningMonthId: string; // e.g. "2026-10"
  planningMonth: string; // e.g. "2026-10"
  status: PlannerPlanStatus;
  version: number;
  approvedAt?: string;
  source: "ai_generated" | "edited";
  plannedMonthlyIncome: number;
  proposal: unknown; // AIProposedPlan structure
  recalculatedSummary: unknown; // RecalculatedProposedSummary structure
}

export interface PlannerPlanVersion extends BaseEntity {
  userId: string;
  planningMonthId: string;
  version: number;
  status: PlannerPlanStatus;
  approvedAt?: string;
  savedAt: string;
  source: "ai_generated" | "edited";
  plannedMonthlyIncome: number;
  totalSpending: number;
  totalSavings: number;
  safetyBuffer: number;
  remainingMoney: number;
  isAffordable: boolean;
  proposal: unknown;
  recalculatedSummary: unknown;
}

