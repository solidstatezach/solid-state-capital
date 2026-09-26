'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'BTC', value: 45 },
  { name: 'ETH', value: 30 },
  { name: 'SOL', value: 15 },
  { name: 'Cash', value: 10 },
]

const COLORS = [
  '#06b6d4',
  '#22c55e',
  '#a855f7',
  '#f59e0b',
]

export default function AllocationChart() {
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
