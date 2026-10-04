import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestor } from "@/lib/supabase/currentInvestor";

export default async function InvestorDashboard() {
  const supabase = await createClient();

  const investor = await getCurrentInvestor();

  if (!investor) {
    return (
      <main className="space-y-8 p-6">
        <h1 className="text-3xl font-bold text-red-500">
          Investor not found
        </h1>
        <p className="text-zinc-400">
          Your account is not linked to an investor profile.
        </p>
      </main>
    );
  }

  const { count: activePositions } = await supabase
    .from("portfolio_positions")
    .select("id", { count: "exact", head: true })
    .eq("investor_id", investor.id);

  const totalValue = Number(investor.balance || 0);

  const monthlyReturn = investor.total_invested
    ? (Number(investor.total_profit || 0) /
        Number(investor.total_invested)) *
      100
    : 0;

  return (
    <main className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Investor Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Welcome, {investor.full_name || "Investor"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="text-zinc-500 text-sm">
            Total Value
          </div>

          <div className="text-3xl font-bold mt-2">
            ${totalValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="text-zinc-500 text-sm">
            Return
          </div>

          <div className="text-3xl font-bold text-green-500 mt-2">
            {monthlyReturn >= 0 ? "+" : ""}
            {monthlyReturn.toFixed(1)}%
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="text-zinc-500 text-sm">
            Cash Balance
          </div>

          <div className="text-3xl font-bold mt-2">
            ${Number(investor.balance || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="text-zinc-500 text-sm">
            Active Positions
          </div>

          <div className="text-3xl font-bold mt-2">
            {activePositions ?? 0}
          </div>
        </div>
      </div>
    </main>
  );
}
