'use client'

import Link from 'next/link'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'

export default function MyPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-tornado-deep">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-tornado-deep/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌪️</span>
              <span className="text-lg font-black">TornadoAI</span>
            </div>
            <HamburgerMenu />
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Welcome */}
          <div className="bg-tornado-card border border-tornado-border rounded-2xl p-6 text-center">
            <p className="text-3xl mb-3">🌪️</p>
            <h1 className="text-xl font-black mb-1">ようこそ、TornadoAIへ</h1>
            <p className="text-sm text-tornado-muted">WIN5特化AI戦略ツール — 会員様専用</p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard"
              className="bg-tornado-card border border-tornado-border rounded-2xl p-5 hover:border-tornado-orange/30 transition"
            >
              <p className="text-2xl mb-2">📊</p>
              <p className="font-bold text-sm">ダッシュボード</p>
              <p className="text-xs text-tornado-muted mt-1">今週のWIN5を確認</p>
            </Link>
            <Link
              href="/chat"
              className="bg-tornado-card border border-tornado-border rounded-2xl p-5 hover:border-tornado-accent/30 transition"
            >
              <p className="text-2xl mb-2">💬</p>
              <p className="font-bold text-sm">AIチャット</p>
              <p className="text-xs text-tornado-muted mt-1">戦略を相談する</p>
            </Link>
          </div>

          {/* Info */}
          <div className="bg-tornado-card border border-tornado-border rounded-2xl p-6">
            <h2 className="font-bold mb-3">🎯 使い方</h2>
            <ol className="space-y-2 text-sm text-tornado-muted">
              <li className="flex gap-2"><span className="text-tornado-accent font-bold">1.</span>ダッシュボードで今週のWIN5対象レースと波乱度を確認</li>
              <li className="flex gap-2"><span className="text-tornado-accent font-bold">2.</span>AIチャットで予算・目標配当を伝えて買い目を生成</li>
              <li className="flex gap-2"><span className="text-tornado-accent font-bold">3.</span>3シナリオ（本線・中荒れ・大荒れ）から選んで購入</li>
            </ol>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
