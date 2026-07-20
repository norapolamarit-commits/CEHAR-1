import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react'
import type { AssistantMessage } from '@/types'
import { askAssistant, makeMessageId } from '@/lib/api'
import { SUGGESTED_PROMPTS } from '@/mock/assistant'

const GREETING: AssistantMessage = {
  id: 'greeting',
  role: 'assistant',
  content: [
    'สวัสดีครับ ผมเป็นผู้ช่วยวิเคราะห์สุขภาพระบบนิเวศชายฝั่ง',
    'ถามได้เลยว่าพื้นที่ไหนเสี่ยง ควรฟื้นฟูที่ไหนก่อน หรืออยากให้อธิบายคะแนน CEHAR ของพื้นที่ใดเป็นพิเศษ',
  ].join('\n'),
  sources: [],
}

export function Assistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const mutation = useMutation({
    mutationFn: askAssistant,
    onSuccess: (reply) => setMessages((prev) => [...prev, reply]),
  })

  // เลื่อนลงล่างสุดทุกครั้งที่มีข้อความใหม่
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, mutation.isPending])

  const send = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || mutation.isPending) return

    setMessages((prev) => [
      ...prev,
      { id: makeMessageId(), role: 'user', content: trimmed },
    ])
    setInput('')
    mutation.mutate(trimmed)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    send(input)
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-4 sm:p-6">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
          <Sparkles className="size-5 text-teal" aria-hidden="true" />
          ผู้ช่วย AI
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          ตอบจากข้อมูลในแดชบอร์ดนี้เท่านั้น · ยังเป็นระบบจำลอง (rule-based) ยังไม่ได้ต่อ LLM จริง
        </p>
      </div>

      {/* ---------- กล่องสนทนา ---------- */}
      <div
        ref={scrollRef}
        className="thin-scroll min-h-0 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-navy/8 bg-white p-4 sm:p-5"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {mutation.isPending && (
          <div className="flex items-center gap-2.5 text-sm text-navy/50">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal/12 text-teal">
              <Bot className="size-4" aria-hidden="true" />
            </span>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            กำลังวิเคราะห์ข้อมูล…
          </div>
        )}

        {mutation.isError && (
          <p className="rounded-xl bg-risk-high/8 px-3.5 py-2.5 text-sm text-risk-high">
            ตอบคำถามไม่สำเร็จ: {mutation.error.message}
          </p>
        )}
      </div>

      {/* ---------- คำถามแนะนำ ---------- */}
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => send(prompt)}
            disabled={mutation.isPending}
            className="rounded-full border border-navy/12 bg-white px-3 py-1.5 text-xs font-medium text-navy/75 transition hover:border-teal/40 hover:text-navy disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ---------- ช่องพิมพ์ ---------- */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="พิมพ์คำถามเกี่ยวกับสุขภาพระบบนิเวศชายฝั่ง…"
          className="min-w-0 flex-1 rounded-xl border border-navy/12 bg-white px-4 py-3 text-sm text-navy outline-none transition placeholder:text-navy/35 focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
        <button
          type="submit"
          disabled={mutation.isPending || input.trim() === ''}
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-white transition hover:bg-deep disabled:opacity-40"
          aria-label="ส่งคำถาม"
        >
          <Send className="size-4.5" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

function MessageBubble({ message }: { message: AssistantMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full ${
          isUser ? 'bg-navy/8 text-navy/70' : 'bg-teal/12 text-teal'
        }`}
      >
        {isUser ? (
          <User className="size-4" aria-hidden="true" />
        ) : (
          <Bot className="size-4" aria-hidden="true" />
        )}
      </span>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
          isUser ? 'bg-navy text-white' : 'bg-mist text-navy/85'
        }`}
      >
        {message.content}

        {!isUser && message.sources && message.sources.length > 0 && (
          <p className="mt-2.5 border-t border-navy/10 pt-2 text-xs text-navy/50">
            อ้างอิงข้อมูลจาก: {message.sources.join(' · ')}
          </p>
        )}
      </div>
    </div>
  )
}
