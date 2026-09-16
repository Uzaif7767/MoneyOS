import { currentUser } from "@clerk/nextjs/server";
import { firestoreRepo } from "@/lib/firebase/firestore";
import type { UserProfile, OnboardingData, Goal } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("userService module must only be used on the server side.");
}

/**
 * Securely synchronizes the authenticated Clerk user profile into Firestore at /users/{clerkUserId}
 */
export async function syncUserProfile(): Promise<UserProfile | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const clerkUserId = clerkUser.id;
  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    "";

  const displayName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    "";

  const userDocRef = firestoreRepo.getUserDoc(clerkUserId);
  const snapshot = await userDocRef.get();
  const now = new Date().toISOString();

  if (!snapshot.exists) {
    const newProfile: UserProfile = {
      id: clerkUserId,
      clerkUserId,
      email: primaryEmail,
      displayName,
      hasCompletedOnboarding: false,
      createdAt: now,
      updatedAt: now,
    };
    await userDocRef.set(newProfile);
    return newProfile;
  }

  const existingData = snapshot.data();
  const updatedFields: Partial<UserProfile> = {
    updatedAt: now,
  };

  if (primaryEmail && existingData?.email !== primaryEmail) {
    updatedFields.email = primaryEmail;
  }
  if (displayName && existingData?.displayName !== displayName) {
    updatedFields.displayName = displayName;
  }

  await userDocRef.update(updatedFields);

  return {
    ...(existingData as UserProfile),
    ...updatedFields,
  };
}

/**
 * Saves onboarding financial profile to Firestore at /users/{clerkUserId}
 * and optionally creates the first savings goal document.
 */
export async function saveOnboardingProfile(
  clerkUserId: string,
  data: OnboardingData
): Promise<void> {
  const userDocRef = firestoreRepo.getUserDoc(clerkUserId);
  const now = new Date().toISOString();

  const profileUpdate: Partial<UserProfile> = {
    monthlyIncome: data.monthlyIncome,
    currentBalance: data.currentBalance,
    nextIncomeDate: data.nextIncomeDate,
    safetyBuffer: data.safetyBuffer,
    hasCompletedOnboarding: true,
    onboardingCompletedAt: now,
    updatedAt: now,
  };

  await userDocRef.set(profileUpdate as UserProfile, { merge: true });

  // If an optional first savings goal is provided, write it to /users/{clerkUserId}/goals
  if (data.goalTitle && data.goalTitle.trim().length > 0 && data.goalTargetAmount && data.goalTargetAmount > 0) {
    const goalsCol = firestoreRepo.getUserGoalsCollection(clerkUserId);
    const newGoalDoc = goalsCol.doc();
    
    const goalData: Goal = {
      id: newGoalDoc.id,
      userId: clerkUserId,
      name: data.goalTitle.trim(),
      title: data.goalTitle.trim(),
      targetAmount: Number(data.goalTargetAmount),
      currentAmount: 0,
      ...(data.goalTargetDate ? { targetDate: data.goalTargetDate } : {}),
      createdAt: now,
      updatedAt: now,
    };

    await newGoalDoc.set(goalData);
  }
}

/**
 * Reads the UserProfile for a given Clerk user ID from Firestore.
 */
export async function getUserProfile(clerkUserId: string): Promise<UserProfile | null> {
  const userDocRef = firestoreRepo.getUserDoc(clerkUserId);
  const snapshot = await userDocRef.get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as UserProfile;
}

/**
 * Updates financial settings (monthly income, current balance, next income date, safety buffer)
 * for the given Clerk user ID in Firestore at /users/{clerkUserId}.
 */
export async function updateFinancialSettings(
  clerkUserId: string,
  settings: {
    monthlyIncome: number;
    currentBalance: number;
    nextIncomeDate: string;
    safetyBuffer: number;
  }
): Promise<UserProfile> {
  const userDocRef = firestoreRepo.getUserDoc(clerkUserId);
  const now = new Date().toISOString();

  const updatePayload: Partial<UserProfile> = {
    monthlyIncome: settings.monthlyIncome,
    currentBalance: settings.currentBalance,
    nextIncomeDate: settings.nextIncomeDate,
    safetyBuffer: settings.safetyBuffer,
    updatedAt: now,
  };

  await userDocRef.set(updatePayload as UserProfile, { merge: true });

  const updatedSnap = await userDocRef.get();
  return updatedSnap.data() as UserProfile;
}

