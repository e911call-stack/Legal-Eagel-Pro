'use client';

import { useState } from 'react';
import { MessageSquare, Send, Lock, User, Search } from 'lucide-react';
import { mockMessages, mockCases } from '@/lib/mock-data';
import { cn, timeAgo } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export default function MessagesPage() {
  const { t } = useI18n();
  const [selectedCase, setCase]    = useState('all');
  const [search, setSearch]        = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setInternal]  = useState(false);

  const filtered = mockMessages.filter(m => {
    const matchCase   = selectedCase === 'all' || m.case_id === selectedCase;
    const matchSearch = m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.sender_name?.toLowerCase().includes(search.toLowerCase());
    return matchCase && matchSearch;
  });

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl lg:text-3xl font-semibold text-stone-900">{t.messagesPage.title}</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            {t.messagesPage.subtitle(mockMessages.filter(m => m.status === 'sent').length)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search messages…" className="input-field pl-9" />
        </div>
        <select value={selectedCase} onChange={e => setCase(e.target.value)}
          className="input-field w-auto cursor-pointer">
          <option value="all">{t.messagesPage.allCases}</option>
          {mockCases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {/* Message list */}
      <div className="space-y-3 mb-6">
        {filtered.map((msg, i) => (
          <div key={msg.id}
            className={cn(
              'bg-white border rounded-2xl p-4 shadow-sm transition-all duration-200 animate-slide-up',
              msg.is_internal_note ? 'border-amber-200 bg-amber-50' :
              msg.status === 'sent' ? 'border-violet-200' : 'border-stone-200'
            )}
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-amber-700">{msg.sender_name?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-stone-800">{msg.sender_name}</span>
                    <span className="text-[10px] text-stone-400 capitalize bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-full font-medium">
                      {msg.sender_role}
                    </span>
                    {msg.is_internal_note && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">
                        <Lock className="w-2.5 h-2.5" /> Internal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-semibold',
                      msg.status === 'seen'
                        ? 'text-green-700 bg-green-50 border-green-200'
                        : 'text-violet-700 bg-violet-50 border-violet-200')}>
                      {msg.status === 'seen' ? t.messagesPage.seen : t.messagesPage.unread}
                    </span>
                    <span className="text-xs text-stone-400">{timeAgo(msg.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">{msg.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-stone-400">Re: {msg.case_title}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-[10px] text-stone-400">To: {msg.receiver_name}</span>
                </div>
                <div className="flex gap-3 mt-3">
                  <button className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold transition-colors">
                    <MessageSquare className="w-3 h-3" /> {t.messagesPage.reply}
                  </button>
                  {msg.status === 'sent' && (
                    <button className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 font-semibold transition-colors">
                      ✓ {t.messagesPage.markReplied}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose */}
      <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-600" /> {t.messagesPage.newMessage}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.messagesPage.case}</label>
            <select className="input-field cursor-pointer">
              {mockCases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1.5 font-semibold uppercase tracking-wide">{t.messagesPage.to}</label>
            <select className="input-field cursor-pointer">
              <option>{t.messagesPage.clientLabel}</option>
              <option>{t.messagesPage.leadAttorney}</option>
              <option>{t.messagesPage.firmAdmin}</option>
            </select>
          </div>
        </div>
        <textarea rows={4} value={newMessage} onChange={e => setNewMessage(e.target.value)}
          placeholder={t.messagesPage.writePlaceholder} className="input-field resize-none mb-3" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-stone-500 cursor-pointer font-medium">
            <button type="button" onClick={() => setInternal(!isInternal)}
              className={cn('w-8 h-4 rounded-full transition-all duration-300 relative',
                isInternal ? 'bg-amber-500' : 'bg-stone-300')}>
              <div className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300',
                isInternal ? 'left-4' : 'left-0.5')} />
            </button>
            {t.messagesPage.internalNote}
          </label>
          <button className="btn-primary flex items-center gap-1.5 py-2">
            <Send className="w-3.5 h-3.5" /> {t.messagesPage.send}
          </button>
        </div>
      </div>
    </div>
  );
}
