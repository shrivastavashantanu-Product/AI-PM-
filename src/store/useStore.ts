import { create } from 'zustand'
import type { SKU, Decision, FeedbackRecord } from '../types'
import { PAST_DECISIONS, PAST_FEEDBACK } from '../data/mockData'

interface Store {
  // Navigation
  selectedSKU: SKU | null
  setSelectedSKU: (sku: SKU | null) => void

  // Decisions
  decisions: Decision[]
  addDecision: (d: Decision) => void
  updateDecision: (id: string, update: Partial<Decision>) => void

  // Feedback
  feedbackRecords: FeedbackRecord[]
  addFeedback: (f: FeedbackRecord) => void

  // Model state
  plannerBiasScore: number
  setPlannerBiasScore: (score: number) => void
  modelAccuracy: number
  setModelAccuracy: (acc: number) => void

  // Current decision flow
  pendingDecision: Decision | null
  setPendingDecision: (d: Decision | null) => void
}

export const useStore = create<Store>((set) => ({
  selectedSKU: null,
  setSelectedSKU: (sku) => set({ selectedSKU: sku }),

  decisions: PAST_DECISIONS,
  addDecision: (d) => set((state) => ({ decisions: [d, ...state.decisions] })),
  updateDecision: (id, update) =>
    set((state) => ({
      decisions: state.decisions.map((d) => (d.id === id ? { ...d, ...update } : d)),
    })),

  feedbackRecords: PAST_FEEDBACK,
  addFeedback: (f) => set((state) => ({ feedbackRecords: [f, ...state.feedbackRecords] })),

  plannerBiasScore: 0.22,
  setPlannerBiasScore: (score) => set({ plannerBiasScore: score }),

  modelAccuracy: 0.934,
  setModelAccuracy: (acc) => set({ modelAccuracy: acc }),

  pendingDecision: null,
  setPendingDecision: (d) => set({ pendingDecision: d }),
}))
