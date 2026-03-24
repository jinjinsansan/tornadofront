'use client'

export default function DashboardPage() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto p-4">
      <header className="flex items-center gap-3 mb-8">
        <span className="text-2xl">🌪️</span>
        <h1 className="text-lg font-bold">WIN5 ダッシュボード</h1>
      </header>

      <div className="bg-tornado-card border border-tornado-border rounded-xl p-6 text-center">
        <p className="text-tornado-muted text-lg mb-4">🚧 準備中</p>
        <p className="text-tornado-muted text-sm">
          WIN5ダッシュボードは近日公開予定です。<br />
          まずはAIチャットでWIN5の相談ができます。
        </p>
        <a
          href="/chat"
          className="inline-block mt-6 px-6 py-3 bg-tornado-accent text-white font-bold rounded-lg hover:opacity-90 transition"
        >
          💬 AIに相談する
        </a>
      </div>
    </div>
  )
}
