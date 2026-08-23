import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, ArrowRight } from 'lucide-react';
import { useAnalysisStore } from '../context/AnalysisStore';
import { Button } from '../components/ui/Button';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { analysisResult } = useAnalysisStore();

  if (!analysisResult) {
    return (
      <div className="min-h-full bg-white px-6 md:px-10 py-14">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto">
            <FileText size={20} className="text-neutral-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">No Reports Yet</h1>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              Complete an analysis to generate your executive intelligence report.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<PlusCircle size={15} />}
            onClick={() => navigate('/new-analysis')}
          >
            Start New Analysis
          </Button>
        </div>
      </div>
    );
  }

  const r = analysisResult;
  const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : 'Today';

  return (
    <div className="min-h-full bg-white px-6 md:px-10 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
            <FileText size={17} className="text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-black">Reports</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Your completed executive analyses</p>
          </div>
        </div>

        {/* Report card */}
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200">
          {/* Status bar */}
          <div className={[
            'h-1',
            r.status === 'completed' ? 'bg-emerald-500' :
            r.status === 'partial'   ? 'bg-amber-400'   :
            'bg-red-400',
          ].join(' ')} />

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={[
                    'text-[10px] font-bold uppercase tracking-widest',
                    r.status === 'completed' ? 'text-emerald-600' :
                    r.status === 'partial'   ? 'text-amber-600'   :
                    'text-red-600',
                  ].join(' ')}>
                    {r.status}
                  </span>
                  <span className="text-neutral-200">·</span>
                  <span className="text-[10px] text-neutral-400">{date}</span>
                </div>
                <h2 className="text-lg font-bold text-black">{r.business_name}</h2>
                <p className="text-xs text-neutral-400 font-mono mt-1">{r.analysis_id}</p>

                {r.executive_summary && (
                  <p className="text-sm text-neutral-600 mt-3 leading-relaxed line-clamp-2">
                    {r.executive_summary}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <span className="text-xs text-neutral-500">
                    <strong className="text-black">{r.key_opportunities?.length ?? 0}</strong> opportunities
                  </span>
                  <span className="text-xs text-neutral-500">
                    <strong className="text-black">{r.critical_risks?.length ?? 0}</strong> risks
                  </span>
                  <span className="text-xs text-neutral-500">
                    <strong className="text-black">{r.metadata.successful_agents}</strong> agents completed
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight size={15} />}
                iconPosition="right"
                onClick={() => navigate('/insights')}
              >
                View Report
              </Button>
            </div>
          </div>
        </div>

        {/* Start another */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/new-analysis')}
            className="text-xs text-neutral-400 hover:text-black transition-colors font-medium underline underline-offset-2"
          >
            Run another analysis →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
