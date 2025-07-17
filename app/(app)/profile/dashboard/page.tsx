import { fetchDashboardData } from "./dashboard-data";
import DashboardClient from "./DashboardClient";

export default async function PurchasesPage() {
  const { profile, points, transactions, purchasedTools, tools } = await fetchDashboardData();
  // console.log('Dashboard Points Data:', points); // Debug log
  return <DashboardClient profile={profile} points={points} transactions={transactions} purchasedTools={purchasedTools} tools={tools} />;
}
