type Props = {
  transactions: any[]
}

export default function InvestorSummary({
  transactions,
}: Props) {
  const deposits = transactions
    .filter((tx) => tx.transaction_type === 'deposit')
    .reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0
    )

  const withdrawals = transactions
    .filter((tx) => tx.transaction_type === 'withdrawal')
    .reduce(
      (sum, tx) => sum + Number(tx.amount || 0),
      0
    )

  return (
    <div className="grid gap-4 mb-8">
      <div className="bg-zinc-900 p-4 rounded-xl">
        <p className="text-zinc-400">Deposits</p>
        <p className="text-green-400 text-2xl font-bold">
          ${deposits.toFixed(2)}
        </p>
      </div>

      <div className="bg-zinc-900 p-4 rounded-xl">
        <p className="text-zinc-400">Withdrawals</p>
        <p className="text-red-400 text-2xl font-bold">
          ${withdrawals.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
