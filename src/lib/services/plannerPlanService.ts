import { firestoreRepo } from "@/lib/firebase/firestore";
import type { PlannerPlan, PlannerPlanVersion, PlannerPlanStatus } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("plannerPlanService module must only be used on the server side.");
}

export interface SavePlannerPlanPayload {
  status: PlannerPlanStatus;
  approvedAt?: string;
  source: "ai_generated" | "edited";
  plannedMonthlyIncome: number;
  proposal: unknown;
  recalculatedSummary: unknown;
}

/**
 * Fetches the saved planner plan document for a user and month.
 */
export async function getPlannerPlan(
  userId: string,
  planningMonthId: string
): Promise<PlannerPlan | null> {
  if (!userId || !planningMonthId) return null;

  const docSnap = await firestoreRepo
    .getUserPlannerPlanDoc(userId, planningMonthId)
    .get();

  if (!docSnap.exists) {
    return null;
  }

  const data = docSnap.data() as Omit<PlannerPlan, "id">;

  return {
    id: docSnap.id,
    userId: data.userId || userId,
    planningMonthId: data.planningMonthId || planningMonthId,
    planningMonth: data.planningMonth || planningMonthId,
    status: data.status || "draft",
    version: Number(data.version) || 1,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    approvedAt: data.approvedAt,
    source: data.source || "ai_generated",
    plannedMonthlyIncome: Number(data.plannedMonthlyIncome) || 0,
    proposal: data.proposal,
    recalculatedSummary: data.recalculatedSummary,
  };
}

/**
 * Saves an approved planner plan as a persistent document and appends an immutable version history record.
 */
export async function savePlannerPlan(
  userId: string,
  planningMonthId: string,
  payload: SavePlannerPlanPayload
): Promise<{ plan: PlannerPlan; version: PlannerPlanVersion }> {
  if (!userId || !planningMonthId) {
    throw new Error("User ID and Planning Month ID are required to save a planner plan.");
  }

  const docRef = firestoreRepo.getUserPlannerPlanDoc(userId, planningMonthId);
  const docSnap = await docRef.get();
  const now = new Date().toISOString();

  let nextVersion = 1;
  let createdAt = now;

  if (docSnap.exists) {
    const existing = docSnap.data();
    if (existing) {
      nextVersion = (Number(existing.version) || 0) + 1;
      createdAt = existing.createdAt || now;
    }
  }

  const planData: Omit<PlannerPlan, "id"> = {
    userId,
    planningMonthId,
    planningMonth: planningMonthId,
    status: payload.status,
    version: nextVersion,
    createdAt,
    updatedAt: now,
    approvedAt: payload.approvedAt || now,
    source: payload.source,
    plannedMonthlyIncome: payload.plannedMonthlyIncome,
    proposal: payload.proposal,
    recalculatedSummary: payload.recalculatedSummary,
  };

  // 1. Write the main plannerPlan document
  await docRef.set(planData as PlannerPlan, { merge: true });

  const savedPlan: PlannerPlan = {
    id: planningMonthId,
    ...planData,
  };

  // 2. Extract key metrics for history display
  const recap = (payload.recalculatedSummary as Record<string, unknown>) || {};
  const totalSpending = Number(recap.totalProposedSpending) || 0;
  const totalSavings = Number(recap.totalProposedSavings) || 0;
  const safetyBuffer = Number(recap.totalProposedSafetyBuffer) || 0;
  const remainingMoney = Number(recap.recalculatedRemainingMoney) || 0;
  const isAffordable = typeof recap.isAffordable === "boolean" ? recap.isAffordable : remainingMoney >= 0;

  // 3. Write immutable version history snapshot in subcollection
  const versionId = `v${nextVersion}`;
  const versionDocRef = firestoreRepo.getUserPlannerPlanVersionDoc(userId, planningMonthId, versionId);

  const versionData: Omit<PlannerPlanVersion, "id"> = {
    userId,
    planningMonthId,
    version: nextVersion,
    status: payload.status,
    approvedAt: payload.approvedAt || now,
    savedAt: now,
    createdAt,
    updatedAt: now,
    source: payload.source,
    plannedMonthlyIncome: payload.plannedMonthlyIncome,
    totalSpending,
    totalSavings,
    safetyBuffer,
    remainingMoney,
    isAffordable,
    proposal: payload.proposal,
    recalculatedSummary: payload.recalculatedSummary,
  };

  await versionDocRef.set(versionData as PlannerPlanVersion);

  const savedVersion: PlannerPlanVersion = {
    id: versionId,
    ...versionData,
  };

  return { plan: savedPlan, version: savedVersion };
}

/**
 * Retrieves plan version history for a specific planning month ordered by version descending.
 */
export async function getPlannerPlanHistory(
  userId: string,
  planningMonthId: string
): Promise<PlannerPlanVersion[]> {
  if (!userId || !planningMonthId) return [];

  const querySnap = await firestoreRepo
    .getUserPlannerPlanVersionsCollection(userId, planningMonthId)
    .orderBy("version", "desc")
    .get();

  if (querySnap.empty) {
    return [];
  }

  return querySnap.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId || userId,
      planningMonthId: data.planningMonthId || planningMonthId,
      version: Number(data.version) || 1,
      status: data.status || "approved",
      approvedAt: data.approvedAt,
      savedAt: data.savedAt || data.updatedAt || new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      source: data.source || "edited",
      plannedMonthlyIncome: Number(data.plannedMonthlyIncome) || 0,
      totalSpending: Number(data.totalSpending) || 0,
      totalSavings: Number(data.totalSavings) || 0,
      safetyBuffer: Number(data.safetyBuffer) || 0,
      remainingMoney: Number(data.remainingMoney) || 0,
      isAffordable: typeof data.isAffordable === "boolean" ? data.isAffordable : true,
      proposal: data.proposal,
      recalculatedSummary: data.recalculatedSummary,
    };
  });
}

/**
 * Retrieves a specific saved plan version document for a user, planning month, and versionId.
 */
export async function getPlannerPlanVersion(
  userId: string,
  planningMonthId: string,
  versionId: string
): Promise<PlannerPlanVersion | null> {
  if (!userId || !planningMonthId || !versionId) return null;

  const docSnap = await firestoreRepo
    .getUserPlannerPlanVersionDoc(userId, planningMonthId, versionId)
    .get();

  if (!docSnap.exists) {
    return null;
  }

  const data = docSnap.data();
  if (!data) return null;

  return {
    id: docSnap.id,
    userId: data.userId || userId,
    planningMonthId: data.planningMonthId || planningMonthId,
    version: Number(data.version) || 1,
    status: data.status || "approved",
    approvedAt: data.approvedAt,
    savedAt: data.savedAt || data.updatedAt || new Date().toISOString(),
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    source: data.source || "edited",
    plannedMonthlyIncome: Number(data.plannedMonthlyIncome) || 0,
    totalSpending: Number(data.totalSpending) || 0,
    totalSavings: Number(data.totalSavings) || 0,
    safetyBuffer: Number(data.safetyBuffer) || 0,
    remainingMoney: Number(data.remainingMoney) || 0,
    isAffordable: typeof data.isAffordable === "boolean" ? data.isAffordable : true,
    proposal: data.proposal,
    recalculatedSummary: data.recalculatedSummary,
  };
}

