'use client'

import Link from 'next/link'
import { BarChart3, MessageCircle, Target, Layers, Activity, Zap, Shield, ChevronRight } from 'lucide-react'
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

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

          {/* Premium Welcome Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 p-6 sm:p-8"
            style={{ background: 'linear-gradient(135deg, #1a1030, #111827, #0c1a2e)' }}>
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-tornado-accent/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-tornado-orange/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-tornado-gold" />
                <span className="text-xs font-bold tracking-widest text-tornado-gold uppercase">Premium Member</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mb-2">
                ようこそ、<span className="gradient-text">TornadoAI</span>へ
              </h1>
              <p className="text-sm text-white/50 leading-relaxed">
                WIN5の組み合わせ最適化AI。予算と目標配当を伝えるだけで、
                5レースの最適な買い目を自動設計します。
              </p>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard"
              className="group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{ borderColor: 'rgba(249,115,22,0.25)', background: 'linear-gradient(135deg, rgba(249,115,22,0.06), transparent)' }}
            >
              <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-tornado-orange/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <BarChart3 className="w-7 h-7 mb-3 text-tornado-orange" strokeWidth={1.5} />
              <p className="font-bold text-sm">ダッシュボード</p>
              <p className="text-[11px] text-white/40 mt-1">今週のWIN5を分析</p>
            </Link>
            <Link
              href="/chat"
              className="group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{ borderColor: 'rgba(59,130,246,0.25)', background: 'linear-gradient(135deg, rgba(59,130,246,0.06), transparent)' }}
            >
              <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-blue-500/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <MessageCircle className="w-7 h-7 mb-3 text-blue-400" strokeWidth={1.5} />
              <p className="font-bold text-sm">AIチャット</p>
              <p className="text-[11px] text-white/40 mt-1">戦略を相談する</p>
            </Link>
          </div>

          <Link
            href="/history"
            className="block rounded-2xl border border-white/5 p-5 hover:border-white/10 transition"
            style={{ background: 'linear-gradient(180deg, #111827, #0f172a)' }}
          >
            <p className="text-sm font-bold">💾 保存した買い目</p>
            <p className="text-xs text-white/40 mt-1">保存したパターンを比較・確認できます</p>
          </Link>

          {/* Features */}
          <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'linear-gradient(180deg, #111827, #0f172a)' }}>
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-sm font-black tracking-wide flex items-center gap-2">
                <Zap className="w-4 h-4 text-tornado-accent" />
                あなたの武器
              </h2>
            </div>
            {[
              { icon: Activity, color: '#ef4444', title: '波乱度ランク', desc: '各レースの荒れやすさを5段階で数値化。堅いレースと荒れるレースを瞬時に判別' },
              { icon: Target, color: '#f97316', title: '買い目ジェネレーター', desc: '予算と目標配当を入力するだけ。AIが各レースの頭数を自動配分し最適な組み合わせを生成' },
              { icon: Layers, color: '#fbbf24', title: '3シナリオ同時提示', desc: '本線（堅実）・中荒れ・大荒れ。点数・想定配当・的中率を比較してあなたのスタイルで選ぶ' },
              { icon: MessageCircle, color: '#3b82f6', title: 'AI戦略チャット', desc: '「穴狙いで」「R3は1頭にしたい」——自然言語でWIN5専門AIと買い目の相談ができる' },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="flex items-start gap-4 px-5 py-4 border-t border-white/[0.03]">
                  <div className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
                    style={{ borderColor: `${f.color}30`, background: `${f.color}10` }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-0.5" style={{ color: f.color }}>{f.title}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* How to Use */}
          <div className="rounded-2xl border border-white/5 p-5" style={{ background: '#111827' }}>
            <h2 className="text-sm font-black tracking-wide mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-tornado-orange" />
              毎週のWIN5攻略フロー
            </h2>
            <div className="space-y-4">
              {[
                { step: '1', color: '#ef4444', title: '水曜〜金曜：対象レース確認', desc: 'ダッシュボードでWIN5対象5レースが確認できます。レース条件をチェック。' },
                { step: '2', color: '#f97316', title: '土曜：波乱度 × 指数で戦略構築', desc: 'オッズ確定後に波乱度が更新されます。AIチャットで「3シナリオ見せて」と聞くだけ。' },
                { step: '3', color: '#fbbf24', title: '日曜朝：最終買い目を決定', desc: '当日朝に最新オッズで買い目を再生成。「予算5,000円で500万狙い」でAIが最適解を出します。' },
                { step: '4', color: '#3b82f6', title: '日曜：IPAT購入', desc: 'AIが出した買い目をIPATで購入するだけ。3シナリオから選んで、あなたのスタイルで勝負。' },
              ].map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                    style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                    {s.step}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">{s.title}</p>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 0 25px rgba(239,68,68,0.25)' }}
            >
              💬 AIに今週のWIN5を相談する
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </AuthGuard>
  )
}
