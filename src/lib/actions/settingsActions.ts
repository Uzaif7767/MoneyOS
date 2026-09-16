"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateFinancialSettings } from "@/lib/services/userService";

export interface SettingsFormErrors {
  monthlyIncome?: string;
  currentBalance?: string;
  nextIncomeDate?: string;
  safetyBuffer?: string;
  form?: string;
}

export interface SettingsActionResult {
  success: boolean;
  errors?: SettingsFormErrors;
  message?: string;
}

export async function updateFinancialSettingsAction(
  rawData: unknown
): Promise<SettingsActionResult> {
  // 1. Authenticate server-side via Clerk session
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to update your financial settings.",
      },
    };
  }

  // 2. Validate input fields
  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Record<string, unknown>;
  const errors: SettingsFormErrors = {};

  // Monthly Income validation
  const monthlyIncome = Number(data.monthlyIncome);
  if (
    data.monthlyIncome === undefined ||
    data.monthlyIncome === null ||
    data.monthlyIncome === ("" as unknown) ||
    isNaN(monthlyIncome)
  ) {
    errors.monthlyIncome = "Monthly income is required.";
  } else if (monthlyIncome < 0) {
    errors.monthlyIncome = "Monthly income must be a non-negative amount (≥ ₹0).";
  }

  // Current Balance validation
  const currentBalance = Number(data.currentBalance);
  if (
    data.currentBalance === undefined ||
    data.currentBalance === null ||
    data.currentBalance === ("" as unknown) ||
    isNaN(currentBalance)
  ) {
    errors.currentBalance = "Current balance is required.";
  } else if (currentBalance < 0) {
    errors.currentBalance = "Current balance must be a non-negative amount (≥ ₹0).";
  }

  // Next Income Date validation
  const nextIncomeDateStr = typeof data.nextIncomeDate === "string" ? data.nextIncomeDate.trim() : "";
  if (!nextIncomeDateStr) {
    errors.nextIncomeDate = "Next income date is required.";
  } else {
    const parsedDate = new Date(nextIncomeDateStr);
    if (isNaN(parsedDate.getTime())) {
      errors.nextIncomeDate = "Please enter a valid next income date.";
    }
  }

  // Safety Buffer validation
  const safetyBuffer = Number(data.safetyBuffer);
  if (
    data.safetyBuffer === undefined ||
    data.safetyBuffer === null ||
    data.safetyBuffer === ("" as unknown) ||
    isNaN(safetyBuffer)
  ) {
    errors.safetyBuffer = "Safety buffer amount is required.";
  } else if (safetyBuffer < 0) {
    errors.safetyBuffer = "Safety buffer must be a non-negative amount (≥ ₹0).";
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted errors before saving.",
    };
  }

  // 3. Update Firestore profile via server-side service
  try {
    await updateFinancialSettings(clerkUserId, {
      monthlyIncome,
      currentBalance,
      nextIncomeDate: nextIncomeDateStr,
      safetyBuffer,
    });

    // Revalidate affected routes to update Safe-to-Spend calculations immediately
    revalidatePath("/protected");
    revalidatePath("/protected/settings");
    revalidatePath("/protected/insights");
    revalidatePath("/protected/goals");
    revalidatePath("/protected/expenses");
    revalidatePath("/protected/bills");

    return {
      success: true,
      message: "Financial settings updated successfully! Safe-to-Spend calculations have been refreshed.",
    };
  } catch (error) {
    console.error("Error updating financial settings:", error);
    return {
      success: false,
      errors: {
        form: "An unexpected error occurred while saving your settings. Please try again.",
      },
    };
  }
}
