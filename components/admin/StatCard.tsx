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
    <div
      className="
      group
      relative
      overflow-hidden
      rounded-3xl
      border
      border-zinc-800
      bg-zinc-900/70
      backdrop-blur-xl
      p-6
      transition-all
      duration-300
      hover:border-cyan-500/40
      hover:-translate-y-1
      hover:shadow-[0_0_40px_rgba(34,211,238,0.12)]
    "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="text-zinc-500 text-sm uppercase tracking-wider">
          {title}
        </div>

        <div
          className={`mt-3 text-4xl font-black tracking-tight ${valueClassName}`}
        >
          {value}
        </div>
      </div>
    </div>
  )
}
