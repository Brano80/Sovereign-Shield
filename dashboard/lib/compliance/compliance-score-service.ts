import 'server-only';
import prisma from '@/lib/prisma';
import { complianceQueryEngine } from '@/lib/audit/compliance-query-engine';
import { alertService } from '@/lib/audit/alert-service';
import {
  Regulation,
  ComplianceStatus,
  TrendDirection,
  ArticleScore,
  RegulationScore,
  OverallComplianceScore,
  MonthlyComplianceSummary,
  ARTICLE_MAPPINGS,
  getArticlesByRegulation,
} from './compliance-score-types';

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE SCORE SERVICE
// ═══════════════════════════════════════════════════════════════

export class ComplianceScoreService {

  // Cache for scores (refresh every 5 minutes)
  private scoreCache: OverallComplianceScore | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // ═══════════════════════════════════════════════════════════════
  // MAIN SCORE CALCULATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get overall compliance score (with caching)
   */
  async getOverallScore(forceRefresh: boolean = false): Promise<OverallComplianceScore> {
    const now = Date.now();

    if (!forceRefresh && this.scoreCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.scoreCache;
    }

    const score = await this.calculateOverallScore();
    this.scoreCache = score;
    this.cacheTimestamp = now;

    return score;
  }

  /**
   * Calculate overall compliance score from query results
   */
  private async calculateOverallScore(): Promise<OverallComplianceScore> {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const timeRange = {
      from: twelveMonthsAgo.toISOString(),
      to: now.toISOString(),
    };

    // Calculate scores for each regulation
    const regulations: RegulationScore[] = await Promise.all([
      this.calculateRegulationScore('GDPR', timeRange),
      this.calculateRegulationScore('DORA', timeRange),
      this.calculateRegulationScore('NIS2', timeRange),
      this.calculateRegulationScore('AI_ACT', timeRange),
    ]);

    // Calculate overall score (weighted average by article count)
    const totalArticles = regulations.reduce((sum, r) => sum + r.totalArticles, 0);
    const weightedScore = regulations.reduce((sum, r) => sum + (r.score * r.totalArticles), 0);
    const overallScore = totalArticles > 0 ? Math.round(weightedScore / totalArticles) : 0;

    // Aggregate stats
    const compliantArticles = regulations.reduce((sum, r) => sum + r.compliantArticles, 0);
    const partialArticles = regulations.reduce((sum, r) => sum + r.partialArticles, 0);
    const nonCompliantArticles = regulations.reduce((sum, r) => sum + r.nonCompliantArticles, 0);
    const notAssessedArticles = regulations.reduce((sum, r) => sum + r.notAssessedArticles, 0);

    // Collect critical gaps
    const criticalGaps = regulations.flatMap(r =>
      r.criticalGaps.map(gap => ({
        regulation: r.regulation,
        articleId: gap.description.split(':')[0] || 'Unknown',
        description: gap.description,
        recommendation: gap.recommendation,
      }))
    );

    // Collect active clocks
    const activeClocks = await this.getActiveClocks();

    // Get alert summary
    const alertSummary = await alertService.getAlertSummary();

    // Get previous score for trend
    const previousScore = await this.getPreviousOverallScore();
    const trend = this.calculateTrend(overallScore, previousScore);

    return {
      overallScore,
      overallStatus: this.scoreToStatus(overallScore),
      regulations,
      totalArticles,
      compliantArticles,
      partialArticles,
      nonCompliantArticles,
      notAssessedArticles,
      criticalGaps: criticalGaps.slice(0, 10), // Top 10 critical gaps
      activeClocks,
      activeAlerts: {
        total: alertSummary.total,
        critical: alertSummary.bySeverity.CRITICAL + alertSummary.bySeverity.BREACH,
        warning: alertSummary.bySeverity.WARNING,
      },
      previousScore,
      trend,
      trendPercentage: previousScore ? overallScore - previousScore : undefined,
      calculatedAt: now.toISOString(),
      dataRange: timeRange,
    };
  }

  /**
   * Calculate score for a specific regulation
   */
  async calculateRegulationScore(regulation: Regulation, timeRange?: { from: string; to: string }): Promise<RegulationScore> {
    const articles = getArticlesByRegulation(regulation);
    const articleScores: ArticleScore[] = [];

    const range = timeRange || {
      from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    };

    // Calculate score for each article
    for (const article of articles) {
      const articleScore = await this.calculateArticleScore(article, range);
      articleScores.push(articleScore);
    }

    // Calculate weighted average score
    const totalWeight = articles.reduce((sum, a) => sum + a.weight, 0);
    const weightedScore = articleScores.reduce((sum, score, idx) => {
      return sum + (score.score * articles[idx].weight);
    }, 0);
    const regulationScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    // Count by status
    const compliantArticles = articleScores.filter(a => a.status === 'COMPLIANT').length;
    const partialArticles = articleScores.filter(a => a.status === 'PARTIAL').length;
    const nonCompliantArticles = articleScores.filter(a => a.status === 'NON_COMPLIANT').length;
    const notAssessedArticles = articleScores.filter(a => a.status === 'NOT_ASSESSED').length;

    // Collect critical gaps
    const criticalGaps = articleScores
      .flatMap(a => a.gaps.filter(g => g.severity === 'HIGH'))
      .slice(0, 5);

    // Get active clocks for this regulation
    const activeClocks = await this.getActiveClocksForRegulation(regulation);

    // Get previous score for trend
    const previousScore = await this.getPreviousRegulationScore(regulation);
    const trend = this.calculateTrend(regulationScore, previousScore);

    return {
      regulation,
      regulationName: this.getRegulationName(regulation),
      score: regulationScore,
      status: this.scoreToStatus(regulationScore),
      totalArticles: articles.length,
      compliantArticles,
      partialArticles,
      nonCompliantArticles,
      notAssessedArticles,
      articles: articleScores,
      criticalGaps,
      activeClocks,
      previousScore,
      trend,
      trendPercentage: previousScore ? regulationScore - previousScore : undefined,
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calculate score for a specific article
   */
  private async calculateArticleScore(
    article: typeof ARTICLE_MAPPINGS[0],
    timeRange: { from: string; to: string }
  ): Promise<ArticleScore> {
    let totalScore = 0;
    let totalConfidence = 0;
    let queryCount = 0;
    let evidenceCount = 0;
    const allGaps: ArticleScore['gaps'] = [];
    let lastQueryResult: 'PROVEN' | 'PARTIAL' | 'NOT_PROVEN' = 'NOT_PROVEN';

    // Execute all queries for this article
    for (const queryId of article.queryIds) {
      try {
        const result = await complianceQueryEngine.executeQuery(queryId, timeRange);

        // Convert query result to score
        const queryScore = result.result === 'PROVEN' ? 100 :
                          result.result === 'PARTIAL' ? 50 : 0;

        totalScore += queryScore;
        totalConfidence += result.confidence;
        queryCount++;
        evidenceCount += result.evidenceCount;
        lastQueryResult = result.result;

        // Collect gaps
        result.gaps?.forEach(gap => {
          allGaps.push({
            description: gap.description,
            recommendation: gap.recommendation,
            severity: article.isCritical ? 'HIGH' : 'MEDIUM',
          });
        });
      } catch (error) {
        console.error(`Failed to execute query ${queryId}:`, error);
      }
    }

    // Calculate average score
    const avgScore = queryCount > 0 ? Math.round(totalScore / queryCount) : 0;
    const avgConfidence = queryCount > 0 ? Math.round(totalConfidence / queryCount) : 0;

    // Get previous score for trend
    const previousScore = await this.getPreviousArticleScore(article.articleId);
    const trend = this.calculateTrend(avgScore, previousScore);

    return {
      articleId: article.articleId,
      articleName: article.articleName,
      regulation: article.regulation,
      score: avgScore,
      status: this.scoreToStatus(avgScore),
      confidence: avgConfidence,
      queryId: article.queryIds[0] || '',
      queryResult: lastQueryResult,
      evidenceCount,
      gaps: allGaps,
      lastAssessedAt: new Date().toISOString(),
      previousScore,
      trend,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // MONTHLY SUMMARY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get monthly compliance summary
   */
  async getMonthlyComplianceSummary(month?: string): Promise<MonthlyComplianceSummary> {
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const [year, monthNum] = targetMonth.split('-').map(Number);

    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    // Count events by type
    const events = await prisma.evidence_events.groupBy({
      by: ['event_type'],
      where: {
        occurred_at: {
          gte: startDate.toISOString(),
          lte: endDate.toISOString(),
        },
      },
      _count: true,
    });

    const eventCounts = new Map<string, number>(events.map((e: { event_type: string; _count: number }) => [e.event_type, e._count]));

    // Calculate totals
    const totalRequests = events.reduce((sum: number, e: { _count: number }) => sum + e._count, 0);
    const blockedRequests = (eventCounts.get('AI.PROHIBITED_BLOCKED') ?? 0) +
                           (eventCounts.get('SOVEREIGN.BLOCKED') ?? 0);
    const dataSubjectRequests = (eventCounts.get('DSR.RECEIVED') ?? 0);
    const breachNotifications = (eventCounts.get('BREACH.NOTIFIED_DPA') ?? 0);
    const incidentReports = (eventCounts.get('INCIDENT.CREATED') ?? 0) +
                           (eventCounts.get('INCIDENT.CLASSIFIED') || 0);

    // Get current scores
    const currentScore = await this.getOverallScore(true);

    // Get previous month scores for trends
    const previousMonth = new Date(year, monthNum - 2, 1).toISOString().substring(0, 7);
    const previousSummary = await this.getStoredMonthlySummary(previousMonth);

    return {
      month: targetMonth,
      totalRequests,
      blockedRequests,
      dataSubjectRequests,
      breachNotifications,
      incidentReports,
      overallScore: currentScore.overallScore,
      regulationScores: currentScore.regulations.map(r => ({
        regulation: r.regulation,
        score: r.score,
      })),
      gdprTrend: this.calculateTrend(
        currentScore.regulations.find(r => r.regulation === 'GDPR')?.score || 0,
        previousSummary?.regulationScores.find(r => r.regulation === 'GDPR')?.score
      ),
      doraTrend: this.calculateTrend(
        currentScore.regulations.find(r => r.regulation === 'DORA')?.score || 0,
        previousSummary?.regulationScores.find(r => r.regulation === 'DORA')?.score
      ),
      aiActTrend: this.calculateTrend(
        currentScore.regulations.find(r => r.regulation === 'AI_ACT')?.score || 0,
        previousSummary?.regulationScores.find(r => r.regulation === 'AI_ACT')?.score
      ),
      nis2Trend: this.calculateTrend(
        currentScore.regulations.find(r => r.regulation === 'NIS2')?.score || 0,
        previousSummary?.regulationScores.find(r => r.regulation === 'NIS2')?.score
      ),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  private scoreToStatus(score: number): ComplianceStatus {
    if (score >= 80) return 'COMPLIANT';
    if (score >= 50) return 'PARTIAL';
    if (score > 0) return 'NON_COMPLIANT';
    return 'NOT_ASSESSED';
  }

  private calculateTrend(current: number, previous?: number): TrendDirection {
    if (previous === undefined) return 'STABLE';
    if (current > previous + 2) return 'UP';
    if (current < previous - 2) return 'DOWN';
    return 'STABLE';
  }

  private getRegulationName(regulation: Regulation): string {
    const names: Record<Regulation, string> = {
      GDPR: 'General Data Protection Regulation',
      DORA: 'Digital Operational Resilience Act',
      NIS2: 'Network and Information Security Directive 2',
      AI_ACT: 'EU Artificial Intelligence Act',
    };
    return names[regulation];
  }

  private async getActiveClocks(): Promise<OverallComplianceScore['activeClocks']> {
    try {
      const clocks = await prisma.evidence_clocks.findMany({
        where: { status: 'RUNNING' },
        orderBy: { deadline: 'asc' },
        take: 10,
      });

      const now = new Date();
      return clocks.map((clock: { regulation: string; clock_id: string; clock_type: string; deadline: Date | string; status: string }) => ({
        regulation: clock.regulation as Regulation,
        clockId: clock.clock_id,
        clockType: clock.clock_type,
        deadline: clock.deadline instanceof Date ? clock.deadline.toISOString() : String(clock.deadline),
        hoursRemaining: Math.max(0, Math.round(
          (new Date(clock.deadline).getTime() - now.getTime()) / (1000 * 60 * 60)
        )),
        status: clock.status,
      }));
    } catch (error) {
      console.error('Failed to get active clocks:', error);
      return [];
    }
  }

  private async getActiveClocksForRegulation(regulation: Regulation): Promise<RegulationScore['activeClocks']> {
    try {
      const clocks = await prisma.evidence_clocks.findMany({
        where: {
          status: 'RUNNING',
          regulation: regulation,
        },
        orderBy: { deadline: 'asc' },
        take: 5,
      });

      return clocks.map((clock: { clock_id: string; clock_type: string; deadline: Date | string; status: string }) => ({
        clockId: clock.clock_id,
        clockType: clock.clock_type,
        deadline: clock.deadline instanceof Date ? clock.deadline.toISOString() : String(clock.deadline),
        status: clock.status,
      }));
    } catch (error) {
      return [];
    }
  }

  // Placeholder methods for historical data (implement with actual storage)
  private async getPreviousOverallScore(): Promise<number | undefined> {
    // TODO: Implement historical score storage and retrieval
    return undefined;
  }

  private async getPreviousRegulationScore(regulation: Regulation): Promise<number | undefined> {
    // TODO: Implement historical score storage and retrieval
    return undefined;
  }

  private async getPreviousArticleScore(articleId: string): Promise<number | undefined> {
    // TODO: Implement historical score storage and retrieval
    return undefined;
  }

  private async getStoredMonthlySummary(month: string): Promise<MonthlyComplianceSummary | null> {
    // TODO: Implement monthly summary storage and retrieval
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // STORE MONTHLY SNAPSHOT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Store monthly compliance snapshot (call at end of each month)
   */
  async storeMonthlySnapshot(): Promise<void> {
    const summary = await this.getMonthlyComplianceSummary();

    await prisma.evidence_artifacts.upsert({
      where: { artifact_id: `compliance-snapshot-${summary.month}` },
      create: {
        artifact_id: `compliance-snapshot-${summary.month}`,
        artifact_type: 'REPORT',
        name: `Compliance Snapshot ${summary.month}`,
        hash: '',
        hash_algorithm: 'SHA-256',
        storage_ref: `compliance/snapshots/${summary.month}`,
        storage_type: 'STANDARD',
        signature_type: 'NONE',
        related_event_ids: [],
        metadata: summary as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      update: {
        metadata: summary as any,
        updated_at: new Date().toISOString(),
      },
    });
  }
}

// Singleton instance
export const complianceScoreService = new ComplianceScoreService();

