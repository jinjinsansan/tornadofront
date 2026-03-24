'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 w-full z-50 bg-tornado-deep/80 backdrop-blur-md border-b border-tornado-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌪️</span>
            <span className="text-lg font-bold">TornadoAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-tornado-muted hover:text-white transition">ダッシュボード</Link>
            <Link
              href="/chat"
              className="text-sm px-4 py-2 bg-gradient-accent text-white font-bold rounded-lg hover:opacity-90 transition"
            >
              AIに相談
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-hero overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-tornado-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-tornado-orange/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-tornado-accent/10 border border-tornado-accent/30 rounded-full">
            <span className="text-sm text-tornado-accent font-medium">WIN5 専門 AI戦略ツール</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            WIN5は、<br />
            <span className="gradient-text">組み合わせで勝つ。</span>
          </h1>

          <p className="text-lg md:text-xl text-tornado-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            予算と目標配当を伝えるだけ。<br />
            AIが5レースの最適な組み合わせを自動設計する。<br />
            <span className="text-tornado-text">「当てる」ではなく「爆発させる」</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="px-8 py-4 bg-gradient-accent text-white font-bold text-lg rounded-xl glow-red hover:opacity-90 transition"
            >
              🌪️ 無料で始める
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-tornado-card border border-tornado-border text-tornado-text font-bold text-lg rounded-xl hover:bg-tornado-border transition"
            >
              📊 ダッシュボードを見る
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <p className="text-2xl md:text-3xl font-bold gradient-text">5</p>
              <p className="text-xs text-tornado-muted mt-1">レース横断分析</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold gradient-text">3</p>
              <p className="text-xs text-tornado-muted mt-1">シナリオ提示</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold gradient-text">∞</p>
              <p className="text-xs text-tornado-muted mt-1">AIと買い目相談</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROBLEM SECTION ===== */}
      <section className="py-20 px-4 bg-tornado-deep">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            WIN5で<span className="text-tornado-accent">負ける理由</span>、わかってますか？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '❌', title: '1レースずつ予想してる', desc: 'WIN5は5レースの連立方程式。1レースずつ考えても最適な組み合わせにならない。' },
              { icon: '❌', title: '点数が爆発して予算オーバー', desc: '全レース3頭ずつ → 243点 = 24,300円。計画なく広げると破産する。' },
              { icon: '❌', title: '当たっても配当がショボい', desc: '人気馬ばかり入れると的中しても数万円。WIN5の意味がない。' },
            ].map((item, i) => (
              <div key={i} className="bg-tornado-card border border-tornado-border rounded-xl p-6">
                <p className="text-2xl mb-3">{item.icon}</p>
                <h3 className="font-bold mb-2 text-tornado-text">{item.title}</h3>
                <p className="text-sm text-tornado-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOLUTION / FEATURES ===== */}
      <section className="py-20 px-4 bg-tornado-bg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              トルネードAIが<span className="gradient-text">全部やる</span>
            </h2>
            <p className="text-tornado-muted">5レースを横断して、予算内で期待値最大の組み合わせを自動設計</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: '🌪️',
                title: '波乱度ランク',
                desc: '各レースの荒れやすさを5段階で可視化。堅いレースは絞り、荒れるレースは広げる。AIが自動判定。',
                color: 'border-tornado-orange/30',
              },
              {
                icon: '🎯',
                title: '買い目ジェネレーター',
                desc: '「予算5,000円で500万狙い」→ 各レースの頭数を自動最適化。予算・目標・リスクを指定するだけ。',
                color: 'border-tornado-accent/30',
              },
              {
                icon: '📊',
                title: '3シナリオ提示',
                desc: '本線（堅実）・中荒れ・大荒れの3パターン。それぞれの点数・想定配当・的中率を比較して選べる。',
                color: 'border-tornado-gold/30',
              },
              {
                icon: '💬',
                title: 'AI戦略チャット',
                desc: '「高松宮記念は荒れる？」「穴狙いで組んで」自然言語で何でも聞ける。WIN5専門AIが即答。',
                color: 'border-blue-500/30',
              },
            ].map((item, i) => (
              <div key={i} className={`bg-gradient-card border ${item.color} rounded-xl p-6 hover:border-opacity-60 transition`}>
                <p className="text-3xl mb-4">{item.icon}</p>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-tornado-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4 bg-tornado-deep">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            使い方は<span className="gradient-text">3ステップ</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: '予算を決める', desc: '今週のWIN5にいくら使うか。1,000円〜自由に設定。', icon: '💰' },
              { step: '02', title: 'AIが組み合わせを設計', desc: '波乱度・AI指数・オッズから5レースの最適な頭数配分を自動計算。', icon: '🌪️' },
              { step: '03', title: '買い目を選んで購入', desc: '3シナリオから好みを選ぶだけ。あとはJRAで購入。', icon: '🎯' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-full flex items-center justify-center text-2xl glow-red">
                  {item.icon}
                </div>
                <p className="text-xs text-tornado-accent font-bold mb-2">STEP {item.step}</p>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-tornado-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section className="py-20 px-4 bg-tornado-bg">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            WIN5専用<span className="gradient-text">ダッシュボード</span>
          </h2>
          <p className="text-tornado-muted text-center mb-10">5レースを一覧で俯瞰。波乱度に応じて戦略を立てる。</p>

          {/* Mock dashboard */}
          <div className="bg-tornado-card border border-tornado-border rounded-2xl p-6 glow-red">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold">🌪️ 今週のWIN5</span>
              <span className="text-xs text-tornado-gold font-bold">総合波乱度 15/25</span>
            </div>
            {[
              { r: 1, venue: '中山10R', name: '船橋S', vol: 3 },
              { r: 2, venue: '中京10R', name: '伊勢S', vol: 3 },
              { r: 3, venue: '阪神11R', name: '六甲S', vol: 4 },
              { r: 4, venue: '中山11R', name: 'マーチS', vol: 3 },
              { r: 5, venue: '中京11R', name: '高松宮記念', vol: 2 },
            ].map(race => (
              <div key={race.r} className="flex items-center gap-3 py-2.5 border-b border-tornado-border/50 last:border-0">
                <span className="w-8 h-8 bg-tornado-bg rounded-lg flex items-center justify-center text-xs font-bold">R{race.r}</span>
                <span className="flex-1 text-sm font-medium">{race.venue} {race.name}</span>
                <span className={`text-sm ${race.vol >= 4 ? 'text-red-400' : race.vol >= 3 ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {'★'.repeat(race.vol)}{'☆'.repeat(5 - race.vol)}
                </span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-tornado-border flex justify-between items-center">
              <span className="text-sm text-tornado-muted">予算 ¥5,000 / 48点</span>
              <span className="text-sm font-bold text-tornado-gold">最高想定 ¥12,400,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            今週のWIN5、<br />
            <span className="gradient-text">一緒に攻めようぜ。</span>
          </h2>
          <p className="text-tornado-muted mb-10">完全無料。アカウント不要。今すぐAIに相談できる。</p>
          <Link
            href="/chat"
            className="inline-block px-10 py-4 bg-gradient-accent text-white font-bold text-lg rounded-xl glow-red hover:opacity-90 transition"
          >
            🌪️ 無料で始める
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-4 bg-tornado-deep border-t border-tornado-border/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🌪️</span>
            <span className="text-sm font-bold">TornadoAI</span>
            <span className="text-xs text-tornado-muted">WIN5特化AI戦略ツール</span>
          </div>
          <div className="flex gap-6 text-xs text-tornado-muted">
            <Link href="/chat" className="hover:text-white transition">AIチャット</Link>
            <Link href="/dashboard" className="hover:text-white transition">ダッシュボード</Link>
          </div>
          <p className="text-xs text-tornado-muted">&copy; 2026 TornadoAI</p>
        </div>
      </footer>
    </main>
  )
}
