import React from 'react';
import type { AnalysisResponse } from '../../types/api';

interface ExecutiveSummaryHeroProps {
  result: AnalysisResponse;
}

const statusConfig: Record<string, { label: string; dot: string; text: string }> = {
  completed:      { label: 'Analysis Complete',  dot: 'bg-emerald-500', text: 'text-emerald-600' },
  partial:        { label: 'Partial Results',    dot: 'bg-amber-400',   text: 'text-amber-600'  },
  failed:         { label: 'Analysis Failed',    dot: 'bg-red-400',     text: 'text-red-600'    },
  quota_exceeded: { label: 'Quota Exhausted',    dot: 'bg-amber-500',   text: 'text-amber-600'  },
  pending:        { label: 'Pending',            dot: 'bg-neutral-400', text: 'text-neutral-600'},
  running:        { label: 'Analyzing',          dot: 'bg-burgundy',    text: 'text-burgundy'   },
};

export const ExecutiveSummaryHero: React.FC<ExecutiveSummaryHeroProps> = ({ result }) => {
  const normalizedStatus = (result.status || '').toLowerCase();
  const cfg = statusConfig[normalizedStatus] ?? statusConfig.failed;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      {/* Top band */}
      <div className="px-8 pt-8 pb-6 border-b border-neutral-100">
        {/* Status pill */}
        <div className="flex items-center gap-2 mb-4">
          <span className={['w-2 h-2 rounded-full flex-shrink-0', cfg.dot].join(' ')} />
          <span className={['text-xs font-semibold uppercase tracking-widest', cfg.text].join(' ')}>
            {cfg.label}
          </span>
        </div>

        {/* Business name + report title */}
        <h1 className="text-3xl font-extrabold text-black tracking-tight leading-tight">
          {result.business_name}
        </h1>
        <p className="text-sm text-neutral-500 mt-1 font-medium tracking-wide uppercase">
          Executive Intelligence Report
        </p>

        {/* Divider */}
        <div className="mt-5 mb-5 border-t border-neutral-100" />

        {/* Executive summary */}
        {result.executive_summary ? (
          <p className="text-base text-neutral-700 leading-relaxed max-w-3xl">
            {result.executive_summary}
          </p>
        ) : result.business_summary ? (
          <p className="text-base text-neutral-700 leading-relaxed max-w-3xl">
            {result.business_summary}
          </p>
        ) : (
          <p className="text-sm text-neutral-400 italic">No executive summary returned.</p>
        )}
      </div>

      {/* Meta strip */}
      <div className="px-8 py-4 bg-neutral-50 flex flex-wrap gap-6">
        <MetaItem label="Agents Completed" value={`${result.metadata.successful_agents} / ${result.metadata.successful_agents + result.metadata.failed_agents}`} />
        {result.metadata.failed_agents > 0 && (
          <MetaItem label="Agents Failed" value={String(result.metadata.failed_agents)} dim />
        )}
        <MetaItem label="Opportunities" value={String(result.key_opportunities?.length ?? 0)} />
        <MetaItem label="Critical Risks"  value={String(result.critical_risks?.length ?? 0)} />
        <MetaItem label="Analysis ID" value={result.analysis_id.slice(0, 12) + '…'} mono />
      </div>
    </div>
  );
};

const MetaItem: React.FC<{ label: string; value: string; dim?: boolean; mono?: boolean }> = ({
  label, value, dim, mono,
}) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
    <p className={['text-sm font-bold mt-0.5', dim ? 'text-neutral-400' : 'text-black', mono ? 'font-mono text-xs' : ''].join(' ')}>
      {value}
    </p>
  </div>
);

export default ExecutiveSummaryHero;
