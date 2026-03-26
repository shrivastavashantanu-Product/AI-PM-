import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'
import StreamingText from '../components/ui/StreamingText'
import AgentThinkingLoader from '../components/ui/AgentThinkingLoader'
import { useStore } from '../store/useStore'
import { CRITICAL_SKUS, TOTAL_SKUS, WARNING_SKU_COUNT, HEALTHY_SKU_COUNT } from '../data/mockData'
import { runPlannerAgent } from '../lib/claudeAgent'
import type { SKU } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const setSelectedSKU = useStore((s) => s.setSelectedSKU)
  const [agentText, setAgentText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [agentStarted, setAgentStarted] = useState(false)
  const [agentError, setAgentError] = useState('')

  const handleSKUClick = (sku: SKU) => {
    setSelectedSKU(sku)
    navigate('/forecasting')
  }

  const startAgent = async () => {
    setAgentStarted(true)
    setIsStreaming(true)
    setAgentText('')
    setAgentError('')
    try {
      for await (const chunk of runPlannerAgent(CRITICAL_SKUS)) {
        setAgentText((prev) => prev + chunk)
      }
    } catch (e: any) {
      setAgentError(e.message || 'Agent error')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white">Supply Chain Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Real-time risk monitoring across {TOTAL_SKUS.toLocaleString()} active SKUs
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="SKUs Monitored"
          value={TOTAL_SKUS.toLocaleString()}
          sublabel="Across all categories"
          accent="gray"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
        />
        <MetricCard
          label="Critical SKUs"
          value={CRITICAL_SKUS.length}
          sublabel="Immediate action required"
          accent="red"
          trend={{ value: 8, label: 'vs last week' }}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <MetricCard
          label="At-Risk SKUs"
          value={WARNING_SKU_COUNT}
          sublabel="Monitor closely"
          accent="amber"
          trend={{ value: 3, label: 'vs last week' }}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Healthy SKUs"
          value={HEALTHY_SKU_COUNT.toLocaleString()}
          sublabel="No action needed"
          accent="green"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* SKU Table */}
        <div className="col-span-3 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Critical SKUs</h2>
              <p className="text-xs text-gray-500 mt-0.5">Click any row to begin analysis</p>
            </div>
            <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/25 rounded-full px-2.5 py-1">
              {CRITICAL_SKUS.length} items
            </span>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['SKU', 'Name', 'Category', 'Stock', 'Reorder Pt', 'Days Left', 'Risk'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRITICAL_SKUS.map((sku, idx) => (
                  <tr
                    key={sku.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => handleSKUClick(sku)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-indigo-400">{sku.sku}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-gray-200 max-w-[160px] truncate">{sku.name}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{sku.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">{sku.currentStock}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{sku.reorderPoint}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-xs font-bold ${
                        sku.daysUntilStockout <= 1 ? 'text-red-400' :
                        sku.daysUntilStockout <= 3 ? 'text-amber-400' : 'text-yellow-500'
                      }`}>
                        {sku.daysUntilStockout}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge level={sku.riskLevel} score={sku.riskScore} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Planner Agent Panel */}
        <div className="col-span-2 agent-panel p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Planner Agent</span>
            <span className="text-xs text-gray-600 ml-auto">Agent 1 of 4</span>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            I monitor all 14,000 SKUs and surface the highest-risk items requiring your attention.
          </p>

          {!agentStarted ? (
            <button
              onClick={startAgent}
              className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run Planner Agent
            </button>
          ) : (
            <div className="flex-1 overflow-auto">
              {isStreaming && !agentText && (
                <AgentThinkingLoader agentName="Planner Agent" color="amber" />
              )}
              {agentError ? (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {agentError}
                  <br />
                  <span className="text-gray-500">Add VITE_ANTHROPIC_API_KEY to .env to enable AI agents.</span>
                </div>
              ) : (
                <StreamingText text={agentText} isStreaming={isStreaming} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
