'use client'

import HamburgerMenu from '@/components/navigation/HamburgerMenu'

export default function MenuTestPage() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto">
      <header className="sticky top-0 z-30 bg-tornado-deep/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌪️</span>
          <h1 className="text-lg font-bold">Menu Test</h1>
        </div>
        <HamburgerMenu />
      </header>

      <main className="p-4 space-y-4">
        <p className="text-sm text-tornado-muted">
          このページはハンバーガーメニューの表示検証用です（コミット前に削除します）。
        </p>
        <div className="h-[1400px] rounded-xl border border-white/5 bg-white/[0.02]" />
      </main>
    </div>
  )
}
