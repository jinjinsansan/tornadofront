import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'トルネードAI | WIN5特化AI予想',
  description: 'WIN5の組み合わせを最適化するAI戦略ツール。予算と目標配当から最適な買い目を自動生成。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
