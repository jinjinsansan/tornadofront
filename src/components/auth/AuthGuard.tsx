'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const token = localStorage.getItem('tornado_token')
      if (token) {
        setIsAuth(true)
        setChecking(false)
        return
      }
    } catch {}
    // No token
    setChecking(false)
    router.replace('/login')
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tornado-deep">
        <div className="text-tornado-muted animate-pulse">🌪️ 読み込み中...</div>
      </div>
    )
  }

  if (!isAuth) return null

  return <>{children}</>
}
