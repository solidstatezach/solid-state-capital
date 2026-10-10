'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Snapshot = {
  created_at: string
  total_value: number
}

export default function SnapshotChart({
  snapshots,
}: {
  snapshots: Snapshot[]
}) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <p className="text-zinc-500 p-4">
        No valuation history yet. Record a snapshot to start building
        the track record — the chart fills in from real data, never
        backfilled.
      </p>
    )
  }

  const data = snapshots.map((s) => ({
    date: new Date(s.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    value: Number(s.total_value),
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
