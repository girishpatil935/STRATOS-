import React from 'react';
import type { ActionPlan } from '../../types/api';

interface ActionPlanSectionProps {
  plan: ActionPlan;
}

interface Phase {
  label: string;
  timeframe: string;
  actions: string[];
  dot: string;
  lineColor: string;
}

export const ActionPlanSection: React.FC<ActionPlanSectionProps> = ({ plan }) => {
  const phases: Phase[] = [
    {
      label: 'Immediate Actions',
      timeframe: 'Now → 30 days',
      actions: plan.immediate_actions ?? [],
      dot: 'bg-burgundy',
      lineColor: 'bg-burgundy/20',
    },
    {
      label: 'Short-Term Actions',
      timeframe: '30 → 90 days',
      actions: plan.short_term_actions ?? [],
      dot: 'bg-black',
      lineColor: 'bg-neutral-200',
    },
    {
      label: 'Medium-Term Strategy',
      timeframe: '90 days → 12 months',
      actions: plan.medium_term_strategy ?? [],
      dot: 'bg-neutral-400',
      lineColor: 'bg-neutral-100',
    },
  ].filter(p => p.actions.length > 0);

  if (phases.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
        <p className="text-sm text-neutral-400">No action plan returned by the analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {phases.map((phase, phaseIdx) => (
        <div key={phase.label} className="flex gap-4">
          {/* Timeline column */}
          <div className="flex flex-col items-center w-8 flex-shrink-0">
            <div className={['w-3 h-3 rounded-full mt-1 flex-shrink-0 z-10', phase.dot].join(' ')} />
            {phaseIdx < phases.length - 1 && (
              <div className={['w-0.5 flex-1 mt-1', phase.lineColor].join(' ')} />
            )}
          </div>

          {/* Phase content */}
          <div className="flex-1 pb-6 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <h3 className="text-sm font-bold text-black">{phase.label}</h3>
              <span className="text-[10px] font-semibold text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 uppercase tracking-widest">
                {phase.timeframe}
              </span>
            </div>

            <div className="space-y-2">
              {phase.actions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:border-neutral-300 hover:shadow-sm transition-all duration-150"
                >
                  <span className="w-5 h-5 rounded bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-600 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-neutral-700 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionPlanSection;
