'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'
import { useWin5Store } from '@/store/win5Store'
import { ChevronDown, Save, RefreshCw, FlaskConical, Users, Flame, Zap, Target, TrendingUp, Shield, Swords, BarChart3 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

type Horse = {
  horse_number: number
  horse_name: string
  waku?: number
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

type OverlapResponse = {
  date: string
  total_tickets: number
  overlap: Record<string, Array<{ horse_number: number; count: number; ratio: number }>>
}

type HeatmapResponse = {
  max_per_race: number
  total_combinations: number
  global_max_route_payout: number
  races: Array<{
    race_order: number
    race_name: string
    items: Array<{
      horse_number: number
      horse_name: string
      odds: number
      value_score: number
      max_route_payout: number
      max_route_ratio: number
      routes_count: number
    }>
  }>
}

const toRoman = (n: number) => {
  if (!Number.isFinite(n) || n <= 0) return ''
  const map: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let x = Math.floor(n)
  let out = ''
  for (const [v, s] of map) {
    while (x >= v) {
      out += s
      x -= v
    }
  }
  return out
}

const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★']
const VOL_COLORS = ['', 'text-blue-400', 'text-cyan-400', 'text-yellow-400', 'text-orange-400', 'text-red-500']
const VOL_BORDER = ['', 'border-blue-500/30', 'border-cyan-500/30', 'border-yellow-500/30', 'border-orange-500/30', 'border-red-500/30']
const VOL_GLOW = ['', 'shadow-blue-500/10', 'shadow-cyan-500/10', 'shadow-yellow-500/10', 'shadow-orange-500/10', 'shadow-red-500/10']
const WIN5_PRICE = 100

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' } }),
}

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tornado-accent/20 to-tornado-orange/10 flex items-center justify-center">
        <Icon size={16} className="text-tornado-accent" />
      </div>
      <h2 className="text-base font-bold tracking-tight">{label}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  )
}

function GlassCard({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm shadow-lg shadow-black/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

function PremiumButton({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const base = 'relative font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-gradient-to-r from-tornado-accent to-tornado-orange text-white shadow-lg shadow-tornado-accent/20 hover:shadow-tornado-accent/40 hover:brightness-110 active:scale-[0.98]',
    secondary: 'bg-white/[0.06] border border-white/10 text-white hover:bg-white/[0.10] hover:border-white/20 active:scale-[0.98]',
    ghost: 'text-tornado-muted hover:text-white hover:bg-white/[0.04] active:scale-[0.98]',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

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
  const [overlapLoading, setOverlapLoading] = useState(false)
  const [overlap, setOverlap] = useState<OverlapResponse | null>(null)
  const [overlapMsg, setOverlapMsg] = useState('')
  const [heatmapLoading, setHeatmapLoading] = useState(false)
  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null)
  const [heatmapMsg, setHeatmapMsg] = useState('')
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

  const provisionalByRace = useMemo(() => {
    const m: Record<number, boolean> = {}
    for (const r of races) {
      const hs = r.horses || []
      m[r.race_order] = hs.length > 0 && hs.every(h => !h.waku || h.waku === 0)
    }
    return m
  }, [races])

  const horseNoLabel = (raceOrder: number, horseNumber: number) => {
    return provisionalByRace[raceOrder] ? toRoman(horseNumber) : String(horseNumber)
  }

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

  const runOverlap = async () => {
    const token = localStorage.getItem('tornado_token') || ''
    if (!token) {
      setOverlapMsg('ログインが必要です')
      return
    }
    if (Object.keys(customTickets).length === 0) return

    setOverlapLoading(true)
    setOverlapMsg('')
    try {
      const res = await fetch(`${API}/api/win5/overlap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tickets: customTickets }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setOverlapMsg(data.error || '取得に失敗しました')
        setOverlap(null)
      } else {
        setOverlap(data)
      }
    } catch {
      setOverlapMsg('通信エラーが発生しました')
    } finally {
      setOverlapLoading(false)
    }
  }

  const runHeatmap = async () => {
    const token = localStorage.getItem('tornado_token') || ''
    if (!token) {
      setHeatmapMsg('ログインが必要です')
      return
    }
    if (Object.keys(customTickets).length === 0) return

    setHeatmapLoading(true)
    setHeatmapMsg('')
    try {
      const res = await fetch(`${API}/api/win5/explosion/heatmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tickets: customTickets, max_per_race: 6 }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setHeatmapMsg(data.error || '取得に失敗しました')
        setHeatmap(null)
      } else {
        setHeatmap(data)
      }
    } catch {
      setHeatmapMsg('通信エラーが発生しました')
    } finally {
      setHeatmapLoading(false)
    }
  }

  const totalVolatility = races.reduce((sum, r) => sum + r.volatility_rank, 0)
  const overallLabel = totalVolatility >= 20 ? '大荒れ週' : totalVolatility >= 15 ? '荒れ模様' : totalVolatility >= 12 ? 'やや混戦' : 'やや堅め'
  const overallColor = totalVolatility >= 20 ? 'text-red-400' : totalVolatility >= 15 ? 'text-orange-400' : totalVolatility >= 12 ? 'text-yellow-400' : 'text-blue-400'
  const overallGradient = totalVolatility >= 20 ? 'from-red-500/20 to-red-900/5' : totalVolatility >= 15 ? 'from-orange-500/20 to-orange-900/5' : totalVolatility >= 12 ? 'from-yellow-500/20 to-yellow-900/5' : 'from-blue-500/20 to-blue-900/5'

  const live = calcFromTickets(customTickets)

  const perRaceDiagnostics = races.map(r => {
    const selectedNums = customTickets[`R${r.race_order}`] || []
    const selected = r.horses.filter(h => selectedNums.includes(h.horse_number))
    const valueAvg = selected.length ? selected.reduce((s, h) => s + (h.value_score || 0), 0) / selected.length : 0
    const coverage = Math.min(
      selected.reduce((s, h) => s + (h.ai_win_prob || 0), 0),
      0.95,
    )
    return { race_order: r.race_order, selectedCount: selected.length, valueAvg, coverage }
  })

  const survival = (() => {
    let cum = 1
    const per = races.map(r => {
      const selectedNums = customTickets[`R${r.race_order}`] || []
      const p = r.horses
        .filter(h => selectedNums.includes(h.horse_number))
        .reduce((s, h) => s + (h.ai_win_prob || 0), 0)
      const capped = Math.min(p, 0.95)
      cum *= capped
      return { race_order: r.race_order, p: capped, cum }
    })
    return { per, overall: per.length ? per[per.length - 1].cum : 0 }
  })()

  const explosion = (() => {
    const picks = races.map(r => {
      const selectedNums = customTickets[`R${r.race_order}`] || []
      const selected = r.horses.filter(h => selectedNums.includes(h.horse_number))
      if (selected.length === 0) return null
      const withOdds = selected.filter(h => (h.odds || 0) > 0)
      const best = (withOdds.length > 0 ? withOdds : selected).sort((a, b) => (b.odds || 0) - (a.odds || 0))[0]
      return { race_order: r.race_order, horse_number: best.horse_number, horse_name: best.horse_name, odds: best.odds || 0 }
    })
    if (picks.some(p => !p)) return null
    const oddsProd = (picks as any[]).reduce((acc, p) => acc * ((p.odds || 0) > 0 ? p.odds : 20), 1)
    const payout = Math.floor(oddsProd * WIN5_PRICE * 0.7)
    return { picks: picks as any[], payout }
  })()

  const explosionRoutes = (() => {
    if (Object.keys(customTickets).length === 0) return []
    const candidates = races.map(r => {
      const selectedNums = customTickets[`R${r.race_order}`] || []
      const selected = r.horses
        .filter(h => selectedNums.includes(h.horse_number))
        .map(h => ({ ...h, effOdds: (h.odds || 0) > 0 ? h.odds : 20 }))
        .sort((a, b) => b.effOdds - a.effOdds)
        .slice(0, 3)
      return { race_order: r.race_order, horses: selected }
    })
    if (candidates.some(c => c.horses.length === 0)) return []

    let routes: Array<{ picks: Array<{ race_order: number; horse_number: number; horse_name: string; odds: number }>; oddsProd: number }> = [
      { picks: [], oddsProd: 1 },
    ]
    for (const c of candidates) {
      const next: typeof routes = []
      for (const r0 of routes) {
        for (const h of c.horses) {
          next.push({
            picks: [...r0.picks, { race_order: c.race_order, horse_number: h.horse_number, horse_name: h.horse_name, odds: h.effOdds }],
            oddsProd: r0.oddsProd * h.effOdds,
          })
        }
      }
      routes = next.slice(0, 5000)
    }

    return routes
      .map(r => ({
        picks: r.picks,
        payout: Math.floor(r.oddsProd * WIN5_PRICE * 0.7),
      }))
      .sort((a, b) => b.payout - a.payout)
      .slice(0, 5)
  })()

  return (
    <AuthGuard>
    <div className="min-h-screen max-w-2xl mx-auto pb-24">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06]" style={{ background: 'linear-gradient(180deg, rgba(6,11,24,0.95) 0%, rgba(6,11,24,0.85) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image src="/brand/logo.png" alt="TornadoAI" width={34} height={34} className="rounded-xl" />
            </Link>
            <div>
              <h1 className="text-base font-bold tracking-tight">WIN5 Dashboard</h1>
              <p className="text-[11px] text-tornado-muted -mt-0.5">AI-Powered Analysis</p>
            </div>
          </div>
          <HamburgerMenu />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-32 gap-4">
          <div className="tornado-spinner" />
          <p className="text-sm text-tornado-muted">データを読み込んでいます...</p>
        </div>
      ) : races.length === 0 ? (
        <div className="text-center mt-32 px-6">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Target size={28} className="text-tornado-muted" />
          </div>
          <p className="text-lg font-bold mb-2">レースデータなし</p>
          <p className="text-sm text-tornado-muted">WIN5対象レースは毎週日曜に更新されます</p>
        </div>
      ) : (
        <motion.div
          className="p-4 space-y-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {/* Overall Status Card */}
          <motion.div variants={fadeUp} custom={0}>
            <GlassCard className={`p-5 bg-gradient-to-br ${overallGradient}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-tornado-muted font-medium uppercase tracking-wider">This Week&apos;s WIN5</p>
                  <p className={`text-xl font-bold ${overallColor}`}>{overallLabel}</p>
                  {carryover > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-tornado-gold animate-pulse" />
                      <p className="text-xs text-tornado-gold font-medium">
                        Carryover: ¥{carryover.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-tornado-muted font-medium uppercase tracking-wider">Volatility</p>
                  <p className="text-3xl font-black gradient-text">{totalVolatility}</p>
                  <p className="text-[11px] text-tornado-muted">/25</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Quick Guide */}
          <motion.div variants={fadeUp} custom={1}>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center">
                    <Zap size={13} className="text-tornado-gold" />
                  </div>
                  <p className="text-sm font-bold">クイックガイド</p>
                </div>
                <Link href="/chat" className="text-xs text-tornado-accent hover:text-tornado-orange transition-colors font-medium">
                  AIに相談 →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { step: '1', text: '買い目を生成', sub: '予算/目標/リスク設定' },
                  { step: '2', text: '馬をタップで調整', sub: '点数は自動計算' },
                  { step: '3', text: '保存して比較', sub: '履歴で振り返り' },
                  { step: '4', text: '分析で仕上げ', sub: 'シミュ/被り/ヒートマップ' },
                ].map(item => (
                  <div key={item.step} className="flex items-start gap-2 rounded-xl bg-white/[0.02] border border-white/[0.04] p-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-tornado-accent to-tornado-orange text-[10px] font-bold flex items-center justify-center text-white">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-xs font-medium leading-tight">{item.text}</p>
                      <p className="text-[10px] text-tornado-muted leading-tight">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              {Object.keys(customTickets).length === 0 && (
                <p className="text-[11px] text-tornado-muted mt-3 text-center">
                  下の「買い目生成」を押して始めましょう
                </p>
              )}
            </GlassCard>
          </motion.div>

          {/* Strategy Summary */}
          {Object.keys(customTickets).length > 0 && (
            <motion.div variants={fadeUp} custom={2}>
              <SectionLabel icon={TrendingUp} label="戦略サマリー" />
              <GlassCard className="p-4 space-y-3">
                {/* Survival Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-tornado-muted font-medium">生存率（目安）</p>
                    <p className="text-sm font-bold">{(survival.overall * 100).toFixed(1)}%</p>
                  </div>
                  <div className="flex gap-1">
                    {survival.per.map(x => {
                      const pct = Math.min(x.p * 100, 100)
                      const color = pct >= 60 ? 'bg-emerald-500' : pct >= 35 ? 'bg-yellow-500' : 'bg-red-500'
                      return (
                        <div key={x.race_order} className="flex-1">
                          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[9px] text-tornado-muted text-center mt-0.5">R{x.race_order}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Explosion Route */}
                {explosion && (
                  <div className="rounded-xl bg-gradient-to-r from-tornado-accent/10 to-transparent border border-tornado-accent/10 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-tornado-muted">爆発ルート（目安）</p>
                      <p className="text-sm font-bold text-tornado-accent">~¥{explosion.payout.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      {explosion.picks.map((p: any) => (
                        <span key={p.race_order} className="text-[10px] bg-white/[0.06] rounded-md px-1.5 py-0.5 text-tornado-muted">
                          R{p.race_order}:{horseNoLabel(p.race_order, p.horse_number)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                <div className="space-y-1.5">
                  {carryover > 0 && (
                    <div className="flex items-start gap-2 text-[11px] text-tornado-gold">
                      <span className="mt-0.5">●</span>
                      <span>キャリーあり：点数を広げても期待値が上がりやすい週です。</span>
                    </div>
                  )}
                  {survival.per.some(x => x.p < 0.25) && (
                    <div className="flex items-start gap-2 text-[11px] text-red-400">
                      <span className="mt-0.5">●</span>
                      <span>一部レースで生存率が低めです。波乱度の高いレースは頭数を広げましょう。</span>
                    </div>
                  )}
                  {perRaceDiagnostics.some(d => d.selectedCount === 0) && (
                    <div className="flex items-start gap-2 text-[11px] text-red-400">
                      <span className="mt-0.5">●</span>
                      <span>未選択のレースがあります（点数が0になります）。</span>
                    </div>
                  )}
                  {live.investment > budget && (
                    <div className="flex items-start gap-2 text-[11px] text-red-400">
                      <span className="mt-0.5">●</span>
                      <span>予算超過（投資 ¥{live.investment.toLocaleString()} / 予算 ¥{budget.toLocaleString()}）</span>
                    </div>
                  )}
                  {perRaceDiagnostics.some(d => d.valueAvg > 0 && d.valueAvg < 0.8) && (
                    <div className="flex items-start gap-2 text-[11px] text-yellow-400">
                      <span className="mt-0.5">●</span>
                      <span>期待値が低めの選択が含まれています。</span>
                    </div>
                  )}
                </div>

                {/* Explosion Routes Top 5 */}
                {explosionRoutes.length > 0 && (
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3">
                    <p className="text-xs font-bold mb-2 flex items-center gap-1.5">
                      <Zap size={12} className="text-tornado-gold" />
                      爆発ルート Top 5
                    </p>
                    <div className="space-y-1.5">
                      {explosionRoutes.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-tornado-muted w-4">#{idx + 1}</span>
                            <div className="flex gap-0.5">
                              {r.picks.map(p => (
                                <span key={p.race_order} className="text-[10px] bg-white/[0.04] rounded px-1 py-0.5 text-tornado-muted">
                                  R{p.race_order}:{horseNoLabel(p.race_order, p.horse_number)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-white">~¥{r.payout.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* Race Cards */}
          <motion.div variants={fadeUp} custom={3}>
            <SectionLabel icon={Target} label="レース分析" />
          </motion.div>
          {races.map((race, idx) => {
            const isExpanded = expandedRace === race.race_order
            const selectedHorses = customTickets[`R${race.race_order}`] || []
            return (
              <motion.div key={race.race_order} variants={fadeUp} custom={4 + idx}>
                <GlassCard className={`overflow-hidden ${VOL_BORDER[race.volatility_rank] || 'border-white/[0.06]'} shadow-md ${VOL_GLOW[race.volatility_rank] || ''}`}>
                  <button
                    onClick={() => setExpandedRace(isExpanded ? null : race.race_order)}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
                        <span className="text-sm font-black">R{race.race_order}</span>
                      </div>
                      {selectedHorses.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-tornado-accent text-[9px] font-bold flex items-center justify-center">
                          {selectedHorses.length}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{race.venue}{race.race_number}R {race.race_name}</p>
                      <p className="text-xs text-tornado-muted">{race.distance} / {race.field_size}頭</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${VOL_COLORS[race.volatility_rank]} tracking-wider`}>
                        {STARS[race.volatility_rank]}
                      </p>
                      <p className="text-[10px] text-tornado-muted">{race.volatility_desc || `波乱度${race.volatility_rank}`}</p>
                    </div>
                    <ChevronDown size={16} className={`text-tornado-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && race.horses.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.06] px-4 pb-4">
                          {provisionalByRace[race.race_order] && (
                            <p className="text-[10px] text-tornado-muted pt-3">
                              ※ 枠順未確定のため番号は仮表示（I, II, III...）です
                            </p>
                          )}
                          {/* Table Header */}
                          <div className="grid grid-cols-[2rem_1fr_3.5rem_3.5rem_3.5rem] gap-1 text-[10px] text-tornado-muted font-medium uppercase tracking-wider py-2.5 border-b border-white/[0.04]">
                            <span>No.</span>
                            <span>馬名</span>
                            <span className="text-right">Odds</span>
                            <span className="text-right">AI%</span>
                            <span className="text-right">Value</span>
                          </div>
                          {/* Horse Rows */}
                          {race.horses
                            .sort((a, b) => b.ai_win_prob - a.ai_win_prob)
                            .map(h => {
                              const isSelected = selectedHorses.includes(h.horse_number)
                              return (
                                <button
                                  key={h.horse_number}
                                  onClick={() => toggleHorse(race.race_order, h.horse_number)}
                                  className={`w-full grid grid-cols-[2rem_1fr_3.5rem_3.5rem_3.5rem] gap-1 items-center py-2 border-b border-white/[0.03] text-sm transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-tornado-accent/10 border-l-2 border-l-tornado-accent'
                                      : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                                  }`}
                                >
                                  <span className={`text-xs font-bold ${isSelected ? 'text-tornado-accent' : ''}`}>
                                    {horseNoLabel(race.race_order, h.horse_number)}
                                  </span>
                                  <span className={`text-left text-xs truncate ${isSelected ? 'text-white font-medium' : 'text-tornado-text'}`}>
                                    {h.horse_name}
                                  </span>
                                  <span className="text-right text-xs text-tornado-muted">
                                    {h.odds > 0 ? `${h.odds}x` : '-'}
                                  </span>
                                  <span className="text-right text-xs">
                                    {(h.ai_win_prob * 100).toFixed(1)}%
                                  </span>
                                  <span className={`text-right text-xs font-bold ${
                                    h.value_score >= 1.5 ? 'text-emerald-400' : h.value_score <= 0.7 ? 'text-red-400' : 'text-tornado-text'
                                  }`}>
                                    {h.value_score.toFixed(2)}
                                  </span>
                                </button>
                              )
                            })}
                          {/* Selection Summary */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-tornado-muted">選択中:</span>
                              {selectedHorses.length > 0 ? (
                                <div className="flex gap-1">
                                  {selectedHorses.map(n => (
                                    <span key={n} className="text-[10px] bg-tornado-accent/20 text-tornado-accent rounded-md px-1.5 py-0.5 font-medium">
                                      {horseNoLabel(race.race_order, n)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-tornado-muted">なし</span>
                              )}
                            </div>
                            <span className="text-[11px] text-tornado-muted">{selectedHorses.length}頭</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            )
          })}

          {/* Controls Panel */}
          <motion.div variants={fadeUp} custom={10}>
            <SectionLabel icon={Swords} label="生成設定" />
            <GlassCard className="p-5 space-y-5">
              {/* Budget */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-tornado-muted font-medium uppercase tracking-wider">Budget</label>
                  <span className="text-lg font-black">¥{budget.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={30000}
                  step={1000}
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] accent-tornado-accent cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-tornado-muted mt-1">
                  <span>¥1,000</span>
                  <span>¥30,000</span>
                </div>
              </div>

              {/* Target */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-tornado-muted font-medium uppercase tracking-wider">Target Payout</label>
                  <span className="text-lg font-black text-tornado-gold">¥{targetPayout.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={20000000}
                  step={100000}
                  value={targetPayout}
                  onChange={e => setTargetPayout(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/[0.08] accent-tornado-gold cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-tornado-muted mt-1">
                  <span>¥100K</span>
                  <span>¥20M</span>
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className="text-xs text-tornado-muted font-medium uppercase tracking-wider block mb-2">Risk Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'conservative', label: '堅実', icon: Shield, color: 'blue' },
                    { value: 'balanced', label: 'バランス', icon: Target, color: 'yellow' },
                    { value: 'aggressive', label: '攻め', icon: Flame, color: 'red' },
                  ].map(opt => {
                    const isActive = riskLevel === opt.value
                    const colorMap: Record<string, string> = {
                      blue: isActive ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : '',
                      yellow: isActive ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' : '',
                      red: isActive ? 'border-red-500/50 bg-red-500/10 text-red-400' : '',
                    }
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setRiskLevel(opt.value as any)}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? colorMap[opt.color]
                            : 'border-white/[0.06] bg-white/[0.02] text-tornado-muted hover:bg-white/[0.04]'
                        }`}
                      >
                        <opt.icon size={16} />
                        <span className="text-xs font-medium">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Generate Buttons */}
              <div className="space-y-2 pt-1">
                <PremiumButton
                  onClick={generateTicket}
                  disabled={generatingTicket}
                  className="w-full py-3.5 text-sm"
                >
                  {generatingTicket ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="tornado-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      生成中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Zap size={16} />
                      買い目生成
                    </span>
                  )}
                </PremiumButton>

                <PremiumButton
                  onClick={generateScenarios}
                  disabled={generating}
                  variant="secondary"
                  className="w-full py-3 text-sm"
                >
                  {generating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="tornado-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      生成中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <BarChart3 size={16} />
                      3シナリオ生成
                    </span>
                  )}
                </PremiumButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Current Ticket */}
          {Object.keys(customTickets).length > 0 && (
            <motion.div variants={fadeUp} custom={11}>
              <SectionLabel icon={Target} label="現在の買い目" />
              <GlassCard className="p-4 space-y-4">
                {/* Race Selection Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {races.map((race) => {
                    const sel = customTickets?.[`R${race.race_order}`] || []
                    return (
                      <div key={race.race_order} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 text-center">
                        <p className="text-[10px] text-tornado-muted font-medium">R{race.race_order}</p>
                        <p className="text-base font-black mt-0.5">{sel.length}</p>
                        <p className="text-[9px] text-tornado-muted truncate">
                          {sel.map(n => horseNoLabel(race.race_order, n)).join(', ') || '-'}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div>
                    <p className="text-[10px] text-tornado-muted">点数 / 投資</p>
                    <p className="text-sm font-bold">{live.total_combinations}点 / ¥{live.investment.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-tornado-muted">推定払戻</p>
                    <p className="text-sm font-bold gradient-text">~¥{live.estimated_payout_range.max.toLocaleString()}</p>
                  </div>
                </div>

                {ticket && (
                  <div className="flex justify-between text-[11px] text-tornado-muted px-1">
                    <span>的中率: {(ticket.hit_probability * 100).toFixed(1)}%</span>
                    <span>期待値: {ticket.expected_value.toFixed(2)}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <PremiumButton
                    onClick={saveCurrentTicket}
                    disabled={saving}
                    variant="secondary"
                    className="py-2.5 text-xs"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <Save size={14} />
                      {saving ? '保存中...' : '保存'}
                    </span>
                  </PremiumButton>
                  <Link href="/history" className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl bg-white/[0.06] border border-white/10 text-tornado-muted hover:text-white hover:bg-white/[0.10] transition-all">
                    保存済みを見る →
                  </Link>
                </div>
                {saveMsg && (
                  <p className="text-xs text-center text-tornado-muted">{saveMsg}</p>
                )}

                {/* Analysis Tools */}
                <div className="space-y-2">
                  <p className="text-[11px] text-tornado-muted font-medium uppercase tracking-wider">分析ツール</p>
                  <div className="grid grid-cols-2 gap-2">
                    <PremiumButton onClick={runSimulate} disabled={simulating} variant="ghost" className="py-2.5 text-xs border border-white/[0.06] rounded-xl">
                      <span className="flex items-center justify-center gap-1.5">
                        <FlaskConical size={14} />
                        {simulating ? '計算中...' : '1頭飛んだら？'}
                      </span>
                    </PremiumButton>
                    <PremiumButton
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
                      variant="ghost"
                      className="py-2.5 text-xs border border-white/[0.06] rounded-xl"
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <RefreshCw size={14} />
                        最新で更新
                      </span>
                    </PremiumButton>
                    <PremiumButton onClick={runOverlap} disabled={overlapLoading} variant="ghost" className="py-2.5 text-xs border border-white/[0.06] rounded-xl">
                      <span className="flex items-center justify-center gap-1.5">
                        <Users size={14} />
                        {overlapLoading ? '集計中...' : '被り度チェック'}
                      </span>
                    </PremiumButton>
                    <PremiumButton onClick={runHeatmap} disabled={heatmapLoading} variant="ghost" className="py-2.5 text-xs border border-white/[0.06] rounded-xl">
                      <span className="flex items-center justify-center gap-1.5">
                        <Flame size={14} />
                        {heatmapLoading ? '作成中...' : '爆発ヒートマップ'}
                      </span>
                    </PremiumButton>
                  </div>
                </div>

                {overlapMsg && <p className="text-xs text-tornado-muted text-center">{overlapMsg}</p>}

                {/* Overlap Results */}
                {overlap && overlap.total_tickets > 0 && (
                  <GlassCard className="p-3 space-y-2">
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <Users size={13} className="text-tornado-accent" />
                      被り度（{overlap.total_tickets}件中）
                    </p>
                    <div className="space-y-1.5">
                      {Object.entries(overlap.overlap || {}).map(([rk, arr]) => (
                        <div key={rk} className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-white w-6">{rk}</span>
                          <div className="flex flex-wrap gap-1">
                            {arr.map(x => {
                              const ratio = Math.round(x.ratio * 100)
                              const color = ratio >= 50 ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-white/[0.04] text-tornado-muted border-white/[0.06]'
                              const ro = Number(String(rk).replace('R', '')) || 0
                              return (
                                <span key={x.horse_number} className={`text-[10px] px-1.5 py-0.5 rounded-md border ${color}`}>
                                  {(ro ? horseNoLabel(ro, x.horse_number) : String(x.horse_number))}({ratio}%)
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    {Object.values(overlap.overlap || {}).some(arr => arr.some(x => x.ratio >= 0.5)) && (
                      <p className="text-[10px] text-red-400 flex items-start gap-1">
                        <span>●</span>
                        被りが高い馬あり。高配当狙いなら穴に寄せると効果的です。
                      </p>
                    )}
                  </GlassCard>
                )}

                {heatmapMsg && <p className="text-xs text-tornado-muted text-center">{heatmapMsg}</p>}

                {/* Heatmap */}
                {heatmap && (
                  <GlassCard className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold flex items-center gap-1.5">
                        <Flame size={13} className="text-tornado-accent" />
                        爆発ヒートマップ
                      </p>
                      <span className="text-[10px] text-tornado-muted">{heatmap.total_combinations}通り</span>
                    </div>
                    <p className="text-[10px] text-tornado-muted">
                      基準: ~¥{heatmap.global_max_route_payout.toLocaleString()}
                    </p>
                    <div className="space-y-3">
                      {heatmap.races.map(r => (
                        <div key={r.race_order}>
                          <p className="text-[11px] text-tornado-muted mb-1.5 font-medium">R{r.race_order} {r.race_name}</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {r.items.map(it => {
                              const alpha = Math.min(0.85, 0.15 + it.max_route_ratio * 0.7)
                              return (
                                <div
                                  key={it.horse_number}
                                  className="rounded-xl border border-white/10 p-2"
                                  style={{ background: `linear-gradient(135deg, rgba(239,68,68,${alpha}), rgba(249,115,22,${alpha * 0.6}))` }}
                                >
                                  <p className="text-[11px] font-bold text-white">#{horseNoLabel(r.race_order, it.horse_number)}</p>
                                  <p className="text-[9px] text-white/80 truncate">{it.horse_name}</p>
                                  <p className="text-[10px] text-white/90 font-medium mt-0.5">~¥{it.max_route_payout.toLocaleString()}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-tornado-muted">
                      ※ オッズ未確定時は概算。週後半ほど精度が上がります。
                    </p>
                  </GlassCard>
                )}

                {/* Simulation Results */}
                {sim && (
                  <GlassCard className="p-3 space-y-2">
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <FlaskConical size={13} className="text-tornado-accent" />
                      払戻シミュレーション
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-2.5">
                        <p className="text-[10px] text-tornado-muted">通常</p>
                        <p className="text-xs font-bold">¥{sim.base_estimated_payout.min.toLocaleString()}</p>
                        <p className="text-[10px] text-tornado-muted">~¥{sim.base_estimated_payout.max.toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-tornado-accent/5 border border-tornado-accent/10 p-2.5">
                        <p className="text-[10px] text-tornado-accent">人気馬飛び</p>
                        <p className="text-xs font-bold text-tornado-accent">¥{sim.favorite_miss_estimated_payout.min.toLocaleString()}</p>
                        <p className="text-[10px] text-tornado-muted">~¥{sim.favorite_miss_estimated_payout.max.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {sim.per_race.map(r => (
                        <div key={r.race_order} className="flex justify-between text-[10px] text-tornado-muted py-0.5 border-b border-white/[0.03]">
                          <span>
                            R{r.race_order} {r.race_name}（人気:{r.favorite_horse_number ? horseNoLabel(r.race_order, r.favorite_horse_number) : '-'}）
                          </span>
                          <span>{r.base_odds_range.min.toFixed(1)}~{r.base_odds_range.max.toFixed(1)} → {r.favorite_miss_odds_range.min.toFixed(1)}~{r.favorite_miss_odds_range.max.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-tornado-muted">
                      ※ オッズ未確定の時期は概算になることがあります。
                    </p>
                  </GlassCard>
                )}

                <p className="text-[10px] text-tornado-muted text-center">
                  馬をタップして選択を調整（点数・投資額はリアルタイム計算）
                </p>
              </GlassCard>
            </motion.div>
          )}

          {/* Scenarios */}
          {scenarios && (
            <motion.div variants={fadeUp} custom={12}>
              <SectionLabel icon={BarChart3} label="3シナリオ" />
              <div className="space-y-3">
                {[
                  { key: 'main' as const, label: '本線（堅実）', icon: Shield, color: 'blue', data: scenarios.main },
                  { key: 'medium' as const, label: '中荒れ', icon: Target, color: 'yellow', data: scenarios.medium },
                  { key: 'wild' as const, label: '大荒れ', icon: Flame, color: 'red', data: scenarios.wild },
                ].map(({ key, label, icon: Icon, color, data }) => {
                  const colorMap: Record<string, string> = {
                    blue: 'from-blue-500/10 border-blue-500/20',
                    yellow: 'from-yellow-500/10 border-yellow-500/20',
                    red: 'from-red-500/10 border-red-500/20',
                  }
                  const textColor: Record<string, string> = {
                    blue: 'text-blue-400',
                    yellow: 'text-yellow-400',
                    red: 'text-red-400',
                  }
                  return (
                    <GlassCard key={key} className={`p-4 bg-gradient-to-br ${colorMap[color]} to-transparent`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={16} className={textColor[color]} />
                        <p className={`text-sm font-bold ${textColor[color]}`}>{label}</p>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 mb-3">
                        {races.map((race) => {
                          const sel = data.tickets?.[`R${race.race_order}`] || []
                          return (
                            <div key={race.race_order} className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2 text-center">
                              <p className="text-[9px] text-tornado-muted">R{race.race_order}</p>
                              <p className="text-sm font-black">{sel.length}</p>
                              <p className="text-[9px] text-tornado-muted truncate">
                                {sel.map(n => horseNoLabel(race.race_order, n)).join(',')}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-tornado-muted">
                          {data.total_combinations}点 / ¥{data.investment?.toLocaleString()}
                        </span>
                        <span className="text-sm font-bold gradient-text">
                          ~¥{(data.estimated_payout_range?.max || 0).toLocaleString()}
                        </span>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
    </AuthGuard>
  )
}
