'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'

const API = process.env.NEXT_PUBLIC_API_URL || ''
const WIN5_PRICE = 100

const riskMeta = (risk: string) => {
  switch ((risk || '').toLowerCase()) {
    case 'conservative':
    case 'safe':
      return { label: '堅実', color: '#3b82f6' }
    case 'aggressive':
    case 'attack':
      return { label: '攻め', color: '#ef4444' }
    default:
      return { label: 'バランス', color: '#f97316' }
  }
}

const scenarioMeta = (s: string) => {
  const t = (s || 'custom').toLowerCase()
  if (t.includes('base') || t.includes('main')) return { label: '本線', color: '#f97316' }
  if (t.includes('mid')) return { label: '中荒れ', color: '#fbbf24' }
  if (t.includes('wild') || t.includes('boom')) return { label: '大荒れ', color: '#ef4444' }
  if (t === 'custom') return { label: 'カスタム', color: '#a855f7' }
  return { label: s || 'custom', color: '#a855f7' }
}

type SavedTicket = {
  id: string
  date: string
  budget: number
  target_payout: number
  risk_level: string
  ticket_data: Record<string, number[]>
  total_combinations: number
  expected_value: number
  hit_probability: number
  scenario_type: string
  created_at: string
}

export default function HistoryPage() {
  const [items, setItems] = useState<SavedTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string>('')

  useEffect(() => {
    const token = localStorage.getItem('tornado_token') || ''
    fetch(`${API}/api/win5/tickets/my`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async r => {
        const data = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(data.error || '取得に失敗しました')
        return data
      })
      .then(data => {
        setItems(data.tickets || [])
        setLoading(false)
      })
      .catch(e => {
        setError(e?.message || 'エラーが発生しました')
        setLoading(false)
      })
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen max-w-2xl mx-auto pb-24">
        <header className="sticky top-0 z-30 bg-tornado-deep/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image src="/brand/logo.png" alt="TornadoAI" width={30} height={30} className="rounded-lg" />
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight">買い目履歴</h1>
              <p className="text-[11px] text-tornado-muted -mt-0.5">保存した買い目を比較・復元できます</p>
            </div>
          </div>
          <HamburgerMenu />
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3 text-tornado-muted">
            <Image src="/brand/logo.png" alt="TornadoAI" width={44} height={44} className="rounded-2xl opacity-70" />
            <p className="text-sm animate-pulse">取得中...</p>
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-tornado-card border border-tornado-border rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center mt-20 text-tornado-muted">
            <p className="text-xl mb-3">保存された買い目がありません</p>
            <Link href="/dashboard" className="text-sm text-tornado-accent underline">
              ダッシュボードで保存する →
            </Link>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-4">
              <p className="text-xs text-tornado-muted">
                ヒント：カードを開くと、各レースの選択馬が見やすく表示されます（直近の買い目ほど上）。
              </p>
            </div>

            {items.map(it => {
              const risk = riskMeta(it.risk_level)
              const scenario = scenarioMeta(it.scenario_type)
              const investment = it.budget || (it.total_combinations || 0) * WIN5_PRICE
              const isOpen = openId === it.id
              const created = it.created_at ? new Date(it.created_at) : null

              return (
                <div
                  key={it.id}
                  className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent shadow-[0_18px_70px_rgba(0,0,0,0.35)] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(prev => (prev === it.id ? '' : it.id))}
                    className="w-full text-left p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                            style={{ color: scenario.color, borderColor: `${scenario.color}40`, background: `${scenario.color}10` }}
                          >
                            {scenario.label}
                          </span>
                          <span
                            className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                            style={{ color: risk.color, borderColor: `${risk.color}40`, background: `${risk.color}10` }}
                          >
                            {risk.label}
                          </span>
                          <span className="text-[11px] text-tornado-muted">
                            {it.date}
                          </span>
                        </div>

                        <p className="text-base sm:text-lg font-black leading-tight text-white/95">
                          {it.total_combinations}点 <span className="text-white/40">/</span> ¥{investment.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-tornado-muted mt-1">
                          推定払戻: ~¥{(it.target_payout || 0).toLocaleString()}
                          {created && (
                            <>
                              <span className="mx-1.5 text-white/10">|</span>
                              保存: {created.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                            </>
                          )}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-tornado-muted uppercase tracking-wider">Hit / EV</p>
                        <p className="text-sm font-bold text-white/90">
                          {((it.hit_probability ?? 0) * 100).toFixed(1)}%
                        </p>
                        <p className="text-[11px] text-tornado-muted">
                          EV {(it.expected_value ?? 0).toFixed(2)}
                        </p>
                        <p className="text-[11px] mt-1 font-bold" style={{ color: isOpen ? '#f97316' : 'rgba(255,255,255,0.35)' }}>
                          {isOpen ? '閉じる' : '開く'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5">
                      <div className="grid grid-cols-5 gap-2 text-center">
                        {['R1', 'R2', 'R3', 'R4', 'R5'].map(k => {
                          const sel = it.ticket_data?.[k] || []
                          const shown = sel.slice(0, 6)
                          const rest = sel.length - shown.length
                          return (
                            <div key={k} className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
                              <p className="text-[10px] text-tornado-muted font-medium">{k}</p>
                              <p className="text-base font-black mt-0.5 text-white/90">{sel.length}</p>
                              <div className="mt-1 flex flex-wrap justify-center gap-1">
                                {shown.length > 0 ? (
                                  <>
                                    {shown.map(n => (
                                      <span key={n} className="px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-white/10 bg-white/[0.04] text-white/70">
                                        {n}
                                      </span>
                                    ))}
                                    {rest > 0 && (
                                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-white/10 bg-white/[0.04] text-white/50">
                                        +{rest}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[10px] text-white/30">-</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 hover:bg-white/[0.08]"
                        >
                          ダッシュボードへ
                        </Link>
                        <Link
                          href="/chat"
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-white/10 bg-white/5 hover:bg-white/[0.08]"
                        >
                          AIに相談
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
