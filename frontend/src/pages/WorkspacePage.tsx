import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, AlertTriangle, RotateCcw, PlusCircle } from 'lucide-react';

import type { BusinessContext } from '../types/api';
import { AGENTS } from '../components/executive/AgentCard';
import { useRunAnalysis } from '../hooks/useRunAnalysis';
import { useAnalysisStore } from '../context/AnalysisStore';

import { OverallStatusBar } from '../components/workspace/OverallStatusBar';
import { AgentOrchestrationCard } from '../components/workspace/AgentOrchestrationCard';
import { AnalysisCompleteCard } from '../components/workspace/AnalysisCompleteCard';
import { AnalysisErrorCard } from '../components/workspace/AnalysisErrorCard';
import { Button } from '../components/ui/Button';

interface WorkspaceLocationState {
  businessContext?: BusinessContext;
  businessName?: string;
}

const WorkspacePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useAnalysisStore();

  // Read context passed from NewAnalysisPage via router state
  const locationState = (location.state ?? {}) as WorkspaceLocationState;
  const incomingContext = locationState.businessContext ?? null;
  const incomingBizName = locationState.businessName ?? '';

  const businessContext = incomingContext ?? store.businessContext;
  const businessName = incomingBizName || store.businessName || 'Your Business';

  const {
    agentStates,
    orchestratorStatus,
    elapsedSeconds,
    analysisResult,
    errorMessage,
    startAnalysis,
    retryFailedOnly,
  } = useRunAnalysis();

  // Save to store whenever we get a real result
  useEffect(() => {
    if (analysisResult) {
      store.setAnalysisResult(analysisResult);
    }
  }, [analysisResult, store]);

  // Store incoming context + name
  useEffect(() => {
    if (incomingContext) store.setBusinessContext(incomingContext);
    if (incomingBizName) store.setBusinessName(incomingBizName);
  }, [incomingContext, incomingBizName, store]);

  // Auto-start only when context exists, no store result exists, and state is idle
  useEffect(() => {
    if (businessContext && orchestratorStatus === 'idle' && !store.analysisResult) {
      startAnalysis(businessName, businessContext);
    }
  }, [businessContext, orchestratorStatus, store.analysisResult, businessName, startAnalysis]);

  const isRunning = orchestratorStatus === 'connecting' || orchestratorStatus === 'running';
  const isDone = ['complete', 'partial', 'failed', 'quota_exceeded'].includes(orchestratorStatus);
  const isError = orchestratorStatus === 'error' || orchestratorStatus === 'quota_exceeded';
  const hasFailedAgents =
    analysisResult?.agent_results.some(a => a.status === 'failed') ?? false;

  const handleViewInsights = () => {
    navigate('/insights');
  };

  const handleNewAnalysis = () => {
    store.resetStore();
    navigate('/new-analysis');
  };

  const handleRetryFailed = () => {
    retryFailedOnly();
  };

  // ── No-context fallback ─────────────────────────────────────────
  if (!businessContext && orchestratorStatus === 'idle' && !store.analysisResult) {
    return (
      <div className="min-h-full bg-white px-6 md:px-10 py-14">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto">
            <BrainCircuit size={22} className="text-neutral-400" />
          </div>
          <h1 className="text-xl font-bold text-black">No Analysis Context Found</h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Please start from the New Analysis page to provide your business context before running an analysis.
          </p>
          <Button variant="primary" size="md" onClick={handleNewAnalysis}>
            Start New Analysis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="border-b border-neutral-200 px-6 md:px-10 py-7">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                <BrainCircuit size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-black tracking-tight">
                  {isDone
                    ? 'Executive Analysis Complete'
                    : 'Executive Analysis in Progress'}
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  {isDone
                    ? `The AI executive team has completed its analysis for ${businessName}.`
                    : `Our specialized AI team is analyzing ${businessName}'s business context and strategic objective.`}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<PlusCircle size={14} />}
                disabled={isRunning}
                onClick={handleNewAnalysis}
              >
                Start New Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 space-y-6">

        {/* Quota Exceeded Banner */}
        {orchestratorStatus === 'quota_exceeded' && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-burgundy flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black">Gemini API Quota Exhausted</p>
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                Gemini API quota is currently exhausted. Please try again later or start a new analysis after the quota resets.
              </p>
              <div className="flex items-center gap-3 mt-3">
                {hasFailedAgents && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<RotateCcw size={14} />}
                    onClick={handleRetryFailed}
                  >
                    Retry Failed Agents
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={handleNewAnalysis}>
                  Start New Analysis
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Overall status bar */}
        <OverallStatusBar
          status={orchestratorStatus}
          elapsedSeconds={elapsedSeconds}
          businessName={businessName}
          successfulAgents={analysisResult?.metadata.successful_agents}
          failedAgents={analysisResult?.metadata.failed_agents}
          totalAgents={6}
        />

        {/* ── Agent orchestration grid ─────────────────────────── */}
        <div>
          {/* Section label */}
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              AI Agent Team
            </p>
            <div className="flex-1 h-px bg-neutral-100" />
            <p className="text-[10px] text-neutral-300 font-medium">
              {agentStates.filter(a => a.displayStatus === 'completed').length} / {AGENTS.length} completed
            </p>
          </div>

          {/* 3-column grid on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AGENTS.map(agent => {
              const state = agentStates.find(s => s.key === agent.key)!;
              return (
                <AgentOrchestrationCard
                  key={agent.key}
                  agent={agent}
                  state={state}
                />
              );
            })}
          </div>
        </div>

        {/* ── Completion / error cards ──────────────────────────── */}
        {(isDone || isError) && (
          <div>
            {isError && errorMessage && orchestratorStatus !== 'quota_exceeded' ? (
              <AnalysisErrorCard
                message={errorMessage}
                onRetry={handleRetryFailed}
                onBack={handleNewAnalysis}
              />
            ) : analysisResult ? (
              <AnalysisCompleteCard
                result={analysisResult}
                onViewInsights={handleViewInsights}
                onNewAnalysis={handleNewAnalysis}
              />
            ) : null}
          </div>
        )}

        {/* ── Orchestration status notice (while running) ──────── */}
        {isRunning && (
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 px-5 py-4">
            <p className="text-xs font-semibold text-black mb-0.5">
              STRATOS is coordinating your analysis
            </p>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Agents execute strictly sequentially. Exactly one agent executes at a time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspacePage;
