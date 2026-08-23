import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 'context',   label: 'Context',   number: '01' },
  { id: 'documents', label: 'Documents', number: '02' },
  { id: 'review',    label: 'Review',    number: '03' },
  { id: 'analysis',  label: 'Analysis',  number: '04' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

interface StepIndicatorProps {
  current: StepId;
  completed: StepId[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ current, completed }) => {
  return (
    <div className="flex items-center gap-0 w-full max-w-lg">
      {STEPS.map((step, idx) => {
        const isDone    = completed.includes(step.id);
        const isActive  = step.id === current;

        return (
          <React.Fragment key={step.id}>
            {/* Step node */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  isDone    ? 'bg-black text-white'               :
                  isActive  ? 'bg-burgundy text-white ring-4 ring-burgundy/20' :
                  'bg-neutral-100 text-neutral-400 border border-neutral-200',
                ].join(' ')}
              >
                {isDone ? <Check size={14} strokeWidth={2.5} /> : step.number}
              </div>
              <span
                className={[
                  'text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap',
                  isDone   ? 'text-black'       :
                  isActive ? 'text-burgundy'    :
                  'text-neutral-400',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  'flex-1 h-px mx-2 mb-5 transition-all duration-300',
                  isDone ? 'bg-black' : 'bg-neutral-200',
                ].join(' ')}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
