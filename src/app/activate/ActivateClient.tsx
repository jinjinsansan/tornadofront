'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export default function ActivateClient() {
  const sp = useSearchParams()
  const token = useMemo(() => sp.get('t') || '', [sp])
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!token) {
      setError('アクティベーションURLが不正です')
      return
    }
    if (!/^[0-9]{4}$/.test(pin)) {
      setError('PINは4桁の数字で入力してください')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, pin }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'アクティベーションに失敗しました')
        return
      }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('LINEログインURLの取得に失敗しました')
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-tornado-deep">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl">🌪️</Link>
          <h1 className="text-2xl font-black mt-3">TornadoAI</h1>
          <p className="text-tornado-muted text-sm mt-1">初回アクティベーション</p>
        </div>

        <div className="bg-tornado-card border border-tornado-border rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-sm font-bold mb-1">PIN（4桁）</p>
            <p className="text-xs text-tornado-muted">販売会社メールに記載の4桁数字を入力してください</p>
          </div>

          <input
            type="text"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="1234"
            className="w-full bg-tornado-bg border border-tornado-border rounded-xl px-4 py-3.5 text-center text-2xl font-mono tracking-widest text-tornado-text placeholder-tornado-muted/50 focus:outline-none focus:border-tornado-accent transition"
            maxLength={4}
            inputMode="numeric"
            disabled={loading}
          />

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button
            onClick={submit}
            disabled={loading || pin.length !== 4}
            className="w-full py-3.5 bg-gradient-to-r from-tornado-accent to-tornado-orange text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40"
          >
            {loading ? '処理中...' : 'LINE連携して開始'}
          </button>

          <p className="text-[11px] text-tornado-muted text-center">
            ※ 初回のみ必要です。次回以降はLINEログインだけで入れます。
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/login" className="text-xs text-tornado-muted hover:text-white transition">
            既に連携済みの方はこちら（LINEログイン） →
          </Link>
        </div>
      </div>
    </div>
  )
}
