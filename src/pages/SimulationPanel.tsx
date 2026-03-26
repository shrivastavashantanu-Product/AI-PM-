import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import StreamingText from '../components/ui/StreamingText'
import AgentThinkingLoader from '../components/ui/AgentThinkingLoader'
import StockoutRiskChart from '../components/charts/StockoutRiskChart'
import { runCriticAgent } from '../lib/claudeAgent'
import { CRITICAL_SKUS } from '../data/mockData'
import type { FeedbackRecord, Outcome } from '../types'

export default function SimulationPanel() {
  const navigate = useNavigate()
  const selectedSKU = useStore((s) => s.selectedSKU)
  const pendingDecision = useStore((s) => s.pendingDecision)
  const decisions = useStore((s) => s.decisions)
  const updateDecision = useStore((s) => s.updateDecision)
  const addFeedback = useStore((s) => s.addFeedback)
  const setPlannerBiasScore = useStore((s) => s.setPlannerBiasScore)
  const plannerBiasScore = useStore((s) => s.plannerBiasScore)

  const [agentText, setAgentText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [agentStarted, setAgentStarted] = useState(false)
  const [agentError, setAgentError] = useState('')
  const [executed, setExecuted] = useState(false)

  const sku = selectedSKU ?? CRITICAL_SKUS[0]
  const decision = pendingDecision ?? decisions[0]

  if (!decision) return (
    <div className="p-6 text-gray-400">No pending decision. Go back to Replenishment.</div>
  )

  const rec = decision.agentRecommendation
  const wasOverridden = decision.humanAction === 'overridden' && decision.humanOverrideQty
  const overrideQty = decision.humanOverrideQty
  const overrideRisk = wasOverridden
    ? Math.max(0.5, ((rec.orderQty - overrideQty!) / rec.orderQty) * 45)
    : 0

  const lostRevenue = Math.round(sku.avgDailyDemand * sku.unitCost * 30)
  const overstockCost = Math.round(rec.orderQty * 0.06 * sku.unitCost) // 6% holding cost

  const startAgent = async () => {
    setAgentStarted(true)
    setIsStreaming(true)
    setAgentText('')
    setAgentError('')
    try {
      for await (const chunk of runCriticAgent(sku, decision)) {
        setAgentText((prev) => prev + chunk)
      }
    } catch (e: any) {
      setAgentError(e.message || 'Agent error')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleExecute = () => {
    updateDecision(decision.id, { status: 'executed', executedAt: new Date().toISOString() })
    setExecuted(true)
    // Simulate immediate feedback
    if (wasOverridden) {
      setPlannerBiasScore(Math.min(1, plannerBiasScore + 0.05))
    }
  }

  const handleNavigateFeedback = () => {
    navigate('/feedback')
  }

  const scenarios = [
    {
      label: `Scenario A — Recommended (${rec.orderQty.toLocaleString()} units)`,
      stockoutRisk: '0.8%',
      overstock: '~120 units',
      revenue: `+$${(rec.orderQty * sku.unitCost * 0.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      confidence: 96,
      color: 'green',
    },
    ...(wasOverridden
      ? [
          {
            label: `Scenario C — Your Override (${overrideQty!.toLocaleString()} units)`,
            stockoutRisk: `${overrideRisk.toFixed(1)}%`,
            overstock: '~0 units',
            revenue: `+$${(overrideQty! * sku.unitCost * 0.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            confidence: 54,
            color: 'amber',
          },
        ]
      : []),
    {
      label: 'Scenario B — No Action',
      stockoutRisk: '100%',
      overstock: '0 units',
      revenue: `-$${lostRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} (lost)`,
      confidence: 0,
      color: 'red',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-white">Decision Simulation</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          <span className="font-mono text-indigo-400">{sku.sku}</span> — Critic Agent validation &amp; counterfactual analysis
        </p>
      </div>

      {/* Decision summary banner */}
      <div className={`rounded-xl border p-4 flex items-center justify-between ${
        wasOverridden
          ? 'bg-amber-500/10 border-amber-500/25'
          : 'bg-green-500/10 border-green-500/25'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${wasOverridden ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
            {wasOverridden ? (
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <div className={`text-sm font-semibold ${wasOverridden ? 'text-amber-400' : 'text-green-400'}`}>
              {wasOverridden ? 'Human Override' : 'Approved as Recommended'}
            </div>
            <div className="text-xs text-gray-500">
              {wasOverridden
                ? `Planner overrode ${rec.orderQty.toLocaleString()} → ${overrideQty!.toLocaleString()} units (−${(rec.orderQty - overrideQty!).toLocaleString()} units)`
                : `${rec.orderQty.toLocaleString()} units approved · $${rec.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} order value`}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-600 font-mono">{new Date(decision.timestamp).toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-5">
          {/* Counterfactual table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-white">Counterfactual Scenarios</h2>
              <p className="text-xs text-gray-500">Simulated outcomes for each decision path</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Scenario', 'Stockout Risk', 'Overstock', 'Revenue Impact', 'Confidence'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, idx) => (
                  <tr key={idx} className="border-b border-gray-800/50">
                    <td className="px-5 py-4">
                      <div className={`text-xs font-medium text-${s.color}-400`}>{s.label}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-mono text-sm font-bold text-${s.color}-400`}>{s.stockoutRisk}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 font-mono">{s.overstock}</td>
                    <td className="px-5 py-4 text-sm font-mono">
                      <span className={s.revenue.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                        {s.revenue}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full bg-${s.color}-500`}
                            style={{ width: `${s.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-400">{s.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-1">Stockout Risk Comparison</h2>
            <p className="text-xs text-gray-500 mb-4">Before vs after replenishment</p>
            <StockoutRiskChart recommendedQty={rec.orderQty} overrideQty={overrideQty} />
          </div>

          {/* Execute button */}
          {!executed ? (
            <button
              onClick={handleExecute}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm &amp; Execute Order
            </button>
          ) : (
            <div className="w-full py-4 bg-green-900/40 border border-green-500/30 rounded-xl flex items-center justify-center gap-3">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 font-semibold text-sm">Order Executed — Feedback Loop Active</span>
              <button
                onClick={handleNavigateFeedback}
                className="ml-4 text-xs text-indigo-400 underline"
              >
                View Feedback Loop →
              </button>
            </div>
          )}
        </div>

        {/* Critic Agent Panel */}
        <div className="col-span-2 agent-panel p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Critic Agent</span>
            <span className="text-xs text-gray-600 ml-auto">Agent 4 of 4</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            I am the trust layer. I justify every recommendation and simulate what happens if you do something different.
          </p>

          {!agentStarted ? (
            <button
              onClick={startAgent}
              className="w-full py-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Why this recommendation?
            </button>
          ) : (
            <div className="flex-1 overflow-auto">
              {isStreaming && !agentText && (
                <AgentThinkingLoader agentName="Critic Agent" color="purple" />
              )}
              {agentError ? (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {agentError}
                  <br /><span className="text-gray-500">Add VITE_ANTHROPIC_API_KEY to .env</span>
                </div>
              ) : (
                <StreamingText text={agentText} isStreaming={isStreaming} />
              )}
            </div>
          )}

          {/* Key financials */}
          <div className="mt-4 pt-4 border-t border-indigo-800/40 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Financial Stakes</div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Order Value</span>
              <span className="font-mono text-amber-400">${rec.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Stockout Cost (30d)</span>
              <span className="font-mono text-red-400">${lostRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Holding Cost</span>
              <span className="font-mono text-gray-400">${overstockCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-t border-gray-800 pt-2 mt-1">
              <span className="text-gray-300">Net Benefit vs No Action</span>
              <span className="font-mono text-green-400">+${(lostRevenue - rec.totalCost - overstockCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
