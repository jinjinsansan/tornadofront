'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, User, BarChart3, MessageCircle, LogOut, X, ChevronRight } from 'lucide-react'
import styles from './HamburgerMenu.module.css'

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'
    // iOS/Safari/WebView may report unstable viewport widths; cap scrollbar compensation to desktop only.
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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('tornado_token')
    localStorage.removeItem('tornado_user')
    setOpen(false)
    router.push('/')
  }

  const links = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/mypage', label: 'マイページ', icon: User },
    { href: '/dashboard', label: 'ダッシュボード', icon: BarChart3 },
    { href: '/chat', label: 'AIチャット', icon: MessageCircle },
  ]

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
        aria-label="メニュー"
        aria-expanded={open}
        aria-controls="tornado-hamburger-menu"
      >
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
      </button>

      {!mounted || !open
        ? null
        : createPortal(
          <>
            {/* Overlay */}
            <div className={styles.overlay} onClick={() => setOpen(false)} />

            {/* Panel */}
            <div id="tornado-hamburger-menu" className={styles.menuContainer} role="dialog" aria-modal="true">
              {/* Header */}
              <div
                className="px-5 pt-5 pb-4"
                style={{
                  background: 'linear-gradient(180deg, #151c2c, #0d1117)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌪️</span>
                    <span className="font-black text-sm">TornadoAI</span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition"
                    aria-label="閉じる"
                  >
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>

                {/* User badge */}
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}
                  >
                    🌪️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/80">Premium会員</p>
                    <p className="text-[10px]" style={{ color: '#fbbf24' }}>TornadoAI Member</p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className={`${styles.menuBody} px-3 py-4`}>
                <p className="px-3 mb-2 text-[9px] font-bold tracking-[0.25em] text-white/15 uppercase">Menu</p>

                <nav className="space-y-0.5">
                  {links.map(link => {
                    const isActive = pathname === link.href
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors duration-150"
                        style={isActive ? {
                          background: 'rgba(239,68,68,0.08)',
                          borderLeft: '2px solid #ef4444',
                        } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className="w-4 h-4"
                            style={{ color: isActive ? '#ef4444' : 'rgba(255,255,255,0.3)' }}
                            strokeWidth={1.5}
                          />
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: isActive ? '#ef4444' : 'rgba(255,255,255,0.7)' }}
                          >
                            {link.label}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.08)' }} />
                      </Link>
                    )
                  })}
                </nav>

                {/* Divider */}
                <div className="my-3 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150 w-full"
                  style={{ color: 'rgba(239,68,68,0.6)' }}
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  <span>ログアウト</span>
                </button>
              </div>

              {/* Footer */}
              <div
                className="px-5 py-3 text-center"
                style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
              >
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.1)' }}>&copy; 2026 TornadoAI</p>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  )
}
