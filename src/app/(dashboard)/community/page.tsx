// src/app/(dashboard)/community/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { Send, Users, Hash, Loader2, MessageCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials, timeAgo } from '@/lib/utils'
import type { ChatRoom, ChatMessage } from '@/types'

export default function CommunityPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    fetch('/api/chat/rooms')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRooms(d.data)
          if (d.data[0]) setActiveRoom(d.data[0])
        }
      })
      .finally(() => setLoadingRooms(false))
  }, [])

  const loadMessages = async (roomId: string) => {
    setLoadingMessages(true)
    const res = await fetch(`/api/chat/rooms/${roomId}/messages`)
    const data = await res.json()
    if (data.success) setMessages(data.data)
    setLoadingMessages(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  useEffect(() => {
    if (!activeRoom) return
    loadMessages(activeRoom.id)
    pollRef.current = setInterval(() => loadMessages(activeRoom.id), 5000)
    return () => clearInterval(pollRef.current)
  }, [activeRoom?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!text.trim() || !activeRoom || sending) return
    setSending(true)
    const res = await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })
    const data = await res.json()
    if (data.success) {
      setText('')
      setMessages((prev) => [...prev, data.data])
    }
    setSending(false)
  }

  const ROOM_ICONS: Record<string, string> = {
    GENERAL: '📢', SCHOOL: '🎓', FACULTY: '🏫', STUDY_GROUP: '📚',
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-display font-bold text-text-primary">Community</h1>
        <span className="badge-blue">{rooms.length} rooms</span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Rooms sidebar */}
        <div className="w-64 flex-shrink-0 hidden md:flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1 mb-1">
            Chat Rooms
          </h2>
          {loadingRooms
            ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)
            : rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    activeRoom?.id === room.id
                      ? 'bg-primary text-white shadow-button'
                      : 'bg-white hover:bg-blue-50 text-text-primary border border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{ROOM_ICONS[room.roomType] || '💬'}</span>
                    <span className="text-sm font-semibold truncate">{room.name}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      activeRoom?.id === room.id ? 'text-white/70' : 'text-text-muted'
                    }`}
                  >
                    <Users size={11} />
                    <span>{(room._count?.members || 0).toLocaleString()} members</span>
                  </div>
                </button>
              ))}
        </div>

        {/* Mobile room selector */}
        <div className="md:hidden mb-3">
          <select
            className="input text-sm"
            value={activeRoom?.id || ''}
            onChange={(e) => {
              const room = rooms.find((r) => r.id === e.target.value)
              if (room) setActiveRoom(room)
            }}
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {ROOM_ICONS[r.roomType]} {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col card overflow-hidden min-h-0">
          {/* Room header */}
          {activeRoom && (
            <div className="flex items-center gap-3 p-4 border-b border-border bg-white flex-shrink-0">
              <span className="text-xl">{ROOM_ICONS[activeRoom.roomType]}</span>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">{activeRoom.name}</h3>
                {activeRoom.description && (
                  <p className="text-xs text-text-muted">{activeRoom.description}</p>
                )}
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-text-muted">
                <Users size={13} />
                <span>{(activeRoom._count?.members || 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingMessages ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="mx-auto text-border mb-3" size={36} />
                <p className="text-text-muted text-sm font-medium">No messages yet</p>
                <p className="text-text-muted text-xs mt-1">Be the first to say hello! 👋</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender.id === user?.id
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 gradient-header rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                      {msg.sender.avatar ? (
                        <img src={msg.sender.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(msg.sender.name)
                      )}
                    </div>
                    <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                        <span className="text-[11px] text-text-muted font-medium mb-1 ml-1">
                          {msg.sender.name}
                        </span>
                      )}
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-primary text-white rounded-tr-sm'
                            : 'bg-background text-text-primary rounded-tl-sm border border-border'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-text-muted mt-1 mx-1">
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={activeRoom ? `Message ${activeRoom.name}...` : 'Select a room'}
                className="input flex-1 text-sm py-2.5"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                disabled={!activeRoom}
              />
              <button
                onClick={send}
                disabled={!text.trim() || sending || !activeRoom}
                className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-primary-dark transition-colors flex-shrink-0"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
