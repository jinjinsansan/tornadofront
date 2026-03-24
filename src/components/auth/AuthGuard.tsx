'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        const token = localStorage.getItem('tornado_token') || ''
        if (!token) {
          if (!cancelled) {
            setChecking(false)
            router.replace('/login')
          }
          return
        }

        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })

        if (!res.ok) {
          try {
            localStorage.removeItem('tornado_token')
            localStorage.removeItem('tornado_user')
          } catch {}
          if (!cancelled) {
            setChecking(false)
            router.replace('/login')
          }
          return
        }

        if (!cancelled) {
          setIsAuth(true)
          setChecking(false)
        }
      } catch {
        if (!cancelled) {
          setChecking(false)
          router.replace('/login')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050608] gap-4">
        <div className="tornado-spinner" />
        <p className="text-sm text-[#848E9C]">読み込み中...</p>
      </div>
    )
  }

  if (!isAuth) return null

  return <>{children}</>
}
