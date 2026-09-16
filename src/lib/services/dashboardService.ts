import { currentUser } from "@clerk/nextjs/server";
import { firestoreRepo } from "@/lib/firebase/firestore";
import type { UserProfile, Expense, Bill, Goal } from "@/types";

if (typeof window !== "undefined") {
  throw new Error("dashboardService module must only be used on the server side.");
}

export interface DashboardData {
  userProfile: UserProfile | null;
  expenses: Expense[];
  bills: Bill[];
  goals: Goal[];
  totalSpending: number;
  upcomingBillsTotal: number;
  goalAllocationTotal: number;
  safeToSpendPool: number | null;
  dailySafeSpend: number | null;
  daysUntilNextIncome: number | null;
}

/**
 * Reads all financial data for the authenticated Clerk user from Firestore server-side.
 * Computes the MoneyOS locked Safe-to-Spend formula strictly when required real user profile data exists:
 * 
 * Safe-to-Spend Pool = Current Balance - Upcoming Bills - Goal Allocation - Safety Buffer
 * Daily Safe Spend = Safe-to-Spend Pool ÷ Days until Next Income
 */
export async function getDashboardData(): Promise<DashboardData> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return {
      userProfile: null,
      expenses: [],
      bills: [],
      goals: [],
      totalSpending: 0,
      upcomingBillsTotal: 0,
      goalAllocationTotal: 0,
      safeToSpendPool: null,
      dailySafeSpend: null,
      daysUntilNextIncome: null,
    };
  }

  const userId = clerkUser.id;

  // 1. Fetch User Profile
  const userDocSnap = await firestoreRepo.getUserDoc(userId).get();
  const userProfile = userDocSnap.exists ? (userDocSnap.data() as UserProfile) : null;

  // 2. Fetch Expenses
  const expensesSnap = await firestoreRepo.getUserExpensesCollection(userId).get();
  const expenses: Expense[] = expensesSnap.docs.map((doc) => {
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

  // Sort expenses descending by date / createdAt
  expenses.sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt || 0).getTime();
    const timeB = new Date(b.date || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const totalSpending = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

  // 3. Fetch Bills
  const billsSnap = await firestoreRepo.getUserBillsCollection(userId).get();
  const bills: Bill[] = billsSnap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Bill, "id">),
  }));

  // Sort bills by dueDate ascending
  bills.sort((a, b) => {
    const timeA = new Date(a.dueDate || 0).getTime();
    const timeB = new Date(b.dueDate || 0).getTime();
    return timeA - timeB;
  });

  // Calculate upcoming (unpaid) bills total
  const upcomingBillsTotal = bills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  // 4. Fetch Goals
  const goalsSnap = await firestoreRepo.getUserGoalsCollection(userId).get();
  const goals: Goal[] = goalsSnap.docs.map((doc) => {
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

  // Calculate total goal allocation (sum of currentAmount saved in goals)
  const goalAllocationTotal = goals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);

  // 5. MoneyOS Locked Safe-to-Spend Formula Calculation
  let safeToSpendPool: number | null = null;
  let dailySafeSpend: number | null = null;
  let daysUntilNextIncome: number | null = null;

  if (
    userProfile &&
    typeof userProfile.currentBalance === "number" &&
    typeof userProfile.safetyBuffer === "number" &&
    userProfile.nextIncomeDate &&
    userProfile.nextIncomeDate.trim() !== ""
  ) {
    const currentBalance = userProfile.currentBalance;
    const safetyBuffer = userProfile.safetyBuffer;
    const nextIncomeDateStr = userProfile.nextIncomeDate;

    // Safe-to-Spend Pool = Current Balance - Upcoming Bills - Goal Allocation - Safety Buffer
    safeToSpendPool = currentBalance - upcomingBillsTotal - goalAllocationTotal - safetyBuffer;

    // Calculate Days until Next Income
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextIncome = new Date(nextIncomeDateStr);
    nextIncome.setHours(0, 0, 0, 0);

    const diffTime = nextIncome.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Ensure daysUntilNextIncome is at least 1 day to prevent division by zero
    daysUntilNextIncome = Math.max(1, diffDays);

    // Daily Safe Spend = Safe-to-Spend Pool ÷ Days until Next Income
    dailySafeSpend = safeToSpendPool / daysUntilNextIncome;
  }

  return {
    userProfile,
    expenses,
    bills,
    goals,
    totalSpending,
    upcomingBillsTotal,
    goalAllocationTotal,
    safeToSpendPool,
    dailySafeSpend,
    daysUntilNextIncome,
  };
}
