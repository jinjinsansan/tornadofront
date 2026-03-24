'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'

const API = process.env.NEXT_PUBLIC_API_URL || ''

type ResultRow = {
  date: string
  payout: number
  carryover: number
}

export default function ResultsPage() {
  const [rows, setRows] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/win5/results/recent?limit=52`)
      .then(r => r.json())
      .then(data => {
        setRows(data.results || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen max-w-2xl mx-auto pb-20">
        <header className="sticky top-0 z-30 bg-tornado-deep/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl">🌪️</Link>
            <h1 className="text-lg font-bold">過去WIN5</h1>
          </div>
          <HamburgerMenu />
        </header>

        {loading ? (
          <div className="text-center mt-20 text-tornado-muted animate-pulse">🌪️ 取得中...</div>
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
