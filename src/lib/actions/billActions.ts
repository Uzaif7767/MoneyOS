"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createBill,
  updateBill,
  deleteBill,
  toggleBillPaidStatus,
} from "@/lib/services/billService";
import type { Bill, RecurrenceFrequency } from "@/types";

export interface BillFormErrors {
  title?: string;
  amount?: string;
  dueDate?: string;
  isRecurring?: string;
  frequency?: string;
  note?: string;
  form?: string;
}

export interface BillActionResult {
  success: boolean;
  errors?: BillFormErrors;
  bill?: Bill;
  message?: string;
}

function validateBillInputs(data: {
  title?: unknown;
  amount?: unknown;
  dueDate?: unknown;
  isRecurring?: unknown;
  frequency?: unknown;
  note?: unknown;
  isPaid?: unknown;
}): {
  errors: BillFormErrors;
  cleanPayload?: {
    title: string;
    amount: number;
    dueDate: string;
    isRecurring: boolean;
    frequency?: RecurrenceFrequency;
    note?: string;
    isPaid?: boolean;
  };
} {
  const errors: BillFormErrors = {};

  // 1. Validate Title / Name
  const titleStr = typeof data.title === "string" ? data.title.trim() : "";
  if (!titleStr) {
    errors.title = "Bill name / title is required.";
  } else if (titleStr.length > 100) {
    errors.title = "Bill title cannot exceed 100 characters.";
  }

  // 2. Validate Amount
  const amount = Number(data.amount);
  if (
    data.amount === undefined ||
    data.amount === null ||
    data.amount === ("" as unknown) ||
    isNaN(amount)
  ) {
    errors.amount = "Amount is required.";
  } else if (amount <= 0) {
    errors.amount = "Amount must be a positive number greater than ₹0.";
  }

  // 3. Validate Due Date
  const dueDateStr = typeof data.dueDate === "string" ? data.dueDate.trim() : "";
  if (!dueDateStr) {
    errors.dueDate = "Due date is required.";
  } else {
    const parsedDate = new Date(dueDateStr);
    if (isNaN(parsedDate.getTime())) {
      errors.dueDate = "Please provide a valid due date.";
    }
  }

  // 4. Validate Recurring (Explicitly required boolean)
  let isRecurringBool: boolean | undefined;
  if (typeof data.isRecurring === "boolean") {
    isRecurringBool = data.isRecurring;
  } else if (data.isRecurring === "true" || data.isRecurring === "yes") {
    isRecurringBool = true;
  } else if (data.isRecurring === "false" || data.isRecurring === "no") {
    isRecurringBool = false;
  }

  if (isRecurringBool === undefined) {
    errors.isRecurring = "Please select whether this bill is recurring (Yes or No).";
  }

  // 5. Validate Frequency (Required ONLY when recurring is enabled)
  let cleanFreq: RecurrenceFrequency | undefined = undefined;
  if (isRecurringBool === true) {
    const freqStr = typeof data.frequency === "string" ? data.frequency.toLowerCase().trim() : "";
    if (freqStr === "monthly") {
      cleanFreq = "monthly";
    } else if (freqStr === "yearly") {
      cleanFreq = "yearly";
    } else {
      errors.frequency = "Please select a valid recurrence frequency (Monthly or Yearly).";
    }
  }

  // 6. Validate Note
  const noteStr = typeof data.note === "string" ? data.note.trim() : "";
  if (noteStr.length > 500) {
    errors.note = "Note cannot exceed 500 characters.";
  }

  const isPaidBool = typeof data.isPaid === "boolean" ? data.isPaid : undefined;

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors: {},
    cleanPayload: {
      title: titleStr,
      amount,
      dueDate: dueDateStr,
      isRecurring: isRecurringBool!,
      frequency: cleanFreq,
      note: noteStr,
      isPaid: isPaidBool,
    },
  };
}

/**
 * Server action to create a new bill for the authenticated Clerk user.
 */
export async function createBillAction(rawData: unknown): Promise<BillActionResult> {
  // 1. Authenticate user server-side
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to add a bill.",
      },
    };
  }

  // 2. Validate input payload
  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Record<string, unknown>;
  const { errors, cleanPayload } = validateBillInputs(data);

  if (Object.keys(errors).length > 0 || !cleanPayload) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted errors.",
    };
  }

  // 3. Persist to Firestore
  try {
    const newBill = await createBill(clerkUserId, cleanPayload);

    revalidatePath("/protected/bills");
    revalidatePath("/protected");

    return {
      success: true,
      bill: newBill,
      message: "Bill created successfully!",
    };
  } catch (error) {
    console.error("Error creating bill:", error);
    return {
      success: false,
      errors: {
        form: "An unexpected server error occurred while adding your bill.",
      },
    };
  }
}

/**
 * Server action to update an existing bill for the authenticated Clerk user.
 */
export async function updateBillAction(
  billId: string,
  rawData: unknown
): Promise<BillActionResult> {
  // 1. Authenticate user server-side
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to edit a bill.",
      },
    };
  }

  if (!billId) {
    return {
      success: false,
      errors: {
        form: "Bill ID is required.",
      },
    };
  }

  // 2. Validate input payload
  const data = (rawData && typeof rawData === "object" ? rawData : {}) as Record<string, unknown>;
  const { errors, cleanPayload } = validateBillInputs(data);

  if (Object.keys(errors).length > 0 || !cleanPayload) {
    return {
      success: false,
      errors,
      message: "Please correct the highlighted errors.",
    };
  }

  // 3. Persist to Firestore
  try {
    const updatedBill = await updateBill(clerkUserId, billId, cleanPayload);

    revalidatePath("/protected/bills");
    revalidatePath("/protected");

    return {
      success: true,
      bill: updatedBill,
      message: "Bill updated successfully!",
    };
  } catch (error) {
    console.error("Error updating bill:", error);
    return {
      success: false,
      errors: {
        form: "An unexpected server error occurred while updating the bill.",
      },
    };
  }
}

/**
 * Server action to delete a bill for the authenticated Clerk user.
 */
export async function deleteBillAction(billId: string): Promise<BillActionResult> {
  // 1. Authenticate user server-side
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required. Please sign in to delete a bill.",
      },
    };
  }

  if (!billId) {
    return {
      success: false,
      errors: {
        form: "Bill ID is required for deletion.",
      },
    };
  }

  // 2. Delete from Firestore
  try {
    await deleteBill(clerkUserId, billId);

    revalidatePath("/protected/bills");
    revalidatePath("/protected");

    return {
      success: true,
      message: "Bill deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting bill:", error);
    return {
      success: false,
      errors: {
        form: "Failed to delete bill record.",
      },
    };
  }
}

/**
 * Server action to toggle paid status of a bill.
 */
export async function toggleBillPaidAction(
  billId: string,
  isPaid: boolean
): Promise<BillActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      errors: {
        form: "Authentication required.",
      },
    };
  }

  if (!billId) {
    return {
      success: false,
      errors: {
        form: "Bill ID is required.",
      },
    };
  }

  try {
    const updatedBill = await toggleBillPaidStatus(clerkUserId, billId, isPaid);

    revalidatePath("/protected/bills");
    revalidatePath("/protected");

    return {
      success: true,
      bill: updatedBill,
      message: isPaid ? "Bill marked as paid." : "Bill marked as pending.",
    };
  } catch (error) {
    console.error("Error toggling bill status:", error);
    return {
      success: false,
      errors: {
        form: "Failed to update bill status.",
      },
    };
  }
}
