'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AuthGuard from '@/components/auth/AuthGuard'
import FreeTrialBanner from '@/components/auth/FreeTrialBanner'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'
import { Target, RefreshCw, Sparkles, Shield, ChevronRight, BarChart3 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || ''

type RaceRow = {
  race_id: string
  venue: string
  race_number: number
  race_name: string
  start_time?: string
  distance?: string
}

type WideCandidate = {
  pair: Array<{ horse_number: number; horse_name: string }>
  wide_odds: { min: number; max: number }
  hit_probability_est: number
  multiplier_mid: number
  expected_payout_range: { min: number; max: number }
}

type WideResult = {
  race_id: string
  budget: number
  target_payout: number
  target_multiplier: number
  recommended: WideCandidate
  alternatives: WideCandidate[]
  count: number
  note?: string
}

type RaceListResponse = {
  date: string
  ready: boolean
  ready_at: string | null
  ready_race_id?: string | null
  races: RaceRow[]
  count: number
}

export default function WidePage() {
  const [date, setDate] = useState('')
  const [ready, setReady] = useState(true)
  const [readyAt, setReadyAt] = useState<string | null>(null)
  const [readyRaceId, setReadyRaceId] = useState<string | null>(null)
  const [races, setRaces] = useState<RaceRow[]>([])
  const [raceId, setRaceId] = useState('')
  const [budget, setBudget] = useState(1000)
  const [targetPayout, setTargetPayout] = useState(5000)
  const [loading, setLoading] = useState(true)
  const [genLoading, setGenLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<WideResult | null>(null)

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('tornado_token') || '' : ''), [])

  const targetMult = useMemo(() => {
    if (budget <= 0) return 0
    return targetPayout / budget
  }, [budget, targetPayout])

  const loadRaces = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${API}/api/wide/races`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, cache: 'no-store' })
      const data = (await res.json().catch(() => ({} as any))) as RaceListResponse & { error?: string }
      if (!res.ok) throw new Error(data?.error || '取得に失敗しました')
      const list = (data?.races || []) as RaceRow[]
      setDate(String(data?.date || ''))
      setReady(Boolean(data?.ready ?? true))
      setReadyAt(data?.ready_at || null)
      setReadyRaceId((data as any)?.ready_race_id || null)
      setRaces(list)
      setRaceId(prev => prev || list?.[0]?.race_id || '')
    } catch (e: any) {
      setError(e?.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generate = async () => {
    if (!raceId) return
    setGenLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${API}/api/wide/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ race_id: raceId, budget, target_payout: targetPayout }),
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) throw new Error(data?.error || '生成に失敗しました')
      setResult(data as WideResult)
    } catch (e: any) {
      setError(e?.message || 'エラーが発生しました')
    } finally {
      setGenLoading(false)
    }
  }

  const raceLabel = (r: RaceRow) => {
    const time = r.start_time ? ` ${r.start_time}` : ''
    const dist = r.distance ? ` / ${r.distance}` : ''
    return `${r.venue}${r.race_number}R ${r.race_name}${time}${dist}`
  }

  const dateLabel = useMemo(() => {
    if (!date || date.length !== 8) return ''
    return `${date.slice(0, 4)}/${date.slice(4, 6)}/${date.slice(6, 8)}`
  }, [date])

  const readyAtLabel = useMemo(() => {
    if (!readyAt) return ''
    const d = new Date(readyAt)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }, [readyAt])

  const targetGapLabel = useMemo(() => {
    if (!result) return ''
    const gap = result.recommended.multiplier_mid - result.target_multiplier
    const sign = gap > 0 ? '+' : ''
    return `${sign}${gap.toFixed(2)}倍`
  }, [result])

  const pairText = (c: WideCandidate) => `${c.pair[0]?.horse_number} ${c.pair[0]?.horse_name} × ${c.pair[1]?.horse_number} ${c.pair[1]?.horse_name}`

  return (
    <AuthGuard>
      <FreeTrialBanner />
      <div className="min-h-screen max-w-2xl mx-auto pb-24 bg-[#0B0E11]">
        <header className="sticky top-0 z-30 border-b border-white/[0.06]" style={{ background: 'linear-gradient(180deg, rgba(6,11,24,0.95) 0%, rgba(6,11,24,0.85) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Image src="/brand/logo.png" alt="TornadoAI" width={34} height={34} className="rounded-xl" />
              </Link>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white/90">ワイドモード</h1>
                <p className="text-[11px] text-white/40 -mt-0.5">予算 × 目標払戻で「最も近い×当たりやすい」組み合わせ</p>
              </div>
            </div>
            <HamburgerMenu />
          </div>
        </header>

        <div className="p-4 space-y-3">
          {/* Premium status */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/25 flex items-center justify-center">
                    <Shield size={18} className="text-[#ef4444]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Premium Mode</p>
                    <p className="text-lg font-black text-white/95 leading-tight">ワイドで利益確保</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/45 mt-2">
                  予算と欲しい払戻を入れると、目標倍率に「最も近い」かつ「当たりやすい」組み合わせを優先して提案します。
                </p>
              </div>
              <button
                onClick={loadRaces}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition disabled:opacity-40 shrink-0"
              >
                <RefreshCw size={14} />
                更新
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] text-white/40">対象開催日</p>
                <p className="text-sm font-black text-white/90">{dateLabel || '-'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] text-white/40">レース数</p>
                <p className="text-sm font-black text-white/90">{races.length || '-'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] text-white/40">データ状況</p>
                <p className={`text-sm font-black ${ready ? 'text-[#10b981]' : 'text-[#fbbf24]'}`}>
                  {ready ? '利用可能' : '準備中'}
                </p>
              </div>
            </div>

            {!ready && (
              <div className="mt-3 rounded-xl border border-[#fbbf24]/30 bg-[#fbbf24]/10 px-3 py-2 text-[11px] text-[#fbbf24]">
                サーバー側のレースデータがまだ準備中です（目安 {readyAtLabel || '前日10:30'}）。準備でき次第、自動で利用可能になります。
              </div>
            )}
            {ready && readyRaceId && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-white/45">
                データ確認OK（例: race_id {readyRaceId}）
              </div>
            )}
          </div>

          {/* How to */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white/90 flex items-center gap-2">
                <Sparkles size={16} className="text-[#fbbf24]" />
                使い方（30秒）
              </p>
              <Link href="/chat" className="text-xs font-bold text-white/50 hover:text-white transition-colors inline-flex items-center gap-1">
                AIに相談 <ChevronRight size={14} />
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              {[
                { n: '1', t: 'レース選択', d: '当日のJRAから選ぶ' },
                { n: '2', t: '目標を入力', d: '予算→欲しい払戻' },
                { n: '3', t: '生成→購入', d: '候補から最終判断' },
              ].map(s => (
                <div key={s.n} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[10px] text-white/35">STEP {s.n}</p>
                  <p className="text-xs font-black text-white/90 mt-0.5">{s.t}</p>
                  <p className="text-[10px] text-white/40 mt-1">{s.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm font-bold text-white/90 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#f97316]" />
                条件入力
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[11px] text-white/40">対象開催日（自動）</label>
                  <div className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90">
                    {dateLabel || '-'}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-white/40">対象レース</label>
                  <select
                    value={raceId}
                    onChange={e => setRaceId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-[#f97316]/50"
                    disabled={loading}
                  >
                    {races.map(r => (
                      <option key={r.race_id} value={r.race_id}>
                        {raceLabel(r)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { b: 1000, p: 5000, label: '1000→5000' },
                  { b: 2000, p: 10000, label: '2000→10000' },
                  { b: 5000, p: 25000, label: '5000→25000' },
                ].map(x => (
                  <button
                    key={x.label}
                    onClick={() => { setBudget(x.b); setTargetPayout(x.p) }}
                    className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition text-xs font-bold text-white/70"
                  >
                    {x.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-white/40">予算（円）</label>
                  <input
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-[#f97316]/50"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/40">欲しい払戻（円）</label>
                  <input
                    value={targetPayout}
                    onChange={e => setTargetPayout(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-[#f97316]/50"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-[11px] text-white/40">目標倍率</p>
                <p className="text-sm font-black text-[#fbbf24]">{targetMult ? targetMult.toFixed(2) : '-' }倍</p>
              </div>

              <button
                onClick={generate}
                disabled={genLoading || loading || !raceId || !ready}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 8px 30px rgba(239,68,68,0.25)' }}
              >
                <Target size={16} />
                {genLoading ? '生成中...' : 'ワイド買い目を生成'}
              </button>

              <p className="text-[11px] text-white/35">
                ※ オッズ公開前は生成できない場合があります。その場合はレース当日に再実行してください。
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-4 text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent p-5">
                <p className="text-xs text-white/40 font-medium">おすすめ（目標に近い×当たりやすい）</p>
                <p className="text-base font-black text-white/95 mt-1">{pairText(result.recommended)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] text-white/40">ワイド倍率（100円あたり）</p>
                    <p className="text-sm font-black text-[#fbbf24]">
                      {result.recommended.wide_odds.min.toFixed(1)}
                      {result.recommended.wide_odds.max !== result.recommended.wide_odds.min ? `–${result.recommended.wide_odds.max.toFixed(1)}` : ''}倍
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] text-white/40">想定払戻（予算で）</p>
                    <p className="text-sm font-black text-white/90">
                      ¥{result.recommended.expected_payout_range.min.toLocaleString()}
                      {result.recommended.expected_payout_range.max !== result.recommended.expected_payout_range.min ? `〜¥${result.recommended.expected_payout_range.max.toLocaleString()}` : ''}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-white/35">
                  的中率（目安）: {(result.recommended.hit_probability_est * 100).toFixed(2)}% / 目標: {result.target_multiplier.toFixed(2)}倍
                </p>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[10px] text-white/40">なぜこの組み合わせ？</p>
                  <p className="text-[11px] text-white/65 mt-1">
                    目標 <span className="font-bold text-white/90">{result.target_multiplier.toFixed(2)}倍</span> に対して、推定倍率が
                    <span className="font-bold text-[#fbbf24]"> {result.recommended.multiplier_mid.toFixed(2)}倍</span>（差 {targetGapLabel}）で、
                    その近さと当たりやすさ（的中率目安）を掛け合わせたスコアが最大の組み合わせです。
                  </p>
                </div>
              </div>

              {result.alternatives?.length > 0 && (
                <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
                  <p className="text-sm font-bold text-white/90 mb-3">候補（上位{Math.min(10, result.count - 1)}件）</p>
                  <div className="space-y-2">
                    {result.alternatives.slice(0, 6).map((c, idx) => (
                      <div key={idx} className="rounded-xl border border-white/10 bg-black/20 p-3">
                        <p className="text-[12px] font-bold text-white/90">{pairText(c)}</p>
                        <p className="text-[11px] text-white/40 mt-1">
                          {c.wide_odds.min.toFixed(1)}
                          {c.wide_odds.max !== c.wide_odds.min ? `–${c.wide_odds.max.toFixed(1)}` : ''}倍 /
                          払戻 ¥{c.expected_payout_range.min.toLocaleString()}
                          {c.expected_payout_range.max !== c.expected_payout_range.min ? `〜¥${c.expected_payout_range.max.toLocaleString()}` : ''} /
                          的中 {(c.hit_probability_est * 100).toFixed(2)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 hover:bg-white/[0.08]">
                  WIN5へ戻る
                </Link>
                <Link href="/chat" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 hover:bg-white/[0.08]">
                  AIに相談
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
