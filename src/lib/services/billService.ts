import { firestoreRepo } from "@/lib/firebase/firestore";
import type { Bill, RecurrenceFrequency } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("billService module must only be used on the server side.");
}

export interface CreateBillPayload {
  title: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  frequency?: RecurrenceFrequency;
  note?: string;
  isPaid?: boolean;
}

export interface UpdateBillPayload {
  title?: string;
  amount?: number;
  dueDate?: string;
  isRecurring?: boolean;
  frequency?: RecurrenceFrequency;
  note?: string;
  isPaid?: boolean;
}

/**
 * Fetches all bills for a specific user, sorted ascending by due date.
 */
export async function getUserBills(userId: string): Promise<Bill[]> {
  if (!userId) return [];

  const snap = await firestoreRepo.getUserBillsCollection(userId).get();

  const bills: Bill[] = snap.docs.map((doc) => {
    const data = doc.data() as Omit<Bill, "id">;
    return {
      id: doc.id,
      userId: data.userId || userId,
      title: data.title || "Bill",
      amount: Number(data.amount) || 0,
      dueDate: data.dueDate || new Date().toISOString().split("T")[0],
      isRecurring: Boolean(data.isRecurring),
      frequency: data.frequency,
      note: data.note || "",
      isPaid: Boolean(data.isPaid),
      category: data.category || "Bills",
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  });

  // Sort ascending by dueDate, then createdAt
  bills.sort((a, b) => {
    const timeA = new Date(a.dueDate || 0).getTime();
    const timeB = new Date(b.dueDate || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });

  return bills;
}

/**
 * Fetches a single bill document by ID for a specific user.
 */
export async function getBillById(
  userId: string,
  billId: string
): Promise<Bill | null> {
  if (!userId || !billId) return null;

  const docSnap = await firestoreRepo
    .getUserBillsCollection(userId)
    .doc(billId)
    .get();

  if (!docSnap.exists) return null;

  const data = docSnap.data() as Omit<Bill, "id">;
  return {
    id: docSnap.id,
    userId: data.userId || userId,
    title: data.title || "Bill",
    amount: Number(data.amount) || 0,
    dueDate: data.dueDate || new Date().toISOString().split("T")[0],
    isRecurring: Boolean(data.isRecurring),
    frequency: data.frequency,
    note: data.note || "",
    isPaid: Boolean(data.isPaid),
    category: data.category || "Bills",
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Creates a new bill document under /users/{userId}/bills/{billId}
 */
export async function createBill(
  userId: string,
  payload: CreateBillPayload
): Promise<Bill> {
  if (!userId) throw new Error("User ID is required to create a bill.");

  const now = new Date().toISOString();
  const colRef = firestoreRepo.getUserBillsCollection(userId);
  const docRef = colRef.doc();

  const newBillData: Omit<Bill, "id"> = {
    userId,
    title: payload.title.trim(),
    amount: payload.amount,
    dueDate: payload.dueDate,
    isRecurring: payload.isRecurring,
    ...(payload.isRecurring && payload.frequency ? { frequency: payload.frequency } : {}),
    note: payload.note?.trim() || "",
    isPaid: payload.isPaid ?? false,
    category: "Bills",
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(newBillData as Bill);

  return {
    id: docRef.id,
    ...newBillData,
  };
}

/**
 * Updates an existing bill doc under /users/{userId}/bills/{billId}
 */
export async function updateBill(
  userId: string,
  billId: string,
  payload: UpdateBillPayload
): Promise<Bill> {
  if (!userId || !billId) {
    throw new Error("User ID and Bill ID are required to update a bill.");
  }

  const docRef = firestoreRepo.getUserBillsCollection(userId).doc(billId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Bill record not found.");
  }

  const existingData = docSnap.data() as Omit<Bill, "id">;
  const now = new Date().toISOString();

  const isRecurring =
    payload.isRecurring !== undefined ? payload.isRecurring : existingData.isRecurring;

  const updateData: Partial<Omit<Bill, "id">> = {
    ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
    ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
    ...(payload.dueDate !== undefined ? { dueDate: payload.dueDate } : {}),
    isRecurring,
    ...(isRecurring
      ? { frequency: payload.frequency !== undefined ? payload.frequency : existingData.frequency }
      : { frequency: undefined }),
    ...(payload.note !== undefined ? { note: payload.note.trim() } : {}),
    ...(payload.isPaid !== undefined ? { isPaid: payload.isPaid } : {}),
    updatedAt: now,
  };

  await docRef.update(updateData);

  const updatedSnap = await docRef.get();
  const updatedData = updatedSnap.data() as Omit<Bill, "id">;

  return {
    id: billId,
    ...updatedData,
  };
}

/**
 * Deletes a bill doc under /users/{userId}/bills/{billId}
 */
export async function deleteBill(userId: string, billId: string): Promise<void> {
  if (!userId || !billId) {
    throw new Error("User ID and Bill ID are required to delete a bill.");
  }

  const docRef = firestoreRepo.getUserBillsCollection(userId).doc(billId);
  await docRef.delete();
}

/**
 * Toggles paid status for a bill under /users/{userId}/bills/{billId}
 */
export async function toggleBillPaidStatus(
  userId: string,
  billId: string,
  isPaid: boolean
): Promise<Bill> {
  return updateBill(userId, billId, { isPaid });
}
