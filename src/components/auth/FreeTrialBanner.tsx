'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { isFreeTrial, freeTrialRemainingMs } from '@/config/freeTrial'

/**
 * 無料体験中のカウントダウンバナー
 * - 有料ユーザー（tornado_tokenあり）→ 非表示
 * - フリートライアル期間外 → 非表示
 * - ゲスト＋期間内 → カウントダウン表示
 * - カウントダウン終了 → 自動的に /login へリダイレクト
 */
export default function FreeTrialBanner() {
  const [remaining, setRemaining] = useState('')
  const [visible, setVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 有料ユーザーには表示しない
    const token = localStorage.getItem('tornado_token') || ''
    if (token) {
      setVisible(false)
      return
    }

    // フリートライアル期間外なら非表示
    if (!isFreeTrial()) {
      setVisible(false)
      return
    }

    setVisible(true)

    const tick = () => {
      const ms = freeTrialRemainingMs()
      if (ms <= 0) {
        setRemaining('00:00:00')
        router.replace('/login')
        return
      }

      const totalSec = Math.floor(ms / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      const pad = (n: number) => String(n).padStart(2, '0')
      setRemaining(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [router])

  if (!visible) return null

  return (
    <div className="sticky top-0 z-50 w-full">
      <div
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white"
        style={{
          background: 'linear-gradient(90deg, #ef4444, #f97316, #fbbf24, #f97316, #ef4444)',
          backgroundSize: '200% 100%',
          animation: 'free-trial-shimmer 3s linear infinite',
        }}
      >
        <Clock size={16} className="flex-shrink-0 animate-pulse" />
        <span>🔥 無料体験中</span>
        <span className="font-mono tracking-wider">{remaining}</span>
      </div>

      <style jsx>{`
        @keyframes free-trial-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
