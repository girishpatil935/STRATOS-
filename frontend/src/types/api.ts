// ============================================================
// Executive_AI – API Type Definitions
// Strictly matches docs/FRONTEND_API_CONTRACT.md — do not add
// fields that are not documented in the backend contract.
// ============================================================

// --------------- Health / Root ----------------------------

export interface RootResponse {
  name: string;
  status: string;
  message: string;
}

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
}

// --------------- Context ----------------------------------

export interface DocumentResult {
  filename: string;
  file_type: string;
  character_count: number;
  extracted_characters: number;
  extraction_status: 'success' | 'failed';
  preview: string;
  truncated: boolean;
  error: string | null;
}

export interface ContextMetadata {
  number_of_documents: number;
  successful_documents: number;
  failed_documents: number;
  total_character_count: number;
  truncated_documents: number;
}

/** The `data` object returned by POST /api/v1/research/context */
export interface BusinessContext {
  business_question: string;
  business_description: string;
  documents: DocumentResult[];
  combined_context: string;
  metadata: ContextMetadata;
}

export interface CreateContextResponse {
  success: boolean;
  message: string;
  data: BusinessContext;
}

// --------------- Analysis ---------------------------------

export interface KeyOpportunity {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CriticalRisk {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface ActionPlan {
  immediate_actions: string[];
  short_term_actions: string[];
  medium_term_strategy: string[];
}

export interface AgentResult {
  agent_name: string;
  status: 'completed' | 'failed' | 'skipped' | 'not_started';
  summary: string;
  insights: string[];
  recommendations: string[];
  risks: string[];
  assumptions: string[];
  confidence: number | null;
  error: string | null;
}

export interface AnalysisMetadata {
  execution_mode: string;
  successful_agents: number;
  failed_agents: number;
}

export interface AnalysisResponse {
  workflow_id: string;
  analysis_id: string;
  business_name: string;
  status:
    | 'CREATED'
    | 'RUNNING'
    | 'COMPLETED'
    | 'PARTIAL'
    | 'FAILED'
    | 'QUOTA_EXHAUSTED'
    | 'completed'
    | 'partial'
    | 'failed'
    | 'quota_exceeded'
    | 'pending'
    | 'running';
  overall_status: string;
  context_metadata: ContextMetadata;
  business_summary: string;
  executive_summary: string;
  key_opportunities: KeyOpportunity[];
  critical_risks: CriticalRisk[];
  market_insights: string[];
  financial_insights: string[];
  compliance_considerations: string[];
  strategic_recommendations: string[];
  action_plan: ActionPlan;
  recommended_kpis: string[];
  assumptions: string[];
  agent_results: AgentResult[];
  created_at: string;
  metadata: AnalysisMetadata;
}

// --------------- Requests ---------------------------------

export interface RunAnalysisRequest {
  business_name: string;
  context: BusinessContext;
}

// --------------- API Error --------------------------------

export interface ApiErrorDetail {
  detail: string;
}
