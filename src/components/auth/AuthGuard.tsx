'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isFreeTrial, isLineAdded } from '@/config/freeTrial'
import LineGateScreen from './LineGateScreen'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showLineGate, setShowLineGate] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const token = localStorage.getItem('tornado_token') || ''

        // ── Free Trial: トークンなし → LINE追加済みならゲスト通過、未追加ならゲート表示 ──
        if (!token && isFreeTrial()) {
          if (!cancelled) {
            if (isLineAdded()) {
              setIsAuth(true)
              setShowLineGate(false)
            } else {
              setIsAuth(false)
              setShowLineGate(true)
            }
            setChecking(false)
          }
          return
        }

        if (!token) {
          if (!cancelled) {
            setChecking(false)
            router.replace('/login')
          }
          return
        }

        // Optimistic render: show the app immediately if a token exists,
        // then validate it in the background to avoid long blocking spinners.
        if (!cancelled) {
          setIsAuth(true)
          setChecking(false)
        }

        const ac = new AbortController()
        const t = setTimeout(() => ac.abort(), 6000)
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          signal: ac.signal,
        })
        clearTimeout(t)

        if (!res.ok) {
          try {
            localStorage.removeItem('tornado_token')
            localStorage.removeItem('tornado_user')
          } catch {}
          if (!cancelled) {
            // トークン無効でもフリートライアル中 → LINE追加チェック
            if (isFreeTrial()) {
              if (isLineAdded()) {
                setIsAuth(true)
                setShowLineGate(false)
              } else {
                setIsAuth(false)
                setShowLineGate(true)
              }
              setChecking(false)
            } else {
              setIsAuth(false)
              setChecking(false)
              router.replace('/login')
            }
          }
          return
        }

        // Token is valid; nothing else to do.
      } catch {
        // Network issues: keep the user in the app if they already have a token.
        // They'll be redirected only if the token is actually invalid.
        if (!cancelled) setChecking(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [router])

  /** LINE追加完了コールバック — ゲートを閉じてゲスト通過 */
  const handleLineComplete = useCallback(() => {
    setShowLineGate(false)
    setIsAuth(true)
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050608] gap-4">
        <div className="tornado-spinner" />
        <p className="text-sm text-[#848E9C]">読み込み中...</p>
      </div>
    )
  }

  if (showLineGate) {
    return <LineGateScreen onComplete={handleLineComplete} />
  }

  if (!isAuth) return null

  return <>{children}</>
}
