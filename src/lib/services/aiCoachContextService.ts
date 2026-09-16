import 'server-only';
import { getInsightsRawData } from "@/lib/services/insightsService";
import { getPlannerPlan } from "@/lib/services/plannerPlanService";
import type { ExpenseCategory } from "@/types";
import type { IntentDetectionResult } from "@/lib/ai/intentDetector";

export interface AICoachProfileContext {
  monthlyIncome: number | null;
  currentBalance: number | null;
  nextIncomeDate: string | null;
  safetyBuffer: number | null;
}

export interface AICoachExpenseItem {
  title: string;
  amount: number;
  category: ExpenseCategory | string;
  date: string;
}

export interface AICoachSpendingContext {
  currentMonthTotal: number;
  previousMonthTotal: number;
  categoryTotals: Record<string, number>;
  recentExpenses: AICoachExpenseItem[];
}

export interface AICoachBillItem {
  title: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  frequency?: string;
  isPaid: boolean;
}

export interface AICoachBillsContext {
  upcoming: AICoachBillItem[];
  unpaidTotal: number;
}

export interface AICoachGoalItem {
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  targetDate?: string;
}

export interface AICoachGoalsContext {
  activeGoals: AICoachGoalItem[];
}

export interface AICoachSafeToSpendContext {
  pool: number | null;
  dailyAmount: number | null;
  daysUntilIncome: number | null;
}

export interface AICoachPlannerContext {
  planningMonth: string;
  status: string;
  plannedMonthlyIncome: number;
  plannedSpendingTotal: number;
  plannedSavings: number;
  projectedRemaining: number;
  isAffordable: boolean;
}

export interface AICoachFinancialContext {
  profile: AICoachProfileContext;
  spending: AICoachSpendingContext;
  bills: AICoachBillsContext;
  goals: AICoachGoalsContext;
  safeToSpend: AICoachSafeToSpendContext;
  planner: AICoachPlannerContext | null;
}

/**
 * Builds a sanitized, server-side financial context object for the authenticated user.
 * Strictly uses server-side services (Firestore Admin SDK) tied to the authenticated Clerk userId.
 */
export async function buildAICoachFinancialContext(userId: string): Promise<AICoachFinancialContext> {
  // 1. Fetch raw financial data using insights service
  const rawData = await getInsightsRawData(userId);
  const { userProfile, expenses, bills, goals, safeToSpendPool, dailySafeSpend, daysUntilNextIncome } = rawData;

  // Profile context
  const profile: AICoachProfileContext = {
    monthlyIncome: typeof userProfile?.monthlyIncome === "number" ? userProfile.monthlyIncome : null,
    currentBalance: typeof userProfile?.currentBalance === "number" ? userProfile.currentBalance : null,
    nextIncomeDate: userProfile?.nextIncomeDate || null,
    safetyBuffer: typeof userProfile?.safetyBuffer === "number" ? userProfile.safetyBuffer : null,
  };

  // Spending context
  const now = new Date();
  const currentMonthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthId = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  let currentMonthTotal = 0;
  let previousMonthTotal = 0;
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((exp) => {
    const expDate = exp.date || "";
    const amount = Number(exp.amount) || 0;

    if (expDate.startsWith(currentMonthId)) {
      currentMonthTotal += amount;
      const cat = exp.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
    } else if (expDate.startsWith(previousMonthId)) {
      previousMonthTotal += amount;
    }
  });

  const recentExpenses: AICoachExpenseItem[] = expenses.slice(0, 10).map((exp) => ({
    title: exp.title || exp.note || exp.notes || exp.category || "Expense",
    amount: Number(exp.amount) || 0,
    category: exp.category || "Other",
    date: exp.date || "",
  }));

  const spending: AICoachSpendingContext = {
    currentMonthTotal,
    previousMonthTotal,
    categoryTotals,
    recentExpenses,
  };

  // Bills context
  const upcomingBills: AICoachBillItem[] = bills.slice(0, 10).map((b) => ({
    title: b.title || "Bill",
    amount: Number(b.amount) || 0,
    dueDate: b.dueDate || "",
    isRecurring: Boolean(b.isRecurring),
    frequency: b.frequency,
    isPaid: Boolean(b.isPaid),
  }));

  const unpaidTotal = bills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const billsContext: AICoachBillsContext = {
    upcoming: upcomingBills,
    unpaidTotal,
  };

  // Goals context
  const activeGoals: AICoachGoalItem[] = goals.map((g) => {
    const target = Number(g.targetAmount) || 0;
    const current = Number(g.currentAmount) || 0;
    return {
      name: g.name || g.title || "Goal",
      targetAmount: target,
      currentAmount: current,
      remainingAmount: Math.max(0, target - current),
      targetDate: g.targetDate,
    };
  });

  const goalsContext: AICoachGoalsContext = {
    activeGoals,
  };

  // Safe to Spend context
  const safeToSpend: AICoachSafeToSpendContext = {
    pool: safeToSpendPool,
    dailyAmount: dailySafeSpend,
    daysUntilIncome: daysUntilNextIncome,
  };

  // Planner context (attempt to load saved plan for current month)
  let planner: AICoachPlannerContext | null = null;
  try {
    const savedPlan = await getPlannerPlan(userId, currentMonthId);
    if (savedPlan) {
      const recap = (savedPlan.recalculatedSummary as Record<string, unknown>) || {};
      planner = {
        planningMonth: savedPlan.planningMonth || currentMonthId,
        status: savedPlan.status || "approved",
        plannedMonthlyIncome: Number(savedPlan.plannedMonthlyIncome) || 0,
        plannedSpendingTotal: Number(recap.totalProposedSpending) || 0,
        plannedSavings: Number(recap.totalProposedSavings) || 0,
        projectedRemaining: Number(recap.recalculatedRemainingMoney) || 0,
        isAffordable: typeof recap.isAffordable === "boolean" ? recap.isAffordable : true,
      };
    }
  } catch (err) {
    console.error("Error fetching planner plan for AI Coach context:", err);
  }

  return {
    profile,
    spending,
    bills: billsContext,
    goals: goalsContext,
    safeToSpend,
    planner,
  };
}

/**
 * Formats the sanitized financial context into a clear text prompt block for Groq AI provider.
 * Completely excludes internal IDs, Clerk userId, credentials, and sensitive technical fields.
 */
export function formatAICoachContextForPrompt(context: AICoachFinancialContext): string {
  const { profile, spending, bills, goals, safeToSpend, planner } = context;

  const profileLines = [
    `- Monthly Income: ${profile.monthlyIncome !== null ? `₹${profile.monthlyIncome.toLocaleString('en-IN')}` : 'Not provided'}`,
    `- Current Balance: ${profile.currentBalance !== null ? `₹${profile.currentBalance.toLocaleString('en-IN')}` : 'Not provided'}`,
    `- Next Expected Income Date: ${profile.nextIncomeDate || 'Not provided'}`,
    `- Safety Buffer Target: ${profile.safetyBuffer !== null ? `₹${profile.safetyBuffer.toLocaleString('en-IN')}` : 'Not provided'}`,
  ].join('\n');

  const catSummary = Object.keys(spending.categoryTotals).length > 0
    ? Object.entries(spending.categoryTotals)
        .map(([cat, total]) => `  * ${cat}: ₹${total.toLocaleString('en-IN')}`)
        .join('\n')
    : '  * No category breakdown available for this month';

  const recentList = spending.recentExpenses.length > 0
    ? spending.recentExpenses
        .map((e) => `  * [${e.date}] ${e.title} (${e.category}): ₹${e.amount.toLocaleString('en-IN')}`)
        .join('\n')
    : '  * No recent transactions recorded';

  const spendingLines = [
    `- Current Month Spending Total: ₹${spending.currentMonthTotal.toLocaleString('en-IN')}`,
    `- Previous Month Spending Total: ₹${spending.previousMonthTotal.toLocaleString('en-IN')}`,
    `- Current Month Spending by Category:\n${catSummary}`,
    `- Recent Transactions (Latest ${spending.recentExpenses.length}):\n${recentList}`,
  ].join('\n');

  const upcomingBillsList = bills.upcoming.length > 0
    ? bills.upcoming
        .map(
          (b) =>
            `  * ${b.title}: ₹${b.amount.toLocaleString('en-IN')} | Due: ${b.dueDate} | Recurring: ${b.isRecurring ? b.frequency || 'Yes' : 'No'} | Status: ${b.isPaid ? 'PAID' : 'UNPAID'}`
        )
        .join('\n')
    : '  * No bills recorded';

  const billsLines = [
    `- Unpaid Bills Total: ₹${bills.unpaidTotal.toLocaleString('en-IN')}`,
    `- Bill Details:\n${upcomingBillsList}`,
  ].join('\n');

  const goalsList = goals.activeGoals.length > 0
    ? goals.activeGoals
        .map(
          (g) =>
            `  * ${g.name}: Saved ₹${g.currentAmount.toLocaleString('en-IN')} of ₹${g.targetAmount.toLocaleString('en-IN')} (Remaining: ₹${g.remainingAmount.toLocaleString('en-IN')})${g.targetDate ? ` (Target Date: ${g.targetDate})` : ''}`
        )
        .join('\n')
    : '  * No active savings goals recorded';

  const safeToSpendLines = [
    `- Safe-to-Spend Pool: ${safeToSpend.pool !== null ? `₹${safeToSpend.pool.toLocaleString('en-IN')}` : 'Unavailable (profile incomplete)'}`,
    `- Daily Safe Spend Allowance: ${safeToSpend.dailyAmount !== null ? `₹${Math.round(safeToSpend.dailyAmount).toLocaleString('en-IN')}/day` : 'Unavailable'}`,
    `- Days Until Next Income: ${safeToSpend.daysUntilIncome !== null ? `${safeToSpend.daysUntilIncome} days` : 'Unavailable'}`,
    `(Note: Safe-to-Spend calculation formula = Current Balance - Unpaid Bills - Goal Allocation - Safety Buffer. Deterministic value calculated by MoneyOS.)`,
  ].join('\n');

  let plannerLines = '- No saved Monthly Money Planner for the current month.';
  if (planner) {
    plannerLines = [
      `- Month Context: ${planner.planningMonth} (Status: ${planner.status})`,
      `- Planned Monthly Income: ₹${planner.plannedMonthlyIncome.toLocaleString('en-IN')}`,
      `- Planned Spending Total: ₹${planner.plannedSpendingTotal.toLocaleString('en-IN')}`,
      `- Planned Savings Total: ₹${planner.plannedSavings.toLocaleString('en-IN')}`,
      `- Projected Remaining Money: ₹${planner.projectedRemaining.toLocaleString('en-IN')}`,
      `- Plan Affordability: ${planner.isAffordable ? 'Affordable' : 'Deficit / Unaffordable'}`,
      `(Note: Monthly Planner figures represent PLANNED allocations, NOT actual executed expenses.)`,
    ].join('\n');
  }

  return `
==================================================
AUTHENTICATED USER MONEYOS FINANCIAL CONTEXT
==================================================

1. USER PROFILE & FINANCIAL SETUP:
${profileLines}

2. EXPENSE & TRANSACTION RECORDS (ACTUAL):
${spendingLines}

3. BILLS & UPCOMING PAYMENTS (ACTUAL):
${billsLines}

4. SAVINGS GOALS (ACTUAL):
${goalsList}

5. DETERMINISTIC SAFE-TO-SPEND (AUTHORITATIVE MONEYOS CALCULATION):
${safeToSpendLines}

6. MONTHLY MONEY PLANNER (PLANNED ALLOCATIONS):
${plannerLines}
==================================================
`;
}

/**
 * Formats context with explicit intent prioritization guidelines for Groq AI provider.
 */
export function formatPrioritizedContextForPrompt(
  context: AICoachFinancialContext,
  detection: IntentDetectionResult
): string {
  const { profile, spending, bills, goals, safeToSpend } = context;
  const { intent, requestedAmount, targetCategory } = detection;

  // Build requested amount evaluation if present
  let requestedAmountEval = '';
  if (typeof requestedAmount === 'number' && requestedAmount > 0) {
    const daily = safeToSpend.dailyAmount;
    const pool = safeToSpend.pool;
    if (daily !== null && pool !== null) {
      if (requestedAmount <= daily) {
        requestedAmountEval = `\n- DETERMINISTIC SPENDING EVALUATION: User asked if they can afford ₹${requestedAmount.toLocaleString('en-IN')}. Daily Safe Spend is ₹${Math.round(daily).toLocaleString('en-IN')}. The requested amount is WITHIN the daily safe limit (₹${Math.round(daily - requestedAmount).toLocaleString('en-IN')} remaining for today).`;
      } else if (requestedAmount <= pool) {
        requestedAmountEval = `\n- DETERMINISTIC SPENDING EVALUATION: User asked if they can afford ₹${requestedAmount.toLocaleString('en-IN')}. Daily Safe Spend is ₹${Math.round(daily).toLocaleString('en-IN')} (Total Pool: ₹${pool.toLocaleString('en-IN')}). The requested amount EXCEEDS the daily safe limit by ₹${Math.round(requestedAmount - daily).toLocaleString('en-IN')}. State clearly that spending this amount exceeds today's daily safe allowance and reduces their safe pool for upcoming days.`;
      } else {
        requestedAmountEval = `\n- DETERMINISTIC SPENDING EVALUATION: User asked if they can afford ₹${requestedAmount.toLocaleString('en-IN')}. Safe-to-Spend Pool is ₹${pool.toLocaleString('en-IN')}. The requested amount EXCEEDS the total safe-to-spend pool by ₹${Math.round(requestedAmount - pool).toLocaleString('en-IN')}. State clearly that this amount exceeds their safe-to-spend limit.`;
      }
    } else {
      requestedAmountEval = `\n- DETERMINISTIC SPENDING EVALUATION: User asked if they can afford ₹${requestedAmount.toLocaleString('en-IN')}. Safe-to-Spend is unavailable because user profile setup (balance, income, or safety buffer) is incomplete.`;
    }
  }

  // MoM Spending summary
  const momDiff = spending.currentMonthTotal - spending.previousMonthTotal;
  let momText = '';
  if (spending.previousMonthTotal > 0) {
    if (momDiff > 0) {
      momText = ` (Increased by ₹${momDiff.toLocaleString('en-IN')} compared to last month's ₹${spending.previousMonthTotal.toLocaleString('en-IN')})`;
    } else if (momDiff < 0) {
      momText = ` (Decreased by ₹${Math.abs(momDiff).toLocaleString('en-IN')} compared to last month's ₹${spending.previousMonthTotal.toLocaleString('en-IN')})`;
    } else {
      momText = ` (Same as last month's ₹${spending.previousMonthTotal.toLocaleString('en-IN')})`;
    }
  } else {
    momText = ` (Previous month spending data not recorded in MoneyOS)`;
  }

  // Intent focus guidelines for system prompt
  let focusGuidance = '';
  switch (intent) {
    case 'balance':
      focusGuidance = `PRIMARY FOCUS: Current Account Balance & Income context. Lead directly with current balance: ${profile.currentBalance !== null ? `₹${profile.currentBalance.toLocaleString('en-IN')}` : 'Not provided'}. Mention next income date and safety buffer if relevant.`;
      break;
    case 'spending':
      focusGuidance = `PRIMARY FOCUS: Expense records & MoM comparison. Lead directly with current month spending: ₹${spending.currentMonthTotal.toLocaleString('en-IN')}${momText}. Highlight recent transactions or major expenses.`;
      break;
    case 'spending_category':
      if (targetCategory) {
        const catSpent = spending.categoryTotals[targetCategory] || 0;
        focusGuidance = `PRIMARY FOCUS: Category '${targetCategory}'. User specifically asked about ${targetCategory}. Direct Answer: ${catSpent > 0 ? `₹${catSpent.toLocaleString('en-IN')} recorded for ${targetCategory} this month.` : `I don't have any recorded ${targetCategory} expenses for this period.`}`;
      } else {
        const topCat = Object.keys(spending.categoryTotals).length > 0
          ? Object.entries(spending.categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
          : 'None';
        focusGuidance = `PRIMARY FOCUS: Spending breakdown by category. Top spending category: ${topCat}. Lead with where money went across categories.`;
      }
      break;
    case 'bills':
      focusGuidance = `PRIMARY FOCUS: Upcoming and Unpaid Bills. Unpaid Bills Total: ₹${bills.unpaidTotal.toLocaleString('en-IN')}. Detail upcoming bills with due dates and amounts. Note paid vs unpaid status clearly. Do not call paid bills unpaid.`;
      break;
    case 'safe_to_spend':
      focusGuidance = `PRIMARY FOCUS: Authoritative Safe-to-Spend. Daily Safe Spend: ${safeToSpend.dailyAmount !== null ? `₹${Math.round(safeToSpend.dailyAmount).toLocaleString('en-IN')}/day` : 'Unavailable'} | Pool: ${safeToSpend.pool !== null ? `₹${safeToSpend.pool.toLocaleString('en-IN')}` : 'Unavailable'}.${requestedAmountEval}`;
      break;
    case 'goals':
      focusGuidance = `PRIMARY FOCUS: Active Savings Goals. Active goals count: ${goals.activeGoals.length}. Detail progress, remaining amounts (Target - Current), and target dates. If multiple goals exist and user did not specify one, summarize all active goals concisely.`;
      break;
    case 'savings':
      focusGuidance = `PRIMARY FOCUS: Savings overview combining active goals, safety buffer, and spending rate relative to income.`;
      break;
    case 'planner':
      focusGuidance = `PRIMARY FOCUS: Monthly Money Planner target allocations. Explicitly clarify that planner amounts represent PLANNED budgets, not executed expenses.`;
      break;
    case 'financial_overview':
      focusGuidance = `PRIMARY FOCUS: High-level financial overview covering Balance, Monthly Spending, Upcoming Bills, Safe-to-Spend, and Savings Goals concisely.`;
      break;
    default:
      focusGuidance = `PRIMARY FOCUS: General MoneyOS financial assistance. Provide accurate answers based strictly on available context.`;
  }

  // Format base prompt context
  const baseContextText = formatAICoachContextForPrompt(context);

  return `
==================================================
DETECTED USER INTENT: ${intent.toUpperCase()} (Confidence: ${detection.confidence})
${focusGuidance}
${requestedAmountEval}
==================================================

${baseContextText}`;
}

