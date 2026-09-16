import { getFirestore, type Firestore, type CollectionReference, type DocumentReference } from "firebase-admin/firestore";
import { adminApp } from "./admin";
import type { UserProfile, Expense, Bill, Goal, UserSettings, PlannerDraft, PlannerPlan, PlannerPlanVersion } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("Firestore Admin module must only be used in a server-side environment.");
}

// Global server-only Firestore database instance
export const db: Firestore = getFirestore(adminApp);

// Reusable server-only data access layer scoped by Clerk User ID
export const firestoreRepo = {
  /**
   * User profile document reference: /users/{userId}
   */
  getUserDoc(userId: string): DocumentReference<UserProfile> {
    return db.collection("users").doc(userId) as DocumentReference<UserProfile>;
  },

  /**
   * User expenses sub-collection reference: /users/{userId}/expenses
   */
  getUserExpensesCollection(userId: string): CollectionReference<Expense> {
    return db
      .collection("users")
      .doc(userId)
      .collection("expenses") as CollectionReference<Expense>;
  },

  /**
   * User bills sub-collection reference: /users/{userId}/bills
   */
  getUserBillsCollection(userId: string): CollectionReference<Bill> {
    return db
      .collection("users")
      .doc(userId)
      .collection("bills") as CollectionReference<Bill>;
  },

  /**
   * User goals sub-collection reference: /users/{userId}/goals
   */
  getUserGoalsCollection(userId: string): CollectionReference<Goal> {
    return db
      .collection("users")
      .doc(userId)
      .collection("goals") as CollectionReference<Goal>;
  },

  /**
   * User settings document reference: /users/{userId}/settings/config
   */
  getUserSettingsDoc(userId: string): DocumentReference<UserSettings> {
    return db
      .collection("users")
      .doc(userId)
      .collection("settings")
      .doc("config") as DocumentReference<UserSettings>;
  },

  /**
   * User planner draft document reference: /users/{userId}/plannerDrafts/{planningMonthId}
   */
  getUserPlannerDraftDoc(userId: string, planningMonthId: string): DocumentReference<PlannerDraft> {
    return db
      .collection("users")
      .doc(userId)
      .collection("plannerDrafts")
      .doc(planningMonthId) as DocumentReference<PlannerDraft>;
  },

  /**
   * User planner drafts collection reference: /users/{userId}/plannerDrafts
   */
  getUserPlannerDraftsCollection(userId: string): CollectionReference<PlannerDraft> {
    return db
      .collection("users")
      .doc(userId)
      .collection("plannerDrafts") as CollectionReference<PlannerDraft>;
  },

  /**
   * User persistent planner plan document reference: /users/{userId}/plannerPlans/{planningMonthId}
   */
  getUserPlannerPlanDoc(userId: string, planningMonthId: string): DocumentReference<PlannerPlan> {
    return db
      .collection("users")
      .doc(userId)
      .collection("plannerPlans")
      .doc(planningMonthId) as DocumentReference<PlannerPlan>;
  },

  /**
   * User persistent planner plans collection reference: /users/{userId}/plannerPlans
   */
  getUserPlannerPlansCollection(userId: string): CollectionReference<PlannerPlan> {
    return db
      .collection("users")
      .doc(userId)
      .collection("plannerPlans") as CollectionReference<PlannerPlan>;
  },

  /**
   * User planner plan version history sub-collection reference: /users/{userId}/plannerPlans/{planningMonthId}/versions
   */
  getUserPlannerPlanVersionsCollection(userId: string, planningMonthId: string): CollectionReference<PlannerPlanVersion> {
    return db
      .collection("users")
      .doc(userId)
      .collection("plannerPlans")
      .doc(planningMonthId)
      .collection("versions") as CollectionReference<PlannerPlanVersion>;
  },

  /**
   * User planner plan specific version document reference: /users/{userId}/plannerPlans/{planningMonthId}/versions/{versionId}
   */
  getUserPlannerPlanVersionDoc(userId: string, planningMonthId: string, versionId: string): DocumentReference<PlannerPlanVersion> {
    return db
      .collection("users")
      .doc(userId)
      .collection("plannerPlans")
      .doc(planningMonthId)
      .collection("versions")
      .doc(versionId) as DocumentReference<PlannerPlanVersion>;
  },
};


