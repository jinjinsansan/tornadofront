'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function LineCallbackClient() {
  const sp = useSearchParams()
  const router = useRouter()
  const code = useMemo(() => sp.get('code') || '', [sp])
  const state = useMemo(() => sp.get('state') || '', [sp])
  const [msg, setMsg] = useState('LINEログイン処理中...')

  useEffect(() => {
    const run = async () => {
      if (!code || !state) {
        setMsg('ログイン情報が不足しています')
        return
      }
      try {
        const res = await fetch(`${API}/api/auth/line/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setMsg(data.error || 'ログインに失敗しました')
          return
        }

        localStorage.setItem('tornado_token', data.token)
        localStorage.setItem('tornado_user', JSON.stringify(data.user || {}))

        router.replace('/mypage')
      } catch {
        setMsg('通信エラーが発生しました')
      }
    }
    run()
  }, [code, state, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-tornado-deep">
      <div className="w-full max-w-md text-center">
        <p className="text-4xl mb-4">🌪️</p>
        <p className="text-sm text-tornado-muted">{msg}</p>
        <div className="mt-6">
          <Link href="/login" className="text-xs text-tornado-muted hover:text-white transition">
            ← ログインに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
