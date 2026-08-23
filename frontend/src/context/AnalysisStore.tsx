import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AnalysisResponse, BusinessContext } from '../types/api';

// ============================================================
// Lightweight Analysis Store — React Context
// Holds the final AnalysisResponse across navigation so Prompt 4
// can read the full result from any route without prop drilling.
// ============================================================

interface AnalysisStoreValue {
  analysisResult: AnalysisResponse | null;
  setAnalysisResult: (result: AnalysisResponse | null) => void;
  businessContext: BusinessContext | null;
  setBusinessContext: (ctx: BusinessContext | null) => void;
  businessName: string;
  setBusinessName: (name: string) => void;
  resetStore: () => void;
}

const AnalysisStoreContext = createContext<AnalysisStoreValue | null>(null);

export const AnalysisStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [businessContext, setBusinessContext] = useState<BusinessContext | null>(null);
  const [businessName, setBusinessName] = useState<string>('');

  const stableSetResult = useCallback(
    (r: AnalysisResponse | null) => setAnalysisResult(r),
    []
  );
  const stableSetContext = useCallback(
    (c: BusinessContext | null) => setBusinessContext(c),
    []
  );
  const stableSetName = useCallback((n: string) => setBusinessName(n), []);
  const resetStore = useCallback(() => {
    setAnalysisResult(null);
    setBusinessContext(null);
    setBusinessName('');
  }, []);

  return (
    <AnalysisStoreContext.Provider
      value={{
        analysisResult,
        setAnalysisResult: stableSetResult,
        businessContext,
        setBusinessContext: stableSetContext,
        businessName,
        setBusinessName: stableSetName,
        resetStore,
      }}
    >
      {children}
    </AnalysisStoreContext.Provider>
  );
};

/** Must be used inside AnalysisStoreProvider */
export function useAnalysisStore(): AnalysisStoreValue {
  const ctx = useContext(AnalysisStoreContext);
  if (!ctx) {
    throw new Error('useAnalysisStore must be used inside AnalysisStoreProvider');
  }
  return ctx;
}
