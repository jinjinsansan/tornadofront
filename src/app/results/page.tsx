'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AuthGuard from '@/components/auth/AuthGuard'
import FreeTrialBanner from '@/components/auth/FreeTrialBanner'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'
import { useWin5Store } from '@/store/win5Store'

const API = process.env.NEXT_PUBLIC_API_URL || ''

type ResultRow = {
  date: string
  payout: number
  carryover: number
}

type Backtest = {
  count: number
  message?: string
  summary?: {
    weeks_considered: number
    hits: number
    hit_rate: number
    total_investment: number
    total_return: number
    total_profit: number
  }
}

export default function ResultsPage() {
  const [rows, setRows] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [bt, setBt] = useState<Backtest | null>(null)
  const [btLoading, setBtLoading] = useState(false)
  const budget = useWin5Store(s => s.budget)
  const targetPayout = useWin5Store(s => s.targetPayout)
  const riskLevel = useWin5Store(s => s.riskLevel)

  useEffect(() => {
    fetch(`${API}/api/win5/results/recent?limit=52`)
      .then(r => r.json())
      .then(data => {
        setRows(data.results || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const runBacktest = async () => {
    setBtLoading(true)
    try {
      const url = new URL(`${API}/api/win5/backtest`)
      url.searchParams.set('weeks', '52')
      url.searchParams.set('budget', String(budget))
      url.searchParams.set('target_payout', String(targetPayout))
      url.searchParams.set('risk_level', String(riskLevel))
      const res = await fetch(url.toString())
      const data = await res.json()
      setBt(data)
    } catch {
      setBt({ count: 0, message: '取得に失敗しました' })
    } finally {
      setBtLoading(false)
    }
  }

  return (
    <AuthGuard>
      <FreeTrialBanner />
      <div className="min-h-screen max-w-2xl mx-auto pb-20">
        <header className="sticky top-0 z-30 bg-tornado-deep/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image src="/brand/logo.png" alt="TornadoAI" width={30} height={30} className="rounded-lg" />
            </Link>
            <h1 className="text-lg font-bold">過去WIN5</h1>
          </div>
          <HamburgerMenu />
        </header>

        <div className="p-4 space-y-3">
          <div className="bg-tornado-card border border-tornado-border rounded-xl p-4">
            <p className="text-sm font-bold mb-2">🧪 過去52週シミュレーター（最小版）</p>
            <p className="text-xs text-tornado-muted mb-3">
              ※ 過去レースデータ（全馬スコアと結果）が揃っている週だけ計算できます。今後データが蓄積していくほど、あなたの設定でバックテストが可能になります。
            </p>
            <button
              onClick={runBacktest}
              disabled={btLoading}
              className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm font-bold hover:bg-white/[0.08] transition disabled:opacity-40"
            >
              {btLoading ? '計算中...' : 'バックテスト実行'}
            </button>
            {bt && (
              <div className="mt-3 text-xs text-tornado-muted space-y-1">
                {bt.message && <p>{bt.message}</p>}
                {bt.summary && (
                  <>
                    <p>対象週: {bt.summary.weeks_considered} / 52</p>
                    <p>的中: {bt.summary.hits}（{(bt.summary.hit_rate * 100).toFixed(1)}%）</p>
                    <p>投資: ¥{bt.summary.total_investment.toLocaleString()} / 回収: ¥{bt.summary.total_return.toLocaleString()}</p>
                    <p>収支: ¥{bt.summary.total_profit.toLocaleString()}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3 text-tornado-muted">
            <Image src="/brand/logo.png" alt="TornadoAI" width={44} height={44} className="rounded-2xl opacity-70" />
            <p className="text-sm animate-pulse">取得中...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center mt-20 text-tornado-muted">
            <p className="text-xl mb-3">データがまだありません</p>
            <p className="text-sm">毎週の結果が蓄積されると、ここに表示されます。</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {rows.map(r => (
              <div key={r.date} className="bg-tornado-card border border-tornado-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-tornado-muted">{r.date}</p>
                  <p className="text-lg font-bold">¥{(r.payout || 0).toLocaleString()}</p>
                </div>
                <div className="text-right text-xs text-tornado-muted">
                  <p>キャリー</p>
                  <p className="font-bold" style={{ color: '#fbbf24' }}>
                    ¥{(r.carryover || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
