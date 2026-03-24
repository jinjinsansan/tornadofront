'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function LoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('招待コードを入力してください')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '認証に失敗しました')
        setLoading(false)
        return
      }

      // Save token
      localStorage.setItem('tornado_token', data.token)
      localStorage.setItem('tornado_user', JSON.stringify(data.user))

      router.push('/mypage')
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
          <Link href="/" className="text-4xl">🌪️</Link>
          <h1 className="text-2xl font-black mt-3">TornadoAI</h1>
          <p className="text-tornado-muted text-sm mt-1">WIN5特化AI戦略ツール</p>
        </div>

        {/* Card */}
        <div className="bg-tornado-card border border-tornado-border rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-center mb-2">会員様限定サービス</h2>
          <p className="text-sm text-tornado-muted text-center mb-8">
            ご購入時に付与された招待コードをご入力ください
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-tornado-muted mb-1.5 block">招待コード</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="TRN-XXXX-XXXX"
                className="w-full bg-tornado-bg border border-tornado-border rounded-xl px-4 py-3.5 text-center text-lg font-mono tracking-widest text-tornado-text placeholder-tornado-muted/50 focus:outline-none focus:border-tornado-accent transition"
                maxLength={14}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-tornado-accent to-tornado-orange text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40"
            >
              {loading ? '認証中...' : 'ログイン'}
            </button>
          </div>

          <p className="text-xs text-tornado-muted text-center mt-6">
            招待コードをお持ちでない方は<br />
            <span className="text-tornado-accent">販売ページ</span>よりお申し込みください
          </p>
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
