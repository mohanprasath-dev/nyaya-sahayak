/**
 * Nyaya Sahayak - Shared Client & API Types
 */

import { LegalGuidanceResult } from '@/lib/ruleEngine';
import { DocumentAnalysisResult } from '@/lib/documentScanner';
import { ClauseComparisonResult } from '@/lib/documentComparator';
import { DocumentQAResult } from '@/lib/documentQA';

export interface ApiResponse {
  success: boolean;
  ruleOutput: LegalGuidanceResult;
  guidance: {
    empatheticSummary: string;
    plainLanguageSteps: string[];
    draftLetter: string;
  };
  disclaimer: string;
  error?: string;
}

export interface DocApiResponse {
  success: boolean;
  analysis: DocumentAnalysisResult;
  disclaimer: string;
  error?: string;
}

export interface CompareApiResponse {
  success: boolean;
  comparison: ClauseComparisonResult;
  error?: string;
}

export interface QaApiResponse {
  success: boolean;
  qa: DocumentQAResult;
  error?: string;
}
