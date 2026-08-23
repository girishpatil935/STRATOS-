import React from 'react';
import { CheckCircle, AlertTriangle, BarChart3, ArrowRight, RotateCcw } from 'lucide-react';
import type { AnalysisResponse } from '../../types/api';
import { Button } from '../ui/Button';

interface AnalysisCompleteCardProps {
  result: AnalysisResponse;
  onViewInsights: () => void;
  onNewAnalysis: () => void;
}

export const AnalysisCompleteCard: React.FC<AnalysisCompleteCardProps> = ({
  result,
  onViewInsights,
  onNewAnalysis,
}) => {
  const isPartial  = result.status === 'partial';
  const isFailed   = result.status === 'failed';
  const { successful_agents, failed_agents } = result.metadata;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden animate-fade-in">
      {/* Header band */}
      <div className={[
        'px-6 py-5 flex items-start gap-4 border-b border-neutral-100',
        isFailed ? 'bg-neutral-50' : 'bg-neutral-50',
      ].join(' ')}>
        <div className={[
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          isFailed   ? 'bg-neutral-200'  :
          isPartial  ? 'bg-amber-100'    :
          'bg-black',
        ].join(' ')}>
          {isFailed ? (
            <AlertTriangle size={18} className="text-neutral-500" />
          ) : isPartial ? (
            <AlertTriangle size={18} className="text-amber-600" />
          ) : (
            <CheckCircle size={18} className="text-white" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-black">
            {isFailed   ? 'Analysis Failed'                 :
             isPartial  ? 'Executive Analysis Complete'     :
             'Executive Analysis Complete'}
          </p>
          <p className="text-sm text-neutral-500 mt-1 leading-relaxed">
            {isFailed
              ? 'The AI team could not complete the analysis. Please try again.'
              : isPartial
              ? `The AI executive team completed the analysis. ${failed_agents} agent${failed_agents !== 1 ? 's' : ''} encountered issues but the report is available.`
              : 'The AI executive team has completed its full analysis. Your strategic insights are ready.'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-neutral-100">
        <StatItem label="Agents Completed" value={`${successful_agents} / ${successful_agents + failed_agents}`} />
        {failed_agents > 0 && (
          <StatItem label="Agents Failed" value={String(failed_agents)} dim />
        )}
        <StatItem
          label="Status"
          value={
            isFailed ? 'Failed' :
            isPartial ? 'Partial' :
            'Complete'
          }
        />
        <StatItem
          label="Opportunities"
          value={String(result.key_opportunities?.length ?? 0)}
        />
        <StatItem
          label="Key Risks"
          value={String(result.critical_risks?.length ?? 0)}
        />
      </div>

      {/* Executive summary preview */}
      {result.executive_summary && (
        <div className="px-6 py-4 border-b border-neutral-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
            Executive Summary Preview
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed line-clamp-3">
            {result.executive_summary}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {!isFailed && (
          <Button
            id="view-insights-btn"
            variant="primary"
            size="lg"
            icon={<ArrowRight size={17} />}
            iconPosition="right"
            onClick={onViewInsights}
          >
            View Executive Insights
          </Button>
        )}
        <Button
          variant="ghost"
          size="md"
          icon={<RotateCcw size={14} />}
          iconPosition="left"
          onClick={onNewAnalysis}
        >
          New Analysis
        </Button>
        {!isFailed && (
          <div className="hidden sm:flex items-center gap-2 ml-auto text-xs text-neutral-400">
            <BarChart3 size={13} />
            <span>Full report available</span>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: string; dim?: boolean }> = ({
  label,
  value,
  dim,
}) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
    <p className={['text-lg font-bold mt-0.5', dim ? 'text-neutral-400' : 'text-black'].join(' ')}>
      {value}
    </p>
  </div>
);

export default AnalysisCompleteCard;
