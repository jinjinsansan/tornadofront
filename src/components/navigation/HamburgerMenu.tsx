'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, User, BarChart3, MessageCircle, LogOut, X, ChevronRight } from 'lucide-react'

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = () => {
    localStorage.removeItem('tornado_token')
    localStorage.removeItem('tornado_user')
    router.push('/')
    setOpen(false)
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
        onClick={() => setOpen(true)}
        className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
        aria-label="メニュー"
      >
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
        <span className="block w-5 h-[2px] bg-white/80 rounded-full" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          style={{ animation: 'fadeIn 0.2s ease' }}
        />
      )}

      {/* Slide-in panel */}
      {open && (
        <div
          className="fixed top-0 right-0 z-[1001] h-full w-full max-w-sm border-l shadow-2xl"
          style={{
            background: '#111827',
            borderColor: 'rgba(255,255,255,0.05)',
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/5" style={{ background: 'linear-gradient(to right, #1a1f35, #111827)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌪️</span>
                <span className="font-black text-sm tracking-wide">TornadoAI</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* User badge */}
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', boxShadow: '0 0 15px rgba(239,68,68,0.3)' }}>
                🌪️
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">Premium会員</p>
                <p className="text-[11px] font-medium" style={{ color: '#fbbf24' }}>TornadoAI Member</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="px-4 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">メニュー</p>

            <nav className="space-y-1">
              {links.map(link => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group"
                    style={isActive ? {
                      background: 'linear-gradient(to right, rgba(239,68,68,0.1), transparent)',
                      borderLeft: '3px solid #ef4444',
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="w-[18px] h-[18px]"
                        style={{ color: isActive ? '#ef4444' : 'rgba(255,255,255,0.4)' }}
                        strokeWidth={1.5}
                      />
                      <span className={`text-sm font-medium ${isActive ? 'text-tornado-accent' : 'text-white/80 group-hover:text-white'}`}>
                        {link.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition" />
                  </Link>
                )
              })}
            </nav>

            {/* Divider */}
            <div className="my-4 mx-3 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.2), transparent)' }} />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition w-full group"
            >
              <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
              <span>ログアウト</span>
            </button>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-4 text-center border-t border-white/5">
            <p className="text-[10px] text-white/15">&copy; 2026 TornadoAI</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
