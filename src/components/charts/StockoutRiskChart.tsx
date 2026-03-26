import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'

interface StockoutRiskChartProps {
  recommendedQty: number
  overrideQty?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-300 font-medium mb-1">{label}</p>
      <p className="text-white font-mono font-bold">
        Stockout Risk: {payload[0]?.value?.toFixed(1)}%
      </p>
    </div>
  )
}

export default function StockoutRiskChart({ recommendedQty, overrideQty }: StockoutRiskChartProps) {
  const data = [
    {
      scenario: 'No Action',
      risk: 100,
      color: '#ef4444',
    },
    {
      scenario: `Recommended\n(${recommendedQty.toLocaleString()} units)`,
      risk: 0.8,
      color: '#22c55e',
    },
  ]

  if (overrideQty && overrideQty !== recommendedQty) {
    const overrideRisk = Math.max(0.5, ((recommendedQty - overrideQty) / recommendedQty) * 45)
    data.splice(1, 0, {
      scenario: `Your Override\n(${overrideQty.toLocaleString()} units)`,
      risk: overrideRisk,
      color: '#f59e0b',
    })
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={true} vertical={false} />
        <XAxis
          dataKey="scenario"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="risk" radius={[4, 4, 0, 0]} name="Stockout Risk">
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
