type StatCardProps = {
  title: string
  value: string | number
  valueClassName?: string
}

export default function StatCard({
  title,
  value,
  valueClassName = '',
}: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="text-zinc-400">
        {title}
      </div>

      <div
        className={`text-3xl font-bold mt-2 ${valueClassName}`}
      >
        {value}
      </div>
    </div>
  )
}
