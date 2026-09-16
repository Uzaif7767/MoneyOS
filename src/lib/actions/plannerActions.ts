"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  getPlannerDraft,
  savePlannerDraft,
  type SavePlannerDraftPayload,
} from "@/lib/services/plannerService";
import { getUserProfile } from "@/lib/services/userService";
import type { PlannerDraft, RepeatablePlannerItem } from "@/types";

export interface PlannerFormErrors {
  monthlyIncome?: string;
  currentBalance?: string;
  expectedIncomeDate?: string;
  foodAndDailyLiving?: string;
  transport?: string;
  housing?: string;
  familyPersonal?: string;
  lifestyleDiscretionary?: string;
  savingsGoalAmount?: string;
  safetyBuffer?: string;
  repeatableItems?: Record<string, string>;
  form?: string;
}

export interface PlannerActionResult {
  success: boolean;
  errors?: PlannerFormErrors;
  draft?: PlannerDraft | null;
  message?: string;
}

export interface UserFinancialDefaultsResult {
  success: boolean;
  monthlyIncome?: number;
  currentBalance?: number;
  message?: string;
}

function sanitizeRepeatableItems(items: unknown): RepeatablePlannerItem[] {
  if (!Array.isArray(items)) return [];
  const result: RepeatablePlannerItem[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const rawObj = item as Record<string, unknown>;
    const name = typeof rawObj.name === "string" ? rawObj.name.trim() : "";
    const amount = Number(rawObj.amount);

    if (!name || isNaN(amount) || amount < 0) continue;

    result.push({
      id: typeof rawObj.id === "string" && rawObj.id ? rawObj.id : `item_${Math.random().toString(36).substring(2, 9)}`,
      name,
      amount,
      ...(typeof rawObj.dueDate === "string" && rawObj.dueDate.trim() ? { dueDate: rawObj.dueDate.trim() } : {}),
    });
  }

  return result;
}

function validatePlannerInputs(data: Record<string, unknown>): {
  errors: PlannerFormErrors;
  cleanPayload?: SavePlannerDraftPayload;
} {
  const errors: PlannerFormErrors = {};

  // Monthly income
  const monthlyIncome = Number(data.monthlyIncome);
  if (data.monthlyIncome !== undefined && data.monthlyIncome !== "" && (isNaN(monthlyIncome) || monthlyIncome < 0)) {
    errors.monthlyIncome = "Monthly Income must be a non-negative number.";
  }

  // Current balance
  const currentBalance = Number(data.currentBalance);
  if (data.currentBalance !== undefined && data.currentBalance !== "" && (isNaN(currentBalance) || currentBalance < 0)) {
    errors.currentBalance = "Current Balance must be a non-negative number.";
  }

  // Expected income date
  const expectedIncomeDate = typeof data.expectedIncomeDate === "string" ? data.expectedIncomeDate.trim() : "";
  if (expectedIncomeDate) {
    const parsedDate = new Date(expectedIncomeDate);
    if (isNaN(parsedDate.getTime())) {
      errors.expectedIncomeDate = "Please provide a valid income date.";
    }
  }

  // Everyday living
  const foodAndDailyLiving = Number(data.foodAndDailyLiving || 0);
  if (isNaN(foodAndDailyLiving) || foodAndDailyLiving < 0) {
    errors.foodAndDailyLiving = "Food & Daily Living amount must be non-negative.";
  }

  const transport = Number(data.transport || 0);
  if (isNaN(transport) || transport < 0) {
    errors.transport = "Transport amount must be non-negative.";
  }

  const housing = Number(data.housing || 0);
  if (isNaN(housing) || housing < 0) {
    errors.housing = "Housing amount must be non-negative.";
  }

  // Family & Personal
  const familyPersonal = Number(data.familyPersonal || 0);
  if (isNaN(familyPersonal) || familyPersonal < 0) {
    errors.familyPersonal = "Family & Personal amount must be non-negative.";
  }

  // Lifestyle
  const lifestyleDiscretionary = Number(data.lifestyleDiscretionary || 0);
  if (isNaN(lifestyleDiscretionary) || lifestyleDiscretionary < 0) {
    errors.lifestyleDiscretionary = "Lifestyle amount must be non-negative.";
  }

  // Savings Goal & Safety Buffer
  const savingsGoalAmount = Number(data.savingsGoalAmount || 0);
  if (isNaN(savingsGoalAmount) || savingsGoalAmount < 0) {
    errors.savingsGoalAmount = "Savings Goal amount must be non-negative.";
  }

  const safetyBuffer = Number(data.safetyBuffer || 0);
  if (isNaN(safetyBuffer) || safetyBuffer < 0) {
    errors.safetyBuffer = "Safety Buffer amount must be non-negative.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const planningMonth = typeof data.planningMonth === "string" ? data.planningMonth.trim() : "";

  return {
    errors: {},
    cleanPayload: {
      planningMonth,
      monthlyIncome: isNaN(monthlyIncome) || monthlyIncome < 0 ? 0 : monthlyIncome,
      currentBalance: isNaN(currentBalance) || currentBalance < 0 ? 0 : currentBalance,
      expectedIncomeDate,
      fixedExpenses: sanitizeRepeatableItems(data.fixedExpenses),
      plannedBills: sanitizeRepeatableItems(data.plannedBills),
      subscriptions: sanitizeRepeatableItems(data.subscriptions),
      foodAndDailyLiving,
      transport,
      housing,
      familyPersonal,
      debtEmi: sanitizeRepeatableItems(data.debtEmi),
      lifestyleDiscretionary,
      oneTimeExpenses: sanitizeRepeatableItems(data.oneTimeExpenses),
      savingsGoalAmount,
      safetyBuffer,
    },
  };
}

/**
 * Server action to fetch saved planner draft for the authenticated Clerk user for a given month.
 */
export async function getPlannerDraftAction(
  planningMonthId: string
): Promise<PlannerActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: { form: "Authentication required." },
    };
  }

  if (!planningMonthId) {
    return {
      success: false,
      errors: { form: "Planning month context ID is required." },
    };
  }

  try {
    const draft = await getPlannerDraft(clerkUserId, planningMonthId);
    return {
      success: true,
      draft,
    };
  } catch (error) {
    console.error("Error fetching planner draft:", error);
    return {
      success: false,
      errors: { form: "Failed to load saved planner draft." },
    };
  }
}

/**
 * Server action to fetch user profile defaults (income, balance) for optional copy actions.
 */
export async function getUserFinancialDefaultsAction(): Promise<UserFinancialDefaultsResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, message: "Authentication required." };
  }

  try {
    const profile = await getUserProfile(clerkUserId);
    return {
      success: true,
      monthlyIncome: profile?.monthlyIncome || 0,
      currentBalance: profile?.currentBalance || 0,
    };
  } catch (error) {
    console.error("Error fetching user defaults:", error);
    return { success: false, message: "Failed to fetch user defaults." };
  }
}

/**
 * Server action to save a planner draft document under /users/{userId}/plannerDrafts/{planningMonthId}
 */
export async function savePlannerDraftAction(
  planningMonthId: string,
  rawData: unknown
): Promise<PlannerActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: { form: "Authentication required. Please sign in to save plan inputs." },
    };
  }

  if (!planningMonthId) {
    return {
      success: false,
      errors: { form: "Planning month context ID is required." },
    };
  }

  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Record<string, unknown>;
  const { errors, cleanPayload } = validatePlannerInputs(data);

  if (Object.keys(errors).length > 0 || !cleanPayload) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted input errors before saving.",
    };
  }

  try {
    const savedDraft = await savePlannerDraft(clerkUserId, planningMonthId, cleanPayload);

    revalidatePath("/protected/planner");

    return {
      success: true,
      draft: savedDraft,
      message: "Plan inputs saved successfully!",
    };
  } catch (error) {
    console.error("Error saving planner draft:", error);
    return {
      success: false,
      errors: {
        form: "An unexpected server error occurred while saving your plan inputs.",
      },
    };
  }
}
