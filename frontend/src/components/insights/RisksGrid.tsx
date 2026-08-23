import React from 'react';
import type { CriticalRisk } from '../../types/api';
import { ShieldAlert } from 'lucide-react';

const severityConfig = {
  high:   { label: 'High',   badge: 'bg-red-50 text-red-700 border-red-200',       bar: 'bg-red-400'     },
  medium: { label: 'Medium', badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400'   },
  low:    { label: 'Low',    badge: 'bg-neutral-100 text-neutral-500 border-neutral-200', bar: 'bg-neutral-300' },
};

interface RisksGridProps {
  risks: CriticalRisk[];
}

export const RisksGrid: React.FC<RisksGridProps> = ({ risks }) => {
  if (!risks.length) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
        <p className="text-sm text-neutral-400">No critical risks identified by the analysis.</p>
      </div>
    );
  }

  const sorted = [...risks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <div className="space-y-3">
      {sorted.map((risk, idx) => {
        const cfg = severityConfig[risk.severity] ?? severityConfig.low;
        return (
          <div
            key={idx}
            className="rounded-xl border border-neutral-200 bg-white overflow-hidden hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
          >
            {/* Severity bar */}
            <div className={['h-0.5 w-full', cfg.bar].join(' ')} />

            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldAlert size={15} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="text-sm font-bold text-black leading-snug">{risk.title}</p>
                    <span className={['text-[10px] font-bold uppercase tracking-widest border rounded px-1.5 py-0.5 flex-shrink-0', cfg.badge].join(' ')}>
                      {cfg.label} Risk
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">{risk.description}</p>

                  {risk.mitigation && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                        Mitigation
                      </p>
                      <p className="text-xs text-neutral-600 leading-relaxed">{risk.mitigation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RisksGrid;
