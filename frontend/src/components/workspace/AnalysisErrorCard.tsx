import React from 'react';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface AnalysisErrorCardProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

export const AnalysisErrorCard: React.FC<AnalysisErrorCardProps> = ({
  message,
  onRetry,
  onBack,
}) => (
  <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden animate-fade-in">
    <div className="px-6 py-8 flex flex-col items-center text-center gap-5">
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
        <AlertCircle size={22} className="text-neutral-500" />
      </div>

      <div className="max-w-md">
        <p className="text-base font-bold text-black">Analysis could not be completed.</p>
        <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Button
          variant="primary"
          size="md"
          icon={<RotateCcw size={15} />}
          iconPosition="left"
          onClick={onRetry}
        >
          Retry Analysis
        </Button>
        <Button
          variant="ghost"
          size="md"
          icon={<ArrowLeft size={15} />}
          iconPosition="left"
          onClick={onBack}
        >
          Return to Form
        </Button>
      </div>

      <p className="text-[11px] text-neutral-400 max-w-sm leading-relaxed">
        Make sure the Executive_AI backend is running at{' '}
        <code className="font-mono bg-neutral-100 px-1 rounded text-[10px]">
          http://127.0.0.1:8000
        </code>{' '}
        and that the backend environment is correctly configured.
      </p>
    </div>
  </div>
);

export default AnalysisErrorCard;
