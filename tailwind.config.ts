import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        tornado: {
          bg: '#0a0f1e',
          card: '#111827',
          border: '#1e293b',
          accent: '#ef4444',
          orange: '#f97316',
          gold: '#fbbf24',
          text: '#e2e8f0',
          muted: '#94a3b8',
          navy: '#0f172a',
          deep: '#060b18',
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #ef4444, #f97316)',
        'gradient-hero': 'radial-gradient(ellipse at top, #1e293b 0%, #0a0f1e 50%, #060b18 100%)',
        'gradient-card': 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
      },
    },
  },
  plugins: [],
}
export default config
