'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Home, User, BarChart3, MessageCircle, LogOut, X, ChevronRight, FileText, History, Layers, ExternalLink } from 'lucide-react'
import styles from './HamburgerMenu.module.css'

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const isDesktop = window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 640
    if (isDesktop && scrollbarWidth > 0 && scrollbarWidth < 40) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => { setOpen(false) }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('tornado_token')
    localStorage.removeItem('tornado_user')
    setOpen(false)
    router.push('/')
  }

  const active = (href: string) => pathname === href

  const mainLinks = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/mypage', label: 'マイページ', icon: User },
    { href: '/dashboard', label: 'WIN5モード', icon: BarChart3 },
    { href: '/wide', label: 'ワイドモード', icon: Layers },
    { href: '/chat', label: 'AIチャット', icon: MessageCircle },
  ]

  const subLinks = [
    { href: '/history', label: '保存した買い目', icon: FileText },
    { href: '/results', label: '過去WIN5結果', icon: History },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
        aria-label="メニュー"
        aria-expanded={open}
      >
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
      </button>

      {!mounted || !open ? null : createPortal(
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />

          <div className={styles.menuContainer} role="dialog" aria-modal="true">
            {/* ── Header (Dlogic pattern) ── */}
            <div style={{
              background: 'linear-gradient(to right, #1A1A24, #14141E)',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(43, 49, 57, 0.3)',
            }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#EAECEF]">メニュー</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: 'rgba(43,49,57,0.3)' }}
                >
                  <X className="w-5 h-5 text-[#B7BDC6]" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(26,26,36,0.5)' }}>
                <Image
                  src="/brand/logo.png" alt="" width={40} height={40}
                  className="rounded-full"
                  style={{ border: '2px solid rgba(239,68,68,0.3)' }}
                />
                <div>
                  <p className="text-sm font-medium text-[#EAECEF]">Premium会員</p>
                  <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                    ⚡ TornadoAI Member
                  </p>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className={styles.menuBody}>
              {/* Main */}
              <div className="px-4 pt-4 pb-2">
                <p className="text-xs font-bold uppercase tracking-wider px-4 mb-2" style={{ color: 'rgba(239,68,68,0.6)' }}>
                  TornadoAI
                </p>
                {mainLinks.map(link => {
                  const Icon = link.icon
                  const a = active(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-lg mb-1 transition-all duration-200 ${
                        a ? 'bg-gradient-to-r from-[#ef4444]/10 to-transparent border-l-4 border-[#ef4444]'
                          : 'hover:bg-[#1A1A24] hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" style={{ color: a ? '#ef4444' : '#B7BDC6' }} strokeWidth={1.5} />
                        <span className={`text-base font-medium ${a ? 'text-[#ef4444]' : 'text-[#EAECEF]'}`}>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: a ? '#ef4444' : '#B7BDC6' }} />
                    </Link>
                  )
                })}
              </div>

              {/* Divider */}
              <div className="mx-6 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.3), transparent)' }} />

              {/* Sub */}
              <div className="px-4 py-2">
                <p className="text-xs font-bold uppercase tracking-wider px-4 mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  データ
                </p>
                {subLinks.map(link => {
                  const Icon = link.icon
                  const a = active(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-lg mb-1 transition-all duration-200 ${
                        a ? 'bg-gradient-to-r from-[#fbbf24]/10 to-transparent border-l-4 border-[#fbbf24]'
                          : 'hover:bg-[#1A1A24] hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" style={{ color: a ? '#fbbf24' : '#B7BDC6' }} strokeWidth={1.5} />
                        <span className={`text-base font-medium ${a ? 'text-[#fbbf24]' : 'text-[#EAECEF]'}`}>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: a ? '#fbbf24' : '#B7BDC6' }} />
                    </Link>
                  )
                })}
              </div>

              {/* Divider */}
              <div className="mx-6 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.3), transparent)' }} />

              {/* LINE */}
              <div className="px-4 py-2">
                <a
                  href="https://lin.ee/s0dqTW3"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between p-4 rounded-lg mb-1 transition-all duration-200 hover:bg-[#06C755]/10 hover:translate-x-1"
                >
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                    <span className="text-base font-medium text-[#06C755]">公式LINE</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#06C755]/60" />
                </a>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.3), transparent)' }} />

              {/* Logout */}
              <div className="px-4 py-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-4 rounded-lg mb-1 w-full transition-all duration-200 hover:translate-x-1"
                  style={{ background: 'rgba(246,70,93,0.06)' }}
                >
                  <LogOut className="w-5 h-5 text-[#F6465D]" strokeWidth={1.5} />
                  <span className="text-base font-medium text-[#F6465D]">ログアウト</span>
                </button>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 text-center">
              <p className="text-xs text-[#848E9C]">&copy; 2026 TornadoAI</p>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
