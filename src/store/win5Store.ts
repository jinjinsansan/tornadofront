import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RiskLevel = 'conservative' | 'balanced' | 'aggressive'

type Win5State = {
  budget: number
  targetPayout: number
  riskLevel: RiskLevel
  setBudget: (v: number) => void
  setTargetPayout: (v: number) => void
  setRiskLevel: (v: RiskLevel) => void
}

export const useWin5Store = create<Win5State>()(
  persist(
    (set) => ({
      budget: 5000,
      targetPayout: 5000000,
      riskLevel: 'balanced',
      setBudget: (v) => set({ budget: v }),
      setTargetPayout: (v) => set({ targetPayout: v }),
      setRiskLevel: (v) => set({ riskLevel: v }),
    }),
    { name: 'tornado_win5_settings_v1' },
  ),
)
