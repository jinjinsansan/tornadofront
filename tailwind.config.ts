import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        tornado: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
          accent: '#e94560',
          orange: '#f58a07',
          gold: '#ffd700',
          text: '#e0e0e0',
          muted: '#888',
        },
      },
    },
  },
  plugins: [],
}
export default config
