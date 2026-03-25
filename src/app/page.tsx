"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  BarChart3,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Layers,
  ChevronDown,
  Sparkles,
  Activity,
  PieChart,
  Flame,
  Shield,
} from "lucide-react";

/* ── Feature data ── */
const features = [
  {
    tag: "Feature 01",
    icon: Activity,
    color: "#ef4444",
    title: "波乱度ランク",
    titleHighlight: "5段階",
    subtitle: "どのレースが荒れるか、AIが数値で示す",
    desc: "出走頭数・AI指数の混戦度・1番人気の信頼性・オッズのエントロピー——4つの要素から各レースの「荒れやすさ」を1〜5で算出。堅いレースは1頭に絞り、荒れるレースは3〜5頭に広げる。この判断をAIが自動で行う。",
    visual: [
      { label: "中山10R 船橋S", stars: 3, color: "#fbbf24" },
      { label: "中京10R 伊勢S", stars: 2, color: "#3b82f6" },
      { label: "阪神11R 六甲S", stars: 4, color: "#f97316" },
      { label: "中山11R マーチS", stars: 3, color: "#fbbf24" },
      { label: "中京11R 高松宮記念", stars: 5, color: "#ef4444" },
    ],
  },
  {
    tag: "Feature 02",
    icon: Target,
    color: "#f97316",
    title: "買い目",
    titleHighlight: "自動生成",
    subtitle: "予算と目標を言うだけ。AIが最適解を出す",
    desc: "「予算5,000円で500万狙いたい」——それだけでOK。AIが波乱度に応じて各レースの頭数を配分し、予算内に収まる買い目を自動生成。的中率/期待値/想定配当レンジまで出し、生成後は馬をタップして微調整→保存できる。",
  },
  {
    tag: "Feature 03",
    icon: Layers,
    color: "#fbbf24",
    title: "3シナリオ",
    titleHighlight: "同時提示",
    subtitle: "本線・中荒れ・大荒れ。3つの戦略を比較して選ぶ",
    desc: "WIN5に「正解」は1つじゃない。堅実に行く本線、1〜2頭穴を混ぜる中荒れ、高配当に全振りする大荒れ——3つのシナリオをそれぞれの点数・投資額・想定配当付きで同時に提示。土曜夜に比較して、日曜朝に決める。",
    scenarios: [
      { name: "🔵 本線", combos: "12点", payout: "〜50万", style: "堅実型" },
      { name: "🟡 中荒れ", combos: "36点", payout: "〜300万", style: "バランス型" },
      { name: "🔴 大荒れ", combos: "48点", payout: "〜1,200万", style: "ロマン型" },
    ],
  },
  {
    tag: "Feature 04",
    icon: MessageCircle,
    color: "#3b82f6",
    title: "AI戦略",
    titleHighlight: "チャット",
    subtitle: "WIN5専門AIに、何でも聞ける",
    desc: "「荒れるレースだけ広げたい」「R3だけ1頭に絞りたい」——自然言語で聞けば、WIN5の文脈に接地したAIが即答。提案買い目はダッシュボードに反映して、そのまま調整・保存まで進められる。",
    chatMessages: [
      { role: "user", text: "予算5000円で500万狙いたいです" },
      { role: "ai", text: "いいですね。波乱度的にR3とR5を広げて、堅いR2は1頭に絞るのがベストです。48点の組み合わせでご提案しますね。" },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-tornado-deep text-white selection:bg-tornado-accent/30 overflow-x-hidden font-sans">

      {/* ━━━ Navigation ━━━ */}
      <header className="fixed top-0 w-full z-50 bg-tornado-deep/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logo.png" alt="TornadoAI" width={36} height={36} className="rounded-lg" priority />
            <span className="text-lg font-black tracking-wide">TornadoAI</span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link href="/dashboard" className="hidden sm:inline text-sm text-white/50 hover:text-white transition">ダッシュボード</Link>
            <Link
              href="/login"
              className="text-sm px-5 py-2.5 bg-gradient-to-r from-tornado-accent to-tornado-orange text-white font-bold rounded-full hover:opacity-90 transition"
            >
              招待コードでログイン
            </Link>
          </nav>
        </div>
      </header>

      {/* ━━━ Hero ━━━ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20 sm:pt-24">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-tornado-accent/[0.04] rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-tornado-orange/[0.03] rounded-full blur-[120px]" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-tornado-accent/30 bg-tornado-accent/5 px-5 py-2 backdrop-blur-sm"
              >
                <Zap className="h-4 w-4 text-tornado-accent" />
                <span className="text-sm font-medium tracking-wide text-tornado-accent">WIN5 専門 AI戦略ツール</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-2 text-4xl leading-none tracking-tight sm:text-7xl lg:text-7xl"
                style={{ fontWeight: 900 }}
              >
                WIN5は、
                <br />
                <span className="bg-gradient-to-r from-tornado-accent via-tornado-orange to-tornado-gold bg-clip-text text-transparent">
                  組み合わせで勝つ。
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="mb-10 mt-6 max-w-2xl text-base font-light leading-relaxed text-white/60 md:text-xl"
              >
                予算と目標配当を入れるだけ。AIが買い目を自動設計し、被り度・爆発ヒートマップ・1頭飛びで当日まで調整できる。
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center gap-4 lg:items-start"
              >
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-9 py-5 text-lg font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                    boxShadow: "0 0 30px rgba(239,68,68,0.3), 0 0 80px rgba(239,68,68,0.1)",
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                  招待コードでログイン
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/15 bg-white/5 px-8 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-tornado-orange/50 hover:bg-tornado-orange/10 hover:text-tornado-orange active:scale-95"
                >
                  <BarChart3 className="h-5 w-5" />
                  ダッシュボードを見る
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:justify-start"
              >
                {[
                  { value: "5", label: "レース横断分析" },
                  { value: "3", label: "シナリオ同時提示" },
                  { value: "🔥", label: "爆発/被り分析" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <p className="text-2xl font-black tracking-tight sm:text-3xl bg-gradient-to-r from-tornado-accent to-tornado-gold bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-[11px] font-medium tracking-wider text-white/40">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero image card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mx-auto w-full max-w-xl lg:max-w-none"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-2 shadow-[0_20px_80px_-30px_rgba(239,68,68,0.25)]">
                <div className="absolute inset-0 bg-gradient-to-br from-tornado-accent/10 via-transparent to-tornado-orange/10" />
                <Image
                  src="/brand/hero.webp"
                  alt="TornadoAI ダッシュボード"
                  width={1200}
                  height={675}
                  priority
                  className="relative w-full h-auto rounded-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-medium tracking-[0.3em] text-white/30 uppercase">Scroll</span>
          <ChevronDown className="h-5 w-5 animate-bounce text-tornado-accent/50" />
        </motion.div>
      </section>

      {/* ── Content wrapper ── */}
      <div className="mx-auto max-w-[1200px]">

        {/* ━━━ Feature 01: 波乱度ランク ━━━ */}
        <section className="relative py-16 sm:py-28 lg:py-36" style={{ background: "#080c18" }}>
          <div className="absolute left-1/2 top-1/2 -z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04] blur-[150px]" style={{ background: features[0].color }} />
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Text */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-5 sm:p-8 backdrop-blur-sm md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <Activity className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: features[0].color }} strokeWidth={1.5} />
                  <span className="text-sm font-bold tracking-widest uppercase" style={{ color: features[0].color }}>Feature 01</span>
                </div>
                <h2 className="mb-8 text-2xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  {features[0].title}
                  <br />
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${features[0].color}, #f97316)` }}>
                    {features[0].titleHighlight}
                  </span>
                </h2>
                <p className="text-lg font-light leading-relaxed text-white/70 md:text-xl">{features[0].subtitle}</p>
                <p className="mt-4 text-base leading-relaxed text-white/50">{features[0].desc}</p>
              </div>

              {/* Visual: Volatility bars */}
              <div className="relative flex flex-col gap-2 sm:gap-3 rounded-2xl sm:rounded-[2rem] border border-white/10 bg-[#0a0e1a] p-4 sm:p-8">
                <p className="mb-2 text-xs font-bold tracking-[0.25em] text-white/30 uppercase">今週のWIN5 波乱度</p>
                {features[0].visual?.map((race, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-4 rounded-lg sm:rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 sm:px-4 sm:py-3">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0" style={{ background: `${race.color}15`, color: race.color }}>
                      R{i + 1}
                    </span>
                    <span className="flex-1 text-xs sm:text-sm font-medium text-white/80 truncate">{race.label}</span>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div
                          key={j}
                          className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-sm"
                          style={{
                            background: j < race.stars ? race.color : "rgba(255,255,255,0.05)",
                            boxShadow: j < race.stars ? `0 0 8px ${race.color}40` : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between text-xs text-white/30">
                  <span>🔵 堅い</span>
                  <span>🟡 混戦</span>
                  <span>🔴 大荒れ</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ Feature 02: 買い目自動生成 ━━━ */}
        <section className="relative py-16 sm:py-28 lg:py-36" style={{ background: "#060a16" }}>
          <div className="absolute left-1/2 top-1/2 -z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04] blur-[150px]" style={{ background: features[1].color }} />
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 flex items-center justify-center gap-3">
                <Target className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: features[1].color }} strokeWidth={1.5} />
                <span className="text-sm font-bold tracking-widest uppercase" style={{ color: features[1].color }}>Feature 02</span>
              </div>
              <h2 className="mb-8 text-2xl font-black leading-tight sm:text-4xl lg:text-5xl">
                {features[1].title}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${features[1].color}, #fbbf24)` }}>
                  {features[1].titleHighlight}
                </span>
              </h2>
              <p className="text-lg font-light leading-relaxed text-white/70 md:text-xl">{features[1].subtitle}</p>
              <p className="mt-4 text-base leading-relaxed text-white/50 max-w-2xl mx-auto">{features[1].desc}</p>
            </div>

            {/* Visual: Ticket generation mock */}
            <div className="mx-auto mt-14 max-w-xl">
              <div className="rounded-2xl sm:rounded-[2rem] border-2 p-5 sm:p-8" style={{ borderColor: `${features[1].color}30`, background: `${features[1].color}08` }}>
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="h-8 w-8" style={{ color: features[1].color }} />
                  <div>
                    <p className="text-sm text-white/50">入力するのはこれだけ</p>
                    <p className="font-bold text-white/90">予算 ¥5,000 → 目標 ¥5,000,000</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-4">
                  {["1頭", "2頭", "3頭", "1頭", "2頭"].map((n, i) => (
                    <div key={i} className="rounded-lg sm:rounded-xl border border-white/10 bg-white/[0.03] p-2 sm:p-3 text-center">
                      <p className="text-[10px] sm:text-xs text-white/40">R{i + 1}</p>
                      <p className="text-base sm:text-lg font-black" style={{ color: features[1].color }}>{n}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 pt-4 border-t border-white/10">
                  <span className="text-xs sm:text-sm text-white/50">12点 / ¥1,200</span>
                  <span className="font-black text-sm sm:text-lg" style={{ color: "#fbbf24" }}>最高想定 ¥12,400,000</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ Feature 03: 3シナリオ ━━━ */}
        <section className="relative py-16 sm:py-28 lg:py-36" style={{ background: "#080c18" }}>
          <div className="absolute left-1/2 top-1/2 -z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04] blur-[150px]" style={{ background: features[2].color }} />
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <div className="mb-6 flex items-center justify-center gap-3">
                <Layers className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: features[2].color }} strokeWidth={1.5} />
                <span className="text-sm font-bold tracking-widest uppercase" style={{ color: features[2].color }}>Feature 03</span>
              </div>
              <h2 className="mb-8 text-2xl font-black leading-tight sm:text-4xl lg:text-5xl">
                {features[2].title}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${features[2].color}, #f97316)` }}>
                  {features[2].titleHighlight}
                </span>
              </h2>
              <p className="text-lg font-light leading-relaxed text-white/70 md:text-xl">{features[2].subtitle}</p>
              <p className="mt-4 text-base leading-relaxed text-white/50 max-w-2xl mx-auto">{features[2].desc}</p>
            </div>

            {/* Scenario cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features[2].scenarios?.map((s, i) => {
                const colors = ["#3b82f6", "#fbbf24", "#ef4444"];
                const c = colors[i];
                return (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-2xl sm:rounded-[2rem] border-2 p-5 sm:p-7 transition-all duration-300 hover:scale-[1.03]"
                    style={{
                      borderColor: `${c}40`,
                      background: `linear-gradient(135deg, ${c}0a, transparent)`,
                      boxShadow: `0 20px 60px -20px ${c}20`,
                    }}
                  >
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-20 blur-3xl transition-transform duration-500 group-hover:scale-150" style={{ background: c }} />
                    <p className="relative text-2xl font-black mb-3">{s.name}</p>
                    <p className="relative text-sm text-white/50 mb-1">{s.style}</p>
                    <div className="relative mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">点数</span>
                        <span className="font-bold" style={{ color: c }}>{s.combos}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">想定配当</span>
                        <span className="font-bold" style={{ color: c }}>{s.payout}</span>
                      </div>
                    </div>
                    <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${30 + i * 25}%`, background: `linear-gradient(to right, ${c}, ${c}80)` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ Feature 04: AIチャット ━━━ */}
        <section className="relative py-16 sm:py-28 lg:py-36" style={{ background: "#060a16" }}>
          <div className="absolute left-1/2 top-1/2 -z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.04] blur-[150px]" style={{ background: features[3].color }} />
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Text */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-5 sm:p-8 backdrop-blur-sm md:p-12">
                <div className="mb-6 flex items-center gap-3">
                  <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12" style={{ color: features[3].color }} strokeWidth={1.5} />
                  <span className="text-sm font-bold tracking-widest uppercase" style={{ color: features[3].color }}>Feature 04</span>
                </div>
                <h2 className="mb-8 text-2xl font-black leading-tight sm:text-4xl lg:text-5xl">
                  {features[3].title}
                  <br />
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${features[3].color}, #60a5fa)` }}>
                    {features[3].titleHighlight}
                  </span>
                </h2>
                <p className="text-lg font-light leading-relaxed text-white/70 md:text-xl">{features[3].subtitle}</p>
                <p className="mt-4 text-base leading-relaxed text-white/50">{features[3].desc}</p>
              </div>

              {/* Chat mock */}
              <div className="relative rounded-2xl sm:rounded-[2rem] border border-white/10 bg-[#0a0e1a] p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                  <Image src="/brand/logo.png" alt="TornadoAI" width={22} height={22} className="rounded-md" />
                  <span className="font-bold text-sm">TornadoAI</span>
                  <span className="text-xs text-white/30 ml-auto">WIN5戦略AI</span>
                </div>
                <div className="space-y-4">
                  {features[3].chatMessages?.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-tornado-accent to-tornado-orange text-white"
                            : "border border-white/10 bg-white/[0.03] text-white/80"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/30">
                    WIN5について何でも聞いてください...
                  </div>
                  <div className="w-14 sm:w-16 rounded-xl bg-gradient-to-r from-tornado-accent to-tornado-orange flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                    送信
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ How It Works ━━━ */}
        <section className="relative py-16 sm:py-28 lg:py-36" style={{ background: "#080c18" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="mb-4 block text-sm font-bold tracking-widest text-tornado-gold uppercase">How It Works</span>
              <h2 className="text-2xl font-black leading-tight sm:text-4xl lg:text-5xl">
                使い方は<span className="bg-gradient-to-r from-tornado-gold to-tornado-orange bg-clip-text text-transparent">シンプル</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", icon: DollarSign, title: "予算を決める", desc: "今週のWIN5にいくら使うか。1,000円〜自由に設定。", color: "#ef4444" },
                { step: "02", icon: Zap, title: "AIが買い目を設計", desc: "波乱度・AI指数・オッズから5レースの最適な頭数配分を自動計算。", color: "#f97316" },
                { step: "03", icon: Target, title: "調整→保存→分析", desc: "馬をタップして微調整し、保存。被り度/爆発ヒートマップ/1頭飛びで当日まで詰める。", color: "#fbbf24" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div
                    className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center"
                    style={{
                      borderColor: `${item.color}50`,
                      background: `${item.color}15`,
                      boxShadow: `0 0 30px ${item.color}20`,
                    }}
                  >
                    <item.icon className="h-6 w-6 sm:h-9 sm:w-9" style={{ color: item.color, filter: `drop-shadow(0 0 8px ${item.color})` }} strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-bold tracking-widest mb-3" style={{ color: item.color }}>STEP {item.step}</p>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ Dashboard power ━━━ */}
        <section className="relative py-16 sm:py-28 lg:py-36" style={{ background: "#060a16" }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="mb-4 block text-sm font-bold tracking-widest text-tornado-accent uppercase">Dashboard</span>
              <h2 className="text-2xl font-black leading-tight sm:text-4xl lg:text-5xl">
                当日まで使える<span className="bg-gradient-to-r from-tornado-accent to-tornado-orange bg-clip-text text-transparent">分析機能</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/50">
                生成して終わりではなく、買い目を「磨く」ための機能をまとめています。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Layers, title: "保存 & 履歴", desc: "買い目を保存して比較。日曜朝に見返せる。", color: "#fbbf24" },
                { icon: PieChart, title: "被り度チェック", desc: "他ユーザーの傾向から“混み具合”を確認。", color: "#60a5fa" },
                { icon: Flame, title: "爆発ヒートマップ", desc: "選択馬の中で“爆発に効く馬”を可視化。", color: "#ef4444" },
                { icon: Activity, title: "1頭飛んだら？", desc: "人気馬が飛んだ時の払戻レンジを概算。", color: "#f97316" },
                { icon: BarChart3, title: "結果 & バックテスト", desc: "過去結果と戦略の相性を振り返り。", color: "#22c55e" },
                { icon: Shield, title: "あなたの傾向", desc: "保存データから“絞る/広げる”傾向と改善ヒント。", color: "#a78bfa" },
              ].map((c, i) => (
                <div key={i} className="rounded-2xl sm:rounded-[2rem] border border-white/10 bg-white/[0.02] p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl border border-white/10 flex items-center justify-center" style={{ background: `${c.color}12` }}>
                      <c.icon className="h-6 w-6" style={{ color: c.color }} strokeWidth={1.5} />
                    </div>
                    <p className="text-base font-black">{c.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-white/50 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>{/* max-w wrapper end */}

      {/* ━━━ CTA ━━━ */}
      <section className="relative overflow-hidden py-16 sm:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute left-1/2 top-1/2 -z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tornado-accent opacity-[0.06] blur-[150px]" />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 text-center">
          <h2 className="text-3xl font-black sm:text-5xl lg:text-6xl">
            今週のWIN5、<br />
            <span className="bg-gradient-to-r from-tornado-accent via-tornado-orange to-tornado-gold bg-clip-text text-transparent">
              一緒に戦略を立てませんか。
            </span>
          </h2>
          <p className="text-lg text-white/50">招待コードでログインして、今週の買い目を設計しましょう。</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-5 text-lg font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #ef4444, #f97316)",
              boxShadow: "0 0 30px rgba(239,68,68,0.3), 0 0 80px rgba(239,68,68,0.1)",
            }}
          >
            <Sparkles className="h-5 w-5" />
            招待コードでログイン
          </Link>
        </div>
      </section>

      {/* ━━━ Footer ━━━ */}
      <footer className="py-10 px-6 border-t border-white/5 bg-tornado-deep">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logo.png" alt="TornadoAI" width={28} height={28} className="rounded-md" />
            <span className="text-sm font-black">TornadoAI</span>
            <span className="text-xs text-white/30">WIN5特化AI戦略ツール</span>
          </div>
          <div className="flex gap-8 text-xs text-white/30">
            <Link href="/chat" className="hover:text-white transition">AIチャット</Link>
            <Link href="/dashboard" className="hover:text-white transition">ダッシュボード</Link>
          </div>
          <p className="text-xs text-white/20">&copy; 2026 TornadoAI</p>
        </div>
      </footer>
    </div>
  );
}
