import React from 'react';
import { Check, Circle } from 'lucide-react';
import type { BusinessInfoFields, SelectedFile } from '../../types/newAnalysis';

interface ReviewPanelProps {
  businessInfo: BusinessInfoFields;
  businessQuestion: string;
  selectedFiles: SelectedFile[];
  businessInfoComplete: boolean;
  questionComplete: boolean;
}

interface SectionStatus {
  label: string;
  detail: string;
  complete: boolean;
  optional?: boolean;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  businessInfo,
  businessQuestion,
  selectedFiles,
  businessInfoComplete,
  questionComplete,
}) => {
  const sections: SectionStatus[] = [
    {
      label: 'Business Information',
      detail: businessInfoComplete
        ? businessInfo.businessName.trim() || 'Details entered'
        : 'Business name required',
      complete: businessInfoComplete,
    },
    {
      label: 'Analysis Objective',
      detail: questionComplete
        ? truncate(businessQuestion.trim(), 60)
        : 'Strategic question required',
      complete: questionComplete,
    },
    {
      label: 'Additional Context',
      detail: businessInfo.additionalContext.trim()
        ? `${businessInfo.additionalContext.trim().length} characters`
        : 'Not provided',
      complete: !!businessInfo.additionalContext.trim(),
      optional: true,
    },
    {
      label: 'Supporting Documents',
      detail: selectedFiles.length > 0
        ? `${selectedFiles.length} ${selectedFiles.length === 1 ? 'file' : 'files'} selected`
        : 'No documents added',
      complete: selectedFiles.length > 0,
      optional: true,
    },
  ];

  const canSubmit = businessInfoComplete && questionComplete;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
        <p className="text-xs font-bold uppercase tracking-widest text-black">
          Analysis Summary
        </p>
      </div>

      {/* Sections */}
      <div className="px-5 py-4 space-y-4">
        {sections.map(section => (
          <div key={section.label} className="flex items-start gap-3">
            {/* Status icon */}
            <div className="mt-0.5 flex-shrink-0">
              {section.complete ? (
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              ) : section.optional ? (
                <div className="w-5 h-5 rounded-full border-2 border-neutral-200 flex items-center justify-center">
                  <Circle size={7} className="text-neutral-300" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex items-center justify-center" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-black">{section.label}</p>
                {section.optional && (
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest">
                    optional
                  </span>
                )}
              </div>
              <p className={[
                'text-[11px] mt-0.5 leading-relaxed truncate',
                section.complete ? 'text-neutral-500' : 'text-neutral-400 italic',
              ].join(' ')}>
                {section.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Submit readiness */}
      <div className={[
        'px-5 py-3 border-t',
        canSubmit ? 'border-neutral-100 bg-neutral-50' : 'border-neutral-100',
      ].join(' ')}>
        <div className="flex items-center gap-2">
          <div className={[
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            canSubmit ? 'bg-emerald-500' : 'bg-neutral-300',
          ].join(' ')} />
          <p className={[
            'text-[11px] font-medium',
            canSubmit ? 'text-emerald-700' : 'text-neutral-400',
          ].join(' ')}>
            {canSubmit
              ? 'Ready to prepare context'
              : 'Complete required fields to continue'}
          </p>
        </div>
      </div>
    </div>
  );
};

function truncate(str: string, len: number): string {
  return str.length <= len ? str : str.slice(0, len) + '…';
}

export default ReviewPanel;
