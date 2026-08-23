import React from 'react';
import {
  Search,
  BarChart2,
  DollarSign,
  ShieldAlert,
  Scale,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';

export type AgentKey = 'research' | 'market' | 'finance' | 'risk' | 'legal' | 'strategy';

export interface AgentDefinition {
  key: AgentKey;
  name: string;
  responsibility: string;
  icon: LucideIcon;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  iconBg: string;
  iconColor: string;
}

/**
 * Each agent has a minimal black/white/burgundy-family identity.
 * We use subtle neutral tints so the grid reads cleanly without
 * competing with the brand accent.
 */
export const AGENTS: AgentDefinition[] = [
  {
    key: 'research',
    name: 'Research',
    responsibility: 'Collects reliable, source-backed findings and market intelligence.',
    icon: Search,
    accentBg:     'bg-white',
    accentText:   'text-black',
    accentBorder: 'border-neutral-200',
    iconBg:       'bg-neutral-100',
    iconColor:    'text-black',
  },
  {
    key: 'market',
    name: 'Market',
    responsibility: 'Evaluates market size, trends, competitors, and demand signals.',
    icon: BarChart2,
    accentBg:     'bg-white',
    accentText:   'text-black',
    accentBorder: 'border-neutral-200',
    iconBg:       'bg-black',
    iconColor:    'text-white',
  },
  {
    key: 'finance',
    name: 'Finance',
    responsibility: 'Analyzes cost structures, revenue potential, and ROI feasibility.',
    icon: DollarSign,
    accentBg:     'bg-white',
    accentText:   'text-black',
    accentBorder: 'border-neutral-200',
    iconBg:       'bg-neutral-100',
    iconColor:    'text-black',
  },
  {
    key: 'risk',
    name: 'Risk',
    responsibility: 'Identifies technical, market, financial, and operational risks.',
    icon: ShieldAlert,
    accentBg:     'bg-white',
    accentText:   'text-black',
    accentBorder: 'border-neutral-200',
    iconBg:       'bg-neutral-100',
    iconColor:    'text-neutral-700',
  },
  {
    key: 'legal',
    name: 'Legal',
    responsibility: 'Reviews regulatory, compliance, privacy, and IP considerations.',
    icon: Scale,
    accentBg:     'bg-white',
    accentText:   'text-black',
    accentBorder: 'border-neutral-200',
    iconBg:       'bg-burgundy',
    iconColor:    'text-white',
  },
  {
    key: 'strategy',
    name: 'Strategy',
    responsibility: 'Synthesizes all insights into an executive decision and action plan.',
    icon: Lightbulb,
    accentBg:     'bg-white',
    accentText:   'text-black',
    accentBorder: 'border-neutral-200',
    iconBg:       'bg-neutral-900',
    iconColor:    'text-white',
  },
];

interface AgentCardProps {
  agent: AgentDefinition;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  className?: string;
  compact?: boolean;
}

const statusDot: Record<string, string> = {
  idle:      'bg-neutral-300',
  running:   'bg-amber-400 animate-pulse',
  completed: 'bg-emerald-500',
  failed:    'bg-red-500',
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  status = 'idle',
  className = '',
  compact = false,
}) => {
  const Icon = agent.icon;

  if (compact) {
    return (
      <div
        className={[
          'flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:shadow-sm hover:border-neutral-300',
          agent.accentBg,
          agent.accentBorder,
          className,
        ].join(' ')}
      >
        <div className={['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', agent.iconBg].join(' ')}>
          <Icon size={16} className={agent.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={['text-sm font-semibold truncate', agent.accentText].join(' ')}>{agent.name}</p>
          <p className="text-xs text-neutral-500 truncate">{agent.responsibility}</p>
        </div>
        <span className={['w-2 h-2 rounded-full flex-shrink-0', statusDot[status]].join(' ')} />
      </div>
    );
  }

  return (
    <div
      className={[
        'group flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-neutral-300',
        agent.accentBg,
        agent.accentBorder,
        className,
      ].join(' ')}
    >
      {/* Icon + status row */}
      <div className="flex items-start justify-between">
        <div className={['w-10 h-10 rounded-xl flex items-center justify-center', agent.iconBg].join(' ')}>
          <Icon size={20} className={agent.iconColor} />
        </div>
        <span className={['w-2 h-2 rounded-full mt-1', statusDot[status]].join(' ')} />
      </div>

      {/* Name + responsibility */}
      <div>
        <p className={['text-sm font-bold', agent.accentText].join(' ')}>{agent.name} Agent</p>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">{agent.responsibility}</p>
      </div>
    </div>
  );
};

export default AgentCard;
