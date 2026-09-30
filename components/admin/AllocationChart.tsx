'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type AllocationChartProps = {
  data: {
    name: string
    value: number
  }[]
}

const COLORS = [
  '#06b6d4',
  '#22c55e',
  '#a855f7',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
]

export default function AllocationChart({
  data,
}: AllocationChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
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
