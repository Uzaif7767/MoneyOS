import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getUserExpenses } from "@/lib/services/expenseService";
import { ExpensesManager } from "@/components/expenses/ExpensesManager";
import ExpensesLoading from "./loading";

export const metadata = {
  title: "Expenses Tracker | MoneyOS",
  description: "Track, manage, and audit your daily expenses in Indian Rupees (₹).",
};

export default async function ExpensesPage() {
  const user = await currentUser();
  const userId = user?.id || "";
  const expenses = userId ? await getUserExpenses(userId) : [];

  return (
    <Suspense fallback={<ExpensesLoading />}>
      <ExpensesManager initialExpenses={expenses} />
    </Suspense>
  );
}

