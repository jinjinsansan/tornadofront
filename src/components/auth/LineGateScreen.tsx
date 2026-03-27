'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ExternalLink, CheckCircle, Zap } from 'lucide-react'
import {
  LINE_ADD_FRIEND_URL,
  freeTrialRemainingMs,
  markLineAdded,
  isLineOpened,
  markLineOpened,
} from '@/config/freeTrial'
import { useEffect } from 'react'

/**
 * LINE友だち追加ゲート画面
 *
 * フリートライアル期間中、未ログイン＋LINE未追加のユーザーに表示。
 * 1. 公式LINEを友だち追加（外部リンク）
 * 2. 「追加しました」ボタンを押す → localStorage にフラグ保存 → onComplete コールバック
 */
export default function LineGateScreen({ onComplete }: { onComplete: () => void }) {
  const [remaining, setRemaining] = useState('')
  const [lineOpened, setLineOpened] = useState(false)

  // 以前にLINEボタンを押していたら復元
  useEffect(() => {
    if (isLineOpened()) setLineOpened(true)
  }, [])

  useEffect(() => {
    const tick = () => {
      const ms = freeTrialRemainingMs()
      if (ms <= 0) {
        setRemaining('00:00:00')
        return
      }
      const totalSec = Math.floor(ms / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      const pad = (n: number) => String(n).padStart(2, '0')
      setRemaining(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const handleOpenLine = () => {
    window.open(LINE_ADD_FRIEND_URL, '_blank', 'noopener,noreferrer')
    markLineOpened()
    setLineOpened(true)
  }

  const handleComplete = () => {
    markLineAdded()
    onComplete()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-tornado-deep">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#06C755]/[0.06] blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            <Image src="/brand/logo.png" alt="TornadoAI" width={56} height={56} className="rounded-2xl" priority />
          </Link>
          <h1 className="text-2xl font-black mt-3">TornadoAI</h1>
          <p className="text-tornado-muted text-sm mt-1">WIN5特化AI戦略ツール</p>
        </div>

        {/* Card */}
        <div className="bg-tornado-card border border-tornado-border rounded-2xl p-6 sm:p-8">
          {/* Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#06C755]/40 bg-[#06C755]/10 px-4 py-1.5">
              <span className="text-xs font-bold text-[#06C755] tracking-wide">🎉 期間限定 無料体験</span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-center mb-2">
            公式LINE追加で<span className="text-[#06C755]">無料体験</span>スタート！
          </h2>
          <p className="text-sm text-tornado-muted text-center mb-6">
            TornadoAIの公式LINEを友だち追加するだけで、全機能を無料でお試しいただけます。
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 mb-6">
            <Clock className="h-4 w-4 text-tornado-accent animate-pulse" />
            <span className="text-xs text-white/50">無料体験終了まで</span>
            <span className="text-base font-mono font-black tracking-wider text-white">{remaining}</span>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-6">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#06C755]/20 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-[#06C755]">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white/90">公式LINEを友だち追加</p>
                <p className="text-xs text-white/50 mt-0.5">下のボタンからLINEアプリで追加できます</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-tornado-accent/20 flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-tornado-accent">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white/90">「追加しました」ボタンを押す</p>
                <p className="text-xs text-white/50 mt-0.5">追加したらこのページに戻ってタップ！</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            {/* LINE Add Button */}
            <button
              onClick={handleOpenLine}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: '#06C755',
                boxShadow: '0 0 25px rgba(6,199,85,0.3)',
              }}
            >
              {/* LINE icon inline SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              友だち追加する
              <ExternalLink className="h-4 w-4" />
            </button>

            {/* Complete Button - appears only after LINE opened */}
            {lineOpened && (
              <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] bg-gradient-to-r from-tornado-accent to-tornado-orange text-white hover:opacity-90"
                style={{ boxShadow: '0 0 25px rgba(239,68,68,0.3)' }}
              >
                <CheckCircle className="h-5 w-5" />
                追加しました — 無料体験を始める
              </button>
            )}
          </div>

          {/* Benefits */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-white/40 text-center mb-3">無料体験でできること</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'WIN5 AI分析',
                'AI戦略チャット',
                '買い目自動生成',
                'ワイドモード',
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-white/60">
                  <Zap className="h-3 w-3 text-tornado-gold flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center mt-6 space-y-2">
          <Link href="/" className="text-xs text-tornado-muted hover:text-white transition block">
            ← トップページに戻る
          </Link>
          <Link href="/login" className="text-xs text-tornado-muted hover:text-white transition block">
            会員の方はこちら（ログイン）
          </Link>
        </div>
      </div>
    </div>
  )
}
