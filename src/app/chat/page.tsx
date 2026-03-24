'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send, Flame } from 'lucide-react'
import AuthGuard from '@/components/auth/AuthGuard'
import HamburgerMenu from '@/components/navigation/HamburgerMenu'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || ''

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type QuickReply = {
  label: string
  text: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [toolStatus, setToolStatus] = useState('')
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch(`${API}/api/chat/sessions`, { method: 'POST' })
      .then(r => r.json())
      .then(data => setSessionId(data.session_id))
      .catch(() => setSessionId('local-' + Date.now()))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, quickReplies])

  const sendMessage = async (text?: string) => {
    const userMsg = (text || input).trim()
    if (!userMsg || isLoading) return

    if (userMsg === '__APPLY_TICKET__') {
      router.push('/dashboard')
      return
    }

    setInput('')
    setQuickReplies([])
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsLoading(true)
    setToolStatus('')

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: userMsg }),
      })

      const reader = res.body?.getReader()
      if (!reader) return

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
                if (last?.role === 'assistant') {
                  last.content = assistantText
                } else {
                  updated.push({ role: 'assistant', content: assistantText })
                }
                return [...updated]
              })
              setToolStatus('')
            } else if (event.type === 'done') {
              setToolStatus('')
              if (event.quick_replies?.length > 0) {
                setQuickReplies(event.quick_replies)
              }
              if (event.ticket) {
                try {
                  localStorage.setItem('tornado_draft_ticket', JSON.stringify(event.ticket))
                } catch {}
                setQuickReplies(prev => ([
                  ...prev,
                  { label: '📌 ダッシュボードへ反映', text: '__APPLY_TICKET__' },
                ]))
              }
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'エラーが発生しました。もう一度お試しください。' }])
    } finally {
      setIsLoading(false)
      setToolStatus('')
    }
  }

  return (
    <AuthGuard>
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-[#0B0E11]">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0B0E11]/80 backdrop-blur-md border-b border-[#2B3139] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center">
            <Image src="/brand/logo.png" alt="TornadoAI" width={32} height={32} className="rounded-lg" priority />
          </Link>
          <span className="text-base font-bold text-[#EAECEF]">TornadoAI</span>
        </div>
        <HamburgerMenu />
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 sm:pt-24">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#ef4444]/15 rounded-full flex items-center justify-center mb-5">
              <Image src="/brand/logo.png" alt="TornadoAI" width={40} height={40} className="rounded-full" priority />
            </div>
            <p className="text-base sm:text-lg font-bold text-[#EAECEF] mb-2">WIN5の戦略を一緒に考えましょう</p>
            <p className="text-sm text-[#848E9C] mb-8 text-center px-4">予算と目標をお伝えいただければ、最適な買い目をご提案します</p>

            <div className="grid grid-cols-2 gap-2 w-full max-w-sm px-4">
              {[
                { label: '今週のWIN5', text: '今週のWIN5は？' },
                { label: '買い目出して', text: '予算5000円で買い目出して' },
                { label: '3シナリオ', text: '3シナリオ見せて' },
                { label: '500万狙いたい', text: '予算5000円で500万狙いたいです' },
              ].map(q => (
                <button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  className="rounded-lg border border-[#2B3139] bg-[#181A20] p-3 text-left hover:bg-[#ef4444]/5 hover:border-[#ef4444]/30 transition-colors"
                >
                  <p className="text-sm font-medium text-[#EAECEF]">{q.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 sm:px-4 py-2 sm:py-3 relative group ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white'
                  : 'border border-[#ef4444]/20 bg-[#181A20]'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center mb-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#ef4444] mr-1.5" />
                  <span className="text-xs text-[#ef4444] font-semibold">TornadoAI</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm sm:text-base text-[#EAECEF] leading-relaxed select-text">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Tool status */}
        {toolStatus && (
          <div className="flex justify-start">
            <div className="bg-[#181A20] border border-[#2B3139] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 min-w-[200px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ef4444] rounded-full animate-pulse" />
                <span className="text-sm text-[#848E9C]">{toolStatus}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Replies */}
        {quickReplies.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickReplies.map(qr => (
              <button
                key={qr.text}
                onClick={() => sendMessage(qr.text)}
                className="px-3 py-1.5 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444] text-xs font-medium hover:bg-[#ef4444]/10 transition-colors"
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[#2B3139] bg-[#181A20] flex-shrink-0">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="WIN5について何でも聞いてください..."
                className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-base text-[#EAECEF] placeholder-[#848E9C] focus:outline-none focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-2.5 sm:p-3 rounded-lg transition-colors flex-shrink-0"
              style={{
                background: input.trim() && !isLoading ? 'linear-gradient(135deg, #ef4444, #f97316)' : '#2B3139',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              }}
            >
              <Send className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="px-3 sm:px-4 pb-2 sm:pb-3">
          <div className="flex items-center justify-between text-[10px] text-[#848E9C]">
            <span>TornadoAI — WIN5戦略AI</span>
            <span>Premium</span>
          </div>
        </div>
      </div>

    </div>
    </AuthGuard>
  )
}
