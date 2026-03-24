'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

type Horse = {
  horse_number: number
  horse_name: string
  odds: number
  ai_win_prob: number
  value_score: number
  popularity_rank: number
}

type Race = {
  race_order: number
  venue: string
  race_number: number
  race_name: string
  field_size: number
  distance: string
  volatility_rank: number
  volatility_desc: string
  horses: Horse[]
}

type TicketResult = {
  tickets: Record<string, number[]>
  total_combinations: number
  investment: number
  estimated_payout_range: { min: number; max: number }
  hit_probability: number
  expected_value: number
  selections: any[]
}

type Scenarios = {
  main: TicketResult
  medium: TicketResult
  wild: TicketResult
}

const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★']
const VOL_COLORS = ['', 'text-blue-400', 'text-cyan-400', 'text-yellow-400', 'text-orange-400', 'text-red-500']
const VOL_BG = ['', 'border-blue-800', 'border-cyan-800', 'border-yellow-800', 'border-orange-800', 'border-red-800']

export default function DashboardPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState(5000)
  const [scenarios, setScenarios] = useState<Scenarios | null>(null)
  const [generating, setGenerating] = useState(false)
  const [expandedRace, setExpandedRace] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API}/api/win5/races`)
      .then(r => r.json())
      .then(data => {
        setRaces(data.races || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const generateScenarios = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`${API}/api/win5/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget }),
      })
      const data = await res.json()
      setScenarios(data)
    } catch {}
    setGenerating(false)
  }

  const totalVolatility = races.reduce((sum, r) => sum + r.volatility_rank, 0)
  const overallDesc = totalVolatility >= 20 ? '🔴 大荒れ週' : totalVolatility >= 15 ? '🟠 荒れ模様' : totalVolatility >= 12 ? '🟡 やや混戦' : '🔵 やや堅め'

  return (
    <div className="min-h-screen max-w-2xl mx-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-tornado-bg border-b border-tornado-border px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-2xl">🌪️</Link>
        <h1 className="text-lg font-bold">WIN5 ダッシュボード</h1>
        <Link href="/chat" className="ml-auto text-sm text-tornado-accent hover:underline">💬 AIに相談</Link>
      </header>

      {loading ? (
        <div className="text-center mt-20 text-tornado-muted animate-pulse">🌪️ データ取得中...</div>
      ) : races.length === 0 ? (
        <div className="text-center mt-20 text-tornado-muted">
          <p className="text-xl mb-4">レースデータなし</p>
          <p className="text-sm">WIN5対象レースは毎週日曜です</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Overall */}
          <div className="bg-tornado-card border border-tornado-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-tornado-muted">今週のWIN5</p>
              <p className="text-lg font-bold">{overallDesc}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-tornado-muted">総合波乱度</p>
              <p className="text-2xl font-bold text-tornado-accent">{totalVolatility}/25</p>
            </div>
          </div>

          {/* 5 Races */}
          {races.map(race => (
            <div
              key={race.race_order}
              className={`bg-tornado-card border ${VOL_BG[race.volatility_rank] || 'border-tornado-border'} rounded-xl overflow-hidden`}
            >
              <button
                onClick={() => setExpandedRace(expandedRace === race.race_order ? null : race.race_order)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className="bg-tornado-bg rounded-lg w-10 h-10 flex items-center justify-center font-bold text-sm">
                  R{race.race_order}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{race.venue}{race.race_number}R {race.race_name}</p>
                  <p className="text-sm text-tornado-muted">{race.distance} / {race.field_size}頭</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${VOL_COLORS[race.volatility_rank]}`}>
                    {STARS[race.volatility_rank]}
                  </p>
                  <p className="text-xs text-tornado-muted">{race.volatility_desc || `波乱度${race.volatility_rank}`}</p>
                </div>
              </button>

              {/* Expanded: Horse list */}
              {expandedRace === race.race_order && race.horses.length > 0 && (
                <div className="border-t border-tornado-border px-4 pb-4">
                  <table className="w-full text-sm mt-2">
                    <thead>
                      <tr className="text-tornado-muted text-xs">
                        <th className="text-left py-1">番</th>
                        <th className="text-left">馬名</th>
                        <th className="text-right">オッズ</th>
                        <th className="text-right">AI勝率</th>
                        <th className="text-right">期待値</th>
                      </tr>
                    </thead>
                    <tbody>
                      {race.horses
                        .sort((a, b) => b.ai_win_prob - a.ai_win_prob)
                        .map(h => (
                        <tr key={h.horse_number} className="border-t border-tornado-border/30">
                          <td className="py-1.5 font-bold">{h.horse_number}</td>
                          <td>{h.horse_name}</td>
                          <td className="text-right text-tornado-muted">{h.odds > 0 ? `${h.odds}倍` : '-'}</td>
                          <td className="text-right">{(h.ai_win_prob * 100).toFixed(1)}%</td>
                          <td className={`text-right font-bold ${h.value_score >= 1.5 ? 'text-green-400' : h.value_score <= 0.7 ? 'text-red-400' : ''}`}>
                            {h.value_score.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {/* Budget Slider + Generate */}
          <div className="bg-tornado-card border border-tornado-border rounded-xl p-4 space-y-4">
            <div>
              <label className="text-sm text-tornado-muted">予算</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min={1000}
                  max={30000}
                  step={1000}
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="flex-1 accent-tornado-accent"
                />
                <span className="text-lg font-bold w-24 text-right">¥{budget.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={generateScenarios}
              disabled={generating}
              className="w-full py-3 bg-tornado-accent text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-40"
            >
              {generating ? '🌪️ 生成中...' : '🌪️ 3シナリオ生成'}
            </button>
          </div>

          {/* Scenarios */}
          {scenarios && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">📊 3シナリオ</h2>
              {[
                { key: 'main' as const, label: '🔵 本線（堅実）', data: scenarios.main },
                { key: 'medium' as const, label: '🟡 中荒れ', data: scenarios.medium },
                { key: 'wild' as const, label: '🔴 大荒れ', data: scenarios.wild },
              ].map(({ key, label, data }) => (
                <div key={key} className="bg-tornado-card border border-tornado-border rounded-xl p-4">
                  <p className="font-bold mb-2">{label}</p>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs mb-3">
                    {races.map((race, i) => {
                      const sel = data.tickets?.[`R${race.race_order}`] || []
                      return (
                        <div key={i} className="bg-tornado-bg rounded-lg p-2">
                          <p className="text-tornado-muted">R{race.race_order}</p>
                          <p className="font-bold text-sm">{sel.length}頭</p>
                          <p className="text-tornado-muted">{sel.join(',')}</p>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{data.total_combinations}点 / ¥{data.investment?.toLocaleString()}</span>
                    <span className="text-tornado-accent font-bold">
                      〜¥{(data.estimated_payout_range?.max || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
