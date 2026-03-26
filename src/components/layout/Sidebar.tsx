import { NavLink } from 'react-router-dom'

const navItems = [
  {
    to: '/',
    label: 'Overview',
    sublabel: 'Planner Agent',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    end: true,
  },
  {
    to: '/forecasting',
    label: 'Demand Forecast',
    sublabel: 'Forecast Agent',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    end: false,
  },
  {
    to: '/replenishment',
    label: 'Replenishment',
    sublabel: 'Executor Agent',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    end: false,
  },
  {
    to: '/simulation',
    label: 'Simulation',
    sublabel: 'Critic Agent',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    end: false,
  },
  {
    to: '/feedback',
    label: 'Feedback Loop',
    sublabel: 'Eval Engine',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    end: false,
  },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
            D
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">DecisionOS</div>
            <div className="text-xs text-gray-500">Inventory Intelligence</div>
          </div>
        </div>
      </div>

      {/* Agent Pipeline Label */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Agent Pipeline</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-1">
        {navItems.map((item, idx) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-mono">{idx + 1}.</span>
                    <span className={`text-sm font-medium truncate ${isActive ? 'text-indigo-300' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 ml-4">{item.sublabel}</div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer stats */}
      <div className="px-4 py-4 border-t border-gray-800 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Model Accuracy</span>
          <span className="text-green-400 font-mono">93.4%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1">
          <div className="bg-green-500 h-1 rounded-full" style={{ width: '93.4%' }} />
        </div>
        <div className="flex justify-between text-xs pt-1">
          <span className="text-gray-500">SKUs Monitored</span>
          <span className="text-gray-300 font-mono">14,000</span>
        </div>
      </div>
    </aside>
  )
}
