"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  OverallComplianceScore,
  RegulationScore,
  ArticleScore,
  MonthlyComplianceSummary,
  Regulation,
} from '@/lib/compliance/compliance-score-types';
import { getAuthHeaders } from '@/utils/auth';
import { API_BASE } from '@/utils/api-config';

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE DATA HOOKS
// ═══════════════════════════════════════════════════════════════

interface UseComplianceOverviewResult {
  data: OverallComplianceScore | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useComplianceOverview(autoRefresh: boolean = false): UseComplianceOverviewResult {
  const [data, setData] = useState<OverallComplianceScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = forceRefresh
        ? '/api/v1/compliance?view=overview&refresh=true'
        : '/api/v1/compliance?view=overview';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch compliance data');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
      console.error('Compliance data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(() => fetchData(), 5 * 60 * 1000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh]);

  return {
    data,
    isLoading,
    error,
    refresh: () => fetchData(true),
  };
}

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE SUMMARY HOOK (Lighter)
// ═══════════════════════════════════════════════════════════════

interface ComplianceSummary {
  overall: {
    score: number;
    status: string;
    trend: string;
    trendPercentage?: number;
  };
  regulations: {
    regulation: Regulation;
    score: number;
    status: string;
    compliantArticles: number;
    totalArticles: number;
    trend: string;
  }[];
  alerts: {
    total: number;
    critical: number;
    warning: number;
  };
  activeClocks: number;
  criticalGaps: number;
  calculatedAt: string;
}

export function useComplianceSummary(): {
  data: ComplianceSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<ComplianceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/compliance?view=summary`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      setData(await response.json());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE HISTORY HOOK
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// REGULATION DETAIL HOOK
// ═══════════════════════════════════════════════════════════════

export function useRegulationScore(regulation: Regulation): {
  data: RegulationScore | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<RegulationScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/compliance/${regulation.toLowerCase()}`);

      if (!response.ok) throw new Error('Failed to fetch');

      setData(await response.json());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [regulation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}

// ═══════════════════════════════════════════════════════════════
// ARTICLE DETAIL HOOK
// ═══════════════════════════════════════════════════════════════

interface ArticleDetail {
  article: any;
  score: ArticleScore | null;
  queryResults: any[];
}

export function useArticleDetail(articleId: string): {
  data: ArticleDetail | null;
  isLoading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<ArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/v1/compliance/articles/${articleId}`);

        if (!response.ok) throw new Error('Failed to fetch');

        setData(await response.json());
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (articleId) fetchData();
  }, [articleId]);

  return { data, isLoading, error };
}

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE HISTORY HOOK
// ═══════════════════════════════════════════════════════════════

interface ComplianceHistory {
  history: MonthlyComplianceSummary[];
  trends: {
    overall: { direction: string; change: number; average: number };
    gdpr: { direction: string; change: number; average: number };
    dora: { direction: string; change: number; average: number };
    nis2: { direction: string; change: number; average: number };
    aiAct: { direction: string; change: number; average: number };
  };
  periodStart: string;
  periodEnd: string;
  monthsAvailable: number;
}

export function useComplianceHistory(months: number = 12): {
  data: ComplianceHistory | null;
  isLoading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<ComplianceHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Mock data for compliance history trends
        const mockHistory: ComplianceHistory = {
          history: [],
          periodStart: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date().toISOString(),
          monthsAvailable: months,
          trends: {
            overall: { direction: 'UP', change: 2.3, average: 76.5 },
            gdpr: { direction: 'UP', change: 1.8, average: 83.2 },
            dora: { direction: 'UP', change: 3.1, average: 62.4 },
            nis2: { direction: 'STABLE', change: 0, average: 90 },
            aiAct: { direction: 'DOWN', change: -1.2, average: 71.2 }
          }
        };

        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        setData(mockHistory);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch compliance history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [months]);

  return { data, isLoading, error };
}

// ═══════════════════════════════════════════════════════════════
// MONTHLY SUMMARY HOOK
// ═══════════════════════════════════════════════════════════════

export function useMonthlySummary(month?: string): {
  data: MonthlyComplianceSummary | null;
  isLoading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<MonthlyComplianceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const url = month
          ? `/api/v1/compliance?view=monthly&month=${month}`
          : '/api/v1/compliance?view=monthly';

        const response = await fetch(url);

        if (!response.ok) throw new Error('Failed to fetch');

        setData(await response.json());
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [month]);

  return { data, isLoading, error };
}
