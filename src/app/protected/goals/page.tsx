import { currentUser } from "@clerk/nextjs/server";
import { getUserGoals } from "@/lib/services/goalService";
import { GoalsManager } from "@/components/goals/GoalsManager";
import type { Goal } from "@/types";

export const metadata = {
  title: "Savings Goals | MoneyOS",
  description: "Set, fund, and track milestone savings goals in Indian Rupees (₹).",
};

export default async function GoalsPage() {
  const user = await currentUser();
  const userId = user?.id || "";

  const goals: Goal[] = userId ? await getUserGoals(userId) : [];

  return <GoalsManager initialGoals={goals} />;
}

