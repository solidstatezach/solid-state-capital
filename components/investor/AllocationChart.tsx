'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const COLORS = [
  '#06b6d4',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
]

export default function AllocationChart({
  data,
}: {
  data: {
    name: string
    value: number
  }[]
}) {
  return (
    <div className="glass-card p-6 h-[400px]">
      <h2 className="text-2xl font-bold mb-4">
        Portfolio Allocation
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
