"use server";

import { auth } from "@clerk/nextjs/server";
import {
  getPlannerPlan,
  savePlannerPlan,
  getPlannerPlanHistory,
  getPlannerPlanVersion,
  type SavePlannerPlanPayload,
} from "@/lib/services/plannerPlanService";
import type { PlannerPlan, PlannerPlanVersion } from "@/types";

export interface GetPlannerPlanActionResult {
  success: boolean;
  plan?: PlannerPlan | null;
  error?: string;
}

export interface SavePlannerPlanActionResult {
  success: boolean;
  plan?: PlannerPlan;
  version?: PlannerPlanVersion;
  error?: string;
}

export interface GetPlannerPlanHistoryActionResult {
  success: boolean;
  history?: PlannerPlanVersion[];
  error?: string;
}

export interface GetPlannerPlanVersionActionResult {
  success: boolean;
  version?: PlannerPlanVersion | null;
  error?: string;
}


/**
 * Server action to fetch the saved persistent planner plan for a given month.
 */
export async function getPlannerPlanAction(
  planningMonthId: string
): Promise<GetPlannerPlanActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to fetch saved plan.",
    };
  }

  if (!planningMonthId || typeof planningMonthId !== "string" || !planningMonthId.trim()) {
    return {
      success: false,
      error: "Valid planning month context is required.",
    };
  }

  const cleanMonthId = planningMonthId.trim();

  try {
    const plan = await getPlannerPlan(clerkUserId, cleanMonthId);
    return {
      success: true,
      plan,
    };
  } catch (error) {
    console.error("Error in getPlannerPlanAction:", error);
    return {
      success: false,
      error: "Failed to load saved planner plan.",
    };
  }
}

/**
 * Server action to save an approved planner plan persistently and record an immutable version snapshot.
 */
export async function savePlannerPlanAction(
  planningMonthId: string,
  payload: SavePlannerPlanPayload
): Promise<SavePlannerPlanActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to save plan.",
    };
  }

  if (!planningMonthId || typeof planningMonthId !== "string" || !planningMonthId.trim()) {
    return {
      success: false,
      error: "Valid planning month context is required.",
    };
  }

  if (!payload || payload.status !== "approved") {
    return {
      success: false,
      error: "Only explicitly approved plans can be saved. Please approve your plan first.",
    };
  }

  const cleanMonthId = planningMonthId.trim();

  try {
    const result = await savePlannerPlan(clerkUserId, cleanMonthId, payload);
    return {
      success: true,
      plan: result.plan,
      version: result.version,
    };
  } catch (error) {
    console.error("Error in savePlannerPlanAction:", error);
    return {
      success: false,
      error: "Failed to save planner plan to Firestore. Please try again.",
    };
  }
}

/**
 * Server action to fetch the plan version history for a given planning month.
 */
export async function getPlannerPlanHistoryAction(
  planningMonthId: string
): Promise<GetPlannerPlanHistoryActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to view plan history.",
    };
  }

  if (!planningMonthId || typeof planningMonthId !== "string" || !planningMonthId.trim()) {
    return {
      success: false,
      error: "Valid planning month context is required.",
    };
  }

  const cleanMonthId = planningMonthId.trim();

  try {
    const history = await getPlannerPlanHistory(clerkUserId, cleanMonthId);
    return {
      success: true,
      history,
    };
  } catch (error) {
    console.error("Error in getPlannerPlanHistoryAction:", error);
    return {
      success: false,
      error: "Failed to load planner plan history.",
    };
  }
}

/**
 * Server action to fetch a specific plan version document for a given planning month and version ID.
 */
export async function getPlannerPlanVersionAction(
  planningMonthId: string,
  versionId: string
): Promise<GetPlannerPlanVersionActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return {
      success: false,
      error: "Authentication required. Please sign in to load plan version.",
    };
  }

  if (!planningMonthId || typeof planningMonthId !== "string" || !planningMonthId.trim()) {
    return {
      success: false,
      error: "Valid planning month context is required.",
    };
  }

  if (!versionId || typeof versionId !== "string" || !versionId.trim()) {
    return {
      success: false,
      error: "Valid version ID is required.",
    };
  }

  const cleanMonthId = planningMonthId.trim();
  const cleanVersionId = versionId.trim();

  try {
    const version = await getPlannerPlanVersion(clerkUserId, cleanMonthId, cleanVersionId);
    return {
      success: true,
      version,
    };
  } catch (error) {
    console.error("Error in getPlannerPlanVersionAction:", error);
    return {
      success: false,
      error: "Failed to load specified planner plan version.",
    };
  }
}

