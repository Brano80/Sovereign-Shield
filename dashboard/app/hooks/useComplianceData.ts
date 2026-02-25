import { useState, useEffect } from 'react';
import { fetchComplianceOverview, ComplianceOverview } from '@/app/utils/compliance-overview';

// Compliance Summary interface
export interface ComplianceSummary {
  overall: {
    score: number;
    status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
    trend: number;
    trendPercentage: number;
  };
  regulations: Array<{
    regulation: string;
    score: number;
    status: string;
    compliantArticles: number;
    totalArticles: number;
    trend: number;
  }>;
  alerts: {
    total: number;
    critical: number;
  };
  activeClocks: number;
  criticalGaps: number;
  calculatedAt: string;
}

// Compliance History interface
export interface ComplianceHistory {
  trends: {
    overall: { direction: string; change: number; average: number };
    gdpr: { direction: string; change: number; average: number };
    dora: { direction: string; change: number; average: number };
    nis2: { direction: string; change: number; average: number };
    aiAct: { direction: string; change: number; average: number };
  };
}

// Mock data for development
const mockComplianceSummary: ComplianceSummary = {
  overall: {
    score: 78,
    status: 'PARTIAL',
    trend: 1,
    trendPercentage: 2.3
  },
  regulations: [
    {
      regulation: 'GDPR',
      score: 85,
      status: 'PARTIAL',
      compliantArticles: 8,
      totalArticles: 10,
      trend: 1
    },
    {
      regulation: 'DORA',
      score: 65,
      status: 'PARTIAL',
      compliantArticles: 6,
      totalArticles: 12,
      trend: 1
    },
    {
      regulation: 'NIS2',
      score: 90,
      status: 'COMPLIANT',
      compliantArticles: 4,
      totalArticles: 4,
      trend: 0
    },
    {
      regulation: 'AI Act',
      score: 70,
      status: 'PARTIAL',
      compliantArticles: 3,
      totalArticles: 5,
      trend: -1
    }
  ],
  alerts: {
    total: 12,
    critical: 2
  },
  activeClocks: 3,
  criticalGaps: 5,
  calculatedAt: new Date().toISOString()
};

const mockComplianceHistory: ComplianceHistory = {
  trends: {
    overall: { direction: 'UP', change: 2.3, average: 76.5 },
    gdpr: { direction: 'UP', change: 1.8, average: 83.2 },
    dora: { direction: 'UP', change: 3.1, average: 62.4 },
    nis2: { direction: 'STABLE', change: 0, average: 90 },
    aiAct: { direction: 'DOWN', change: -1.2, average: 71.2 }
  }
};

// Hook for compliance summary (for compliance-overview page)
export function useComplianceOverviewSummary() {
  const [data, setData] = useState<ComplianceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    try {
      // For now, use mock data
      // In production, this would fetch from API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setData(mockComplianceSummary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch compliance summary');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { data, isLoading, error, refresh };
}

