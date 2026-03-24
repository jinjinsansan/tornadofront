'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('tornado_token')
    localStorage.removeItem('tornado_user')
    router.push('/')
    setOpen(false)
  }

  const links = [
    { href: '/', label: 'ホーム', icon: '🏠' },
    { href: '/mypage', label: 'マイページ', icon: '👤' },
    { href: '/dashboard', label: 'ダッシュボード', icon: '📊' },
    { href: '/chat', label: 'AIチャット', icon: '💬' },
  ]

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
        aria-label="メニュー"
      >
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in menu */}
      <div className={`fixed top-0 right-0 z-50 h-full w-72 bg-tornado-card border-l border-tornado-border transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 pt-20">
          {/* User info */}
          <div className="mb-8 pb-6 border-b border-tornado-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-tornado-accent to-tornado-orange flex items-center justify-center text-lg">
                🌪️
              </div>
              <div>
                <p className="font-bold text-sm">会員様</p>
                <p className="text-xs text-tornado-muted">TornadoAI Premium</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  pathname === link.href
                    ? 'bg-tornado-accent/10 text-tornado-accent'
                    : 'text-tornado-text hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="mt-8 pt-6 border-t border-tornado-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition w-full"
            >
              <span className="text-lg">🚪</span>
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
