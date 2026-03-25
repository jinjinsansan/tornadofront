'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send, Flame, LifeBuoy, RefreshCw } from 'lucide-react'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

type Message = { role: 'user' | 'assistant'; content: string }
type QuickReply = { label: string; text: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [toolStatus, setToolStatus] = useState('')
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
  const [supportMode, setSupportMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch(`${API}/api/chat/sessions`, { method: 'POST' })
      .then(r => r.json())
      .then(data => setSessionId(data.session_id))
      .catch(() => setSessionId('local-' + Date.now()))
  }, [])

  const fetchSupportReplies = async () => {
    const token = localStorage.getItem('tornado_token') || ''
    if (!token) return
    try {
      const res = await fetch(`${API}/api/support/replies`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      const data = await res.json().catch(() => ({} as any))
      const list = (data?.replies || []) as Array<{ ticket_id: number; text: string }>
      if (list.length === 0) return
      setMessages(prev => [
        ...prev,
        ...list.map(r => ({ role: 'assistant' as const, content: `【サポート回答 #${r.ticket_id}】\n${r.text}` })),
      ])
    } catch {}
  }

  useEffect(() => {
    fetchSupportReplies()
    const id = window.setInterval(fetchSupportReplies, 15000)
    return () => window.clearInterval(id)
  }, [])

  const ensureSessionId = async () => {
    if (sessionId) return sessionId
    setToolStatus('準備中...')
    try {
      const res = await fetch(`${API}/api/chat/sessions`, { method: 'POST' })
      const data = await res.json().catch(() => ({} as any))
      const sid = String(data?.session_id || '') || 'local-' + Date.now()
      setSessionId(sid)
      return sid
    } catch {
      const sid = 'local-' + Date.now()
      setSessionId(sid)
      return sid
    } finally {
      setToolStatus('')
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, quickReplies])

  const sendMessage = async (text?: string) => {
    const userMsg = (text || input).trim()
    if (!userMsg || isLoading) return
    if (userMsg === '__APPLY_TICKET__') { router.push('/dashboard'); return }

    setInput('')
    setQuickReplies([])
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)
    setToolStatus('')

    try {
      if (supportMode) {
        const token = localStorage.getItem('tornado_token') || ''
        const res = await fetch(`${API}/api/support/tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: userMsg, page: '/chat' }),
        })
        const data = await res.json().catch(() => ({} as any))
        if (!res.ok) {
          setMessages(prev => [...prev, { role: 'assistant', content: data?.error || '送信に失敗しました。もう一度お試しください。' }])
          return
        }
        const ticketId = data?.ticket_id
        setMessages(prev => [...prev, { role: 'assistant', content: `お問い合わせを受け付けました（受付番号 #${ticketId}）。\n担当からの返信はこのチャットに届きます。` }])
        setSupportMode(false)
        return
      }

      const sid = await ensureSessionId()
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, message: userMsg }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setMessages(prev => [...prev, { role: 'assistant', content: data?.error || 'エラーが発生しました。もう一度お試しください。' }])
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        const raw = await res.text().catch(() => '')
        const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
        let assistantText = ''
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const payload = line.replace(/^data:\s?/, '').trim()
          if (payload === '[DONE]') break
          try {
            const event = JSON.parse(payload)
            if (event.type === 'text') assistantText = String(event.content || '')
          } catch {}
        }
        if (assistantText) setMessages(prev => [...prev, { role: 'assistant', content: assistantText }])
        else setMessages(prev => [...prev, { role: 'assistant', content: '応答の取得に失敗しました。もう一度お試しください。' }])
        return
      }
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const event = JSON.parse(data)
            if (event.type === 'thinking') {
              setToolStatus('分析中...')
            } else if (event.type === 'tool') {
              setToolStatus(`${event.label || event.name}...`)
            } else if (event.type === 'text') {
              assistantText = event.content
              setMessages(prev => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last?.role === 'assistant') { last.content = assistantText }
                else { updated.push({ role: 'assistant', content: assistantText }) }
                return [...updated]
              })
              setToolStatus('')
            } else if (event.type === 'done') {
              setToolStatus('')
              if (event.quick_replies?.length > 0) setQuickReplies(event.quick_replies)
              if (event.ticket) {
                try { localStorage.setItem('tornado_draft_ticket', JSON.stringify(event.ticket)) } catch {}
                setQuickReplies(prev => ([...prev, { label: '📌 ダッシュボードへ反映', text: '__APPLY_TICKET__' }]))
              }
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。もう一度お試しください。' }])
    } finally {
      setIsLoading(false)
      setToolStatus('')
    }
  }

  const hasText = input.trim().length > 0

  return (
    <AuthGuard>
    <div className="flex flex-col h-screen bg-[#050608]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 border-b border-[#2B3139]/50 bg-[#0B0E11]/90 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/brand/logo.png" alt="TornadoAI" width={34} height={34} className="rounded-xl" priority />
          </Link>
          <span className="font-bold text-[#EAECEF]">TornadoAI</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSupportMode(true)
              setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'お問い合わせありがとうございます。\nこのチャットにそのまま「内容」を送ってください（個人情報やパスワードは書かないでください）。\n送信するとサポートへ転送し、返信はこのチャットに届きます。' },
              ])
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
              supportMode
                ? 'border-[#fbbf24]/40 bg-[#fbbf24]/10 text-[#fbbf24]'
                : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]'
            }`}
            aria-label="お問い合わせ"
          >
            <span className="inline-flex items-center gap-1.5">
              <LifeBuoy size={14} />
              お問い合わせ
            </span>
          </button>
          <button
            onClick={fetchSupportReplies}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] transition"
            aria-label="返信を更新"
          >
            <span className="inline-flex items-center gap-1.5">
              <RefreshCw size={14} />
              更新
            </span>
          </button>
          <HamburgerMenu />
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-5">

        {/* Empty state — centered like Dlogic */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
            {/* Logo with glow ring */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-[#ef4444]/20 blur-xl scale-150" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#ef4444]/40 bg-[#ef4444]/10 flex items-center justify-center"
                style={{ boxShadow: '0 0 40px rgba(239,68,68,0.2)' }}>
                <Image src="/brand/logo.png" alt="TornadoAI" width={72} height={72} className="rounded-full" priority />
              </div>
            </div>

            <p className="text-lg font-bold text-[#EAECEF] mb-1">TornadoAI</p>
            <p className="text-sm text-[#848E9C] mb-8">WIN5のことなら何でも聞いてください！</p>

            {/* Suggestion pills */}
            <div className="flex flex-wrap justify-center gap-2 px-4">
              {[
                { emoji: '🌪️', label: '今週のWIN5' , text: '今週のWIN5は？' },
                { emoji: '🎯', label: '買い目出して', text: '予算5000円で買い目出して' },
                { emoji: '📊', label: '3シナリオ', text: '3シナリオ見せて' },
                { emoji: '💰', label: 'ワイド5倍', text: '中山11Rでワイド 1000円→5000円が欲しい' },
              ].map(q => (
                <button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#2B3139] bg-[#181A20]/80 text-sm text-[#EAECEF] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/30 transition-colors"
                >
                  <span>{q.emoji}</span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 sm:py-3 relative group ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white'
                  : 'border border-[#ef4444]/20 bg-[#0B0E11]/80'
              }`}
              style={msg.role === 'assistant' ? {
                background: 'linear-gradient(135deg, rgba(239,68,68,0.04), rgba(15,17,22,0.9))',
              } : {}}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center mb-1.5 sm:mb-2">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ef4444] mr-1.5" />
                  <span className="text-xs text-[#ef4444] font-semibold">TornadoAI</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-[14px] sm:text-[15px] text-[#EAECEF] leading-relaxed select-text">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {toolStatus && (
          <div className="flex justify-start">
            <div className="bg-[#0B0E11] border border-[#2B3139] rounded-2xl px-4 py-3.5 min-w-[220px]">
              <div className="flex items-center gap-3">
                <div className="tornado-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                <span className="text-sm text-[#848E9C]">{toolStatus}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick replies */}
        {quickReplies.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickReplies.map(qr => (
              <button
                key={qr.text}
                onClick={() => sendMessage(qr.text)}
                className="px-3.5 py-2 rounded-full border border-[#ef4444]/30 bg-[#ef4444]/5 text-[13px] font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <div className="border-t border-[#2B3139] bg-[#181A20] flex-shrink-0 safe-bottom">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2">
            {/* Input — rounded-full like Dlogic */}
            <div className="flex-1 flex items-center rounded-full border border-[#2B3139] bg-[#0B0E11] px-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="メッセージを入力..."
                className="flex-1 bg-transparent py-2.5 text-[14px] text-[#EAECEF] placeholder-[#848E9C] outline-none disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            {/* Send — circle button */}
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !hasText}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-30"
              style={{
                background: hasText && !isLoading
                  ? 'linear-gradient(135deg, #ef4444, #f97316)'
                  : '#2B3139',
              }}
            >
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
    </AuthGuard>
  )
}
