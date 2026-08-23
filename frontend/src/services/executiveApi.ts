// ============================================================
// Executive_AI — Domain API methods
// Wraps the base client with typed, domain-specific calls.
// Strictly follows docs/FRONTEND_API_CONTRACT.md.
// ============================================================

import { apiGet, apiPost, apiPostForm } from './api';
import type {
  RootResponse,
  HealthResponse,
  BusinessContext,
  CreateContextResponse,
  AnalysisResponse,
  RunAnalysisRequest,
} from '../types/api';

// --------------- Health & Status --------------------------

/** GET /  — lightweight service availability check */
export async function checkRoot(): Promise<RootResponse> {
  return apiGet<RootResponse>('/');
}

/** GET /api/v1/health  — readiness / health display */
export async function checkHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/api/v1/health');
}

// --------------- Context ----------------------------------

/**
 * POST /api/v1/research/context
 *
 * Normalizes the user's business input and uploaded documents.
 * Content-Type is multipart/form-data — do NOT set it manually.
 *
 * Required field: `business_question`
 * Optional fields: `business_description`, `files` (PDF / DOCX / TXT)
 */
export async function createBusinessContext(
  formData: FormData
): Promise<CreateContextResponse> {
  return apiPostForm<CreateContextResponse>('/api/v1/research/context', formData);
}

// --------------- Analysis ---------------------------------

/**
 * POST /api/v1/analysis/run
 *
 * Idempotent analysis request. If an analysis for this context already exists,
 * returns the existing workflow instead of calling Gemini again.
 */
export async function runAnalysis(
  businessName: string,
  context: BusinessContext
): Promise<AnalysisResponse> {
  const request: RunAnalysisRequest = { business_name: businessName, context };
  return apiPost<AnalysisResponse>('/api/v1/analysis/run', request);
}

/**
 * POST /api/v1/analysis/new
 *
 * Explicitly starts a brand-new analysis workflow, bypassing previous context locks.
 */
export async function createNewAnalysis(
  businessName: string,
  context: BusinessContext
): Promise<AnalysisResponse> {
  const request: RunAnalysisRequest = { business_name: businessName, context };
  return apiPost<AnalysisResponse>('/api/v1/analysis/new', request);
}

/**
 * GET /api/v1/analysis/{analysisId}
 *
 * Retrieves an existing workflow by ID without calling Gemini.
 */
export async function getAnalysis(analysisId: string): Promise<AnalysisResponse> {
  return apiGet<AnalysisResponse>(`/api/v1/analysis/${analysisId}`);
}

/**
 * POST /api/v1/analysis/{analysisId}/retry-failed
 *
 * Retries ONLY failed agents for an existing workflow without re-running successful agents.
 */
export async function retryFailedAgents(analysisId: string): Promise<AnalysisResponse> {
  return apiPost<AnalysisResponse>(`/api/v1/analysis/${analysisId}/retry-failed`, {});
}
