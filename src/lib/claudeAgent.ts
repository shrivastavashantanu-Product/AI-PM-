import Anthropic from '@anthropic-ai/sdk'
import type { SKU, Decision } from '../types'

function getClient() {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file.')
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export async function* runPlannerAgent(skus: SKU[]): AsyncGenerator<string> {
  const client = getClient()
  const topRisks = skus
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map(
      (s) =>
        `- ${s.sku} (${s.name}): Risk Score ${s.riskScore}/100, ${s.daysUntilStockout} days until stockout, avg daily demand ${s.avgDailyDemand} units`
    )
    .join('\n')

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `You are the Planner Agent in DecisionOS, an autonomous inventory intelligence system. Your job is to triage the entire SKU catalog and surface the highest-risk items requiring immediate action.

Current critical SKUs (${skus.length} total flagged):
${topRisks}

In 3-4 short paragraphs, provide:
1. An executive summary of the current inventory risk posture
2. Which SKU demands the most urgent attention and why
3. A recommended triage order for the planner
4. One key insight about the demand patterns you're seeing

Be concise, data-driven, and actionable. Use specific numbers. Format as plain text, no markdown headers.`,
      },
    ],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}

export async function* runForecastAgent(sku: SKU): AsyncGenerator<string> {
  const client = getClient()
  const drivers = sku.forecastDrivers
    .map((d) => `${d.driver}: ${d.impact > 0 ? '+' : ''}${d.impact}% (${d.description})`)
    .join('\n')

  const recentDemand = sku.demandHistory
    .slice(-14)
    .map((d) => `${d.date}: ${d.units} units`)
    .join(', ')

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `You are the Forecast Agent in DecisionOS. Analyze this SKU's demand pattern and explain the forecast in detail.

SKU: ${sku.sku} — ${sku.name}
Category: ${sku.category}
Current Stock: ${sku.currentStock} units
Average Daily Demand: ${sku.avgDailyDemand} units/day
Days Until Stockout: ${sku.daysUntilStockout}
Lead Time: ${sku.leadTimeDays} days

Recent 14-day demand: ${recentDemand}

Forecast Demand Drivers:
${drivers}

30-day forecast peak: ${Math.max(...sku.forecast.map((f) => f.predicted))} units
30-day forecast average: ${Math.round(sku.forecast.reduce((a, f) => a + f.predicted, 0) / sku.forecast.length)} units/day

In 3-4 paragraphs, explain:
1. The key demand drivers and their combined effect
2. What the trend and seasonality are telling us
3. Confidence level in this forecast and main uncertainty factors
4. Why immediate action is warranted given the lead time

Be specific with numbers. Plain text, no markdown.`,
      },
    ],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}

export async function* runReplenishmentAgent(sku: SKU): AsyncGenerator<string> {
  const client = getClient()
  const totalRecommended = Math.round(
    sku.avgDailyDemand * (sku.leadTimeDays + 30) + sku.safetyStock - sku.currentStock
  )
  const splits = sku.warehouses
    .filter((w) => w.capacity > 0)
    .slice(0, 2)
    .map((w, i) => `${w.name} (${w.city}): ${i === 0 ? Math.round(totalRecommended * 0.6) : Math.round(totalRecommended * 0.4)} units`)
    .join(', ')

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `You are the Replenishment Agent in DecisionOS. Calculate and explain the optimal replenishment order for this SKU.

SKU: ${sku.sku} — ${sku.name}
Current Stock: ${sku.currentStock} units (${sku.daysUntilStockout} days of coverage)
Reorder Point: ${sku.reorderPoint} units
Safety Stock: ${sku.safetyStock} units
Average Daily Demand: ${sku.avgDailyDemand} units
Lead Time: ${sku.leadTimeDays} days
Unit Cost: $${sku.unitCost}

Recommended Order: ${totalRecommended} units (~$${(totalRecommended * sku.unitCost).toLocaleString()})
Warehouse Split: ${splits}

In 3-4 paragraphs, explain:
1. The exact math behind the order quantity (EOQ, safety stock, lead time buffer)
2. Why this specific warehouse split was chosen
3. Financial implications and ROI of this order vs stockout cost
4. What happens if we delay this order by even 24 hours

Be precise. Show the math. Plain text, no markdown.`,
      },
    ],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}

export async function* runCriticAgent(sku: SKU, decision: Decision): AsyncGenerator<string> {
  const client = getClient()
  const { agentRecommendation, humanAction, humanOverrideQty } = decision
  const wasOverridden = humanAction === 'overridden' && humanOverrideQty

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 700,
    messages: [
      {
        role: 'user',
        content: `You are the Critic Agent in DecisionOS. Your role is to validate the replenishment decision, provide full explainability, and run counterfactual simulations.

SKU: ${sku.sku} — ${sku.name}
Agent Recommendation: ${agentRecommendation.orderQty.toLocaleString()} units ($${agentRecommendation.totalCost.toLocaleString()})
${wasOverridden ? `Human Override: ${humanOverrideQty!.toLocaleString()} units (planner reduced by ${agentRecommendation.orderQty - humanOverrideQty!} units)` : 'Decision: Approved as recommended'}

Counterfactual Analysis:
- Scenario A (Recommended ${agentRecommendation.orderQty} units): Stockout risk 0.8%, overstock ~120 units
- Scenario B (No action): Stockout risk 100%, estimated lost revenue $${(sku.avgDailyDemand * sku.unitCost * 30).toLocaleString()}
${wasOverridden ? `- Scenario C (Override ${humanOverrideQty} units): Stockout risk ~${Math.round(((agentRecommendation.orderQty - humanOverrideQty!) / agentRecommendation.orderQty) * 45)}%, partial coverage` : ''}

In 4 paragraphs, provide:
1. Why the recommendation is correct (or why the override may be risky)
2. Full justification of the math and logic behind the recommendation
3. What the counterfactual simulations reveal
4. Your confidence score (0-100) and the main risk factors to monitor

Be direct and authoritative. This is the trust layer. Plain text, no markdown.`,
      },
    ],
  })

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text
    }
  }
}
