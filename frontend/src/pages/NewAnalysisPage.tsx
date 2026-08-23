import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, PlusCircle } from 'lucide-react';

import { useNewAnalysis } from '../hooks/useNewAnalysis';
import { StepIndicator } from '../components/newanalysis/StepIndicator';
import { BusinessInfoSection } from '../components/newanalysis/BusinessInfoSection';
import { ObjectiveSection } from '../components/newanalysis/ObjectiveSection';
import { AdditionalContextSection } from '../components/newanalysis/AdditionalContextSection';
import { DocumentUpload } from '../components/newanalysis/DocumentUpload';
import { ReviewPanel } from '../components/newanalysis/ReviewPanel';
import { ContextReadyCard } from '../components/newanalysis/ContextReadyCard';
import { Button } from '../components/ui/Button';

import { useAnalysisStore } from '../context/AnalysisStore';

const NewAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useAnalysisStore();
  const [showValidation, setShowValidation] = useState(false);

  const {
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
  } = useNewAnalysis();

  const canSubmit = businessInfoComplete && questionComplete;
  const isLoading = submitStatus === 'loading';
  const isSuccess = submitStatus === 'success';

  const handleSubmit = async () => {
    if (!canSubmit) {
      setShowValidation(true);
      // Scroll to first error
      setTimeout(() => {
        document.getElementById('field-businessName')?.scrollIntoView({
          behavior: 'smooth', block: 'center',
        });
      }, 100);
      return;
    }
    setShowValidation(false);
    await submit();
  };

  const handleContinueToWorkspace = () => {
    const bizName = businessInfo.businessName.trim() || 'My Business';
    store.resetStore();
    if (businessContext) {
      store.setBusinessContext(businessContext);
    }
    store.setBusinessName(bizName);
    // Pass context via location state and store
    navigate('/workspace', {
      state: {
        businessContext,
        businessName: bizName,
      },
    });
  };

  // ── Completed step tracking ────────────────────────────────
  const completedSteps: Array<'context' | 'documents' | 'review' | 'analysis'> = [];
  if (businessInfoComplete && questionComplete) completedSteps.push('context');
  if (selectedFiles.length > 0) completedSteps.push('documents');
  if (isSuccess) completedSteps.push('review');

  const currentStep: 'context' | 'documents' | 'review' | 'analysis' =
    isSuccess ? 'analysis' :
    (businessInfoComplete && questionComplete) ? 'review' :
    'context';

  return (
    <div className="min-h-full bg-white">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="border-b border-neutral-200 px-6 md:px-10 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-burgundy flex items-center justify-center flex-shrink-0 mt-0.5">
              <PlusCircle size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-black tracking-tight">
                Create a New Analysis
              </h1>
              <p className="text-sm text-neutral-500 mt-1 max-w-xl leading-relaxed">
                Provide your business context and objectives. STRATOS will prepare your
                information for analysis by its specialized AI team.
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator current={currentStep} completed={completedSteps} />
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-8">
        {isSuccess && businessContext ? (
          /* ── Success state ───────────────────────────────── */
          <ContextReadyCard
            context={businessContext}
            businessName={businessInfo.businessName.trim() || 'Your Business'}
            onReset={reset}
            onContinue={handleContinueToWorkspace}
          />
        ) : (
          /* ── Form + sidebar ──────────────────────────────── */
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* ── Left: form ───────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-10">

              {/* Section divider helper */}
              {/* ─── 1. Business Information ─────────────── */}
              <FormSection number="01">
                <BusinessInfoSection
                  values={businessInfo}
                  onChange={setBusinessInfo}
                  showValidation={showValidation}
                />
              </FormSection>

              <Divider />

              {/* ─── 2. Analysis Objective ───────────────── */}
              <FormSection number="02">
                <ObjectiveSection
                  value={businessQuestion}
                  onChange={setBusinessQuestion}
                  showValidation={showValidation}
                />
              </FormSection>

              <Divider />

              {/* ─── 3. Additional Context ───────────────── */}
              <FormSection number="03">
                <AdditionalContextSection
                  value={businessInfo.additionalContext}
                  onChange={v => setBusinessInfo('additionalContext', v)}
                />
              </FormSection>

              <Divider />

              {/* ─── 4. Document Upload ──────────────────── */}
              <FormSection number="04">
                <DocumentUpload
                  files={selectedFiles}
                  onAdd={addFiles}
                  onRemove={removeFile}
                  fileErrors={fileErrors}
                />
              </FormSection>

              {/* ─── Error state ─────────────────────────── */}
              {submitStatus === 'error' && errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <AlertCircle size={16} className="text-burgundy flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-black">Context preparation failed</p>
                    <p className="text-sm text-neutral-500 mt-0.5">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={clearError}
                      className="mt-2 text-xs font-medium text-black underline underline-offset-2 hover:text-burgundy transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* ─── Primary action ──────────────────────── */}
              <div className="flex items-center gap-4 pt-2 pb-8">
                <Button
                  id="submit-context-btn"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? 'Preparing your business context…' : 'Prepare Analysis Context'}
                </Button>

                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing your information…</span>
                  </div>
                )}
              </div>

              {/* Required field note */}
              {showValidation && !canSubmit && (
                <p className="text-xs text-burgundy font-medium -mt-4 pb-4">
                  Please fill in all required fields before continuing.
                </p>
              )}
            </div>

            {/* ── Right: sticky review panel ───────────── */}
            <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-4">
                <ReviewPanel
                  businessInfo={businessInfo}
                  businessQuestion={businessQuestion}
                  selectedFiles={selectedFiles}
                  businessInfoComplete={businessInfoComplete}
                  questionComplete={questionComplete}
                />

                {/* Tip card */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                    Tip
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    The more specific your strategic question, the more targeted the agent
                    insights will be. Include constraints, timeline, and budget context where
                    relevant.
                  </p>
                </div>

                {/* Backend note */}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
                    About Document Processing
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    PDF, DOCX, and TXT files are processed server-side and combined with your
                    business context. Files exceeding 10 MB will be rejected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Helper sub-components ──────────────────────────────── */

const FormSection: React.FC<{ number: string; children: React.ReactNode }> = ({
  number,
  children,
}) => (
  <div className="flex gap-5">
    <div className="flex-shrink-0 w-7 pt-1">
      <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
        {number}
      </span>
    </div>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

const Divider: React.FC = () => (
  <div className="border-t border-neutral-100" />
);

export default NewAnalysisPage;
