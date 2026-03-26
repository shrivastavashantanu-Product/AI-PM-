import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useStore } from '../store/useStore'
import type { FeedbackRecord } from '../types'

const STATUS_STYLE = {
  pending: 'text-gray-400 bg-gray-700/30 border-gray-700/40',
  executed: 'text-blue-400 bg-blue-500/15 border-blue-500/25',
  evaluated: 'text-green-400 bg-green-500/15 border-green-500/25',
}

const MODEL_ACCURACY_HISTORY = [
  { period: 'Oct', accuracy: 88.2 },
  { period: 'Nov', accuracy: 89.7 },
  { period: 'Dec', accuracy: 90.1 },
  { period: 'Jan', accuracy: 91.4 },
  { period: 'Feb', accuracy: 92.8 },
  { period: 'Mar', accuracy: 93.4 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-mono font-bold">{payload[0]?.value?.toFixed(1)}% accuracy</p>
    </div>
  )
}

export default function FeedbackLoop() {
  const decisions = useStore((s) => s.decisions)
  const feedbackRecords = useStore((s) => s.feedbackRecords)
  const plannerBiasScore = useStore((s) => s.plannerBiasScore)
  const modelAccuracy = useStore((s) => s.modelAccuracy)
  const addFeedback = useStore((s) => s.addFeedback)
  const setPlannerBiasScore = useStore((s) => s.setPlannerBiasScore)
  const setModelAccuracy = useStore((s) => s.setModelAccuracy)
  const updateDecision = useStore((s) => s.updateDecision)

  const [simulating, setSimulating] = useState<string | null>(null)
  const [simulated, setSimulated] = useState<Set<string>>(new Set())

  const handleFastForward = async (decisionId: string) => {
    const decision = decisions.find((d) => d.id === decisionId)
    if (!decision) return

    setSimulating(decisionId)
    await new Promise((r) => setTimeout(r, 1800))

    const wasOverridden = decision.humanAction === 'overridden'
    const rec = decision.agentRecommendation
    const stockoutOccurred = wasOverridden && decision.humanOverrideQty
      ? decision.humanOverrideQty < rec.orderQty * 0.85
      : false

    const fillRate = stockoutOccurred ? 0.76 : 0.98
    const actualDemand = Math.round(rec.orderQty * (0.9 + Math.random() * 0.2))
    const overstockUnits = stockoutOccurred ? 0 : Math.max(0, rec.orderQty - actualDemand)
    const revenueImpact = stockoutOccurred ? -18400 : Math.round(actualDemand * 89)

    const outcome = {
      decisionId,
      actualDemand,
      stockoutOccurred,
      overstockUnits,
      fillRate,
      evaluatedAt: new Date().toISOString(),
      revenueImpact,
    }

    const fb: FeedbackRecord = {
      id: `fb-${Date.now()}`,
      decisionId,
      skuId: decision.skuId,
      skuName: decision.skuName,
      outcome,
      modelAdjustment: {
        type: stockoutOccurred ? 'penalized' : 'reinforced',
        delta: stockoutOccurred ? -0.048 : 0.028,
        reason: stockoutOccurred
          ? 'Human override caused stockout. Planner bias adjustment applied.'
          : 'Agent forecast accuracy within 2% of actual demand. Seasonal weights reinforced.',
      },
      plannerBiasScore: wasOverridden ? plannerBiasScore + 0.05 : Math.max(0, plannerBiasScore - 0.01),
    }

    addFeedback(fb)
    updateDecision(decisionId, { status: 'evaluated' })

    if (stockoutOccurred) {
      setPlannerBiasScore(Math.min(1, plannerBiasScore + 0.05))
    } else {
      setModelAccuracy(Math.min(1, modelAccuracy + 0.002))
    }

    setSimulating(null)
    setSimulated((prev) => new Set([...prev, decisionId]))
  }

  const approvedCount = decisions.filter((d) => d.humanAction === 'approved').length
  const overriddenCount = decisions.filter((d) => d.humanAction === 'overridden').length
  const evaluatedCount = decisions.filter((d) => d.status === 'evaluated').length
  const successRate = feedbackRecords.filter((f) => f.modelAdjustment.type === 'reinforced').length / Math.max(1, feedbackRecords.length)

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-white">Feedback Loop Engine</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Every decision is tracked. Every outcome makes the model smarter.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Model Accuracy', value: `${(modelAccuracy * 100).toFixed(1)}%`, color: 'text-green-400', sub: 'All-time forecast accuracy' },
          { label: 'Planner Bias Score', value: `${(plannerBiasScore * 100).toFixed(0)}%`, color: plannerBiasScore > 0.3 ? 'text-red-400' : 'text-amber-400', sub: 'Override bias index (lower = better)' },
          { label: 'Decisions Evaluated', value: evaluatedCount, color: 'text-blue-400', sub: `of ${decisions.length} total decisions` },
          { label: 'AI Approval Rate', value: `${(approvedCount / Math.max(1, approvedCount + overriddenCount) * 100).toFixed(0)}%`, color: 'text-indigo-400', sub: `${overriddenCount} overrides logged` },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{kpi.label}</div>
            <div className={`text-3xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-600 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Decision History */}
        <div className="col-span-3 space-y-5">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Decision History</h2>
                <p className="text-xs text-gray-500">Click "Fast-forward 30d" to simulate outcomes</p>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['SKU', 'Decision', 'Human Action', 'Qty', 'Status', 'Simulate'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((d) => (
                    <tr key={d.id} className="border-b border-gray-800/50">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-400">{d.skuId.replace('sku-', '#')}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-gray-300 max-w-[140px] truncate">{d.skuName}</div>
                        <div className="text-xs text-gray-600 font-mono">{new Date(d.timestamp).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          d.humanAction === 'approved' ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : d.humanAction === 'overridden' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-gray-400 bg-gray-700/30 border-gray-700'
                        }`}>
                          {d.humanAction}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className="text-gray-300">{d.agentRecommendation.orderQty.toLocaleString()}</span>
                        {d.humanOverrideQty && (
                          <span className="text-amber-400 ml-1">→ {d.humanOverrideQty.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[d.status]}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.status !== 'evaluated' && !simulated.has(d.id) ? (
                          <button
                            onClick={() => handleFastForward(d.id)}
                            disabled={simulating !== null}
                            className="text-xs px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            {simulating === d.id ? (
                              <>
                                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                Simulating...
                              </>
                            ) : (
                              '⏩ +30d'
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600">Evaluated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedback Records */}
          {feedbackRecords.length > 0 && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Model Adjustment Log</h2>
              <div className="space-y-3">
                {feedbackRecords.map((fb) => (
                  <div key={fb.id} className={`rounded-lg border p-3 ${
                    fb.modelAdjustment.type === 'reinforced'
                      ? 'bg-green-500/5 border-green-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold ${fb.modelAdjustment.type === 'reinforced' ? 'text-green-400' : 'text-red-400'}`}>
                            {fb.modelAdjustment.type === 'reinforced' ? '▲ REINFORCED' : '▼ PENALIZED'}
                          </span>
                          <span className="text-xs text-gray-500">{fb.skuName.slice(0, 30)}</span>
                        </div>
                        <p className="text-xs text-gray-400">{fb.modelAdjustment.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-bold font-mono ${fb.modelAdjustment.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {fb.modelAdjustment.delta > 0 ? '+' : ''}{(fb.modelAdjustment.delta * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">model Δ</div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-600">
                      <span>Fill rate: <strong className={fb.outcome.fillRate > 0.9 ? 'text-green-400' : 'text-red-400'}>{(fb.outcome.fillRate * 100).toFixed(1)}%</strong></span>
                      <span>Stockout: <strong className={fb.outcome.stockoutOccurred ? 'text-red-400' : 'text-green-400'}>{fb.outcome.stockoutOccurred ? 'Yes' : 'No'}</strong></span>
                      <span>Revenue: <strong className={fb.outcome.revenueImpact > 0 ? 'text-green-400' : 'text-red-400'}>${fb.outcome.revenueImpact.toLocaleString()}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="col-span-2 space-y-5">
          {/* Model Accuracy Chart */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-1">Model Accuracy Trend</h2>
            <p className="text-xs text-gray-500 mb-4">6-month rolling accuracy from the feedback flywheel</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={MODEL_ACCURACY_HISTORY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="period" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} domain={[85, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Planner Bias */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Planner Bias Tracker</h2>
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Bias Score</span>
                <span className={`font-mono font-bold ${plannerBiasScore > 0.3 ? 'text-red-400' : plannerBiasScore > 0.15 ? 'text-amber-400' : 'text-green-400'}`}>
                  {(plannerBiasScore * 100).toFixed(0)}% {plannerBiasScore > 0.3 ? '⚠️' : plannerBiasScore > 0.15 ? '🟡' : '✅'}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${plannerBiasScore > 0.3 ? 'bg-red-500' : plannerBiasScore > 0.15 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, plannerBiasScore * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {plannerBiasScore > 0.3
                  ? 'High bias detected. Planner overrides are costing revenue.'
                  : plannerBiasScore > 0.15
                  ? 'Moderate bias. Monitor override patterns.'
                  : 'Low bias. Good alignment with AI recommendations.'}
              </p>
            </div>
            <div className="space-y-2 border-t border-gray-800 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Decisions Approved</span>
                <span className="font-mono text-green-400">{approvedCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Decisions Overridden</span>
                <span className="font-mono text-amber-400">{overriddenCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Override Success Rate</span>
                <span className="font-mono text-gray-400">
                  {overriddenCount === 0 ? 'N/A' : `${(successRate * 100).toFixed(0)}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Flywheel explanation */}
          <div className="agent-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">The Flywheel</span>
            </div>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Agent makes recommendation', color: 'indigo' },
                { step: '2', text: 'Planner approves or overrides', color: 'amber' },
                { step: '3', text: 'Real-world outcome is tracked', color: 'blue' },
                { step: '4', text: 'Model weights are adjusted', color: 'purple' },
                { step: '5', text: 'Next recommendation is smarter', color: 'green' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full bg-${item.color}-500/20 border border-${item.color}-500/30 flex items-center justify-center text-xs font-bold text-${item.color}-400`}>
                    {item.step}
                  </div>
                  <span className="text-xs text-gray-400">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
