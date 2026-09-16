"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/services/expenseService";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from "@/types";

export interface ExpenseFormErrors {
  amount?: string;
  category?: string;
  date?: string;
  note?: string;
  form?: string;
}

export interface ExpenseActionResult {
  success: boolean;
  errors?: ExpenseFormErrors;
  expense?: Expense;
  message?: string;
}

function validateExpenseInputs(data: {
  amount?: unknown;
  category?: unknown;
  date?: unknown;
  note?: unknown;
}): { errors: ExpenseFormErrors; cleanPayload?: { amount: number; category: ExpenseCategory; date: string; note: string } } {
  const errors: ExpenseFormErrors = {};

  // 1. Validate Amount
  const amount = Number(data.amount);
  if (
    data.amount === undefined ||
    data.amount === null ||
    data.amount === ("" as unknown) ||
    isNaN(amount)
  ) {
    errors.amount = "Amount is required.";
  } else if (amount <= 0) {
    errors.amount = "Amount must be a positive number greater than 0.";
  }

  // 2. Validate Category
  const categoryStr = typeof data.category === "string" ? data.category.trim() : "";
  if (!categoryStr) {
    errors.category = "Category is required.";
  } else if (!EXPENSE_CATEGORIES.includes(categoryStr as ExpenseCategory)) {
    errors.category = `Invalid category. Allowed: ${EXPENSE_CATEGORIES.join(", ")}`;
  }

  // 3. Validate Date
  const dateStr = typeof data.date === "string" ? data.date.trim() : "";
  if (!dateStr) {
    errors.date = "Date is required.";
  } else {
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      errors.date = "Please provide a valid date.";
    }
  }

  // 4. Validate Note
  const noteStr = typeof data.note === "string" ? data.note.trim() : "";
  if (noteStr.length > 500) {
    errors.note = "Description / Note cannot exceed 500 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors: {},
    cleanPayload: {
      amount,
      category: categoryStr as ExpenseCategory,
      date: dateStr,
      note: noteStr,
    },
  };
}

/**
 * Server action to create a new expense for the authenticated Clerk user.
 */
export async function createExpenseAction(
  rawData: unknown
): Promise<ExpenseActionResult> {
  // 1. Authenticate user server-side
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to create an expense.",
      },
    };
  }

  // 2. Input validation
  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Record<string, unknown>;
  const { errors, cleanPayload } = validateExpenseInputs(data);

  if (Object.keys(errors).length > 0 || !cleanPayload) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted errors.",
    };
  }

  // 3. Persist to Firestore
  try {
    const newExpense = await createExpense(clerkUserId, cleanPayload);

    revalidatePath("/protected/expenses");
    revalidatePath("/protected");

    return {
      success: true,
      expense: newExpense,
      message: "Expense recorded successfully!",
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    return {
      success: false,
      errors: {
        form: "An unexpected server error occurred while adding your expense.",
      },
    };
  }
}

/**
 * Server action to update an existing expense for the authenticated Clerk user.
 */
export async function updateExpenseAction(
  expenseId: string,
  rawData: unknown
): Promise<ExpenseActionResult> {
  // 1. Authenticate user server-side
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to edit an expense.",
      },
    };
  }

  if (!expenseId) {
    return {
      success: false,
      errors: {
        form: "Expense ID is required.",
      },
    };
  }

  // 2. Input validation
  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Record<string, unknown>;
  const { errors, cleanPayload } = validateExpenseInputs(data);

  if (Object.keys(errors).length > 0 || !cleanPayload) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted errors.",
    };
  }

  // 3. Persist to Firestore
  try {
    const updatedExpense = await updateExpense(clerkUserId, expenseId, cleanPayload);

    revalidatePath("/protected/expenses");
    revalidatePath("/protected");

    return {
      success: true,
      expense: updatedExpense,
      message: "Expense updated successfully!",
    };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      success: false,
      errors: {
        form: "An unexpected server error occurred while updating the expense.",
      },
    };
  }
}

/**
 * Server action to delete an expense for the authenticated Clerk user.
 */
export async function deleteExpenseAction(
  expenseId: string
): Promise<ExpenseActionResult> {
  // 1. Authenticate user server-side
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to delete an expense.",
      },
    };
  }

  if (!expenseId) {
    return {
      success: false,
      errors: {
        form: "Expense ID is required for deletion.",
      },
    };
  }

  // 2. Delete from Firestore
  try {
    await deleteExpense(clerkUserId, expenseId);

    revalidatePath("/protected/expenses");
    revalidatePath("/protected");

    return {
      success: true,
      message: "Expense deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return {
      success: false,
      errors: {
        form: "Failed to delete expense record.",
      },
    };
  }
}
