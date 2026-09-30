import { createClient } from "@/lib/supabase/server";

export default async function InvestorDashboard() {
  const supabase = await createClient();

  const { data: investors } = await supabase
    .from("investors")
    .select("*")
    .limit(1);

  const investor = investors?.[0];

  const totalValue = Number(investor?.balance || 0);

  return (
    <main className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold text-cyan-400">
          Investor Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Welcome to Solid State Capital
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
            Monthly Return
          </div>

          <div className="text-3xl font-bold text-green-500 mt-2">
            +8.2%
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="text-zinc-500 text-sm">
            Cash Balance
          </div>

          <div className="text-3xl font-bold mt-2">
            $15,250
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="text-zinc-500 text-sm">
            Active Positions
          </div>

          <div className="text-3xl font-bold mt-2">
            6
          </div>
        </div>
      </div>
    </main>
  );
}
