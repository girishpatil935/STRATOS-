import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ShieldAlert, BarChart3, DollarSign,
  Scale, Lightbulb, Target, CheckSquare, Users,
  ArrowLeft, PlusCircle, BarChart2,
} from 'lucide-react';

import { useAnalysisStore } from '../context/AnalysisStore';
import { Button } from '../components/ui/Button';

import { ExecutiveSummaryHero } from '../components/insights/ExecutiveSummaryHero';
import { InsightSection } from '../components/insights/InsightSection';
import { OpportunitiesGrid } from '../components/insights/OpportunitiesGrid';
import { RisksGrid } from '../components/insights/RisksGrid';
import { InsightListCard } from '../components/insights/InsightListCard';
import { ActionPlanSection } from '../components/insights/ActionPlanSection';
import { AgentResultsSection } from '../components/insights/AgentResultsSection';

// ── Section scroll-link ─────────────────────────────────────────
const SECTIONS = [
  { id: 'summary',         label: 'Summary'          },
  { id: 'opportunities',   label: 'Opportunities'     },
  { id: 'risks',           label: 'Risks'             },
  { id: 'market',          label: 'Market'            },
  { id: 'financial',       label: 'Financial'         },
  { id: 'compliance',      label: 'Compliance'        },
  { id: 'strategy',        label: 'Strategy'          },
  { id: 'action-plan',     label: 'Action Plan'       },
  { id: 'kpis',            label: 'KPIs'              },
  { id: 'agent-insights',  label: 'Agent Insights'    },
];

const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { analysisResult } = useAnalysisStore();

  // ── Empty state ─────────────────────────────────────────────
  if (!analysisResult) {
    return (
      <div className="min-h-full bg-white px-6 md:px-10 py-14">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto">
            <BarChart3 size={24} className="text-neutral-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">No Analysis Available</h1>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed max-w-sm mx-auto">
              Run an analysis from the New Analysis page to generate your executive intelligence report.
            </p>
          </div>
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <Button
              variant="primary"
              size="md"
              icon={<PlusCircle size={15} />}
              onClick={() => navigate('/new-analysis')}
            >
              Start New Analysis
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={<ArrowLeft size={15} />}
              onClick={() => navigate('/')}
            >
              Go to Overview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const r = analysisResult;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-full bg-white">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="border-b border-neutral-200 px-6 md:px-10 py-6 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-burgundy flex items-center justify-center">
                <BarChart2 size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-black leading-none">Executive Insights</h1>
                <p className="text-[11px] text-neutral-500 mt-0.5">{r.business_name}</p>
              </div>
            </div>

            {/* Section nav — hidden on mobile */}
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="px-2.5 py-1 text-[11px] font-medium text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors duration-150 whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
            </nav>

            {/* Action */}
            <Button
              variant="ghost"
              size="sm"
              icon={<PlusCircle size={14} />}
              onClick={() => navigate('/new-analysis')}
            >
              New Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ──────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 space-y-10">

        {/* 1. Executive Summary Hero */}
        <div id="summary" className="scroll-mt-20">
          <ExecutiveSummaryHero result={r} />
        </div>

        <SectionDivider />

        {/* 2. Key Opportunities */}
        <InsightSection
          id="opportunities"
          icon={TrendingUp}
          iconBg="bg-emerald-50 border border-emerald-100"
          iconColor="text-emerald-700"
          title="Key Opportunities"
          subtitle="Strategic opportunities identified by the AI executive team."
          badge={`${r.key_opportunities?.length ?? 0} identified`}
        >
          <OpportunitiesGrid opportunities={r.key_opportunities ?? []} />
        </InsightSection>

        <SectionDivider />

        {/* 3. Critical Risks */}
        <InsightSection
          id="risks"
          icon={ShieldAlert}
          iconBg="bg-red-50 border border-red-100"
          iconColor="text-red-600"
          title="Critical Risks"
          subtitle="Key risks and mitigation strategies for executive consideration."
          badge={`${r.critical_risks?.length ?? 0} identified`}
        >
          <RisksGrid risks={r.critical_risks ?? []} />
        </InsightSection>

        <SectionDivider />

        {/* 4. Market Insights */}
        <InsightSection
          id="market"
          icon={BarChart3}
          iconBg="bg-neutral-100"
          iconColor="text-black"
          title="Market Insights"
          subtitle="Market analysis and competitive intelligence."
        >
          <InsightListCard
            items={r.market_insights ?? []}
            emptyMessage="No market insights returned by the analysis."
          />
        </InsightSection>

        <SectionDivider />

        {/* 5. Financial Insights */}
        <InsightSection
          id="financial"
          icon={DollarSign}
          iconBg="bg-neutral-100"
          iconColor="text-black"
          title="Financial Insights"
          subtitle="Financial analysis and economic considerations."
        >
          <InsightListCard
            items={r.financial_insights ?? []}
            emptyMessage="No financial insights returned by the analysis."
          />
        </InsightSection>

        <SectionDivider />

        {/* 6. Compliance Considerations */}
        <InsightSection
          id="compliance"
          icon={Scale}
          iconBg="bg-burgundy/10"
          iconColor="text-burgundy"
          title="Compliance Considerations"
          subtitle="Legal, regulatory, and compliance factors identified."
        >
          <InsightListCard
            items={r.compliance_considerations ?? []}
            emptyMessage="No compliance considerations returned by the analysis."
          />
        </InsightSection>

        <SectionDivider />

        {/* 7. Strategic Recommendations */}
        <InsightSection
          id="strategy"
          icon={Lightbulb}
          iconBg="bg-black"
          iconColor="text-white"
          title="Strategic Recommendations"
          subtitle="Executive-level strategic recommendations from the AI team."
          badge="Synthesized"
        >
          <InsightListCard
            items={r.strategic_recommendations ?? []}
            emptyMessage="No strategic recommendations returned by the analysis."
            numbered
          />
        </InsightSection>

        <SectionDivider />

        {/* 8. Action Plan */}
        <InsightSection
          id="action-plan"
          icon={CheckSquare}
          iconBg="bg-burgundy"
          iconColor="text-white"
          title="Action Plan"
          subtitle="Executive roadmap with immediate, short-term, and medium-term actions."
        >
          {r.action_plan ? (
            <ActionPlanSection plan={r.action_plan} />
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
              <p className="text-sm text-neutral-400">No action plan returned by the analysis.</p>
            </div>
          )}
        </InsightSection>

        <SectionDivider />

        {/* 9. Recommended KPIs */}
        <InsightSection
          id="kpis"
          icon={Target}
          iconBg="bg-neutral-100"
          iconColor="text-black"
          title="Recommended KPIs"
          subtitle="Key performance indicators to track progress and success."
        >
          <InsightListCard
            items={r.recommended_kpis ?? []}
            emptyMessage="No KPIs recommended by the analysis."
            numbered
          />
        </InsightSection>

        <SectionDivider />

        {/* 10. Agent Insights */}
        <InsightSection
          id="agent-insights"
          icon={Users}
          iconBg="bg-neutral-900"
          iconColor="text-white"
          title="Agent Insights"
          subtitle="Detailed results from each specialized AI agent."
          badge={`${r.agent_results?.length ?? 0} agents`}
        >
          <AgentResultsSection agentResults={r.agent_results ?? []} />
        </InsightSection>

        <SectionDivider />

        {/* 11. Metadata footer */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
            Analysis Metadata
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <MetaField label="Analysis ID" value={r.analysis_id} mono truncate />
            <MetaField label="Business" value={r.business_name} />
            <MetaField label="Status" value={r.overall_status ?? r.status} />
            <MetaField label="Execution Mode" value={r.metadata?.execution_mode ?? '—'} />
            <MetaField label="Agents Completed" value={String(r.metadata?.successful_agents ?? '—')} />
            <MetaField label="Agents Failed" value={String(r.metadata?.failed_agents ?? '—')} />
            {r.created_at && (
              <MetaField
                label="Created At"
                value={new Date(r.created_at).toLocaleString()}
              />
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center justify-between gap-4 pb-8 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={14} />}
            onClick={() => navigate('/workspace')}
          >
            Back to Workspace
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<PlusCircle size={15} />}
            onClick={() => navigate('/new-analysis')}
          >
            Run Another Analysis
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ─────────────────────────────────────────────────────

const SectionDivider: React.FC = () => (
  <div className="border-t border-neutral-100" />
);

const MetaField: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}> = ({ label, value, mono, truncate }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
    <p className={[
      'text-xs font-medium text-neutral-600 mt-0.5',
      mono ? 'font-mono' : '',
      truncate ? 'truncate' : '',
    ].join(' ')}>
      {value}
    </p>
  </div>
);

export default InsightsPage;
