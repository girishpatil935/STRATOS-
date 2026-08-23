import React from 'react';
import { FileText } from 'lucide-react';

const MAX_CHARS = 3000;

interface AdditionalContextSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const AdditionalContextSection: React.FC<AdditionalContextSectionProps> = ({
  value,
  onChange,
}) => {
  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FileText size={17} className="text-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black">Additional Context</h2>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5">
              Optional
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            Provide any supporting background that would help the agents understand your situation.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 transition-all duration-200">
        <textarea
          id="additional-context"
          rows={6}
          maxLength={MAX_CHARS}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={
            'Include any relevant background information such as:\n' +
            '• Current market situation or recent changes\n' +
            '• Existing strategy or previous attempts\n' +
            '• Key constraints or non-negotiables\n' +
            '• Regulatory environment or compliance concerns\n' +
            '• Stakeholder or investor considerations'
          }
          className="w-full px-4 pt-4 pb-2 text-sm text-black placeholder-neutral-400 bg-transparent outline-none resize-none leading-relaxed rounded-xl"
        />
        <div className="flex items-center justify-end px-4 pb-3">
          <span
            className={[
              'text-[11px] font-medium tabular-nums',
              nearLimit ? 'text-burgundy' : 'text-neutral-300',
            ].join(' ')}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-neutral-400">
        This text is included in{' '}
        <code className="font-mono bg-neutral-100 px-1 rounded text-[10px]">business_description</code>{' '}
        and sent to all six AI agents alongside your business information.
      </p>
    </div>
  );
};

export default AdditionalContextSection;
