import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import StatusBadge from '../components/ui/StatusBadge'
import StreamingText from '../components/ui/StreamingText'
import AgentThinkingLoader from '../components/ui/AgentThinkingLoader'
import { runReplenishmentAgent } from '../lib/claudeAgent'
import { CRITICAL_SKUS } from '../data/mockData'
import type { Decision, Recommendation } from '../types'

export default function ReplenishmentView() {
  const navigate = useNavigate()
  const selectedSKU = useStore((s) => s.selectedSKU)
  const addDecision = useStore((s) => s.addDecision)
  const setPendingDecision = useStore((s) => s.setPendingDecision)
  const [agentText, setAgentText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [agentStarted, setAgentStarted] = useState(false)
  const [agentError, setAgentError] = useState('')
  const [overrideMode, setOverrideMode] = useState(false)
  const [overrideQty, setOverrideQty] = useState('')

  const sku = selectedSKU ?? CRITICAL_SKUS[0]

  const orderQty = Math.round(
    sku.avgDailyDemand * (sku.leadTimeDays + 30) + sku.safetyStock - sku.currentStock
  )
  const eoqQty = Math.round(orderQty * 0.75)
  const safetyQty = sku.safetyStock
  const leadQty = Math.round(sku.avgDailyDemand * sku.leadTimeDays)
  const totalCost = orderQty * sku.unitCost

  const warehouseSplits = sku.warehouses.slice(0, 2).map((w, i) => ({
    warehouse: w.name,
    city: w.city,
    units: i === 0 ? Math.round(orderQty * 0.6) : Math.round(orderQty * 0.4),
    transitDays: i === 0 ? 2 : 4,
    shippingCost: Math.round((i === 0 ? orderQty * 0.6 : orderQty * 0.4) * 2.5),
  }))

  const recommendation: Recommendation = {
    orderQty,
    totalCost,
    eoqQty,
    safetyStockQty: safetyQty,
    leadTimeBufferQty: leadQty,
    splits: warehouseSplits,
  }

  const startAgent = async () => {
    setAgentStarted(true)
    setIsStreaming(true)
    setAgentText('')
    setAgentError('')
    try {
      for await (const chunk of runReplenishmentAgent(sku)) {
        setAgentText((prev) => prev + chunk)
      }
    } catch (e: any) {
      setAgentError(e.message || 'Agent error')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleApprove = () => {
    const decision: Decision = {
      id: `dec-${Date.now()}`,
      skuId: sku.id,
      skuName: sku.name,
      timestamp: new Date().toISOString(),
      agentRecommendation: recommendation,
      humanAction: 'approved',
      status: 'pending',
    }
    addDecision(decision)
    setPendingDecision(decision)
    navigate('/simulation')
  }

  const handleOverride = () => {
    const qty = parseInt(overrideQty)
    if (!qty || qty <= 0) return
    const decision: Decision = {
      id: `dec-${Date.now()}`,
      skuId: sku.id,
      skuName: sku.name,
      timestamp: new Date().toISOString(),
      agentRecommendation: recommendation,
      humanAction: 'overridden',
      humanOverrideQty: qty,
      status: 'pending',
    }
    addDecision(decision)
    setPendingDecision(decision)
    navigate('/simulation')
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">Replenishment Recommendation</h1>
            <StatusBadge level={sku.riskLevel} />
          </div>
          <p className="text-sm text-gray-500">
            <span className="font-mono text-indigo-400">{sku.sku}</span> — {sku.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-5">
          {/* Main recommendation card */}
          <div className="card p-6 border-indigo-700/40">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Agent Recommendation</div>
                <div className="text-4xl font-bold font-mono text-white">
                  {orderQty.toLocaleString()} <span className="text-2xl text-gray-400">units</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Total order value: <span className="text-amber-400 font-mono font-semibold">${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Est. stockout risk reduction</div>
                <div className="text-2xl font-bold text-green-400">100% → 0.8%</div>
              </div>
            </div>

            {/* Math breakdown */}
            <div className="border-t border-gray-800 pt-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Composition</div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'EOQ Base', value: eoqQty, color: 'text-blue-400', desc: 'Economic Order Qty' },
                  { label: 'Safety Stock', value: safetyQty, color: 'text-purple-400', desc: 'Buffer for variance' },
                  { label: 'Lead Time Buffer', value: leadQty, color: 'text-amber-400', desc: `${sku.leadTimeDays}-day coverage` },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-800/60 rounded-lg p-3">
                    <div className={`text-xl font-bold font-mono ${item.color}`}>{item.value.toLocaleString()}</div>
                    <div className="text-xs font-medium text-gray-300 mt-0.5">{item.label}</div>
                    <div className="text-xs text-gray-600">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Warehouse splits */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Warehouse Distribution</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Distribution Center', 'City', 'Units', 'Transit', 'Shipping Cost'].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {warehouseSplits.map((split, idx) => (
                  <tr key={idx} className="border-b border-gray-800/50">
                    <td className="py-3 text-sm font-medium text-gray-200">{split.warehouse}</td>
                    <td className="py-3 text-xs text-gray-500">{split.city}</td>
                    <td className="py-3 font-mono text-sm font-bold text-indigo-400">{split.units.toLocaleString()}</td>
                    <td className="py-3 text-xs text-gray-400">{split.transitDays} days</td>
                    <td className="py-3 text-xs font-mono text-gray-400">${split.shippingCost.toLocaleString()}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-3 text-xs font-semibold text-gray-500">TOTAL</td>
                  <td />
                  <td className="pt-3 font-mono text-sm font-bold text-white">{orderQty.toLocaleString()}</td>
                  <td />
                  <td className="pt-3 text-xs font-mono font-bold text-amber-400">
                    ${warehouseSplits.reduce((a, s) => a + s.shippingCost, 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Your Decision</h2>
            {!overrideMode ? (
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve — {orderQty.toLocaleString()} units
                </button>
                <button
                  onClick={() => setOverrideMode(true)}
                  className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Override
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  ⚠️ Override mode: your quantity will be compared against the agent recommendation in the simulation.
                </div>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={overrideQty}
                    onChange={(e) => setOverrideQty(e.target.value)}
                    placeholder={`Suggested: ${orderQty}`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleOverride}
                    disabled={!overrideQty}
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Confirm Override
                  </button>
                  <button
                    onClick={() => setOverrideMode(false)}
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-400 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replenishment Agent Panel */}
        <div className="col-span-2 agent-panel p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Replenishment Agent</span>
            <span className="text-xs text-gray-600 ml-auto">Agent 3 of 4</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            I compute the exact math to solve your inventory gap — EOQ, safety stock, and warehouse allocation.
          </p>

          {!agentStarted ? (
            <button
              onClick={startAgent}
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Explain the Math
            </button>
          ) : (
            <div className="flex-1 overflow-auto">
              {isStreaming && !agentText && (
                <AgentThinkingLoader agentName="Replenishment Agent" color="green" />
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
        </div>
      </div>
    </div>
  )
}
