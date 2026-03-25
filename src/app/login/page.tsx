'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [code, setCode] = useState('')
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

  const handleInviteSubmit = async () => {
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
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '認証に失敗しました')
        return
      }

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

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowInvite(v => !v)}
              className="text-xs text-tornado-muted underline hover:text-white transition"
            >
              {showInvite ? '旧招待コードログインを閉じる' : '旧招待コードログイン（テスト用）'}
            </button>
          </div>

          {showInvite && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
              <div>
                <label className="text-xs text-tornado-muted mb-1.5 block">招待コード</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleInviteSubmit()}
                  placeholder="TRN-XXXX-XXXX"
                  className="w-full bg-tornado-bg border border-tornado-border rounded-xl px-4 py-3.5 text-center text-lg font-mono tracking-widest text-tornado-text placeholder-tornado-muted/50 focus:outline-none focus:border-tornado-accent transition"
                  maxLength={14}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleInviteSubmit}
                disabled={loading || !code.trim()}
                className="w-full py-2.5 bg-white/[0.06] border border-white/10 text-white font-bold rounded-xl hover:bg-white/[0.08] transition disabled:opacity-40"
              >
                {loading ? '認証中...' : '招待コードでログイン'}
              </button>
            </div>
          )}
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
