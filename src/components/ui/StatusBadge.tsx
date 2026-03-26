type RiskLevel = 'critical' | 'warning' | 'healthy'

interface StatusBadgeProps {
  level: RiskLevel
  score?: number
  size?: 'sm' | 'md'
}

const config = {
  critical: {
    bg: 'bg-red-500/15 border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
    label: 'Critical',
  },
  warning: {
    bg: 'bg-amber-500/15 border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    label: 'At Risk',
  },
  healthy: {
    bg: 'bg-green-500/15 border-green-500/30',
    text: 'text-green-400',
    dot: 'bg-green-400',
    label: 'Healthy',
  },
}

export default function StatusBadge({ level, score, size = 'sm' }: StatusBadgeProps) {
  const c = config[level]
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bg} ${c.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${level === 'critical' ? 'animate-pulse' : ''}`} />
      {c.label}
      {score !== undefined && <span className="font-mono opacity-70">({score})</span>}
    </span>
  )
}
