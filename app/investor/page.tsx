import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentInvestor } from "@/lib/supabase/currentInvestor";
import {
  totalAccountValue,
  formatMoney,
} from "@/lib/portfolio";

export default async function InvestorDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const investor = await getCurrentInvestor();

  if (!investor) {
    return (
      <main className="space-y-8">
        <h1 className="text-3xl font-bold text-red-500">
          Investor not found
        </h1>
        <p className="text-zinc-400">
          Your account is not linked to an investor profile yet.
          Please contact your administrator.
        </p>
      </main>
    );
  }

  const { data: positions } = await supabase
    .from("portfolio_positions")
    .select("quantity, average_cost, current_price")
    .eq("investor_id", investor.id);

  const { count: activePositions } = await supabase
    .from("portfolio_positions")
    .select("id", { count: "exact", head: true })
    .eq("investor_id", investor.id);

  // Total Value = cash + positions at current price (same definition
  // as every other page — see lib/portfolio.ts).
  const totalValue = totalAccountValue(
    investor.balance,
    positions
  );

  // Realized return: booked P/L (trades + manual profit/loss entries)
  // relative to total cash ever invested. Excludes unrealized gains.
  const realizedReturn = investor.total_invested
    ? (Number(investor.total_profit || 0) /
        Number(investor.total_invested)) *
      100
    : 0;

  return (
    <main className="space-y-8">
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
            {formatMoney(totalValue)}
          </div>

          <div className="text-xs text-zinc-600 mt-1">
            Cash + positions
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="text-zinc-500 text-sm">
            Realized Return
          </div>

          <div
            className={`text-3xl font-bold mt-2 ${
              realizedReturn >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {realizedReturn >= 0 ? "+" : ""}
            {realizedReturn.toFixed(1)}%
          </div>

          <div className="text-xs text-zinc-600 mt-1">
            Booked P/L vs invested
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="text-zinc-500 text-sm">
            Cash Balance
          </div>

          <div className="text-3xl font-bold mt-2">
            {formatMoney(investor.balance)}
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
