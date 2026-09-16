"use server";

import { auth } from "@clerk/nextjs/server";
import { saveOnboardingProfile } from "@/lib/services/userService";
import type { OnboardingData, OnboardingFormErrors } from "@/types";

export interface OnboardingActionResult {
  success: boolean;
  errors?: OnboardingFormErrors;
  message?: string;
}

export async function completeOnboardingAction(
  rawData: unknown
): Promise<OnboardingActionResult> {
  // 1. Server-side identity verification via Clerk
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to complete onboarding.",
      },
    };
  }

  // 2. Input extraction and validation
  const errors: OnboardingFormErrors = {};
  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Partial<OnboardingData>;

  // Validate monthlyIncome
  const monthlyIncome = Number(data.monthlyIncome);
  if (
    data.monthlyIncome === undefined ||
    data.monthlyIncome === null ||
    data.monthlyIncome === ("" as unknown) ||
    isNaN(monthlyIncome)
  ) {
    errors.monthlyIncome = "Monthly income is required.";
  } else if (monthlyIncome < 0) {
    errors.monthlyIncome = "Monthly income must be a valid non-negative amount.";
  }

  // Validate currentBalance
  const currentBalance = Number(data.currentBalance);
  if (
    data.currentBalance === undefined ||
    data.currentBalance === null ||
    data.currentBalance === ("" as unknown) ||
    isNaN(currentBalance)
  ) {
    errors.currentBalance = "Current available balance is required.";
  } else if (currentBalance < 0) {
    errors.currentBalance = "Current balance must be a valid non-negative amount.";
  }

  // Validate nextIncomeDate
  if (!data.nextIncomeDate || typeof data.nextIncomeDate !== "string" || !data.nextIncomeDate.trim()) {
    errors.nextIncomeDate = "Next income date is required.";
  } else {
    const parsedDate = new Date(data.nextIncomeDate);
    if (isNaN(parsedDate.getTime())) {
      errors.nextIncomeDate = "Please provide a valid income date.";
    }
  }

  // Validate safetyBuffer
  const safetyBuffer = Number(data.safetyBuffer);
  if (
    data.safetyBuffer === undefined ||
    data.safetyBuffer === null ||
    data.safetyBuffer === ("" as unknown) ||
    isNaN(safetyBuffer)
  ) {
    errors.safetyBuffer = "Safety buffer amount is required.";
  } else if (safetyBuffer < 0) {
    errors.safetyBuffer = "Safety buffer must be a valid non-negative amount.";
  }

  // Optional First Savings Goal validation
  const goalTitle = data.goalTitle?.trim() || "";
  const goalTargetAmountRaw = data.goalTargetAmount;
  const goalTargetAmount = goalTargetAmountRaw !== undefined && goalTargetAmountRaw !== null && goalTargetAmountRaw !== ("" as unknown)
    ? Number(goalTargetAmountRaw)
    : undefined;
  const goalTargetDate = data.goalTargetDate?.trim() || "";

  const isGoalStarted = Boolean(goalTitle || (goalTargetAmount !== undefined && !isNaN(goalTargetAmount)) || goalTargetDate);

  if (isGoalStarted) {
    if (!goalTitle) {
      errors.goalTitle = "Please provide a name for your savings goal.";
    }
    if (goalTargetAmount === undefined || isNaN(goalTargetAmount) || goalTargetAmount <= 0) {
      errors.goalTargetAmount = "Target amount must be a positive number greater than 0.";
    }
    if (goalTargetDate) {
      const parsedGoalDate = new Date(goalTargetDate);
      if (isNaN(parsedGoalDate.getTime())) {
        errors.goalTargetDate = "Please provide a valid target date.";
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Please correct the errors in the form before submitting.",
    };
  }

  // 3. Save to Firestore via server-only layer
  try {
    const validatedData: OnboardingData = {
      monthlyIncome,
      currentBalance,
      nextIncomeDate: data.nextIncomeDate!.trim(),
      safetyBuffer,
      ...(isGoalStarted && goalTitle && goalTargetAmount ? {
        goalTitle,
        goalTargetAmount,
        ...(goalTargetDate ? { goalTargetDate } : {}),
      } : {}),
    };

    await saveOnboardingProfile(clerkUserId, validatedData);

    return {
      success: true,
      message: "Onboarding completed successfully!",
    };
  } catch (error) {
    console.error("Failed to save onboarding profile:", error);
    return {
      success: false,
      errors: {
        form: "An unexpected error occurred while saving your financial profile. Please try again.",
      },
    };
  }
}
