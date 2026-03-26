import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import StatusBadge from '../components/ui/StatusBadge'
import StreamingText from '../components/ui/StreamingText'
import AgentThinkingLoader from '../components/ui/AgentThinkingLoader'
import DemandForecastChart from '../components/charts/DemandForecastChart'
import { runForecastAgent } from '../lib/claudeAgent'
import { CRITICAL_SKUS } from '../data/mockData'

export default function ForecastingView() {
  const navigate = useNavigate()
  const selectedSKU = useStore((s) => s.selectedSKU)
  const setSelectedSKU = useStore((s) => s.setSelectedSKU)
  const [agentText, setAgentText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [agentStarted, setAgentStarted] = useState(false)
  const [agentError, setAgentError] = useState('')

  const sku = selectedSKU ?? CRITICAL_SKUS[0]

  const startAgent = async () => {
    setAgentStarted(true)
    setIsStreaming(true)
    setAgentText('')
    setAgentError('')
    try {
      for await (const chunk of runForecastAgent(sku)) {
        setAgentText((prev) => prev + chunk)
      }
    } catch (e: any) {
      setAgentError(e.message || 'Agent error')
    } finally {
      setIsStreaming(false)
    }
  }

  const maxImpact = Math.max(...sku.forecastDrivers.map((d) => Math.abs(d.impact)))

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">{sku.name}</h1>
            <StatusBadge level={sku.riskLevel} score={sku.riskScore} size="md" />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-mono text-indigo-400">{sku.sku}</span>
            <span>{sku.category} · {sku.brand}</span>
            <span>Current stock: <strong className="text-amber-400">{sku.currentStock} units</strong></span>
            <span>Avg demand: <strong className="text-gray-300">{sku.avgDailyDemand}/day</strong></span>
          </div>
        </div>

        {/* SKU picker */}
        <select
          className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-3 py-2"
          value={sku.id}
          onChange={(e) => {
            const found = CRITICAL_SKUS.find((s) => s.id === e.target.value)
            if (found) { setSelectedSKU(found); setAgentStarted(false); setAgentText('') }
          }}
        >
          {CRITICAL_SKUS.map((s) => (
            <option key={s.id} value={s.id}>{s.sku} — {s.name.slice(0, 30)}</option>
          ))}
        </select>
      </div>

      {/* Stockout alert */}
      <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="text-sm">
          <span className="text-red-400 font-semibold">Stockout imminent in {sku.daysUntilStockout} day{sku.daysUntilStockout !== 1 ? 's' : ''}.</span>
          <span className="text-gray-400 ml-2">Lead time is {sku.leadTimeDays} days — order must be placed immediately.</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Chart */}
        <div className="col-span-3 space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Demand Forecast</h2>
                <p className="text-xs text-gray-500">90-day history + 30-day projection</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-gray-500" />
                  <span className="text-gray-500">Historical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-indigo-500 border-dashed" style={{ borderTop: '2px dashed #6366f1', background: 'none' }} />
                  <span className="text-gray-500">Forecast</span>
                </div>
              </div>
            </div>
            <DemandForecastChart sku={sku} />
          </div>

          {/* Demand Drivers */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Demand Drivers</h2>
            <div className="space-y-3">
              {sku.forecastDrivers.map((driver) => (
                <div key={driver.driver}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{driver.driver}</span>
                    <span className={`text-xs font-mono font-bold ${driver.impact > 10 ? 'text-green-400' : driver.impact > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {driver.impact > 0 ? '+' : ''}{driver.impact}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${driver.impact > 10 ? 'bg-green-500' : driver.impact > 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${(Math.abs(driver.impact) / maxImpact) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{driver.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast Agent Panel */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="agent-panel p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Forecast Agent</span>
              <span className="text-xs text-gray-600 ml-auto">Agent 2 of 4</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              I break down complex demand signals into transparent, quantified drivers.
            </p>

            {!agentStarted ? (
              <button
                onClick={startAgent}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Demand Signals
              </button>
            ) : (
              <div className="flex-1 overflow-auto">
                {isStreaming && !agentText && (
                  <AgentThinkingLoader agentName="Forecast Agent" color="blue" />
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

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '30-Day Demand', value: `${(sku.avgDailyDemand * 30).toLocaleString()}`, unit: 'units' },
              { label: 'Coverage Gap', value: `${sku.reorderPoint - sku.currentStock}`, unit: 'units short' },
              { label: 'Lead Time', value: `${sku.leadTimeDays}`, unit: 'days' },
              { label: 'Unit Cost', value: `$${sku.unitCost.toFixed(2)}`, unit: 'per unit' },
            ].map((stat) => (
              <div key={stat.label} className="card p-3">
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="text-lg font-bold font-mono text-white mt-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.unit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/replenishment')}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors"
        >
          Proceed to Replenishment
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
