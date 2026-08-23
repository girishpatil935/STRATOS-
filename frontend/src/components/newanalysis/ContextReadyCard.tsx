import React from 'react';
import { CheckCircle, AlertTriangle, FileText, ChevronRight, RotateCcw } from 'lucide-react';
import type { BusinessContext, DocumentResult } from '../../types/api';
import { Button } from '../ui/Button';

interface ContextReadyCardProps {
  context: BusinessContext;
  businessName: string;
  onReset: () => void;
  onContinue: () => void;
}

export const ContextReadyCard: React.FC<ContextReadyCardProps> = ({
  context,
  businessName,
  onReset,
  onContinue,
}) => {
  const { documents, metadata } = context;
  const hasDocuments = documents.length > 0;
  const hasFailedDocs = metadata.failed_documents > 0;
  const hasTruncated = metadata.truncated_documents > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Success banner */}
      <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
          <CheckCircle size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-black">Business context ready.</p>
          <p className="text-sm text-neutral-500 mt-1">
            STRATOS has successfully processed your business context for{' '}
            <strong className="text-black">{businessName}</strong>.
            The six AI agents are ready to begin their analysis.
          </p>
        </div>
      </div>

      {/* Context summary */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-black">Context Summary</p>
          <div className="flex items-center gap-3 text-[11px] text-neutral-500">
            <span>{metadata.total_character_count.toLocaleString()} chars</span>
            {hasDocuments && (
              <>
                <span className="text-neutral-200">·</span>
                <span>{metadata.successful_documents} / {metadata.number_of_documents} docs processed</span>
              </>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="px-5 py-4 border-b border-neutral-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
            Analysis Objective
          </p>
          <p className="text-sm text-black leading-relaxed">{context.business_question}</p>
        </div>

        {/* Documents list */}
        {hasDocuments && (
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
              Documents ({documents.length})
            </p>
            <div className="space-y-2">
              {documents.map((doc: DocumentResult) => (
                <DocumentRow key={doc.filename} doc={doc} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Warnings */}
      {(hasFailedDocs || hasTruncated) && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
          {hasFailedDocs && (
            <div className="flex items-start gap-2 text-xs text-neutral-600">
              <AlertTriangle size={13} className="text-burgundy mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-black">{metadata.failed_documents} document(s)</strong> could
                not be processed. The analysis will proceed with the remaining context.
              </span>
            </div>
          )}
          {hasTruncated && (
            <div className="flex items-start gap-2 text-xs text-neutral-600">
              <AlertTriangle size={13} className="text-neutral-400 mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-black">{metadata.truncated_documents} document(s)</strong> were
                truncated due to length limits. The start and end of each document are preserved.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          icon={<ChevronRight size={18} />}
          iconPosition="right"
          onClick={onContinue}
        >
          Continue to Analysis
        </Button>
        <Button
          variant="ghost"
          size="md"
          icon={<RotateCcw size={15} />}
          iconPosition="left"
          onClick={onReset}
        >
          Start Over
        </Button>
      </div>
    </div>
  );
};

const DocumentRow: React.FC<{ doc: DocumentResult }> = ({ doc }) => {
  const isSuccess = doc.extraction_status === 'success';
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2">
      <FileText size={14} className={isSuccess ? 'text-black' : 'text-neutral-300'} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-black truncate">{doc.filename}</p>
        {doc.error && (
          <p className="text-[10px] text-burgundy mt-0.5">{doc.error}</p>
        )}
        {doc.truncated && !doc.error && (
          <p className="text-[10px] text-neutral-400 mt-0.5">Truncated — {doc.character_count.toLocaleString()} chars</p>
        )}
      </div>
      <span className={[
        'text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded',
        isSuccess ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-100 text-neutral-400',
      ].join(' ')}>
        {doc.file_type}
      </span>
    </div>
  );
};

export default ContextReadyCard;
