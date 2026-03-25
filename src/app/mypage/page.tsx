'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  BarChart3, MessageCircle, Target, Layers, Activity, Zap,
  ChevronRight, Clock, TrendingUp,
  FileText, History,
} from 'lucide-react'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'

const API = process.env.NEXT_PUBLIC_API_URL || ''
const WIN5_PRICE = 100

type Horse = {
  horse_number: number
  horse_name: string
  waku?: number
}

type Race = {
  race_order: number
  venue: string
  race_number: number
  race_name: string
  volatility_rank: number
  horses: Horse[]
}

type TicketRow = {
  id: string
  created_at: string
  date: string
  budget: number
  target_payout: number
  risk_level: string
  ticket_data: Record<string, number[]>
  total_combinations: number
  expected_value: number
  hit_probability: number
  scenario_type: string
}

const toRoman = (num: number) => {
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
  let n = num
  let out = ''
  for (const [v, s] of map) {
    while (n >= v) {
      out += s
      n -= v
    }
  }
  return out || String(num)
}

const nextSundayYyyymmdd = () => {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const jst = new Date(utc + 9 * 60 * 60 * 1000)
  const day = jst.getDay() // Sun=0
  let daysUntilSunday = (7 - day) % 7
  if (daysUntilSunday === 0 && jst.getHours() >= 18) daysUntilSunday = 7
  const d = new Date(jst)
  d.setDate(jst.getDate() + daysUntilSunday)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${dd}`
}

export default function MyPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [weekRaces, setWeekRaces] = useState<Race[]>([])
  const [carryover, setCarryover] = useState(0)
  const [weekFetchedAt, setWeekFetchedAt] = useState<Date | null>(null)
  const [weekLoading, setWeekLoading] = useState(true)
  const [weekTicketsCount, setWeekTicketsCount] = useState(0)
  const [latestTicket, setLatestTicket] = useState<TicketRow | null>(null)
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [wideReady, setWideReady] = useState<boolean | null>(null)
  const [wideDate, setWideDate] = useState<string>('')
  const [wideCount, setWideCount] = useState<number>(0)

  useEffect(() => {
    const token = localStorage.getItem('tornado_token') || ''
    if (!token) return
    fetch(`${API}/api/win5/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('tornado_token') || ''
    if (!token) return
    fetch(`${API}/api/wide/races`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(r => r.json())
      .then(data => {
        setWideReady(typeof data?.ready === 'boolean' ? data.ready : null)
        setWideDate(String(data?.date || ''))
        setWideCount(Number(data?.count || 0))
      })
      .catch(() => setWideReady(null))
  }, [])

  useEffect(() => {
    setWeekLoading(true)
    Promise.all([
      fetch(`${API}/api/win5/races`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${API}/api/win5/carryover`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ carryover: 0 })),
    ])
      .then(([racesData, carryData]) => {
        setWeekRaces((racesData?.races || []) as Race[])
        setCarryover(Number(carryData?.carryover || 0))
        setWeekFetchedAt(new Date())
      })
      .catch(() => {})
      .finally(() => setWeekLoading(false))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('tornado_token') || ''
    if (!token) return
    setTicketsLoading(true)
    const date = nextSundayYyyymmdd()
    fetch(`${API}/api/win5/tickets/my?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(r => r.json())
      .then(data => {
        const list = (data?.tickets || []) as TicketRow[]
        setWeekTicketsCount(Number(data?.count || list.length || 0))
        setLatestTicket(list[0] || null)
      })
      .catch(() => {})
      .finally(() => setTicketsLoading(false))
  }, [])

  const volatilityTotal = useMemo(() => weekRaces.reduce((s, r) => s + (r.volatility_rank || 3), 0), [weekRaces])
  const overallLabel = volatilityTotal >= 20 ? '大荒れ週' : volatilityTotal >= 15 ? '荒れ模様' : volatilityTotal >= 12 ? 'やや混戦' : 'やや堅め'
  const overallColor = volatilityTotal >= 20 ? '#ef4444' : volatilityTotal >= 15 ? '#f97316' : volatilityTotal >= 12 ? '#fbbf24' : '#3b82f6'

  const wideDateLabel = useMemo(() => {
    if (!wideDate || wideDate.length !== 8) return ''
    return `${wideDate.slice(0, 4)}/${wideDate.slice(4, 6)}/${wideDate.slice(6, 8)}`
  }, [wideDate])

  const provisionalByRace = useMemo(() => {
    const m: Record<number, boolean> = {}
    for (const r of weekRaces) {
      const hs = r.horses || []
      m[r.race_order] = hs.length > 0 && hs.every(h => !h.waku || h.waku === 0)
    }
    return m
  }, [weekRaces])

  const horseNameByRace = useMemo(() => {
    const m: Record<number, Record<number, string>> = {}
    for (const r of weekRaces) {
      const inner: Record<number, string> = {}
      for (const h of r.horses || []) inner[h.horse_number] = h.horse_name
      m[r.race_order] = inner
    }
    return m
  }, [weekRaces])

  const horseNoLabel = (raceOrder: number, horseNumber: number) => {
    return provisionalByRace[raceOrder] ? toRoman(horseNumber) : String(horseNumber)
  }

  const horseLabel = (raceOrder: number, horseNumber: number) => {
    const no = horseNoLabel(raceOrder, horseNumber)
    const name = horseNameByRace[raceOrder]?.[horseNumber]
    return name ? `${no} ${name}` : no
  }

  const latestTicketInvestment = latestTicket?.budget || (latestTicket?.total_combinations || 0) * WIN5_PRICE

  const resumeOnDashboard = () => {
    if (!latestTicket) return
    const draft = {
      tickets: latestTicket.ticket_data || {},
      total_combinations: latestTicket.total_combinations || 0,
      investment: latestTicketInvestment,
      estimated_payout_range: { min: 0, max: latestTicket.target_payout || 0 },
      hit_probability: latestTicket.hit_probability || 0,
      expected_value: latestTicket.expected_value || 0,
      risk_level: latestTicket.risk_level || 'balanced',
      scenario_type: latestTicket.scenario_type || 'saved',
    }
    localStorage.setItem('tornado_draft_ticket', JSON.stringify(draft))
    router.push('/dashboard')
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF] overflow-x-hidden">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0B0E11]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link href="/"><Image src="/brand/logo.png" alt="TornadoAI" width={32} height={32} className="rounded-lg" /></Link>
              <span className="text-lg font-bold">TornadoAI</span>
            </div>
            <HamburgerMenu />
          </div>
        </header>

        {/* ── Weekly Status / Your Hub ── */}
        <section className="px-6 pt-6 pb-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border-2 p-5" style={{ borderColor: `${overallColor}30`, background: `linear-gradient(135deg, ${overallColor}14, transparent)` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#B7BDC6] font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" style={{ color: overallColor }} />
                    今週のWIN5
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color: overallColor }}>
                    {weekLoading ? '読み込み中...' : overallLabel}
                  </p>
                  <p className="text-xs text-[#B7BDC6] mt-2">
                    総合波乱度: <span className="font-bold text-white/90">{volatilityTotal}</span>/25
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#B7BDC6]">キャリー</p>
                  <p className="text-sm font-bold text-[#fbbf24]">¥{carryover.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#B7BDC6]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  最終更新: {weekFetchedAt ? weekFetchedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }) : '-'}
                </span>
                <Link href="/dashboard" className="font-bold hover:text-white transition-colors" style={{ color: overallColor }}>
                  詳細 →
                </Link>
              </div>
            </div>

            <div className="rounded-xl border-2 border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs text-[#B7BDC6] font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#a855f7]" />
                あなたの今週
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-black/20 border border-white/5 p-3">
                  <p className="text-[10px] text-[#B7BDC6]">保存した買い目（今週）</p>
                  <p className="text-xl font-black mt-0.5">{ticketsLoading ? '-' : weekTicketsCount}<span className="text-xs ml-1 text-[#B7BDC6]">件</span></p>
                </div>
                <div className="rounded-lg bg-black/20 border border-white/5 p-3">
                  <p className="text-[10px] text-[#B7BDC6]">おすすめ</p>
                  <p className="text-sm font-bold mt-1 text-white/90">生成→微調整→保存</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-[1.01] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 8px 30px rgba(239,68,68,0.25)' }}
                >
                  <BarChart3 className="w-4 h-4" />
                  ダッシュボード
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-white/15 bg-white/5 font-bold text-sm transition-all hover:border-[#f97316]/40 hover:bg-[#f97316]/10 hover:text-[#f97316] active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4" />
                  AIに相談
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-3">
            <div className="rounded-xl border-2 border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#B7BDC6] font-medium">今週の最新保存買い目</p>
                  {latestTicket ? (
                    <>
                      <p className="text-sm font-bold mt-1 text-white/90">
                        {latestTicket.total_combinations}点 / ¥{latestTicketInvestment.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-[#B7BDC6] mt-1">
                        {new Date(latestTicket.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} に保存
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold mt-1 text-white/70">{ticketsLoading ? '読み込み中...' : 'まだ保存がありません'}</p>
                  )}
                </div>
                <Link href="/history" className="text-xs font-bold text-white/60 hover:text-white transition-colors whitespace-nowrap">
                  履歴を見る →
                </Link>
              </div>

              {latestTicket && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((order) => {
                    const key = `R${order}`
                    const sel = latestTicket.ticket_data?.[key] || []
                    const summary = sel.map(n => horseLabel(order, n)).join(' / ') || '-'
                    return (
                      <div key={order} className="rounded-lg bg-black/20 border border-white/5 p-2.5 text-center">
                        <p className="text-[10px] text-[#B7BDC6] font-medium">R{order}</p>
                        <p className="text-base font-black mt-0.5">{sel.length}</p>
                        <p className="text-[9px] text-[#B7BDC6] truncate" title={summary}>{summary}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={resumeOnDashboard}
                  disabled={!latestTicket}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.30), rgba(59,130,246,0.10))', border: '1px solid rgba(59,130,246,0.35)' }}
                >
                  <Target className="w-4 h-4 text-[#3b82f6]" />
                  続きから調整
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 hover:bg-white/[0.08]"
                >
                  <Zap className="w-4 h-4 text-[#fbbf24]" />
                  新規で生成
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-3">
            <div className="rounded-xl border-2 border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#B7BDC6] font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#fbbf24]" />
                    ワイド（利益確保）
                  </p>
                  <p className="text-sm font-bold mt-1 text-white/90">
                    {wideDateLabel ? `対象開催日: ${wideDateLabel}` : '対象開催日: -'}
                  </p>
                  <p className="text-[11px] text-[#B7BDC6] mt-1">
                    レース数: {wideCount || 0} / ステータス:{' '}
                    {wideReady === null ? (
                      <span className="text-white/50">取得中</span>
                    ) : wideReady ? (
                      <span className="text-[#10b981] font-bold">利用可能</span>
                    ) : (
                      <span className="text-[#fbbf24] font-bold">準備中（前日10:30以降）</span>
                    )}
                  </p>
                </div>
                <Link href="/wide" className="text-xs font-bold text-white/60 hover:text-white transition-colors whitespace-nowrap">
                  開く →
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/wide"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-[1.01] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.35), rgba(249,115,22,0.18))', border: '1px solid rgba(251,191,36,0.35)' }}
                >
                  <Layers className="w-4 h-4 text-[#fbbf24]" />
                  ワイドモード
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 hover:bg-white/[0.08]"
                >
                  <MessageCircle className="w-4 h-4 text-[#3b82f6]" />
                  ワイドを相談
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick Links ── */}
        <section className="py-14 sm:py-20 px-6 bg-[#181A20]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                <span className="text-[#fbbf24]">クイック</span>アクセス
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: '/dashboard', icon: BarChart3, title: 'ダッシュボード', desc: '今週のWIN5対象5レースと波乱度をチェック', color: '#f97316' },
                { href: '/wide', icon: Layers, title: 'ワイドモード', desc: '予算×目標払戻でワイド買い目を提案', color: '#fbbf24' },
                { href: '/chat', icon: MessageCircle, title: 'AIチャット', desc: '予算・目標・スタイルを伝えて買い目を相談', color: '#3b82f6' },
                { href: '/history', icon: FileText, title: '保存した買い目', desc: '保存したパターンを比較・確認', color: '#a855f7' },
                { href: '/results', icon: History, title: '過去WIN5結果', desc: '過去の配当・キャリーオーバーを確認', color: '#10b981' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      borderColor: `${item.color}30`,
                      background: `linear-gradient(135deg, ${item.color}08, transparent)`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${item.color}15`, boxShadow: `0 0 20px ${item.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold" style={{ color: item.color }}>{item.title}</p>
                      <p className="text-xs text-[#B7BDC6] mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition shrink-0" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Profile (if data exists) ── */}
        {profile && profile.count > 0 && (
          <section className="py-14 sm:py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-xl border-2 border-[#a855f7]/30 p-5 sm:p-6" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.06), transparent)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#a855f7]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#a855f7]">あなたの傾向</p>
                    <p className="text-xs text-[#B7BDC6]">保存データ {profile.count}件から分析</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-[#a855f7]">{Math.round(profile.avg_total_combinations)}<span className="text-xs ml-1">点</span></p>
                    <p className="text-[10px] text-[#B7BDC6] mt-1">平均点数</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-[#fbbf24]">¥{Math.round(profile.avg_investment).toLocaleString()}</p>
                    <p className="text-[10px] text-[#B7BDC6] mt-1">平均投資額</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/90">{profile.style}</p>
                <p className="text-xs text-[#B7BDC6] mt-1">{profile.tip}</p>
              </div>
            </div>
          </section>
        )}

      </div>
    </AuthGuard>
  )
}
