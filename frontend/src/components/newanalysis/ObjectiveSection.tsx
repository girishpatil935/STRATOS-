import React from 'react';
import { Sparkles } from 'lucide-react';

const MAX_CHARS = 2000;

interface ObjectiveSectionProps {
  value: string;
  onChange: (value: string) => void;
  showValidation: boolean;
}

export const ObjectiveSection: React.FC<ObjectiveSectionProps> = ({
  value,
  onChange,
  showValidation,
}) => {
  const hasError = showValidation && !value.trim();
  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;

  return (
    <div className="space-y-4">
      {/* Heading row */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-burgundy flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles size={17} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-black">Analysis Objective</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            What would you like Executive_AI to analyze?{' '}
            <span className="text-burgundy font-medium">Required.</span>
          </p>
        </div>
      </div>

      {/* Prominent question card */}
      <div
        className={[
          'rounded-2xl border-2 p-5 transition-all duration-200',
          hasError
            ? 'border-burgundy bg-white'
            : 'border-black bg-white focus-within:border-burgundy focus-within:shadow-[0_0_0_3px_rgba(96,10,28,0.06)]',
        ].join(' ')}
      >
        <label
          htmlFor="business-question"
          className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3"
        >
          Strategic Question
        </label>
        <textarea
          id="business-question"
          rows={5}
          maxLength={MAX_CHARS}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Describe the challenge, decision, opportunity, or strategic question you want the AI executive team to investigate.&#10;&#10;Example: Should EcoRide expand operations to Mumbai and Bengaluru in the next 12 months given our current budget and team constraints?"
          className="w-full text-sm text-black placeholder-neutral-400 bg-transparent outline-none resize-none leading-relaxed"
        />
        {/* Footer: hint + char count */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <p className="text-[11px] text-neutral-400 leading-relaxed max-w-sm">
            Be specific. The more context you provide, the more targeted the agent insights will be.
          </p>
          <span
            className={[
              'text-[11px] font-medium tabular-nums flex-shrink-0 ml-4',
              nearLimit ? 'text-burgundy' : 'text-neutral-300',
            ].join(' ')}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {hasError && (
        <p className="text-xs text-burgundy font-medium flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-burgundy inline-block" />
          Please enter your strategic question before continuing.
        </p>
      )}
    </div>
  );
};

export default ObjectiveSection;
