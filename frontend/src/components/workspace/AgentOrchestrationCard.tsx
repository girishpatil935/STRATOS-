import React from 'react';
import { Check, X, Loader2, Clock } from 'lucide-react';
import type { AgentDefinition } from '../executive/AgentCard';
import type { AgentDisplayStatus, AgentDisplayState } from '../../hooks/useRunAnalysis';

interface AgentOrchestrationCardProps {
  agent: AgentDefinition;
  state: AgentDisplayState;
}

const statusConfig: Record<AgentDisplayStatus, {
  border: string;
  bg: string;
  label: string;
  labelColor: string;
  dotClass: string;
}> = {
  waiting: {
    border: 'border-neutral-200',
    bg: 'bg-white',
    label: 'Waiting',
    labelColor: 'text-neutral-400',
    dotClass: 'bg-neutral-200',
  },
  analyzing: {
    border: 'border-burgundy/30',
    bg: 'bg-white',
    label: 'Analyzing',
    labelColor: 'text-burgundy',
    dotClass: 'bg-burgundy animate-pulse',
  },
  completed: {
    border: 'border-neutral-200',
    bg: 'bg-white',
    label: 'Completed',
    labelColor: 'text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  failed: {
    border: 'border-neutral-200',
    bg: 'bg-white',
    label: 'Failed',
    labelColor: 'text-neutral-500',
    dotClass: 'bg-red-400',
  },
  skipped: {
    border: 'border-neutral-200',
    bg: 'bg-neutral-50',
    label: 'Skipped',
    labelColor: 'text-neutral-400',
    dotClass: 'bg-neutral-300',
  },
};

export const AgentOrchestrationCard: React.FC<AgentOrchestrationCardProps> = ({
  agent,
  state,
}) => {
  const Icon = agent.icon;
  const cfg = statusConfig[state.displayStatus];
  const isAnalyzing = state.displayStatus === 'analyzing';
  const isCompleted = state.displayStatus === 'completed';
  const isFailed    = state.displayStatus === 'failed';
  const isWaiting   = state.displayStatus === 'waiting';

  // Concise preview from real backend result
  const preview = state.result?.summary
    ? truncate(state.result.summary, 90)
    : null;

  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-500',
        cfg.border,
        cfg.bg,
        isAnalyzing ? 'shadow-[0_0_0_3px_rgba(96,10,28,0.06)]' : '',
        isWaiting   ? 'opacity-60' : 'opacity-100',
      ].join(' ')}
    >
      {/* Top row: icon + status pill */}
      <div className="flex items-center justify-between">
        <div className={[
          'w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-500',
          isWaiting ? 'bg-neutral-100' : agent.iconBg,
        ].join(' ')}>
          <Icon
            size={18}
            className={isWaiting ? 'text-neutral-400' : agent.iconColor}
          />
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-1.5">
          {isAnalyzing && (
            <Loader2 size={11} className="text-burgundy animate-spin" />
          )}
          {isCompleted && (
            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check size={9} className="text-white" strokeWidth={3} />
            </div>
          )}
          {isFailed && (
            <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center">
              <X size={9} className="text-neutral-500" strokeWidth={3} />
            </div>
          )}
          {isWaiting && (
            <Clock size={11} className="text-neutral-300" />
          )}
          <span className={['text-[10px] font-bold uppercase tracking-widest', cfg.labelColor].join(' ')}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Agent name + role */}
      <div>
        <p className={[
          'text-sm font-bold transition-colors duration-300',
          isWaiting ? 'text-neutral-400' : 'text-black',
        ].join(' ')}>
          {agent.name} Agent
        </p>
        <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
          {agent.responsibility}
        </p>
      </div>

      {/* Result preview — only shown when real data available */}
      {isCompleted && preview && (
        <div className="pt-2 border-t border-neutral-100">
          <p className="text-[11px] text-neutral-600 leading-relaxed italic">
            "{preview}"
          </p>
        </div>
      )}
      {isFailed && state.result?.error && (
        <div className="pt-2 border-t border-neutral-100">
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {truncate(state.result.error, 80)}
          </p>
        </div>
      )}

      {/* Analyzing shimmer bar */}
      {isAnalyzing && (
        <div className="h-0.5 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full bg-burgundy rounded-full animate-analyzing-bar"
            style={{ width: '40%', animation: 'analyzingBar 1.8s ease-in-out infinite' }}
          />
        </div>
      )}
    </div>
  );
};

function truncate(s: string, len: number): string {
  return s.length <= len ? s : s.slice(0, len).trimEnd() + '…';
}

export default AgentOrchestrationCard;
