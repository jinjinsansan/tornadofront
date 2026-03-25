'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startLineLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/line/start`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        setError(data.error || 'LINEログインの開始に失敗しました')
        return
      }
      window.location.href = data.url
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-tornado-deep">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex justify-center">
            <Image src="/brand/logo.png" alt="TornadoAI" width={56} height={56} className="rounded-2xl" priority />
          </Link>
          <h1 className="text-2xl font-black mt-3">TornadoAI</h1>
          <p className="text-tornado-muted text-sm mt-1">WIN5特化AI戦略ツール</p>
        </div>

        {/* Card */}
        <div className="bg-tornado-card border border-tornado-border rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-center mb-2">会員様ログイン</h2>
          <p className="text-sm text-tornado-muted text-center mb-8">
            次回以降はLINEログインだけで入れます（初回はメールのアクティベーションURLから連携してください）。
          </p>

          <div className="space-y-4">
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={startLineLogin}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-tornado-accent to-tornado-orange text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40"
            >
              {loading ? '準備中...' : 'LINEでログイン'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-tornado-muted hover:text-white transition">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
