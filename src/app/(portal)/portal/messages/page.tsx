'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { mockMessages } from '@/lib/mock-data';
import { cn, timeAgo } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const CLIENT_CASE_IDS = ['case-1', 'case-3'];

export default function ClientMessagesPage() {
  const { profile } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(false);

  // Only client-visible messages for their cases
  const messages = mockMessages.filter(m =>
    CLIENT_CASE_IDS.includes(m.case_id) && m.is_client_visible && !m.is_internal_note
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSent(true);
    setNewMessage('');
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      <div className="mb-6">
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl lg:text-3xl font-semibold text-stone-900">Messages</h1>
        <p className="text-stone-400 text-sm mt-0.5">
          Communicate directly with your attorney
        </p>
      </div>

      {/* Message thread */}
      <div className="space-y-3 mb-6">
        {messages.length === 0 && (
          <div className="text-center py-12 text-stone-400 text-sm">
            No messages yet. Send your attorney a message below.
          </div>
        )}
        {messages.map((msg, i) => {
          const isFromMe = msg.sender_role === 'client';
          return (
            <div key={msg.id}
              className={cn('flex gap-3 animate-slide-up', isFromMe && 'flex-row-reverse')}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1',
                isFromMe ? 'bg-amber-100 border border-amber-200 text-amber-700' : 'bg-blue-100 border border-blue-200 text-blue-700')}>
                {msg.sender_name?.[0]}
              </div>
              <div className={cn('max-w-[75%]', isFromMe && 'items-end')}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-stone-600">{isFromMe ? 'You' : msg.sender_name}</span>
                  <span className="text-xs text-stone-400">{timeAgo(msg.created_at)}</span>
                  {isFromMe && (
                    <span className={cn('text-[10px] font-medium',
                      msg.status === 'seen' ? 'text-green-600' : 'text-stone-400')}>
                      {msg.status === 'seen' ? '✓ Seen' : 'Sent'}
                    </span>
                  )}
                </div>
                <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  isFromMe
                    ? 'bg-amber-600 text-white rounded-tr-sm'
                    : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm shadow-sm')}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compose */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm sticky bottom-4">
        {sent && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 mb-3 flex items-center gap-2 animate-slide-up">
            <span className="text-green-600 text-xs font-semibold">✓ Message sent to your attorney.</span>
          </div>
        )}
        <form onSubmit={handleSend}>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-semibold text-stone-600">Message to your attorney</span>
          </div>
          <textarea
            rows={3}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type your question or update here…"
            className="input-field resize-none mb-3"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-stone-400">Messages are private between you and your attorney.</p>
            <button type="submit" disabled={sending || !newMessage.trim()}
              className="btn-primary flex items-center gap-1.5 py-2 disabled:opacity-50">
              {sending
                ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                : <><Send className="w-3.5 h-3.5" /> Send</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
