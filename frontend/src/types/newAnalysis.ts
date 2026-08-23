// ============================================================
// Frontend-only form state types for the New Analysis workflow.
// These are NOT sent to the backend directly — they are assembled
// into business_description / business_question before the API call.
// ============================================================

/** All structured fields the user fills out in the business info section */
export interface BusinessInfoFields {
  businessName: string;       // Used as business_name in analysis run
  industry: string;
  productService: string;
  targetCustomer: string;
  revenueOrBudget: string;
  teamSize: string;
  competitors: string;
  goals: string;
  location: string;
  additionalContext: string;  // free-form extra context
}

/** The core analysis question — maps to business_question */
export type BusinessQuestion = string;

/** A selected file held in local state before upload */
export interface SelectedFile {
  id: string;           // random uuid for list key
  file: File;
  name: string;
  size: number;
  type: string;         // MIME type
  extension: string;    // 'pdf' | 'docx' | 'txt'
}

/** Step IDs for the workflow progress indicator */
export type AnalysisStep = 'context' | 'documents' | 'review' | 'analysis';

/** Overall form submission state */
export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

/** Aggregated state for the whole New Analysis flow */
export interface NewAnalysisState {
  step: AnalysisStep;
  businessInfo: BusinessInfoFields;
  businessQuestion: BusinessQuestion;
  selectedFiles: SelectedFile[];
  submitStatus: SubmitStatus;
  errorMessage: string | null;
}

/** Builds the labeled business_description string sent to the backend */
export function buildBusinessDescription(info: BusinessInfoFields): string {
  const lines: string[] = [];
  if (info.industry)         lines.push(`Industry: ${info.industry}`);
  if (info.productService)   lines.push(`Product / Service: ${info.productService}`);
  if (info.targetCustomer)   lines.push(`Target Customer: ${info.targetCustomer}`);
  if (info.revenueOrBudget)  lines.push(`Revenue / Budget: ${info.revenueOrBudget}`);
  if (info.teamSize)         lines.push(`Team Size: ${info.teamSize}`);
  if (info.competitors)      lines.push(`Key Competitors: ${info.competitors}`);
  if (info.goals)            lines.push(`Goals: ${info.goals}`);
  if (info.location)         lines.push(`Location / Market: ${info.location}`);
  if (info.additionalContext) lines.push(`Additional Context:\n${info.additionalContext}`);
  return lines.join('\n');
}
