'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BarChart3, MessageCircle, Target, Layers, Activity, Zap, Shield,
  ChevronRight, ChevronDown, Flame, Clock, Sparkles, TrendingUp,
  FileText, History,
} from 'lucide-react'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'

const API = process.env.NEXT_PUBLIC_API_URL || ''

const FEATURES = [
  {
    icon: Activity,
    title: '波乱度ランク',
    desc: '5段階の荒れ度を数値で可視化',
    color: 'from-red-400 to-red-600',
  },
  {
    icon: Target,
    title: '買い目ジェネレーター',
    desc: '予算×目標で自動最適化',
    color: 'from-orange-400 to-orange-600',
  },
  {
    icon: Layers,
    title: '3シナリオ提示',
    desc: '本線・中荒れ・大荒れ比較',
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    icon: MessageCircle,
    title: 'AI戦略チャット',
    desc: '自然言語で買い目を相談',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: Flame,
    title: '爆発ヒートマップ',
    desc: '高配当ルートを可視化',
    color: 'from-pink-400 to-pink-600',
  },
  {
    icon: TrendingUp,
    title: '被り率分析',
    desc: '他ユーザーとの重複回避',
    color: 'from-teal-400 to-teal-600',
  },
]

const STEPS = [
  { num: '01', title: '対象レース確認', desc: 'ダッシュボードでWIN5対象5レースと波乱度をチェック。', icon: BarChart3, color: '#ef4444' },
  { num: '02', title: '戦略を構築', desc: 'AIチャットで「3シナリオ見せて」と聞くだけ。予算と目標を伝えれば最適解を提案。', icon: Sparkles, color: '#f97316' },
  { num: '03', title: '買い目を決定', desc: '日曜朝に最新オッズで再生成。「予算5,000円で500万狙い」でAIが即回答。', icon: Target, color: '#fbbf24' },
  { num: '04', title: 'IPATで購入', desc: '3シナリオから選んで購入するだけ。あなたのスタイルで勝負。', icon: Zap, color: '#3b82f6' },
]

export default function MyPage() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('tornado_token') || ''
    if (!token) return
    fetch(`${API}/api/win5/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => {})
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF] overflow-x-hidden">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0B0E11]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link href="/"><Image src="/brand/logo.png" alt="TornadoAI" width={32} height={32} className="rounded-lg" /></Link>
              <span className="text-lg font-bold">TornadoAI</span>
            </div>
            <HamburgerMenu />
          </div>
        </header>

        {/* ── Hero Welcome ── */}
        <section className="relative overflow-hidden pt-20 sm:pt-28 pb-14 sm:pb-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ef4444]/8 via-[#f97316]/3 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ef4444]/5 rounded-full blur-[120px]" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm font-medium">
                <Shield className="w-4 h-4" />
                Premium Member
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5 sm:mb-7">
              ようこそ、
              <span className="bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">TornadoAI</span>
              へ
            </h1>

            <p className="text-base sm:text-lg text-[#B7BDC6] mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
              WIN5の組み合わせを最適化するAI。
              <br className="sm:hidden" />
              予算と目標配当を伝えるだけで、
              <br className="sm:hidden" />
              <span className="text-[#fbbf24] font-semibold">5レースの最適な買い目</span>を自動設計します。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #f97316)',
                  boxShadow: '0 8px 30px rgba(239,68,68,0.3)',
                }}
              >
                <BarChart3 className="w-5 h-5" />
                ダッシュボードを開く
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/15 bg-white/5 font-bold text-base sm:text-lg transition-all hover:border-[#f97316]/40 hover:bg-[#f97316]/10 hover:text-[#f97316] active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                AIに相談する
              </Link>
            </div>

            <div className="mt-10 sm:mt-14">
              <ChevronDown className="w-6 h-6 mx-auto text-[#848E9C] animate-bounce" />
            </div>
          </div>
        </section>

        {/* ── Feature Grid ── */}
        <section className="py-14 sm:py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                あなたの<span className="text-[#ef4444]">6つの武器</span>
              </h2>
              <p className="text-sm sm:text-base text-[#B7BDC6]">
                WIN5攻略に必要な全機能を搭載
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className={`bg-gradient-to-br ${f.color} p-4 sm:p-5 rounded-xl text-white text-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-xl`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2" strokeWidth={1.5} />
                    <div className="text-xs sm:text-sm font-bold leading-tight">{f.title}</div>
                    <div className="text-[10px] sm:text-xs font-medium opacity-80 mt-1">{f.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Quick Links ── */}
        <section className="py-14 sm:py-20 px-6 bg-[#181A20]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                <span className="text-[#fbbf24]">クイック</span>アクセス
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { href: '/dashboard', icon: BarChart3, title: 'ダッシュボード', desc: '今週のWIN5対象5レースと波乱度をチェック', color: '#f97316' },
                { href: '/chat', icon: MessageCircle, title: 'AIチャット', desc: '予算・目標・スタイルを伝えて買い目を相談', color: '#3b82f6' },
                { href: '/history', icon: FileText, title: '保存した買い目', desc: '保存したパターンを比較・確認', color: '#a855f7' },
                { href: '/results', icon: History, title: '過去WIN5結果', desc: '過去の配当・キャリーオーバーを確認', color: '#10b981' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      borderColor: `${item.color}30`,
                      background: `linear-gradient(135deg, ${item.color}08, transparent)`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: `${item.color}15`, boxShadow: `0 0 20px ${item.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold" style={{ color: item.color }}>{item.title}</p>
                      <p className="text-xs text-[#B7BDC6] mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition shrink-0" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Profile (if data exists) ── */}
        {profile && profile.count > 0 && (
          <section className="py-14 sm:py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-xl border-2 border-[#a855f7]/30 p-5 sm:p-6" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.06), transparent)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#a855f7]/15 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#a855f7]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#a855f7]">あなたの傾向</p>
                    <p className="text-xs text-[#B7BDC6]">保存データ {profile.count}件から分析</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-[#a855f7]">{Math.round(profile.avg_total_combinations)}<span className="text-xs ml-1">点</span></p>
                    <p className="text-[10px] text-[#B7BDC6] mt-1">平均点数</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-[#fbbf24]">¥{Math.round(profile.avg_investment).toLocaleString()}</p>
                    <p className="text-[10px] text-[#B7BDC6] mt-1">平均投資額</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/90">{profile.style}</p>
                <p className="text-xs text-[#B7BDC6] mt-1">{profile.tip}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── How to Use ── */}
        <section className="py-14 sm:py-20 px-6 bg-[#181A20]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                毎週の<span className="text-[#fbbf24]">攻略フロー</span>
              </h2>
              <p className="text-sm sm:text-base text-[#B7BDC6]">
                4ステップで買い目が完成します
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STEPS.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.num}
                    className="flex items-start gap-4 p-4 sm:p-5 rounded-xl border border-white/5 bg-[#0B0E11]"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${s.color}15`, boxShadow: `0 0 20px ${s.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: s.color, filter: `drop-shadow(0 0 6px ${s.color})` }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: s.color }}>STEP {s.num}</p>
                      <p className="text-sm font-bold text-white/90 mb-1">{s.title}</p>
                      <p className="text-xs text-[#B7BDC6] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 sm:py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-xl sm:text-2xl font-bold mb-6">
              今週のWIN5、
              <span className="bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#fbbf24] bg-clip-text text-transparent">
                戦略を立てましょう。
              </span>
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                boxShadow: '0 8px 30px rgba(239,68,68,0.25)',
              }}
            >
              <MessageCircle className="w-5 h-5" />
              AIに今週のWIN5を相談する
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </div>
    </AuthGuard>
  )
}
