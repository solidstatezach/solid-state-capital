'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export type AUMPoint = {
  label: string
  value: number
}

export default function AUMChart({
  data,
}: {
  data: AUMPoint[]
}) {
  if (!data || data.length === 0) {
    return (
      <p className="text-zinc-500 p-4">
        No valuation history yet. Record a snapshot to start
        building the track record.
      </p>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis dataKey="label" />
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
