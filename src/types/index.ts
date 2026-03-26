export interface Warehouse {
  id: string
  name: string
  city: string
  stock: number
  capacity: number
}

export interface DemandPoint {
  date: string
  units: number
}

export interface ForecastPoint {
  date: string
  predicted: number
  lower: number
  upper: number
}

export interface ForecastDriver {
  driver: string
  impact: number // percentage, can be negative
  description: string
}

export interface SKU {
  id: string
  sku: string
  name: string
  category: string
  brand: string
  currentStock: number
  reorderPoint: number
  safetyStock: number
  leadTimeDays: number
  avgDailyDemand: number
  unitCost: number
  riskScore: number // 0–100
  riskLevel: 'critical' | 'warning' | 'healthy'
  daysUntilStockout: number
  warehouses: Warehouse[]
  demandHistory: DemandPoint[]
  forecast: ForecastPoint[]
  forecastDrivers: ForecastDriver[]
}

export interface WarehouseSplit {
  warehouse: string
  city: string
  units: number
  transitDays: number
  shippingCost: number
}

export interface Recommendation {
  orderQty: number
  totalCost: number
  eoqQty: number
  safetyStockQty: number
  leadTimeBufferQty: number
  splits: WarehouseSplit[]
}

export type HumanAction = 'approved' | 'overridden' | 'pending'
export type DecisionStatus = 'pending' | 'executed' | 'evaluated'

export interface Decision {
  id: string
  skuId: string
  skuName: string
  timestamp: string
  agentRecommendation: Recommendation
  humanAction: HumanAction
  humanOverrideQty?: number
  status: DecisionStatus
  executedAt?: string
}

export interface Outcome {
  decisionId: string
  actualDemand: number
  stockoutOccurred: boolean
  overstockUnits: number
  fillRate: number // 0-1
  evaluatedAt: string
  revenueImpact: number
}

export interface FeedbackRecord {
  id: string
  decisionId: string
  skuId: string
  skuName: string
  outcome: Outcome
  modelAdjustment: {
    type: 'reinforced' | 'penalized'
    delta: number
    reason: string
  }
  plannerBiasScore: number
}

export interface AgentState {
  isThinking: boolean
  streamedText: string
  isComplete: boolean
  error?: string
}
