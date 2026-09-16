import { firestoreRepo } from "@/lib/firebase/firestore";
import type { PlannerDraft } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("plannerService module must only be used on the server side.");
}

export type SavePlannerDraftPayload = Omit<
  PlannerDraft,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

/**
 * Fetches a saved planner draft for a specific user and month (e.g. "2026-10") from Firestore.
 */
export async function getPlannerDraft(
  userId: string,
  planningMonthId: string
): Promise<PlannerDraft | null> {
  if (!userId || !planningMonthId) return null;

  const docSnap = await firestoreRepo
    .getUserPlannerDraftDoc(userId, planningMonthId)
    .get();

  if (!docSnap.exists) {
    return null;
  }

  const data = docSnap.data() as Omit<PlannerDraft, "id">;

  return {
    id: docSnap.id,
    userId: data.userId || userId,
    planningMonth: data.planningMonth || planningMonthId,
    monthlyIncome: Number(data.monthlyIncome) || 0,
    currentBalance: Number(data.currentBalance) || 0,
    expectedIncomeDate: data.expectedIncomeDate || "",
    fixedExpenses: Array.isArray(data.fixedExpenses) ? data.fixedExpenses : [],
    plannedBills: Array.isArray(data.plannedBills) ? data.plannedBills : [],
    subscriptions: Array.isArray(data.subscriptions) ? data.subscriptions : [],
    foodAndDailyLiving: Number(data.foodAndDailyLiving) || 0,
    transport: Number(data.transport) || 0,
    housing: Number(data.housing) || 0,
    familyPersonal: Number(data.familyPersonal) || 0,
    debtEmi: Array.isArray(data.debtEmi) ? data.debtEmi : [],
    lifestyleDiscretionary: Number(data.lifestyleDiscretionary) || 0,
    oneTimeExpenses: Array.isArray(data.oneTimeExpenses) ? data.oneTimeExpenses : [],
    savingsGoalAmount: Number(data.savingsGoalAmount) || 0,
    safetyBuffer: Number(data.safetyBuffer) || 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

/**
 * Creates or updates a planner draft in Firestore under /users/{userId}/plannerDrafts/{planningMonthId}
 */
export async function savePlannerDraft(
  userId: string,
  planningMonthId: string,
  payload: SavePlannerDraftPayload
): Promise<PlannerDraft> {
  if (!userId || !planningMonthId) {
    throw new Error("User ID and Planning Month ID are required to save a planner draft.");
  }

  const docRef = firestoreRepo.getUserPlannerDraftDoc(userId, planningMonthId);
  const docSnap = await docRef.get();
  const now = new Date().toISOString();

  const draftData: Omit<PlannerDraft, "id"> = {
    userId,
    planningMonth: payload.planningMonth || planningMonthId,
    monthlyIncome: payload.monthlyIncome,
    currentBalance: payload.currentBalance,
    expectedIncomeDate: payload.expectedIncomeDate,
    fixedExpenses: payload.fixedExpenses,
    plannedBills: payload.plannedBills,
    subscriptions: payload.subscriptions,
    foodAndDailyLiving: payload.foodAndDailyLiving,
    transport: payload.transport,
    housing: payload.housing,
    familyPersonal: payload.familyPersonal,
    debtEmi: payload.debtEmi,
    lifestyleDiscretionary: payload.lifestyleDiscretionary,
    oneTimeExpenses: payload.oneTimeExpenses,
    savingsGoalAmount: payload.savingsGoalAmount,
    safetyBuffer: payload.safetyBuffer,
    createdAt: docSnap.exists ? (docSnap.data()?.createdAt || now) : now,
    updatedAt: now,
  };

  await docRef.set(draftData as PlannerDraft, { merge: true });

  return {
    id: planningMonthId,
    ...draftData,
  };
}
