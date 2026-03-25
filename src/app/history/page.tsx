'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'

const API = process.env.NEXT_PUBLIC_API_URL || ''

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
      <div className="min-h-screen max-w-2xl mx-auto pb-20">
        <header className="sticky top-0 z-30 bg-tornado-deep/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image src="/brand/logo.png" alt="TornadoAI" width={30} height={30} className="rounded-lg" />
            </Link>
            <h1 className="text-lg font-bold">買い目履歴</h1>
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
            {items.map(it => (
              <div key={it.id} className="bg-tornado-card border border-tornado-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-tornado-muted">{it.date} / {it.scenario_type || 'custom'}</p>
                    <p className="font-bold">{it.total_combinations}点 / ¥{(it.budget || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right text-xs text-tornado-muted">
                    <p>EV: {(it.expected_value ?? 0).toFixed(2)}</p>
                    <p>的中率: {((it.hit_probability ?? 0) * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-xs mt-3">
                  {['R1', 'R2', 'R3', 'R4', 'R5'].map(k => {
                    const sel = it.ticket_data?.[k] || []
                    return (
                      <div key={k} className="bg-tornado-bg rounded-lg p-2">
                        <p className="text-tornado-muted">{k}</p>
                        <p className="font-bold text-sm">{sel.length}頭</p>
                        <p className="text-tornado-muted">{sel.join(',') || '-'}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
