import type { SKU, Decision, FeedbackRecord } from '../types'

// Generate demand history (90 days back)
function generateDemandHistory(
  baseDemand: number,
  seasonalityFactor: number,
  noiseFactor: number
) {
  const history = []
  const today = new Date('2026-03-26')
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    )
    const seasonal = 1 + seasonalityFactor * Math.sin((2 * Math.PI * dayOfYear) / 365)
    const noise = 1 + (Math.random() - 0.5) * noiseFactor
    const units = Math.max(0, Math.round(baseDemand * seasonal * noise))
    history.push({ date: date.toISOString().split('T')[0], units })
  }
  return history
}

// Generate 30-day forecast
function generateForecast(
  baseDemand: number,
  trendFactor: number,
  seasonalityFactor: number,
  uncertainty: number
) {
  const forecast = []
  const today = new Date('2026-03-26')
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    )
    const seasonal = 1 + seasonalityFactor * Math.sin((2 * Math.PI * dayOfYear) / 365)
    const trend = 1 + trendFactor * (i / 30)
    const predicted = Math.round(baseDemand * seasonal * trend)
    const band = Math.round(predicted * uncertainty)
    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted,
      lower: Math.max(0, predicted - band),
      upper: predicted + band,
    })
  }
  return forecast
}

export const CRITICAL_SKUS: SKU[] = [
  {
    id: 'sku-001',
    sku: 'NK-AM270-BK-10',
    name: 'Nike Air Max 270 — Black / Size 10',
    category: 'Footwear',
    brand: 'Nike',
    currentStock: 48,
    reorderPoint: 250,
    safetyStock: 120,
    leadTimeDays: 14,
    avgDailyDemand: 23,
    unitCost: 89.99,
    riskScore: 98,
    riskLevel: 'critical',
    daysUntilStockout: 2,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 31, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 17, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(22, 0.15, 0.3),
    forecast: generateForecast(23, 0.18, 0.15, 0.12),
    forecastDrivers: [
      { driver: 'Seasonality (Spring)', impact: 18, description: 'Q2 seasonal uplift from spring footwear cycle' },
      { driver: 'Competitor Stockout', impact: 5, description: 'Adidas Ultra Boost OOS at major retailers' },
      { driver: 'Marketing Campaign', impact: 8, description: 'Ongoing social media influencer push' },
      { driver: 'Base Demand', impact: 69, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-002',
    sku: 'DYS-V11-ABS-BL',
    name: 'Dyson V11 Cordless Vacuum — Blue',
    category: 'Home Appliances',
    brand: 'Dyson',
    currentStock: 22,
    reorderPoint: 80,
    safetyStock: 40,
    leadTimeDays: 21,
    avgDailyDemand: 8,
    unitCost: 449.99,
    riskScore: 96,
    riskLevel: 'critical',
    daysUntilStockout: 3,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 12, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 10, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(7, 0.25, 0.4),
    forecast: generateForecast(8, 0.1, 0.25, 0.18),
    forecastDrivers: [
      { driver: 'Spring Cleaning Season', impact: 22, description: 'Annual Q1/Q2 household cleaning surge' },
      { driver: 'Viral TikTok Review', impact: 12, description: '4.2M views on #DysonV11 unboxing video' },
      { driver: 'Price Drop Event', impact: -5, description: 'Recent 10% promo slightly compresses velocity' },
      { driver: 'Base Demand', impact: 71, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-003',
    sku: 'APL-IPHN16-PBK-128',
    name: 'Apple iPhone 16 Pro — Black 128GB',
    category: 'Consumer Electronics',
    brand: 'Apple',
    currentStock: 14,
    reorderPoint: 100,
    safetyStock: 50,
    leadTimeDays: 30,
    avgDailyDemand: 11,
    unitCost: 999.00,
    riskScore: 95,
    riskLevel: 'critical',
    daysUntilStockout: 1,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 9, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 5, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(10, 0.05, 0.35),
    forecast: generateForecast(11, 0.05, 0.05, 0.15),
    forecastDrivers: [
      { driver: 'iOS 19 Announcement Effect', impact: 14, description: 'Pre-WWDC upgrade cycle acceleration' },
      { driver: 'Trade-in Program', impact: 9, description: 'Carrier trade-in promos driving new purchases' },
      { driver: 'Supply Constraint Easing', impact: 6, description: 'Taiwan fab capacity normalizing' },
      { driver: 'Base Demand', impact: 71, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-004',
    sku: 'SHK-PRO4-GRN-LG',
    name: 'Shark Hydrovac Pro 4 — Green / Large',
    category: 'Home Appliances',
    brand: 'Shark',
    currentStock: 33,
    reorderPoint: 120,
    safetyStock: 60,
    leadTimeDays: 18,
    avgDailyDemand: 14,
    unitCost: 299.99,
    riskScore: 92,
    riskLevel: 'critical',
    daysUntilStockout: 2,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 20, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 13, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(13, 0.2, 0.3),
    forecast: generateForecast(14, 0.12, 0.2, 0.14),
    forecastDrivers: [
      { driver: 'Spring Cleaning', impact: 20, description: 'Annual household cleaning demand surge' },
      { driver: 'TV Advertising Blitz', impact: 11, description: 'Q1 primetime ad spend at 3x normal rate' },
      { driver: 'Bundle Deal', impact: 7, description: 'Paired with Shark vacuum accessories' },
      { driver: 'Base Demand', impact: 62, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-005',
    sku: 'LV-NVF-CHS-M',
    name: 'Levi\'s 501 Original Jeans — Charcoal / 32x32',
    category: 'Apparel',
    brand: 'Levi\'s',
    currentStock: 67,
    reorderPoint: 200,
    safetyStock: 100,
    leadTimeDays: 25,
    avgDailyDemand: 18,
    unitCost: 59.99,
    riskScore: 89,
    riskLevel: 'critical',
    daysUntilStockout: 4,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 40, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 27, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(17, 0.12, 0.25),
    forecast: generateForecast(18, 0.08, 0.12, 0.13),
    forecastDrivers: [
      { driver: 'Spring Fashion Cycle', impact: 15, description: 'Q2 apparel demand peak begins mid-March' },
      { driver: 'Celebrity Endorsement', impact: 10, description: 'A-list actor spotted wearing 501s' },
      { driver: 'Competitor Price Increase', impact: 8, description: 'Gap & H&M raised prices, shifting demand' },
      { driver: 'Base Demand', impact: 67, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-006',
    sku: 'SNY-PS5-CON-WHT',
    name: 'Sony PlayStation 5 Controller — White',
    category: 'Gaming',
    brand: 'Sony',
    currentStock: 55,
    reorderPoint: 150,
    safetyStock: 75,
    leadTimeDays: 20,
    avgDailyDemand: 16,
    unitCost: 74.99,
    riskScore: 87,
    riskLevel: 'critical',
    daysUntilStockout: 3,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 30, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 25, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(15, 0.08, 0.3),
    forecast: generateForecast(16, 0.06, 0.08, 0.16),
    forecastDrivers: [
      { driver: 'GTA VI Release Hype', impact: 25, description: 'Pre-orders surge driving controller demand' },
      { driver: 'Spring Break Gaming', impact: 8, description: 'Student holiday gaming purchase spike' },
      { driver: 'Base Demand', impact: 67, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-007',
    sku: 'KTC-AID-MXR-SLV-5QT',
    name: 'KitchenAid Stand Mixer — Silver 5Qt',
    category: 'Kitchen',
    brand: 'KitchenAid',
    currentStock: 18,
    reorderPoint: 60,
    safetyStock: 30,
    leadTimeDays: 28,
    avgDailyDemand: 6,
    unitCost: 379.99,
    riskScore: 85,
    riskLevel: 'critical',
    daysUntilStockout: 3,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 11, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 7, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(5, 0.18, 0.35),
    forecast: generateForecast(6, 0.09, 0.18, 0.2),
    forecastDrivers: [
      { driver: 'Spring Baking Trend', impact: 18, description: 'Sourdough & pastry content surging on social' },
      { driver: 'Wedding Season Gifting', impact: 14, description: 'Q2 wedding registry additions spike' },
      { driver: 'Base Demand', impact: 68, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-008',
    sku: 'SMS-GXTA55-BLK-256',
    name: 'Samsung Galaxy Tab A9+ — Black 256GB',
    category: 'Consumer Electronics',
    brand: 'Samsung',
    currentStock: 41,
    reorderPoint: 130,
    safetyStock: 65,
    leadTimeDays: 22,
    avgDailyDemand: 12,
    unitCost: 299.99,
    riskScore: 83,
    riskLevel: 'critical',
    daysUntilStockout: 3,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 24, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 17, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(11, 0.1, 0.3),
    forecast: generateForecast(12, 0.07, 0.1, 0.15),
    forecastDrivers: [
      { driver: 'Education Cycle', impact: 16, description: 'Spring semester tablet purchases for students' },
      { driver: 'Price Competitiveness', impact: 9, description: 'iPad price increase shifted budget buyers' },
      { driver: 'Base Demand', impact: 75, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-009',
    sku: 'NRT-NSNS-WH1000XM6-BLK',
    name: 'Sony WH-1000XM6 Headphones — Black',
    category: 'Audio',
    brand: 'Sony',
    currentStock: 29,
    reorderPoint: 90,
    safetyStock: 45,
    leadTimeDays: 16,
    avgDailyDemand: 9,
    unitCost: 349.99,
    riskScore: 81,
    riskLevel: 'critical',
    daysUntilStockout: 3,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 17, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 12, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(8, 0.07, 0.28),
    forecast: generateForecast(9, 0.05, 0.07, 0.17),
    forecastDrivers: [
      { driver: 'New Model Launch Halo', impact: 20, description: 'XM6 launch halo effect on XM5 demand' },
      { driver: 'WFH Trend Persistence', impact: 12, description: 'Hybrid work driving ANC headphone demand' },
      { driver: 'Base Demand', impact: 68, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-010',
    sku: 'ADI-ULBST-WH-US10',
    name: 'Adidas Ultraboost 24 — White / US 10',
    category: 'Footwear',
    brand: 'Adidas',
    currentStock: 52,
    reorderPoint: 160,
    safetyStock: 80,
    leadTimeDays: 18,
    avgDailyDemand: 15,
    unitCost: 129.99,
    riskScore: 79,
    riskLevel: 'critical',
    daysUntilStockout: 3,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 30, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 22, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(14, 0.15, 0.28),
    forecast: generateForecast(15, 0.1, 0.15, 0.13),
    forecastDrivers: [
      { driver: 'Marathon Season', impact: 18, description: 'Spring marathon training purchase cycle' },
      { driver: 'Nike Recall Effect', impact: 9, description: 'Nike foam issue shifting some runners to Adidas' },
      { driver: 'Base Demand', impact: 73, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-011',
    sku: 'NTF-AFS-WTR-500ML-BLK',
    name: 'Hydro Flask Standard Mouth 500ml — Black',
    category: 'Sports & Outdoors',
    brand: 'Hydro Flask',
    currentStock: 88,
    reorderPoint: 220,
    safetyStock: 110,
    leadTimeDays: 12,
    avgDailyDemand: 20,
    unitCost: 34.99,
    riskScore: 76,
    riskLevel: 'critical',
    daysUntilStockout: 4,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 50, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 38, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(18, 0.22, 0.25),
    forecast: generateForecast(20, 0.15, 0.22, 0.11),
    forecastDrivers: [
      { driver: 'Outdoor Season Onset', impact: 22, description: 'Hiking & outdoor activity demand peak' },
      { driver: 'Sustainability Trend', impact: 10, description: 'Single-use plastic awareness driving reusables' },
      { driver: 'Base Demand', impact: 68, description: 'Organic steady-state demand' },
    ],
  },
  {
    id: 'sku-012',
    sku: 'BRK-EFS-CFFE-BLK-1KG',
    name: 'Breville Barista Express Espresso — Black',
    category: 'Kitchen',
    brand: 'Breville',
    currentStock: 11,
    reorderPoint: 45,
    safetyStock: 22,
    leadTimeDays: 24,
    avgDailyDemand: 4,
    unitCost: 699.99,
    riskScore: 74,
    riskLevel: 'critical',
    daysUntilStockout: 3,
    warehouses: [
      { id: 'wh-ny', name: 'Northeast DC', city: 'Newark, NJ', stock: 7, capacity: 5000 },
      { id: 'wh-la', name: 'West Coast DC', city: 'Los Angeles, CA', stock: 4, capacity: 4500 },
      { id: 'wh-chi', name: 'Midwest DC', city: 'Chicago, IL', stock: 0, capacity: 3000 },
      { id: 'wh-dal', name: 'South DC', city: 'Dallas, TX', stock: 0, capacity: 2500 },
    ],
    demandHistory: generateDemandHistory(4, 0.12, 0.4),
    forecast: generateForecast(4, 0.08, 0.12, 0.22),
    forecastDrivers: [
      { driver: 'Coffee Culture Growth', impact: 15, description: 'Home espresso category growing 12% YoY' },
      { driver: 'Starbucks Strike Effect', impact: 8, description: 'Barista strike shifted some consumers home' },
      { driver: 'Base Demand', impact: 77, description: 'Organic steady-state demand' },
    ],
  },
]

export const TOTAL_SKUS = 14000
export const WARNING_SKU_COUNT = 47
export const HEALTHY_SKU_COUNT = TOTAL_SKUS - CRITICAL_SKUS.length - WARNING_SKU_COUNT

export const PAST_DECISIONS: Decision[] = [
  {
    id: 'dec-001',
    skuId: 'sku-013',
    skuName: 'Instant Pot Duo 7-in-1 — 6Qt',
    timestamp: '2026-03-10T14:22:00Z',
    agentRecommendation: {
      orderQty: 1500,
      totalCost: 134985,
      eoqQty: 1200,
      safetyStockQty: 200,
      leadTimeBufferQty: 100,
      splits: [
        { warehouse: 'Northeast DC', city: 'Newark, NJ', units: 900, transitDays: 2, shippingCost: 2250 },
        { warehouse: 'West Coast DC', city: 'Los Angeles, CA', units: 600, transitDays: 3, shippingCost: 1800 },
      ],
    },
    humanAction: 'approved',
    status: 'evaluated',
    executedAt: '2026-03-10T16:00:00Z',
  },
  {
    id: 'dec-002',
    skuId: 'sku-014',
    skuName: 'Weber Spirit II E-310 Grill',
    timestamp: '2026-03-12T09:15:00Z',
    agentRecommendation: {
      orderQty: 200,
      totalCost: 79980,
      eoqQty: 160,
      safetyStockQty: 25,
      leadTimeBufferQty: 15,
      splits: [
        { warehouse: 'Northeast DC', city: 'Newark, NJ', units: 120, transitDays: 4, shippingCost: 9600 },
        { warehouse: 'West Coast DC', city: 'Los Angeles, CA', units: 80, transitDays: 5, shippingCost: 7200 },
      ],
    },
    humanAction: 'overridden',
    humanOverrideQty: 150,
    status: 'evaluated',
    executedAt: '2026-03-12T11:30:00Z',
  },
  {
    id: 'dec-003',
    skuId: 'sku-015',
    skuName: 'Vitamix 5200 Blender — Black',
    timestamp: '2026-03-15T11:45:00Z',
    agentRecommendation: {
      orderQty: 300,
      totalCost: 119970,
      eoqQty: 240,
      safetyStockQty: 40,
      leadTimeBufferQty: 20,
      splits: [
        { warehouse: 'Northeast DC', city: 'Newark, NJ', units: 180, transitDays: 2, shippingCost: 3600 },
        { warehouse: 'West Coast DC', city: 'Los Angeles, CA', units: 120, transitDays: 3, shippingCost: 2800 },
      ],
    },
    humanAction: 'approved',
    status: 'evaluated',
    executedAt: '2026-03-15T13:00:00Z',
  },
  {
    id: 'dec-004',
    skuId: 'sku-016',
    skuName: 'Patagonia Nano Puff Jacket — M',
    timestamp: '2026-03-18T15:30:00Z',
    agentRecommendation: {
      orderQty: 800,
      totalCost: 71992,
      eoqQty: 640,
      safetyStockQty: 100,
      leadTimeBufferQty: 60,
      splits: [
        { warehouse: 'Northeast DC', city: 'Newark, NJ', units: 480, transitDays: 3, shippingCost: 4800 },
        { warehouse: 'West Coast DC', city: 'Los Angeles, CA', units: 320, transitDays: 4, shippingCost: 3520 },
      ],
    },
    humanAction: 'approved',
    status: 'executed',
    executedAt: '2026-03-18T17:00:00Z',
  },
  {
    id: 'dec-005',
    skuId: 'sku-017',
    skuName: 'Fitbit Charge 6 — Black',
    timestamp: '2026-03-22T10:00:00Z',
    agentRecommendation: {
      orderQty: 600,
      totalCost: 89970,
      eoqQty: 480,
      safetyStockQty: 80,
      leadTimeBufferQty: 40,
      splits: [
        { warehouse: 'Northeast DC', city: 'Newark, NJ', units: 360, transitDays: 2, shippingCost: 3600 },
        { warehouse: 'West Coast DC', city: 'Los Angeles, CA', units: 240, transitDays: 3, shippingCost: 2640 },
      ],
    },
    humanAction: 'pending',
    status: 'pending',
  },
]

export const PAST_FEEDBACK: FeedbackRecord[] = [
  {
    id: 'fb-001',
    decisionId: 'dec-001',
    skuId: 'sku-013',
    skuName: 'Instant Pot Duo 7-in-1 — 6Qt',
    outcome: {
      decisionId: 'dec-001',
      actualDemand: 1480,
      stockoutOccurred: false,
      overstockUnits: 20,
      fillRate: 0.987,
      evaluatedAt: '2026-03-24T09:00:00Z',
      revenueImpact: 132830,
    },
    modelAdjustment: {
      type: 'reinforced',
      delta: 0.032,
      reason: 'Forecast accuracy within 1.3% of actual demand. Seasonal driver weight increased.',
    },
    plannerBiasScore: 0.12,
  },
  {
    id: 'fb-002',
    decisionId: 'dec-002',
    skuId: 'sku-014',
    skuName: 'Weber Spirit II E-310 Grill',
    outcome: {
      decisionId: 'dec-002',
      actualDemand: 198,
      stockoutOccurred: true,
      overstockUnits: 0,
      fillRate: 0.758,
      evaluatedAt: '2026-03-24T09:00:00Z',
      revenueImpact: -18400,
    },
    modelAdjustment: {
      type: 'penalized',
      delta: -0.048,
      reason: 'Human override of 150 vs recommended 200 caused stockout. Planner bias +0.15 applied.',
    },
    plannerBiasScore: 0.27,
  },
  {
    id: 'fb-003',
    decisionId: 'dec-003',
    skuId: 'sku-015',
    skuName: 'Vitamix 5200 Blender — Black',
    outcome: {
      decisionId: 'dec-003',
      actualDemand: 285,
      stockoutOccurred: false,
      overstockUnits: 15,
      fillRate: 1.0,
      evaluatedAt: '2026-03-25T09:00:00Z',
      revenueImpact: 114000,
    },
    modelAdjustment: {
      type: 'reinforced',
      delta: 0.021,
      reason: 'Perfect fill rate achieved. Small overstock within acceptable safety buffer.',
    },
    plannerBiasScore: 0.22,
  },
]
