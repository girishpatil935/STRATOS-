import { useState, useCallback } from 'react';
import { createBusinessContext } from '../services/executiveApi';
import { ApiError } from '../services/api';
import type { BusinessContext } from '../types/api';
import type {
  BusinessInfoFields,
  SelectedFile,
  SubmitStatus,
} from '../types/newAnalysis';
import { buildBusinessDescription } from '../types/newAnalysis';

// Allowed MIME types and extensions
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];
const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (matches backend default)

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const EMPTY_BUSINESS_INFO: BusinessInfoFields = {
  businessName: '',
  industry: '',
  productService: '',
  targetCustomer: '',
  revenueOrBudget: '',
  teamSize: '',
  competitors: '',
  goals: '',
  location: '',
  additionalContext: '',
};

export interface UseNewAnalysisReturn {
  // State
  businessInfo: BusinessInfoFields;
  businessQuestion: string;
  selectedFiles: SelectedFile[];
  submitStatus: SubmitStatus;
  errorMessage: string | null;
  businessContext: BusinessContext | null;
  fileErrors: string[];

  // Derived
  businessInfoComplete: boolean;
  questionComplete: boolean;

  // Actions
  setBusinessInfo: (field: keyof BusinessInfoFields, value: string) => void;
  setBusinessQuestion: (value: string) => void;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearError: () => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useNewAnalysis(): UseNewAnalysisReturn {
  const [businessInfo, setBusinessInfoState] = useState<BusinessInfoFields>(EMPTY_BUSINESS_INFO);
  const [businessQuestion, setBusinessQuestion] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [businessContext, setBusinessContext] = useState<BusinessContext | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const setBusinessInfo = useCallback((field: keyof BusinessInfoFields, value: string) => {
    setBusinessInfoState(prev => ({ ...prev, [field]: value }));
  }, []);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const errors: string[] = [];
    const valid: SelectedFile[] = [];

    arr.forEach(file => {
      const ext = getExtension(file.name);
      if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME.includes(file.type)) {
        errors.push(`"${file.name}" — unsupported type. Use PDF, DOCX, or TXT.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}" — file exceeds 10 MB limit.`);
        return;
      }
      valid.push({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: ext || 'unknown',
      });
    });

    setFileErrors(errors);
    setSelectedFiles(prev => {
      // Deduplicate by name
      const existingNames = new Set(prev.map(f => f.name));
      const deduped = valid.filter(f => !existingNames.has(f.name));
      return [...prev, ...deduped];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setSubmitStatus('idle');
  }, []);

  const submit = useCallback(async () => {
    if (!businessQuestion.trim()) return;

    setSubmitStatus('loading');
    setErrorMessage(null);

    try {
      const form = new FormData();

      // Required field
      const trimmedQuestion = businessQuestion.trim();
      form.append('business_question', trimmedQuestion);

      // Optional: assemble structured fields into labeled description
      const description = buildBusinessDescription(businessInfo);
      if (description.trim()) {
        form.append('business_description', description);
      }

      // Optional: attach files
      selectedFiles.forEach(sf => form.append('files', sf.file));

      console.log('[NewAnalysis] Submitting context form with fields:', {
        business_question: trimmedQuestion,
        business_description: description,
        filesCount: selectedFiles.length,
      });

      const response = await createBusinessContext(form);
      console.log('[NewAnalysis] Raw API response received from backend:', response);

      // Extract BusinessContext: handle both { success: true, data: BusinessContext }
      // and direct BusinessContext format if returned
      let contextData: BusinessContext;
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        contextData = response.data as BusinessContext;
      } else if (response && typeof response === 'object' && 'business_question' in response) {
        contextData = response as unknown as BusinessContext;
      } else {
        console.error('[NewAnalysis] Unexpected response format from context endpoint:', response);
        throw new Error('Unexpected response format from backend.');
      }

      console.log('[NewAnalysis] Successfully parsed business context:', contextData);
      setBusinessContext(contextData);
      setSubmitStatus('success');
    } catch (err: unknown) {
      console.error('[NewAnalysis] Failed to prepare business context:', err);
      if (err instanceof ApiError) {
        setErrorMessage(err.detail);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('We couldn\'t prepare this analysis context. Please review the information and try again.');
      }
      setSubmitStatus('error');
    }
  }, [businessInfo, businessQuestion, selectedFiles]);

  const reset = useCallback(() => {
    setBusinessInfoState(EMPTY_BUSINESS_INFO);
    setBusinessQuestion('');
    setSelectedFiles([]);
    setSubmitStatus('idle');
    setErrorMessage(null);
    setBusinessContext(null);
    setFileErrors([]);
  }, []);

  const businessInfoComplete = businessInfo.businessName.trim().length > 0;
  const questionComplete = businessQuestion.trim().length > 0;

  return {
    businessInfo,
    businessQuestion,
    selectedFiles,
    submitStatus,
    errorMessage,
    businessContext,
    fileErrors,
    businessInfoComplete,
    questionComplete,
    setBusinessInfo,
    setBusinessQuestion,
    addFiles,
    removeFile,
    clearError,
    submit,
    reset,
  };
}
