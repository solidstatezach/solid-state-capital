'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { month: 'Jan', value: 5000 },
  { month: 'Feb', value: 6200 },
  { month: 'Mar', value: 7100 },
  { month: 'Apr', value: 9000 },
  { month: 'May', value: 10000 },
]

export default function PortfolioChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
