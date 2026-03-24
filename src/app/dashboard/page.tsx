'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'
import { useWin5Store } from '@/store/win5Store'

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

type SimResult = {
  base_estimated_payout: { min: number; max: number }
  favorite_miss_estimated_payout: { min: number; max: number }
  per_race: Array<{
    race_order: number
    race_name: string
    favorite_horse_number: number | null
    base_odds_range: { min: number; max: number }
    favorite_miss_odds_range: { min: number; max: number }
  }>
}

const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★']
const VOL_COLORS = ['', 'text-blue-400', 'text-cyan-400', 'text-yellow-400', 'text-orange-400', 'text-red-500']
const VOL_BG = ['', 'border-blue-800', 'border-cyan-800', 'border-yellow-800', 'border-orange-800', 'border-red-800']
const WIN5_PRICE = 100

export default function DashboardPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [carryover, setCarryover] = useState(0)
  const budget = useWin5Store(s => s.budget)
  const setBudget = useWin5Store(s => s.setBudget)
  const targetPayout = useWin5Store(s => s.targetPayout)
  const setTargetPayout = useWin5Store(s => s.setTargetPayout)
  const riskLevel = useWin5Store(s => s.riskLevel)
  const setRiskLevel = useWin5Store(s => s.setRiskLevel)
  const [scenarios, setScenarios] = useState<Scenarios | null>(null)
  const [ticket, setTicket] = useState<TicketResult | null>(null)
  const [customTickets, setCustomTickets] = useState<Record<string, number[]>>({})
  const [generating, setGenerating] = useState(false)
  const [generatingTicket, setGeneratingTicket] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [simulating, setSimulating] = useState(false)
  const [sim, setSim] = useState<SimResult | null>(null)
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tornado_draft_ticket')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.tickets) {
        setTicket(parsed)
        setCustomTickets(parsed.tickets)
        setSaveMsg('チャットの買い目を反映しました')
      }
      localStorage.removeItem('tornado_draft_ticket')
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetch(`${API}/api/win5/carryover`)
      .then(r => r.json())
      .then(data => setCarryover(Number(data.carryover || 0)))
      .catch(() => setCarryover(0))
  }, [])

  const toggleHorse = (raceOrder: number, horseNumber: number) => {
    const key = `R${raceOrder}`
    setCustomTickets(prev => {
      const current = prev[key] || []
      const next = current.includes(horseNumber)
        ? current.filter(n => n !== horseNumber)
        : [...current, horseNumber].sort((a, b) => a - b)
      return { ...prev, [key]: next }
    })
  }

  const calcFromTickets = (ticketsMap: Record<string, number[]>) => {
    const counts = races.map(r => (ticketsMap[`R${r.race_order}`] || []).length)
    const total = counts.reduce((p, c) => p * (c || 0), 1)
    const investment = total * WIN5_PRICE

    // Rough estimate like backend: product(minOdds/maxOdds) * 100 * 0.7
    let minOddsProduct = 1
    let maxOddsProduct = 1

    for (const r of races) {
      const key = `R${r.race_order}`
      const selected = ticketsMap[key] || []
      const odds = r.horses
        .filter(h => selected.includes(h.horse_number) && h.odds > 0)
        .map(h => h.odds)

      if (odds.length === 0) {
        minOddsProduct *= 5
        maxOddsProduct *= 20
      } else {
        minOddsProduct *= Math.min(...odds)
        maxOddsProduct *= Math.max(...odds)
      }
    }

    return {
      counts,
      total_combinations: total,
      investment,
      estimated_payout_range: {
        min: Math.floor(minOddsProduct * WIN5_PRICE * 0.7),
        max: Math.floor(maxOddsProduct * WIN5_PRICE * 0.7),
      },
    }
  }

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

  const generateTicket = async () => {
    setGeneratingTicket(true)
    try {
      const res = await fetch(`${API}/api/win5/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, target_payout: targetPayout, risk_level: riskLevel, refresh: true }),
      })
      const data = await res.json()
      setTicket(data)
      setCustomTickets(data.tickets || {})
      setSim(null)
    } catch {
      // ignore
    } finally {
      setGeneratingTicket(false)
    }
  }

  const saveCurrentTicket = async () => {
    const token = localStorage.getItem('tornado_token') || ''
    if (!token) {
      setSaveMsg('ログインが必要です')
      return
    }
    if (Object.keys(customTickets).length === 0) return

    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`${API}/api/win5/tickets/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket: {
            tickets: customTickets,
            total_combinations: live.total_combinations,
            investment: live.investment,
            estimated_payout_range: live.estimated_payout_range,
            hit_probability: ticket?.hit_probability || 0,
            expected_value: ticket?.expected_value || 0,
            risk_level: riskLevel,
            target_payout: targetPayout,
            scenario_type: 'custom',
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveMsg(data.error || '保存に失敗しました')
      } else {
        setSaveMsg('保存しました')
      }
    } catch {
      setSaveMsg('通信エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const runSimulate = async () => {
    if (Object.keys(customTickets).length === 0) return
    setSimulating(true)
    try {
      const res = await fetch(`${API}/api/win5/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickets: customTickets }),
      })
      const data = await res.json()
      if (res.ok) setSim(data)
    } catch {
      // ignore
    } finally {
      setSimulating(false)
    }
  }

  const totalVolatility = races.reduce((sum, r) => sum + r.volatility_rank, 0)
  const overallDesc = totalVolatility >= 20 ? '🔴 大荒れ週' : totalVolatility >= 15 ? '🟠 荒れ模様' : totalVolatility >= 12 ? '🟡 やや混戦' : '🔵 やや堅め'

  const live = calcFromTickets(customTickets)

  return (
    <AuthGuard>
    <div className="min-h-screen max-w-2xl mx-auto pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-tornado-deep/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl">🌪️</Link>
          <h1 className="text-lg font-bold">WIN5 ダッシュボード</h1>
        </div>
        <HamburgerMenu />
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
              {carryover > 0 && (
                <p className="text-xs mt-1" style={{ color: '#fbbf24' }}>
                  キャリーオーバー: ¥{carryover.toLocaleString()}
                </p>
              )}
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
                        <tr
                          key={h.horse_number}
                          className="border-t border-tornado-border/30 cursor-pointer hover:bg-white/[0.02]"
                          onClick={() => toggleHorse(race.race_order, h.horse_number)}
                        >
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
                  <p className="text-[11px] text-tornado-muted mt-2">
                    選択中: {(customTickets[`R${race.race_order}`] || []).join(', ') || 'なし'}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Budget / Target / Risk + Generate */}
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

            <div>
              <label className="text-sm text-tornado-muted">目標払戻</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min={100000}
                  max={20000000}
                  step={100000}
                  value={targetPayout}
                  onChange={e => setTargetPayout(Number(e.target.value))}
                  className="flex-1 accent-tornado-gold"
                />
                <span className="text-lg font-bold w-24 text-right">¥{targetPayout.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-tornado-muted">リスク</label>
              <select
                value={riskLevel}
                onChange={e => setRiskLevel(e.target.value as any)}
                className="bg-tornado-bg border border-tornado-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="conservative">堅実</option>
                <option value="balanced">バランス</option>
                <option value="aggressive">攻め</option>
              </select>
            </div>

            <button
              onClick={generateTicket}
              disabled={generatingTicket}
              className="w-full py-3 bg-gradient-to-r from-tornado-accent to-tornado-orange text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-40"
            >
              {generatingTicket ? '🌪️ 生成中...' : '🌪️ 買い目生成'}
            </button>

            <button
              onClick={generateScenarios}
              disabled={generating}
              className="w-full py-3 bg-tornado-accent text-white font-bold rounded-lg hover:opacity-90 transition disabled:opacity-40"
            >
              {generating ? '🌪️ 生成中...' : '🌪️ 3シナリオ生成'}
            </button>
          </div>

          {/* Ticket (live) */}
          {Object.keys(customTickets).length > 0 && (
            <div className="bg-tornado-card border border-tornado-border rounded-xl p-4 space-y-3">
              <h2 className="text-lg font-bold">🎯 現在の買い目</h2>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {races.map((race, i) => {
                  const sel = customTickets?.[`R${race.race_order}`] || []
                  return (
                    <div key={i} className="bg-tornado-bg rounded-lg p-2">
                      <p className="text-tornado-muted">R{race.race_order}</p>
                      <p className="font-bold text-sm">{sel.length}頭</p>
                      <p className="text-tornado-muted">{sel.join(',') || '-'}</p>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-sm">
                <span>{live.total_combinations}点 / ¥{live.investment.toLocaleString()}</span>
                <span className="text-tornado-accent font-bold">〜¥{live.estimated_payout_range.max.toLocaleString()}</span>
              </div>
              {ticket && (
                <div className="text-xs text-tornado-muted flex justify-between">
                  <span>的中率(目安): {(ticket.hit_probability * 100).toFixed(1)}%</span>
                  <span>期待値(目安): {ticket.expected_value.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={saveCurrentTicket}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm font-bold hover:bg-white/[0.08] transition disabled:opacity-40"
                >
                  {saving ? '保存中...' : '💾 保存'}
                </button>
                <a href="/history" className="text-sm text-tornado-accent underline">
                  保存済みを見る →
                </a>
              </div>
              {saveMsg && <p className="text-xs text-tornado-muted">{saveMsg}</p>}

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={runSimulate}
                  disabled={simulating}
                  className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-sm font-bold hover:bg-white/[0.06] transition disabled:opacity-40"
                >
                  {simulating ? '計算中...' : '🧪 1頭飛んだら？'}
                </button>
                <button
                  onClick={() => {
                    setLoading(true)
                    fetch(`${API}/api/win5/races?refresh=1`)
                      .then(r => r.json())
                      .then(data => {
                        setRaces(data.races || [])
                        setLoading(false)
                      })
                      .catch(() => setLoading(false))
                  }}
                  className="text-sm text-tornado-muted underline"
                >
                  最新で更新
                </button>
              </div>

              {sim && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
                  <p className="text-sm font-bold">🧪 払戻シミュレーション（目安）</p>
                  <div className="flex justify-between text-xs text-tornado-muted">
                    <span>通常: ¥{sim.base_estimated_payout.min.toLocaleString()}〜¥{sim.base_estimated_payout.max.toLocaleString()}</span>
                    <span>人気馬飛び: ¥{sim.favorite_miss_estimated_payout.min.toLocaleString()}〜¥{sim.favorite_miss_estimated_payout.max.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-[11px] text-tornado-muted">
                    {sim.per_race.map(r => (
                      <div key={r.race_order} className="flex justify-between">
                        <span>R{r.race_order} {r.race_name}（人気: {r.favorite_horse_number ?? '-'}）</span>
                        <span>{r.base_odds_range.min.toFixed(1)}〜{r.base_odds_range.max.toFixed(1)} → {r.favorite_miss_odds_range.min.toFixed(1)}〜{r.favorite_miss_odds_range.max.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-tornado-muted">
                    ※ オッズ未確定の時期は概算（0扱い）になり、差分が出ないことがあります。
                  </p>
                </div>
              )}

              <p className="text-[11px] text-tornado-muted">
                ※ 馬をタップして選択を増減できます（点数・投資額はリアルタイム計算）。
              </p>
            </div>
          )}

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
    </AuthGuard>
  )
}
