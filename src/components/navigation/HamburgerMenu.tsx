'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Home, User, BarChart3, MessageCircle, LogOut, X, ChevronRight, FileText, History, Layers } from 'lucide-react'
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
