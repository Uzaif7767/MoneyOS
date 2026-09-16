import { firestoreRepo } from "@/lib/firebase/firestore";
import type { Expense, ExpenseCategory } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("expenseService module must only be used on the server side.");
}

export interface CreateExpensePayload {
  amount: number;
  category: ExpenseCategory | string;
  date: string;
  note?: string;
}

export interface UpdateExpensePayload {
  amount?: number;
  category?: ExpenseCategory | string;
  date?: string;
  note?: string;
}

/**
 * Fetches all expenses for a specific user, sorted descending by date/createdAt.
 */
export async function getUserExpenses(userId: string): Promise<Expense[]> {
  if (!userId) return [];

  const snap = await firestoreRepo.getUserExpensesCollection(userId).get();

  const expenses: Expense[] = snap.docs.map((doc) => {
    const data = doc.data() as Omit<Expense, "id">;
    const noteVal = data.note || data.notes || "";
    const titleVal = data.title || noteVal || data.category || "Expense";

    return {
      id: doc.id,
      userId: data.userId || userId,
      amount: Number(data.amount) || 0,
      category: data.category || "Other",
      date: data.date || new Date().toISOString().split("T")[0],
      note: noteVal,
      notes: noteVal,
      title: titleVal,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  });

  // Sort descending by date, then by createdAt
  expenses.sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt).getTime();
    const timeB = new Date(b.date || b.createdAt).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return expenses;
}

/**
 * Fetches a single expense document by ID for a specific user.
 */
export async function getExpenseById(
  userId: string,
  expenseId: string
): Promise<Expense | null> {
  if (!userId || !expenseId) return null;

  const docSnap = await firestoreRepo
    .getUserExpensesCollection(userId)
    .doc(expenseId)
    .get();

  if (!docSnap.exists) return null;

  const data = docSnap.data() as Omit<Expense, "id">;
  const noteVal = data.note || data.notes || "";
  const titleVal = data.title || noteVal || data.category || "Expense";

  return {
    id: docSnap.id,
    userId: data.userId || userId,
    amount: Number(data.amount) || 0,
    category: data.category || "Other",
    date: data.date || new Date().toISOString().split("T")[0],
    note: noteVal,
    notes: noteVal,
    title: titleVal,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Creates a new expense under /users/{userId}/expenses/{expenseId}
 */
export async function createExpense(
  userId: string,
  payload: CreateExpensePayload
): Promise<Expense> {
  if (!userId) throw new Error("User ID is required to create an expense.");

  const now = new Date().toISOString();
  const noteVal = payload.note?.trim() || "";
  const titleVal = noteVal || payload.category;

  const colRef = firestoreRepo.getUserExpensesCollection(userId);
  const docRef = colRef.doc();

  const newExpenseData: Omit<Expense, "id"> = {
    userId,
    amount: payload.amount,
    category: payload.category,
    date: payload.date,
    note: noteVal,
    notes: noteVal,
    title: titleVal,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(newExpenseData as Expense);

  return {
    id: docRef.id,
    ...newExpenseData,
  };
}

/**
 * Updates an existing expense doc under /users/{userId}/expenses/{expenseId}
 */
export async function updateExpense(
  userId: string,
  expenseId: string,
  payload: UpdateExpensePayload
): Promise<Expense> {
  if (!userId || !expenseId) {
    throw new Error("User ID and Expense ID are required to update an expense.");
  }

  const docRef = firestoreRepo.getUserExpensesCollection(userId).doc(expenseId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Expense record not found.");
  }

  const existingData = docSnap.data() as Omit<Expense, "id">;
  const now = new Date().toISOString();

  const noteVal = payload.note !== undefined ? payload.note.trim() : existingData.note || existingData.notes || "";
  const categoryVal = payload.category !== undefined ? payload.category : existingData.category;
  const titleVal = noteVal || categoryVal;

  const updateData: Partial<Omit<Expense, "id">> = {
    ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
    ...(payload.category !== undefined ? { category: payload.category } : {}),
    ...(payload.date !== undefined ? { date: payload.date } : {}),
    note: noteVal,
    notes: noteVal,
    title: titleVal,
    updatedAt: now,
  };

  await docRef.update(updateData);

  const updatedSnap = await docRef.get();
  const updatedData = updatedSnap.data() as Omit<Expense, "id">;

  return {
    id: expenseId,
    ...updatedData,
  };
}

/**
 * Deletes an expense doc under /users/{userId}/expenses/{expenseId}
 */
export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  if (!userId || !expenseId) {
    throw new Error("User ID and Expense ID are required to delete an expense.");
  }

  const docRef = firestoreRepo.getUserExpensesCollection(userId).doc(expenseId);
  await docRef.delete();
}
