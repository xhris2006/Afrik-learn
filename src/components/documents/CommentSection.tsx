// src/components/documents/CommentSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2, MessageSquare, CornerDownRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getInitials, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Comment } from '@/types'

interface Props { documentId: string }

export function CommentSection({ documentId }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch(`/api/documents/${documentId}/comments`)
      .then(r => r.json())
      .then(d => { if (d.success) setComments(d.data) })
      .finally(() => setFetching(false))
  }, [documentId])

  const submit = async () => {
    if (!text.trim() || !user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim(), parentId: replyTo?.id }),
      })
      const data = await res.json()
      if (data.success) {
        if (replyTo) {
          setComments(prev => prev.map(c =>
            c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), data.data] } : c
          ))
        } else {
          setComments(prev => [{ ...data.data, replies: [] }, ...prev])
        }
        setText('')
        setReplyTo(null)
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-text-primary flex items-center gap-2">
        <MessageSquare size={18} className="text-primary" />
        Comments ({comments.length})
      </h3>

      {/* Input */}
      {user ? (
        <div className="flex gap-3">
          <div className="w-8 h-8 gradient-header rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="flex-1">
            {replyTo && (
              <div className="flex items-center gap-2 text-xs text-text-muted bg-blue-50 px-3 py-1.5 rounded-t-xl border border-b-0 border-blue-100">
                <CornerDownRight size={12} className="text-primary" />
                Replying to <span className="font-semibold text-primary">{replyTo.name}</span>
                <button onClick={() => setReplyTo(null)} className="ml-auto text-text-muted hover:text-danger text-xs">✕</button>
              </div>
            )}
            <div className={`flex items-end gap-2 bg-white border border-border rounded-${replyTo ? 'b-xl' : 'xl'} p-2`}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write a comment…"
                rows={2}
                className="flex-1 resize-none outline-none text-sm text-text-primary placeholder:text-text-muted"
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submit() }}
              />
              <button onClick={submit} disabled={!text.trim() || loading}
                className="btn-primary px-3 py-2 text-xs flex-shrink-0">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-text-muted mt-1 ml-1">Ctrl+Enter to submit</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text-muted bg-blue-50 rounded-xl px-4 py-3">
          <a href="/login" className="text-primary font-semibold">Sign in</a> to leave a comment
        </p>
      )}

      {/* Comment list */}
      {fetching ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 skeleton rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-1/4 rounded" />
                <div className="skeleton h-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-text-muted text-sm py-8">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onReply={setReplyTo} currentUserId={user?.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  onReply,
  currentUserId,
  isReply = false,
}: {
  comment: Comment
  onReply: (v: { id: string; name: string }) => void
  currentUserId?: string
  isReply?: boolean
}) {
  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10' : ''}`}>
      <div className="w-8 h-8 gradient-header rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {comment.user.avatar
          ? <img src={comment.user.avatar} className="w-full h-full rounded-xl object-cover" alt="" />
          : getInitials(comment.user.name)}
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-xl border border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-text-primary">{comment.user.name}</span>
            <span className="text-xs text-text-muted">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
        </div>
        {!isReply && (
          <button onClick={() => onReply({ id: comment.id, name: comment.user.name })}
            className="text-xs text-text-muted hover:text-primary mt-1 ml-1 transition-colors">
            Reply
          </button>
        )}
        {comment.replies?.map(reply => (
          <CommentItem key={reply.id} comment={reply} onReply={onReply} currentUserId={currentUserId} isReply />
        ))}
      </div>
    </div>
  )
}
