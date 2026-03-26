interface MetricCardProps {
  label: string
  value: string | number
  sublabel?: string
  accent?: 'red' | 'amber' | 'green' | 'blue' | 'purple' | 'gray'
  icon?: React.ReactNode
  trend?: { value: number; label: string }
}

const accentMap = {
  red: 'text-red-400 bg-red-500/10 border-red-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  gray: 'text-gray-300 bg-gray-700/30 border-gray-700/50',
}

const valueColorMap = {
  red: 'text-red-400',
  amber: 'text-amber-400',
  green: 'text-green-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  gray: 'text-gray-200',
}

export default function MetricCard({
  label,
  value,
  sublabel,
  accent = 'gray',
  icon,
  trend,
}: MetricCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={`p-2 rounded-lg border ${accentMap[accent]}`}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className={`text-3xl font-bold font-mono ${valueColorMap[accent]}`}>{value}</div>
        {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-800">
          <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-600">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
