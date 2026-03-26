import { useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'

const routeMeta: Record<string, { title: string; agent: string; color: string }> = {
  '/': { title: 'Supply Chain Overview', agent: 'Planner Agent', color: 'text-amber-400' },
  '/forecasting': { title: 'Demand Forecasting', agent: 'Forecast Agent', color: 'text-blue-400' },
  '/replenishment': { title: 'Replenishment Planning', agent: 'Replenishment Agent', color: 'text-green-400' },
  '/simulation': { title: 'Decision Simulation', agent: 'Critic Agent', color: 'text-purple-400' },
  '/feedback': { title: 'Feedback Loop Engine', agent: 'Eval Engine', color: 'text-rose-400' },
}

export default function Header() {
  const location = useLocation()
  const selectedSKU = useStore((s) => s.selectedSKU)
  const meta = routeMeta[location.pathname] ?? routeMeta['/']

  return (
    <header className="h-14 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center px-6 gap-4 sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-gray-500 text-sm">DecisionOS</span>
        <svg className="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-200 text-sm font-medium">{meta.title}</span>
        {selectedSKU && location.pathname !== '/' && (
          <>
            <svg className="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-indigo-400 text-sm font-mono">{selectedSKU.sku}</span>
          </>
        )}
      </div>

      {/* Agent badge */}
      <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5">
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${meta.color.replace('text-', 'bg-')}`} />
        <span className={`text-xs font-medium ${meta.color}`}>{meta.agent}</span>
        <span className="text-xs text-gray-500">active</span>
      </div>

      {/* Date */}
      <div className="text-xs text-gray-500 font-mono">
        {new Date('2026-03-26').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </header>
  )
}
