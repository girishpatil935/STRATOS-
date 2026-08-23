import React from 'react';
import type { KeyOpportunity } from '../../types/api';
import { TrendingUp } from 'lucide-react';

const priorityConfig = {
  high:   { label: 'High Priority',   dot: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium Priority', dot: 'bg-amber-400',   text: 'text-amber-700',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: 'Low Priority',    dot: 'bg-neutral-300',  text: 'text-neutral-500', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
};

interface OpportunitiesGridProps {
  opportunities: KeyOpportunity[];
}

export const OpportunitiesGrid: React.FC<OpportunitiesGridProps> = ({ opportunities }) => {
  if (!opportunities.length) {
    return <EmptyState message="No key opportunities returned by the analysis." />;
  }

  // Sort: high → medium → low
  const sorted = [...opportunities].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map((opp, idx) => {
        const cfg = priorityConfig[opp.priority] ?? priorityConfig.low;
        return (
          <div
            key={idx}
            className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={16} className="text-black" />
              </div>
              <span className={['text-[10px] font-bold uppercase tracking-widest border rounded px-1.5 py-0.5 flex-shrink-0', cfg.badge].join(' ')}>
                {opp.priority}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-black leading-snug">{opp.title}</p>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{opp.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
    <p className="text-sm text-neutral-400">{message}</p>
  </div>
);

export default OpportunitiesGrid;
