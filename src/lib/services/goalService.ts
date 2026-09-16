import { firestoreRepo } from "@/lib/firebase/firestore";
import type { Goal } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("goalService module must only be used on the server side.");
}

export interface CreateGoalPayload {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
}

export interface UpdateGoalPayload {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
}

/**
 * Fetches all financial goals for a specific user from Firestore under /users/{userId}/goals.
 * Sorted ascending by targetDate (if available), then createdAt.
 */
export async function getUserGoals(userId: string): Promise<Goal[]> {
  if (!userId) return [];

  const snap = await firestoreRepo.getUserGoalsCollection(userId).get();

  const goals: Goal[] = snap.docs.map((doc) => {
    const data = doc.data() as Omit<Goal, "id">;
    const goalName = data.name || data.title || "Savings Goal";
    return {
      id: doc.id,
      userId: data.userId || userId,
      name: goalName,
      title: goalName,
      targetAmount: Number(data.targetAmount) || 0,
      currentAmount: Number(data.currentAmount) || 0,
      targetDate: data.targetDate || undefined,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  });

  // Sort ascending by targetDate, then createdAt
  goals.sort((a, b) => {
    if (a.targetDate && b.targetDate) {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }
    if (a.targetDate) return -1;
    if (b.targetDate) return 1;
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });

  return goals;
}

/**
 * Fetches a single goal document by ID for a specific user under /users/{userId}/goals/{goalId}.
 */
export async function getGoalById(
  userId: string,
  goalId: string
): Promise<Goal | null> {
  if (!userId || !goalId) return null;

  const docSnap = await firestoreRepo
    .getUserGoalsCollection(userId)
    .doc(goalId)
    .get();

  if (!docSnap.exists) return null;

  const data = docSnap.data() as Omit<Goal, "id">;
  const goalName = data.name || data.title || "Savings Goal";

  return {
    id: docSnap.id,
    userId: data.userId || userId,
    name: goalName,
    title: goalName,
    targetAmount: Number(data.targetAmount) || 0,
    currentAmount: Number(data.currentAmount) || 0,
    targetDate: data.targetDate || undefined,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Creates a new goal document strictly under /users/{userId}/goals/{goalId}.
 */
export async function createGoal(
  userId: string,
  payload: CreateGoalPayload
): Promise<Goal> {
  if (!userId) throw new Error("User ID is required to create a goal.");
  if (!payload.name || payload.name.trim() === "") {
    throw new Error("Goal name is required.");
  }
  if (typeof payload.targetAmount !== "number" || payload.targetAmount <= 0) {
    throw new Error("Target amount must be a positive INR amount.");
  }

  const now = new Date().toISOString();
  const colRef = firestoreRepo.getUserGoalsCollection(userId);
  const docRef = colRef.doc();

  const initialCurrentAmount =
    typeof payload.currentAmount === "number" && payload.currentAmount >= 0
      ? payload.currentAmount
      : 0;

  const goalName = payload.name.trim();

  const newGoalData: Omit<Goal, "id"> = {
    userId,
    name: goalName,
    title: goalName,
    targetAmount: payload.targetAmount,
    currentAmount: initialCurrentAmount,
    ...(payload.targetDate && payload.targetDate.trim() !== ""
      ? { targetDate: payload.targetDate.trim() }
      : {}),
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(newGoalData as Goal);

  return {
    id: docRef.id,
    ...newGoalData,
  };
}

/**
 * Updates an existing goal document under /users/{userId}/goals/{goalId}.
 */
export async function updateGoal(
  userId: string,
  goalId: string,
  payload: UpdateGoalPayload
): Promise<Goal> {
  if (!userId || !goalId) {
    throw new Error("User ID and Goal ID are required to update a goal.");
  }

  const docRef = firestoreRepo.getUserGoalsCollection(userId).doc(goalId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error("Goal record not found.");
  }

  const existingData = docSnap.data() as Omit<Goal, "id">;
  const now = new Date().toISOString();

  const updateData: Partial<Omit<Goal, "id">> = {
    ...(payload.name !== undefined
      ? { name: payload.name.trim(), title: payload.name.trim() }
      : {}),
    ...(payload.targetAmount !== undefined ? { targetAmount: payload.targetAmount } : {}),
    ...(payload.currentAmount !== undefined ? { currentAmount: payload.currentAmount } : {}),
    ...(payload.targetDate !== undefined
      ? payload.targetDate.trim() === ""
        ? { targetDate: undefined }
        : { targetDate: payload.targetDate.trim() }
      : {}),
    updatedAt: now,
  };

  await docRef.update(updateData);

  const updatedSnap = await docRef.get();
  const updatedData = updatedSnap.data() as Omit<Goal, "id">;
  const updatedName = updatedData.name || updatedData.title || "Savings Goal";

  return {
    id: goalId,
    userId: updatedData.userId || userId,
    name: updatedName,
    title: updatedName,
    targetAmount: Number(updatedData.targetAmount) || 0,
    currentAmount: Number(updatedData.currentAmount) || 0,
    targetDate: updatedData.targetDate || undefined,
    createdAt: updatedData.createdAt || now,
    updatedAt: updatedData.updatedAt || now,
  };
}

/**
 * Deletes a goal document under /users/{userId}/goals/{goalId}.
 */
export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  if (!userId || !goalId) {
    throw new Error("User ID and Goal ID are required to delete a goal.");
  }

  const docRef = firestoreRepo.getUserGoalsCollection(userId).doc(goalId);
  await docRef.delete();
}

/**
 * Adds money contribution to a goal document under /users/{userId}/goals/{goalId}.
 */
export async function addContribution(
  userId: string,
  goalId: string,
  amount: number
): Promise<Goal> {
  if (!userId || !goalId) {
    throw new Error("User ID and Goal ID are required to add a contribution.");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Contribution amount must be a positive INR amount.");
  }

  const existingGoal = await getGoalById(userId, goalId);
  if (!existingGoal) {
    throw new Error("Goal record not found.");
  }

  const newCurrentAmount = (Number(existingGoal.currentAmount) || 0) + amount;

  return updateGoal(userId, goalId, {
    currentAmount: newCurrentAmount,
  });
}

/**
 * Removes money contribution from a goal document under /users/{userId}/goals/{goalId}.
 * Ensures contribution removal does not create negative currentAmount.
 */
export async function removeContribution(
  userId: string,
  goalId: string,
  amount: number
): Promise<Goal> {
  if (!userId || !goalId) {
    throw new Error("User ID and Goal ID are required to remove a contribution.");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Contribution removal amount must be a positive INR amount.");
  }

  const existingGoal = await getGoalById(userId, goalId);
  if (!existingGoal) {
    throw new Error("Goal record not found.");
  }

  const currentSaved = Number(existingGoal.currentAmount) || 0;
  if (currentSaved - amount < 0) {
    throw new Error(
      `Cannot remove ₹${amount}. Current saved balance is ₹${currentSaved}.`
    );
  }

  const newCurrentAmount = currentSaved - amount;

  return updateGoal(userId, goalId, {
    currentAmount: newCurrentAmount,
  });
}
