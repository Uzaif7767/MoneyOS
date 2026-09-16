import { currentUser } from "@clerk/nextjs/server";
import { getInsightsRawData } from "@/lib/services/insightsService";
import { InsightsManager } from "@/components/insights/InsightsManager";

export const metadata = {
  title: "Insights & Analytics | MoneyOS",
  description: "Real-time mathematical analysis of your spending, cash flow, bills, and savings goals.",
};

export default async function InsightsPage() {
  const clerkUser = await currentUser();
  const userId = clerkUser?.id || "";

  // Read real financial data for authenticated Clerk user
  const initialData = await getInsightsRawData(userId);

  return <InsightsManager initialData={initialData} />;
}

