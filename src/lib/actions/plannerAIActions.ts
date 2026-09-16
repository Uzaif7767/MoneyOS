"use server";

import { auth } from "@clerk/nextjs/server";
import { getPlannerDraft } from "@/lib/services/plannerService";
import { calculatePlannerSummary, toSafeNum } from "@/lib/planner/plannerCalculator";
import {
  generatePlannerAIInsights,
  generateProposedAIPlan,
  generateOptimizedAIPlan,
  type PlannerAIResult,
  type AIProposedPlanResult,
  type AIOptimizationResult,
  type AIProposedPlan,
  type OptimizationMode,
  type SanitizedPlannerContext,
} from "@/lib/ai/planner";

/**
 * Server action to generate structured AI Planning Insights for the authenticated user's planner draft.
 * - Authenticates the Clerk user server-side.
 * - Fetches user-scoped planner draft from Firestore server-side.
 * - Calculates deterministic financials using plannerCalculator.
 * - Passes strictly sanitized aggregated context to the server-only Groq provider.
 */
export async function generatePlannerInsightsAction(
  planningMonthId: string
): Promise<PlannerAIResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to generate AI insights.",
    };
  }

  if (!planningMonthId || typeof planningMonthId !== "string" || !planningMonthId.trim()) {
    return {
      success: false,
      error: "Valid planning month context is required.",
    };
  }

  const cleanMonthId = planningMonthId.trim();

  try {
    const draft = await getPlannerDraft(clerkUserId, cleanMonthId);
    if (!draft) {
      return {
        success: false,
        error: "No saved plan inputs found for this month. Please save your plan inputs first.",
      };
    }

    const calc = calculatePlannerSummary(draft, cleanMonthId);

    const context: SanitizedPlannerContext = {
      planningMonth: cleanMonthId,
      plannedMonthlyIncome: calc.totalPlannedIncome,
      currentBalance: toSafeNum(draft.currentBalance),
      expectedIncomeDate: calc.expectedIncomeDate,
      fixedExpensesTotal: calc.fixedExpensesTotal,
      plannedBillsTotal: calc.plannedBillsTotal,
      subscriptionsTotal: calc.subscriptionsTotal,
      everydayLivingTotal: calc.everydayLivingTotal,
      foodAndDailyLivingTotal: toSafeNum(draft.foodAndDailyLiving),
      transportTotal: toSafeNum(draft.transport),
      housingTotal: toSafeNum(draft.housing),
      familyPersonalTotal: calc.familyPersonalTotal,
      debtEmiTotal: calc.debtEmiTotal,
      lifestyleDiscretionaryTotal: calc.lifestyleDiscretionaryTotal,
      oneTimeExpensesTotal: calc.oneTimeExpensesTotal,
      totalPlannedSpending: calc.totalPlannedSpending,
      savingsGoalAmount: calc.savingsGoalAmount,
      recommendedSavingsBenchmark: calc.recommendedSavings,
      safetyBuffer: calc.safetyBuffer,
      remainingMoney: calc.remainingMoney,
      isAffordable: calc.isAffordable,
    };

    return await generatePlannerAIInsights(context);
  } catch (error) {
    console.error("Error in generatePlannerInsightsAction:", error);
    return {
      success: false,
      error: "AI planning insights are temporarily unavailable.",
    };
  }
}

/**
 * Server action to generate a complete AI Proposed Monthly Plan (Phase 2.5).
 * - Authenticates Clerk user server-side.
 * - Fetches user planner draft server-side.
 * - Runs deterministic calculations via plannerCalculator.
 * - Passes sanitized context to Groq AI provider.
 * - Validates AI response strictly and calculates deterministic summary check for the proposal.
 */
export async function generateAIPlanAction(
  planningMonthId: string
): Promise<AIProposedPlanResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to generate AI plan.",
    };
  }

  if (!planningMonthId || typeof planningMonthId !== "string" || !planningMonthId.trim()) {
    return {
      success: false,
      error: "Valid planning month context is required.",
    };
  }

  const cleanMonthId = planningMonthId.trim();

  try {
    const draft = await getPlannerDraft(clerkUserId, cleanMonthId);
    if (!draft) {
      return {
        success: false,
        error: "No saved plan inputs found for this month. Please save your plan inputs first.",
      };
    }

    const calc = calculatePlannerSummary(draft, cleanMonthId);

    const context: SanitizedPlannerContext = {
      planningMonth: cleanMonthId,
      plannedMonthlyIncome: calc.totalPlannedIncome,
      currentBalance: toSafeNum(draft.currentBalance),
      expectedIncomeDate: calc.expectedIncomeDate,
      fixedExpensesTotal: calc.fixedExpensesTotal,
      fixedExpensesItems: (draft.fixedExpenses || [])
        .filter((i) => i.name && toSafeNum(i.amount) > 0)
        .map((i) => ({ name: i.name.trim(), amount: toSafeNum(i.amount) })),
      plannedBillsTotal: calc.plannedBillsTotal,
      plannedBillsItems: (draft.plannedBills || [])
        .filter((i) => i.name && toSafeNum(i.amount) > 0)
        .map((i) => ({ name: i.name.trim(), amount: toSafeNum(i.amount) })),
      subscriptionsTotal: calc.subscriptionsTotal,
      subscriptionsItems: (draft.subscriptions || [])
        .filter((i) => i.name && toSafeNum(i.amount) > 0)
        .map((i) => ({ name: i.name.trim(), amount: toSafeNum(i.amount) })),
      everydayLivingTotal: calc.everydayLivingTotal,
      foodAndDailyLivingTotal: toSafeNum(draft.foodAndDailyLiving),
      transportTotal: toSafeNum(draft.transport),
      housingTotal: toSafeNum(draft.housing),
      familyPersonalTotal: calc.familyPersonalTotal,
      debtEmiTotal: calc.debtEmiTotal,
      debtEmiItems: (draft.debtEmi || [])
        .filter((i) => i.name && toSafeNum(i.amount) > 0)
        .map((i) => ({ name: i.name.trim(), amount: toSafeNum(i.amount) })),
      lifestyleDiscretionaryTotal: calc.lifestyleDiscretionaryTotal,
      oneTimeExpensesTotal: calc.oneTimeExpensesTotal,
      oneTimeExpensesItems: (draft.oneTimeExpenses || [])
        .filter((i) => i.name && toSafeNum(i.amount) > 0)
        .map((i) => ({ name: i.name.trim(), amount: toSafeNum(i.amount) })),
      totalPlannedSpending: calc.totalPlannedSpending,
      savingsGoalAmount: calc.savingsGoalAmount,
      recommendedSavingsBenchmark: calc.recommendedSavings,
      safetyBuffer: calc.safetyBuffer,
      remainingMoney: calc.remainingMoney,
      isAffordable: calc.isAffordable,
    };

    return await generateProposedAIPlan(context);
  } catch (error) {
    console.error("Error in generateAIPlanAction:", error);
    return {
      success: false,
      error: "AI plan could not be generated right now. Your saved planner data is safe.",
    };
  }
}

/**
 * Server action to generate AI Budget Optimization and Rebalancing (Phase 2.7).
 * - Authenticates Clerk user server-side.
 * - Fetches user planner draft server-side to guarantee context ownership and freshness.
 * - Runs deterministic calculations via plannerCalculator.
 * - Calls generateOptimizedAIPlan with sanitized context, current proposal, and optimization mode.
 * - Validates AI response strictly and calculates deterministic summary check for the proposal.
 * - NEVER alters saved planner draft in Firestore or any permanent records.
 */
export async function optimizeAIPlanAction(
  planningMonthId: string,
  currentProposal: AIProposedPlan,
  mode: OptimizationMode = "auto"
): Promise<AIOptimizationResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to optimize budget plan.",
    };
  }

  if (!planningMonthId || typeof planningMonthId !== "string" || !planningMonthId.trim()) {
    return {
      success: false,
      error: "Valid planning month context is required.",
    };
  }

  if (!currentProposal || !Array.isArray(currentProposal.categories)) {
    return {
      success: false,
      error: "Valid current AI proposed plan context is required.",
    };
  }

  const cleanMonthId = planningMonthId.trim();

  try {
    const draft = await getPlannerDraft(clerkUserId, cleanMonthId);
    if (!draft) {
      return {
        success: false,
        error: "No saved plan inputs found for this month. Please save your plan inputs first.",
      };
    }

    const calc = calculatePlannerSummary(draft, cleanMonthId);

    const context: SanitizedPlannerContext = {
      planningMonth: cleanMonthId,
      plannedMonthlyIncome: calc.totalPlannedIncome,
      currentBalance: toSafeNum(draft.currentBalance),
      expectedIncomeDate: calc.expectedIncomeDate,
      fixedExpensesTotal: calc.fixedExpensesTotal,
      plannedBillsTotal: calc.plannedBillsTotal,
      subscriptionsTotal: calc.subscriptionsTotal,
      everydayLivingTotal: calc.everydayLivingTotal,
      foodAndDailyLivingTotal: toSafeNum(draft.foodAndDailyLiving),
      transportTotal: toSafeNum(draft.transport),
      housingTotal: toSafeNum(draft.housing),
      familyPersonalTotal: calc.familyPersonalTotal,
      debtEmiTotal: calc.debtEmiTotal,
      lifestyleDiscretionaryTotal: calc.lifestyleDiscretionaryTotal,
      oneTimeExpensesTotal: calc.oneTimeExpensesTotal,
      totalPlannedSpending: calc.totalPlannedSpending,
      savingsGoalAmount: calc.savingsGoalAmount,
      recommendedSavingsBenchmark: calc.recommendedSavings,
      safetyBuffer: calc.safetyBuffer,
      remainingMoney: calc.remainingMoney,
      isAffordable: calc.isAffordable,
    };

    return await generateOptimizedAIPlan(context, currentProposal, mode);
  } catch (error) {
    console.error("Error in optimizeAIPlanAction:", error);
    return {
      success: false,
      error: "AI budget optimization is temporarily unavailable. Your saved planner data is safe.",
    };
  }
}


