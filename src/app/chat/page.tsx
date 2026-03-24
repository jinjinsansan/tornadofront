'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

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
              setToolStatus('🌪️ 分析中...')
            } else if (event.type === 'tool') {
              setToolStatus(`🌪️ ${event.label || event.name}...`)
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
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-tornado-bg border-b border-tornado-border px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-2xl">🌪️</Link>
        <h1 className="text-lg font-bold">トルネードAI</h1>
        <span className="text-tornado-muted text-sm">WIN5戦略AI</span>
        <Link href="/dashboard" className="ml-auto text-sm text-tornado-accent hover:underline">📊 ダッシュボード</Link>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-tornado-muted mt-20">
            <p className="text-5xl mb-4">🌪️</p>
            <p className="text-lg font-bold mb-2">WIN5の戦略を一緒に考えましょう</p>
            <p className="text-sm mb-6">予算と目標をお伝えいただければ、最適な買い目をご提案します</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: '🌪️ 今週のWIN5', text: '今週のWIN5は？' },
                { label: '🎯 買い目出して', text: '予算5000円で買い目出して' },
                { label: '📊 3シナリオ', text: '3シナリオ見せて' },
                { label: '💰 500万狙い', text: '500万狙いたいです' },
              ].map(q => (
                <button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  className="px-4 py-2 bg-tornado-card border border-tornado-border rounded-full text-sm hover:bg-tornado-border transition"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-tornado-accent text-white'
                : 'bg-tornado-card border border-tornado-border text-tornado-text'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {toolStatus && (
          <div className="flex justify-start">
            <div className="px-4 py-3 bg-tornado-card border border-tornado-border rounded-2xl text-sm text-tornado-muted animate-pulse">
              {toolStatus}
            </div>
          </div>
        )}

        {/* Quick Replies */}
        {quickReplies.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {quickReplies.map(qr => (
              <button
                key={qr.text}
                onClick={() => sendMessage(qr.text)}
                className="px-3 py-1.5 bg-tornado-card border border-tornado-accent/40 text-tornado-accent rounded-full text-xs hover:bg-tornado-accent/10 transition"
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-tornado-bg border-t border-tornado-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="WIN5について何でも聞いてください..."
            className="flex-1 bg-tornado-card border border-tornado-border rounded-xl px-4 py-3 text-sm text-tornado-text placeholder-tornado-muted focus:outline-none focus:border-tornado-accent"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-tornado-accent text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-40"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  )
}
