import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import type { AgentResult } from '../../types/api';
import { AGENTS, type AgentKey } from '../executive/AgentCard';

interface AgentResultsSectionProps {
  agentResults: AgentResult[];
}

/** Map agent_name from backend to our AgentKey for icon/style lookup */
function resolveAgentKey(agentName: string): AgentKey {
  const lower = agentName.toLowerCase();
  if (lower.includes('research'))  return 'research';
  if (lower.includes('market'))    return 'market';
  if (lower.includes('finance'))   return 'finance';
  if (lower.includes('risk'))      return 'risk';
  if (lower.includes('legal') || lower.includes('compliance')) return 'legal';
  if (lower.includes('strategy'))  return 'strategy';
  return 'research'; // fallback
}

export const AgentResultsSection: React.FC<AgentResultsSectionProps> = ({ agentResults }) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  if (!agentResults.length) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
        <p className="text-sm text-neutral-400">No individual agent results returned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agentResults.map(result => {
        const agentKey = resolveAgentKey(result.agent_name);
        const agentDef = AGENTS.find(a => a.key === agentKey) ?? AGENTS[0];
        const Icon = agentDef.icon;
        const isCompleted = result.status === 'completed';
        const isExpanded  = expandedKeys.has(result.agent_name);

        const hasContent = (
          result.summary ||
          result.insights?.length ||
          result.recommendations?.length ||
          result.risks?.length ||
          result.assumptions?.length
        );

        return (
          <div
            key={result.agent_name}
            className="rounded-xl border border-neutral-200 bg-white overflow-hidden transition-shadow duration-200 hover:shadow-sm"
          >
            {/* Header row — always visible */}
            <button
              type="button"
              onClick={() => toggle(result.agent_name)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50 transition-colors duration-150"
              aria-expanded={isExpanded}
            >
              {/* Icon */}
              <div className={['w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', agentDef.iconBg].join(' ')}>
                <Icon size={17} className={agentDef.iconColor} />
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black">{result.agent_name}</p>
                {result.summary && (
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">{result.summary}</p>
                )}
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isCompleted ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                      Completed
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center">
                      <X size={9} className="text-neutral-500" strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Failed
                    </span>
                  </div>
                )}
                {result.confidence !== null && result.confidence !== undefined && (
                  <span className="text-[10px] text-neutral-400 font-medium hidden sm:block">
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp size={15} className="text-neutral-400" />
                ) : (
                  <ChevronDown size={15} className="text-neutral-400" />
                )}
              </div>
            </button>

            {/* Expanded body */}
            {isExpanded && (
              <div className="border-t border-neutral-100 px-5 py-4 space-y-4 animate-fade-in">
                {/* Error message for failed agents */}
                {!isCompleted && result.error && (
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Error</p>
                    <p className="text-xs text-neutral-600 leading-relaxed">{result.error}</p>
                  </div>
                )}

                {/* Summary */}
                {result.summary && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Summary</p>
                    <p className="text-sm text-neutral-700 leading-relaxed">{result.summary}</p>
                  </div>
                )}

                {/* Insights */}
                {result.insights?.length > 0 && (
                  <StringList label="Insights" items={result.insights} />
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <StringList label="Recommendations" items={result.recommendations} />
                )}

                {/* Risks */}
                {result.risks?.length > 0 && (
                  <StringList label="Risks Identified" items={result.risks} />
                )}

                {/* Assumptions */}
                {result.assumptions?.length > 0 && (
                  <StringList label="Assumptions" items={result.assumptions} />
                )}

                {!hasContent && isCompleted && (
                  <p className="text-xs text-neutral-400 italic">Agent completed without detailed breakdown.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const StringList: React.FC<{ label: string; items: string[] }> = ({ label, items }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">{label}</p>
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-neutral-600 leading-relaxed">
          <span className="w-1 h-1 rounded-full bg-neutral-400 flex-shrink-0 mt-1.5" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default AgentResultsSection;
