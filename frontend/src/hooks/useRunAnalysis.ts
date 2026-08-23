import { useState, useEffect, useRef, useCallback } from 'react';
import { runAnalysis, createNewAnalysis, retryFailedAgents, getAnalysis } from '../services/executiveApi';
import { ApiError } from '../services/api';
import type { BusinessContext, AnalysisResponse, AgentResult } from '../types/api';
import { AGENTS, type AgentKey } from '../components/executive/AgentCard';

export type OrchestratorStatus =
  | 'idle'
  | 'connecting'
  | 'running'
  | 'complete'
  | 'partial'
  | 'failed'
  | 'quota_exceeded'
  | 'error';

export type AgentDisplayStatus = 'waiting' | 'analyzing' | 'completed' | 'failed' | 'skipped';

export interface AgentDisplayState {
  key: AgentKey;
  displayStatus: AgentDisplayStatus;
  result: AgentResult | null;
}

const AGENT_SEQUENCE_DELAY_MS = 1800;

function matchAgentResult(key: AgentKey, results: AgentResult[]): AgentResult | null {
  const nameMap: Record<AgentKey, string[]> = {
    research: ['research'],
    market:   ['market'],
    finance:  ['finance'],
    risk:     ['risk'],
    legal:    ['legal', 'compliance'],
    strategy: ['strategy'],
  };
  const keywords = nameMap[key];
  return (
    results.find(r =>
      keywords.some(kw => r.agent_name.toLowerCase().includes(kw))
    ) ?? null
  );
}

export interface UseRunAnalysisReturn {
  agentStates: AgentDisplayState[];
  orchestratorStatus: OrchestratorStatus;
  elapsedSeconds: number;
  analysisResult: AnalysisResponse | null;
  errorMessage: string | null;
  startAnalysis: (businessName: string, context: BusinessContext) => Promise<void>;
  startNewAnalysis: (businessName: string, context: BusinessContext) => Promise<void>;
  retryFailedOnly: () => Promise<void>;
  fetchExistingAnalysis: (analysisId: string) => Promise<void>;
}

export function useRunAnalysis(): UseRunAnalysisReturn {
  const initialAgentStates: AgentDisplayState[] = AGENTS.map(a => ({
    key: a.key,
    displayStatus: 'waiting',
    result: null,
  }));

  const [agentStates, setAgentStates] = useState<AgentDisplayState[]>(initialAgentStates);
  const [orchestratorStatus, setOrchestratorStatus] = useState<OrchestratorStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for cleanup
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastParamsRef = useRef<{ businessName: string; context: BusinessContext } | null>(null);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    animTimers.current.forEach(t => clearTimeout(t));
    animTimers.current = [];
  };

  // Elapsed timer
  useEffect(() => {
    if (orchestratorStatus === 'running' || orchestratorStatus === 'connecting') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [orchestratorStatus]);

  const startAnimation = useCallback(() => {
    AGENTS.forEach((agent, idx) => {
      const t = setTimeout(() => {
        setAgentStates(prev =>
          prev.map(a =>
            a.key === agent.key && a.displayStatus === 'waiting'
              ? { ...a, displayStatus: 'analyzing' }
              : a
          )
        );
      }, AGENT_SEQUENCE_DELAY_MS * idx);
      animTimers.current.push(t);
    });
  }, []);

  const applyRealResults = useCallback((response: AnalysisResponse) => {
    setAgentStates(
      AGENTS.map(agent => {
        const realResult = matchAgentResult(agent.key, response.agent_results);
        const displayStatus: AgentDisplayStatus =
          realResult?.status === 'completed' ? 'completed' :
          realResult?.status === 'failed'    ? 'failed'    :
          realResult?.status === 'skipped'   ? 'skipped'   :
          'waiting';
        return { key: agent.key, displayStatus, result: realResult };
      })
    );

    const normStatus = response.status.toLowerCase();
    if (normStatus === 'completed') {
      setOrchestratorStatus('complete');
    } else if (normStatus === 'partial') {
      setOrchestratorStatus('partial');
    } else if (normStatus === 'quota_exceeded') {
      setOrchestratorStatus('quota_exceeded');
      setErrorMessage(
        'Gemini API quota is currently exhausted. Please try again later or start a new analysis after the quota resets.'
      );
    } else {
      setOrchestratorStatus('failed');
    }
  }, []);

  const startAnalysis = useCallback(async (
    businessName: string,
    context: BusinessContext
  ) => {
    lastParamsRef.current = { businessName, context };
    clearTimers();

    setOrchestratorStatus('connecting');
    const connectDelay = setTimeout(() => {
      setOrchestratorStatus('running');
      startAnimation();
    }, 500);
    animTimers.current.push(connectDelay);

    try {
      const response = await runAnalysis(businessName, context);
      clearTimers();
      setAnalysisResult(response);
      applyRealResults(response);
    } catch (err) {
      clearTimers();
      setAgentStates(prev =>
        prev.map(a =>
          a.displayStatus === 'analyzing' || a.displayStatus === 'waiting'
            ? { ...a, displayStatus: 'failed' }
            : a
        )
      );
      if (err instanceof ApiError) {
        setErrorMessage(err.detail);
      } else {
        setErrorMessage(
          'Analysis could not be completed. Please check that the backend is running and try again.'
        );
      }
      setOrchestratorStatus('error');
    }
  }, [startAnimation, applyRealResults]);

  const startNewAnalysis = useCallback(async (
    businessName: string,
    context: BusinessContext
  ) => {
    lastParamsRef.current = { businessName, context };
    clearTimers();
    setAgentStates(initialAgentStates);
    setAnalysisResult(null);
    setErrorMessage(null);
    setElapsedSeconds(0);
    setOrchestratorStatus('connecting');

    const connectDelay = setTimeout(() => {
      setOrchestratorStatus('running');
      startAnimation();
    }, 500);
    animTimers.current.push(connectDelay);

    try {
      const response = await createNewAnalysis(businessName, context);
      clearTimers();
      setAnalysisResult(response);
      applyRealResults(response);
    } catch (err) {
      clearTimers();
      setAgentStates(prev =>
        prev.map(a =>
          a.displayStatus === 'analyzing' || a.displayStatus === 'waiting'
            ? { ...a, displayStatus: 'failed' }
            : a
        )
      );
      if (err instanceof ApiError) {
        setErrorMessage(err.detail);
      } else {
        setErrorMessage('Analysis creation failed. Please try again.');
      }
      setOrchestratorStatus('error');
    }
  }, [startAnimation, applyRealResults]);

  const retryFailedOnly = useCallback(async () => {
    const activeId = analysisResult?.workflow_id || analysisResult?.analysis_id;
    if (!activeId) return;

    clearTimers();
    setOrchestratorStatus('running');
    setErrorMessage(null);

    try {
      const response = await retryFailedAgents(activeId);
      clearTimers();
      setAnalysisResult(response);
      applyRealResults(response);
    } catch (err) {
      clearTimers();
      if (err instanceof ApiError) {
        setErrorMessage(err.detail);
      } else {
        setErrorMessage('Retry failed. Please check network connection and try again.');
      }
      setOrchestratorStatus('error');
    }
  }, [analysisResult, applyRealResults]);

  const fetchExistingAnalysis = useCallback(async (analysisId: string) => {
    try {
      const response = await getAnalysis(analysisId);
      setAnalysisResult(response);
      applyRealResults(response);
    } catch (err) {
      console.warn('Failed to fetch existing analysis by ID:', err);
    }
  }, [applyRealResults]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), []);

  return {
    agentStates,
    orchestratorStatus,
    elapsedSeconds,
    analysisResult,
    errorMessage,
    startAnalysis,
    startNewAnalysis,
    retryFailedOnly,
    fetchExistingAnalysis,
  };
}
