import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserBills } from "@/lib/services/billService";
import { BillsManager } from "@/components/bills/BillsManager";

export const metadata = {
  title: "Bills & Subscriptions | MoneyOS",
  description: "Manage upcoming payment schedules, recurring bills, and subscriptions in Indian Rupees (₹).",
};

export default async function BillsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const bills = await getUserBills(userId);

  return <BillsManager initialBills={bills} />;
}
