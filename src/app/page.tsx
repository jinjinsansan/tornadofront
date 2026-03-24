'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Hero */}
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-tornado-accent">🌪️</span> トルネードAI
        </h1>
        <p className="text-xl text-tornado-muted mb-2">
          WIN5特化 AI戦略ツール
        </p>
        <p className="text-tornado-text mb-8">
          予算と目標配当を入力するだけ。<br />
          AIが5レースの最適な組み合わせを自動設計する。
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/chat"
            className="px-8 py-3 bg-tornado-accent text-white font-bold rounded-lg hover:opacity-90 transition"
          >
            💬 AIに相談する
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-tornado-card border border-tornado-border text-tornado-text font-bold rounded-lg hover:bg-tornado-border transition"
          >
            📊 ダッシュボード
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-tornado-card border border-tornado-border rounded-xl p-6">
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="text-lg font-bold mb-2">買い目ジェネレーター</h3>
          <p className="text-tornado-muted text-sm">
            予算5,000円で500万狙い？AIが波乱度に応じて各レースの頭数を自動最適化
          </p>
        </div>
        <div className="bg-tornado-card border border-tornado-border rounded-xl p-6">
          <div className="text-3xl mb-3">🌪️</div>
          <h3 className="text-lg font-bold mb-2">波乱度ランク</h3>
          <p className="text-tornado-muted text-sm">
            5レースそれぞれの荒れやすさを5段階で可視化。堅いレースは絞り、荒れるレースは広げる
          </p>
        </div>
        <div className="bg-tornado-card border border-tornado-border rounded-xl p-6">
          <div className="text-3xl mb-3">💥</div>
          <h3 className="text-lg font-bold mb-2">3シナリオ提示</h3>
          <p className="text-tornado-muted text-sm">
            本線・中荒れ・大荒れの3パターン。想定配当と的中率を比較して選べる
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-tornado-muted text-xs">
        &copy; 2026 TornadoAI. All rights reserved.
      </footer>
    </main>
  )
}
