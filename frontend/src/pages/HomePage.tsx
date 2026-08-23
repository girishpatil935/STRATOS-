import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Upload,
  BrainCircuit,
  BarChart2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeading } from '../components/ui/SectionHeading';
import { AgentCard, AGENTS } from '../components/executive/AgentCard';

// ---- Workflow steps ----
const steps = [
  {
    number: '01',
    icon: <FileText size={20} className="text-black" />,
    title: 'Provide Business Context',
    description:
      'Describe your business, strategic challenge, team, market, and goals in a guided form.',
  },
  {
    number: '02',
    icon: <Upload size={20} className="text-black" />,
    title: 'Add Supporting Documents',
    description:
      'Optionally upload PDF, DOCX, or TXT files — financial reports, strategy decks, or market data.',
  },
  {
    number: '03',
    icon: <BrainCircuit size={20} className="text-burgundy" />,
    title: 'AI Agents Analyze',
    description:
      'Six specialized AI agents run sequentially — each tackling a distinct domain of your challenge.',
  },
  {
    number: '04',
    icon: <BarChart2 size={20} className="text-burgundy" />,
    title: 'Receive Executive Insights',
    description:
      'Get a structured executive report: opportunities, risks, strategy, action plan, and KPIs.',
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full bg-white">

      {/* ===================== HERO ===================== */}
      <section className="relative px-8 pt-16 pb-14 border-b border-neutral-200 overflow-hidden">
        {/* Minimal geometric accent — top-right corner block */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top right, rgba(96,10,28,0.06) 0%, transparent 65%)',
          }}
        />

        <div className="relative max-w-3xl animate-fade-in">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-neutral-100 border border-neutral-200 mb-7">
            <Sparkles size={11} className="text-burgundy" />
            <span className="text-xs font-semibold text-neutral-600 tracking-wide">
              AI-Powered Executive Decision Support
            </span>
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-black mb-5">
            Executive Intelligence,{' '}
            <span className="text-burgundy">Powered by AI.</span>
          </h1>

          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mb-9">
            Give STRATOS a complete view of your business and receive structured
            insights from a team of specialized AI agents — covering research, market,
            finance, risk, legal, and strategy.
          </p>

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant="primary"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
              onClick={() => navigate('/new-analysis')}
            >
              Start New Analysis
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How It Works
            </Button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative flex flex-wrap gap-8 mt-14 pt-8 border-t border-neutral-100">
          {[
            { value: '6',        label: 'Specialized AI Agents' },
            { value: 'PDF/DOCX', label: 'Document Support'      },
            { value: 'Full',     label: 'Executive Report'      },
            { value: 'Instant',  label: 'Structured Insights'   },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <span className="text-xl font-bold text-black">{stat.value}</span>
              <span className="text-xs text-neutral-400 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section id="how-it-works" className="px-8 py-14 bg-white">
        <SectionHeading
          eyebrow="Workflow"
          title="How STRATOS Works"
          subtitle="A four-step process from business context to actionable executive insights."
          className="mb-10"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="hidden lg:block absolute top-5 left-[calc(100%+2px)] h-px border-t border-dashed border-neutral-200 z-10"
                  style={{ width: 'calc(100% - 2.5rem)' }}
                />
              )}
              <Card variant="warm" padding="md" className="h-full hover:border-neutral-300 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                    Step {step.number}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-black mb-1.5">{step.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{step.description}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* =================== AGENT PREVIEW =================== */}
      <section className="px-8 pb-14 bg-white">
        <div className="flex items-end justify-between mb-8">
          <SectionHeading
            eyebrow="The AI Team"
            title="Six Specialized Agents"
            subtitle="Each agent is an expert in its domain, working sequentially to cover every angle."
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight size={14} />}
            iconPosition="right"
            onClick={() => navigate('/new-analysis')}
            className="hidden sm:flex"
          >
            Start Analysis
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent) => (
            <AgentCard key={agent.key} agent={agent} status="idle" />
          ))}
        </div>

        {/* CTA ribbon — black background with burgundy CTA */}
        <div className="mt-8 rounded-2xl bg-black px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-base">Ready to run your first analysis?</p>
            <p className="text-neutral-400 text-sm mt-0.5">
              Provide your business context and let the agents get to work.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            onClick={() => navigate('/new-analysis')}
            className="whitespace-nowrap"
          >
            New Analysis
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
