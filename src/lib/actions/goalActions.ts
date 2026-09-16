"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  removeContribution,
} from "@/lib/services/goalService";
import type { Goal } from "@/types";

export interface GoalFormErrors {
  name?: string;
  targetAmount?: string;
  currentAmount?: string;
  targetDate?: string;
  contributionAmount?: string;
  form?: string;
}

export interface GoalActionResult {
  success: boolean;
  errors?: GoalFormErrors;
  goal?: Goal;
  message?: string;
}

function validateGoalInputs(data: {
  name?: unknown;
  targetAmount?: unknown;
  currentAmount?: unknown;
  targetDate?: unknown;
}): {
  errors: GoalFormErrors;
  cleanPayload?: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string;
  };
} {
  const errors: GoalFormErrors = {};

  // 1. Validate Goal Name
  const nameStr = typeof data.name === "string" ? data.name.trim() : "";
  if (!nameStr) {
    errors.name = "Goal name is required.";
  } else if (nameStr.length > 100) {
    errors.name = "Goal name cannot exceed 100 characters.";
  }

  // 2. Validate Target Amount
  const targetAmount = Number(data.targetAmount);
  if (
    data.targetAmount === undefined ||
    data.targetAmount === null ||
    data.targetAmount === ("" as unknown) ||
    isNaN(targetAmount)
  ) {
    errors.targetAmount = "Target amount is required.";
  } else if (targetAmount <= 0) {
    errors.targetAmount = "Target amount must be a positive number greater than ₹0.";
  }

  // 3. Validate Current Amount (Optional initial savings amount)
  let cleanCurrentAmount: number | undefined = undefined;
  if (
    data.currentAmount !== undefined &&
    data.currentAmount !== null &&
    data.currentAmount !== ("" as unknown)
  ) {
    const currentVal = Number(data.currentAmount);
    if (isNaN(currentVal)) {
      errors.currentAmount = "Current saved amount must be a valid number.";
    } else if (currentVal < 0) {
      errors.currentAmount = "Current saved amount cannot be negative.";
    } else {
      cleanCurrentAmount = currentVal;
    }
  }

  // 4. Validate Target Date (Optional)
  let cleanTargetDate: string | undefined = undefined;
  if (typeof data.targetDate === "string" && data.targetDate.trim() !== "") {
    const targetDateStr = data.targetDate.trim();
    const parsedDate = new Date(targetDateStr);
    if (isNaN(parsedDate.getTime())) {
      errors.targetDate = "Please provide a valid target date.";
    } else {
      cleanTargetDate = targetDateStr;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors: {},
    cleanPayload: {
      name: nameStr,
      targetAmount,
      currentAmount: cleanCurrentAmount,
      targetDate: cleanTargetDate,
    },
  };
}

/**
 * Server action to create a new goal for the authenticated Clerk user.
 */
export async function createGoalAction(rawData: unknown): Promise<GoalActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to create a goal.",
      },
    };
  }

  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Record<string, unknown>;
  const { errors, cleanPayload } = validateGoalInputs(data);

  if (Object.keys(errors).length > 0 || !cleanPayload) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted errors.",
    };
  }

  try {
    const newGoal = await createGoal(clerkUserId, cleanPayload);

    revalidatePath("/protected/goals");
    revalidatePath("/protected");

    return {
      success: true,
      goal: newGoal,
      message: "Savings goal created successfully!",
    };
  } catch (error) {
    console.error("Error creating goal:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to create goal.";
    return {
      success: false,
      errors: {
        form: errMessage,
      },
    };
  }
}

/**
 * Server action to update an existing goal for the authenticated Clerk user.
 */
export async function updateGoalAction(
  goalId: string,
  rawData: unknown
): Promise<GoalActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to update a goal.",
      },
    };
  }

  if (!goalId) {
    return {
      success: false,
      errors: {
        form: "Goal ID is required.",
      },
    };
  }

  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Record<string, unknown>;
  const { errors, cleanPayload } = validateGoalInputs(data);

  if (Object.keys(errors).length > 0 || !cleanPayload) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted errors.",
    };
  }

  try {
    const updatedGoal = await updateGoal(clerkUserId, goalId, cleanPayload);

    revalidatePath("/protected/goals");
    revalidatePath("/protected");

    return {
      success: true,
      goal: updatedGoal,
      message: "Goal updated successfully!",
    };
  } catch (error) {
    console.error("Error updating goal:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to update goal.";
    return {
      success: false,
      errors: {
        form: errMessage,
      },
    };
  }
}

/**
 * Server action to delete a goal for the authenticated Clerk user.
 */
export async function deleteGoalAction(goalId: string): Promise<GoalActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to delete a goal.",
      },
    };
  }

  if (!goalId) {
    return {
      success: false,
      errors: {
        form: "Goal ID is required for deletion.",
      },
    };
  }

  try {
    await deleteGoal(clerkUserId, goalId);

    revalidatePath("/protected/goals");
    revalidatePath("/protected");

    return {
      success: true,
      message: "Goal deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return {
      success: false,
      errors: {
        form: "Failed to delete goal record.",
      },
    };
  }
}

/**
 * Server action to add a money contribution towards a goal.
 */
export async function addContributionAction(
  goalId: string,
  amount: number
): Promise<GoalActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required.",
      },
    };
  }

  if (!goalId) {
    return {
      success: false,
      errors: {
        form: "Goal ID is required.",
      },
    };
  }

  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return {
      success: false,
      errors: {
        contributionAmount: "Contribution amount must be a positive INR amount greater than ₹0.",
      },
    };
  }

  try {
    const updatedGoal = await addContribution(clerkUserId, goalId, amount);

    revalidatePath("/protected/goals");
    revalidatePath("/protected");

    return {
      success: true,
      goal: updatedGoal,
      message: `Successfully added ₹${amount.toLocaleString("en-IN")} to "${updatedGoal.name}"!`,
    };
  } catch (error) {
    console.error("Error adding contribution:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to add contribution.";
    return {
      success: false,
      errors: {
        form: errMessage,
      },
    };
  }
}

/**
 * Server action to remove a money contribution from a goal.
 */
export async function removeContributionAction(
  goalId: string,
  amount: number
): Promise<GoalActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required.",
      },
    };
  }

  if (!goalId) {
    return {
      success: false,
      errors: {
        form: "Goal ID is required.",
      },
    };
  }

  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return {
      success: false,
      errors: {
        contributionAmount: "Contribution removal amount must be a positive INR amount greater than ₹0.",
      },
    };
  }

  try {
    const updatedGoal = await removeContribution(clerkUserId, goalId, amount);

    revalidatePath("/protected/goals");
    revalidatePath("/protected");

    return {
      success: true,
      goal: updatedGoal,
      message: `Successfully withdrew ₹${amount.toLocaleString("en-IN")} from "${updatedGoal.name}".`,
    };
  } catch (error) {
    console.error("Error removing contribution:", error);
    const errMessage = error instanceof Error ? error.message : "Failed to remove contribution.";
    return {
      success: false,
      errors: {
        form: errMessage,
      },
    };
  }
}
