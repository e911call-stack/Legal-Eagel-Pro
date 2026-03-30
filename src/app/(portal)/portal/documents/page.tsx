'use client';

import { FileText, Eye, Download, Calendar, User, Lock } from 'lucide-react';
import { mockDocuments } from '@/lib/mock-data';
import { cn, formatStatus, timeAgo } from '@/lib/utils';
import type { DocType } from '@/types';

const CLIENT_CASE_IDS = ['case-1', 'case-3'];

const TYPE_COLORS: Record<DocType, string> = {
  pleading:  'text-blue-700 bg-blue-50 border-blue-200',
  contract:  'text-violet-700 bg-violet-50 border-violet-200',
  draft:     'text-amber-700 bg-amber-50 border-amber-200',
  evidence:  'text-red-700 bg-red-50 border-red-200',
  other:     'text-stone-500 bg-stone-100 border-stone-200',
};

function fileSize(bytes?: number) {
  if (!bytes) return '';
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

export default function ClientDocumentsPage() {
  // Clients only see their own cases' public documents
  const docs = mockDocuments.filter(d =>
    CLIENT_CASE_IDS.includes(d.case_id) && d.is_public_to_client
  );

  return (
    <div className="p-5 lg:p-7 animate-fade-in">
      <div className="mb-6">
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          className="text-2xl lg:text-3xl font-semibold text-stone-900">My Documents</h1>
        <p className="text-stone-400 text-sm mt-0.5">
          {docs.length} document{docs.length !== 1 ? 's' : ''} shared by your attorney
        </p>
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-blue-700 mb-0.5">Read-only access</p>
          <p className="text-xs text-stone-600">
            These documents have been shared with you by your attorney. To submit your own documents, please message your attorney directly.
          </p>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No documents have been shared yet.</p>
          <p className="text-stone-400 text-xs mt-1">Your attorney will share files here when they're ready.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {docs.map((doc, i) => (
            <div key={doc.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}>
              {/* File icon */}
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

              <div className="space-y-2 mb-4">
                <span className={cn('badge', TYPE_COLORS[doc.doc_type])}>{formatStatus(doc.doc_type)}</span>
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <User className="w-3 h-3" /> Shared by {doc.uploaded_by_name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Calendar className="w-3 h-3" /> {timeAgo(doc.uploaded_at)}
                  {doc.file_size && <span className="ml-auto">{fileSize(doc.file_size)}</span>}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-stone-100">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs text-stone-600 hover:text-stone-800 transition-colors border border-stone-200 font-medium">
                  <Eye className="w-3 h-3" /> Preview
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs text-stone-600 hover:text-stone-800 transition-colors border border-stone-200 font-medium">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
