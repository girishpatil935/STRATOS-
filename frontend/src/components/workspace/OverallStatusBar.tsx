import React from 'react';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Zap } from 'lucide-react';
import type { OrchestratorStatus } from '../../hooks/useRunAnalysis';

interface OverallStatusBarProps {
  status: OrchestratorStatus;
  elapsedSeconds: number;
  businessName: string;
  successfulAgents?: number;
  failedAgents?: number;
  totalAgents?: number;
}

const STATUS_CONFIG: Record<OrchestratorStatus, {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  barClass: string;
  barWidthClass: string;
}> = {
  idle: {
    label: 'Ready',
    sublabel: 'Preparing to connect agents…',
    icon: <Zap size={16} className="text-neutral-400" />,
    barClass: 'bg-neutral-200',
    barWidthClass: 'w-0',
  },
  connecting: {
    label: 'Connecting AI Agents',
    sublabel: 'Establishing connection to the Executive_AI backend…',
    icon: <Loader2 size={16} className="text-burgundy animate-spin" />,
    barClass: 'bg-burgundy',
    barWidthClass: 'w-1/12',
  },
  running: {
    label: 'Analyzing Business',
    sublabel: 'Executive_AI is coordinating your specialized AI team…',
    icon: <Loader2 size={16} className="text-burgundy animate-spin" />,
    barClass: 'bg-burgundy',
    barWidthClass: 'w-2/3',
  },
  complete: {
    label: 'Analysis Complete',
    sublabel: 'All agents have successfully completed their analysis.',
    icon: <CheckCircle size={16} className="text-emerald-500" />,
    barClass: 'bg-emerald-500',
    barWidthClass: 'w-full',
  },
  partial: {
    label: 'Analysis Complete (Partial)',
    sublabel: 'Analysis complete — some agents encountered issues.',
    icon: <AlertTriangle size={16} className="text-amber-500" />,
    barClass: 'bg-amber-500',
    barWidthClass: 'w-full',
  },
  failed: {
    label: 'Analysis Failed',
    sublabel: 'The analysis could not be completed by the agents.',
    icon: <XCircle size={16} className="text-red-500" />,
    barClass: 'bg-red-400',
    barWidthClass: 'w-full',
  },
  quota_exceeded: {
    label: 'Quota Exhausted',
    sublabel: 'Gemini API quota is exhausted. Retry failed agents or try again later.',
    icon: <AlertTriangle size={16} className="text-amber-500" />,
    barClass: 'bg-amber-500',
    barWidthClass: 'w-full',
  },
  error: {
    label: 'Connection Error',
    sublabel: 'Could not reach the Executive_AI backend.',
    icon: <XCircle size={16} className="text-red-500" />,
    barClass: 'bg-red-400',
    barWidthClass: 'w-full',
  },
};

function formatElapsed(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export const OverallStatusBar: React.FC<OverallStatusBarProps> = ({
  status,
  elapsedSeconds,
  businessName,
  successfulAgents,
  failedAgents,
  totalAgents = 6,
}) => {
  const cfg = STATUS_CONFIG[status];
  const isRunning = status === 'connecting' || status === 'running';
  const isDone = status === 'complete' || status === 'partial' || status === 'failed' || status === 'error';

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      {/* Top row */}
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {cfg.icon}
          <div>
            <p className="text-sm font-bold text-black">{cfg.label}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">{cfg.sublabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 text-right">
          {/* Elapsed time */}
          {(isRunning || (isDone && elapsedSeconds > 0)) && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Elapsed</p>
              <p className="text-sm font-bold text-black tabular-nums">{formatElapsed(elapsedSeconds)}</p>
            </div>
          )}

          {/* Agent count summary */}
          {isDone && successfulAgents !== undefined && (
            <div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Agents</p>
              <p className="text-sm font-bold text-black tabular-nums">
                {successfulAgents}/{totalAgents}
                {failedAgents ? (
                  <span className="text-neutral-400 font-normal"> · {failedAgents} failed</span>
                ) : null}
              </p>
            </div>
          )}

          {/* Business name */}
          {businessName && (
            <div className="hidden sm:block">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Business</p>
              <p className="text-xs font-semibold text-black truncate max-w-[140px]">{businessName}</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-neutral-100 w-full">
        <div
          className={[
            'h-full rounded-full transition-all',
            cfg.barClass,
            // Use actual width for done states, animated for running
            isDone ? cfg.barWidthClass : '',
            isRunning ? 'animate-progress-indeterminate' : '',
          ].join(' ')}
          style={isRunning ? {
            width: status === 'connecting' ? '8%' : '65%',
            transition: 'width 2s ease-in-out',
          } : undefined}
        />
      </div>
    </div>
  );
};

export default OverallStatusBar;
