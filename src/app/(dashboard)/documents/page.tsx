'use client';

import { useState } from 'react';
import { FileText, Upload, Search, Eye, Lock, Download, Calendar, User } from 'lucide-react';
import { mockDocuments } from '@/lib/mock-data';
import { cn, formatStatus, timeAgo } from '@/lib/utils';
import type { DocType } from '@/types';
import { useI18n } from '@/lib/i18n';

const TYPE_COLORS: Record<DocType, string> = {
  pleading:  'text-blue-700 bg-blue-50 border-blue-200',
  contract:  'text-violet-700 bg-violet-50 border-violet-200',
  draft:     'text-amber-700 bg-amber-50 border-amber-200',
  evidence:  'text-red-700 bg-red-50 border-red-200',
  other:     'text-stone-500 bg-stone-100 border-stone-200',
};

function fileSize(bytes?: number) {
  if (!bytes) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { t } = useI18n();
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = mockDocuments.filter(d => {
    const matchSearch = d.file_name.toLowerCase().includes(search.toLowerCase()) ||
      d.case_title?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || d.doc_type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            className="text-2xl lg:text-3xl font-semibold text-stone-900">{t.documentsPage.title}</h1>
          <p className="text-stone-400 text-sm mt-0.5">{t.documentsPage.subtitle(mockDocuments.length)}</p>
        </div>
        <button className="btn-primary">
          <Upload className="w-4 h-4" /> {t.documentsPage.upload}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t.documentsPage.searchPlaceholder} className="input-field pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="input-field w-auto cursor-pointer">
          <option value="all">{t.documentsPage.allTypes}</option>
          <option value="pleading">Pleading</option>
          <option value="contract">Contract</option>
          <option value="draft">Draft</option>
          <option value="evidence">Evidence</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doc, i) => (
          <div key={doc.id}
            className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all duration-200 shadow-sm animate-slide-up"
            style={{ animationDelay: `${i * 0.04}s` }}>
            {/* File icon + name */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-12 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden">
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-800 truncate">{doc.file_name}</p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{doc.case_title}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className={cn('badge', TYPE_COLORS[doc.doc_type])}>{formatStatus(doc.doc_type)}</span>
                {doc.is_public_to_client ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                    <Eye className="w-2.5 h-2.5" /> {t.caseDetail.clientVisible}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full font-semibold">
                    <Lock className="w-2.5 h-2.5" /> {t.caseDetail.internalOnly}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <User className="w-3 h-3" /> {doc.uploaded_by_name}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Calendar className="w-3 h-3" /> {timeAgo(doc.uploaded_at)}
                {doc.file_size && <span className="ml-auto font-medium">{fileSize(doc.file_size)}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-stone-100">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs text-stone-600 hover:text-stone-800 transition-colors border border-stone-200 font-medium">
                <Eye className="w-3 h-3" /> {t.documentsPage.preview}
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs text-stone-600 hover:text-stone-800 transition-colors border border-stone-200 font-medium">
                <Download className="w-3 h-3" /> {t.documentsPage.download}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload drop zone */}
      <div className="mt-6 border-2 border-dashed border-stone-300 hover:border-amber-400 hover:bg-amber-50 rounded-2xl p-8 text-center transition-all duration-200 group cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 group-hover:bg-amber-100 flex items-center justify-center mx-auto mb-3 transition-colors">
          <Upload className="w-5 h-5 text-amber-600" />
        </div>
        <p className="text-sm font-semibold text-stone-700 mb-1">{t.documentsPage.dropZone}</p>
        <p className="text-xs text-stone-400">{t.documentsPage.dropZoneSub}</p>
      </div>
    </div>
  );
}
