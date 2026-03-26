import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { SKU } from '../../types'

interface DemandForecastChartProps {
  sku: SKU
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-2 font-mono">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-mono font-bold">{Math.round(p.value)} units</span>
        </div>
      ))}
    </div>
  )
}

export default function DemandForecastChart({ sku }: DemandForecastChartProps) {
  // Combine historical + forecast into one series
  const today = '2026-03-26'

  const historicalData = sku.demandHistory.slice(-60).map((d) => ({
    date: d.date.slice(5), // MM-DD
    historical: d.units,
    predicted: undefined as number | undefined,
    lower: undefined as number | undefined,
    upper: undefined as number | undefined,
  }))

  const forecastData = sku.forecast.map((d) => ({
    date: d.date.slice(5),
    historical: undefined as number | undefined,
    predicted: d.predicted,
    lower: d.lower,
    upper: d.upper,
  }))

  const data = [...historicalData, ...forecastData]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={14}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
        />

        {/* Confidence band */}
        <Area
          type="monotone"
          dataKey="upper"
          stroke="none"
          fill="url(#forecastGradient)"
          name="Forecast Upper"
          legendType="none"
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="lower"
          stroke="none"
          fill="#0a0a0f"
          name="Forecast Lower"
          legendType="none"
          connectNulls
        />

        {/* Historical */}
        <Line
          type="monotone"
          dataKey="historical"
          stroke="#64748b"
          strokeWidth={1.5}
          dot={false}
          name="Historical Demand"
          connectNulls
        />

        {/* Forecast */}
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#6366f1"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          name="Forecast"
          connectNulls
        />

        {/* Today marker */}
        <ReferenceLine
          x={today.slice(5)}
          stroke="#f59e0b"
          strokeDasharray="4 2"
          strokeWidth={1}
          label={{ value: 'Today', fill: '#f59e0b', fontSize: 10, position: 'top' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
