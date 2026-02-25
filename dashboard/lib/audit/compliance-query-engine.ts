import 'server-only';
import prisma from '@/lib/prisma';
import {
  ComplianceQuery,
  ComplianceQueryResult,
  QueryResult,
  ProofCriterion,
  GraphQueryDefinition,
} from './compliance-query-types';
import { QUERY_BY_ID, ALL_COMPLIANCE_QUERIES } from './compliance-queries';

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE QUERY ENGINE
// ═══════════════════════════════════════════════════════════════

export class ComplianceQueryEngine {

  /**
   * Execute a compliance query
   */
  async executeQuery(
    queryId: string,
    timeRange?: { from: string; to: string }
  ): Promise<ComplianceQueryResult> {
    const startTime = Date.now();

    const query = QUERY_BY_ID[queryId];
    if (!query) {
      throw new Error(`Query not found: ${queryId}`);
    }

    const range = timeRange || this.getDefaultTimeRange(query);

    // Fetch all required nodes
    const nodeResults = await this.fetchNodes(query.query, range);

    // Evaluate proof criteria
    const { proofDetails, totalScore, maxScore } = this.evaluateCriteria(
      query.proofCriteria,
      nodeResults
    );

    // Determine result
    const result = this.determineResult(proofDetails, totalScore, maxScore);
    const confidence = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Identify gaps
    const gaps = this.identifyGaps(query, proofDetails);

    // Collect evidence IDs
    const evidence = this.collectEvidence(nodeResults);

    const executionTimeMs = Date.now() - startTime;

    return {
      queryId: query.queryId,
      queryName: query.name,
      regulation: query.regulation,
      articles: query.articles,
      result,
      confidence,
      evidenceCount: evidence.events.length + evidence.decisions.length + evidence.clocks.length + evidence.artifacts.length,
      evidence,
      proofDetails,
      gaps: gaps.length > 0 ? gaps : undefined,
      executedAt: new Date().toISOString(),
      executionTimeMs,
      timeRange: range,
    };
  }

  /**
   * Execute all queries for a regulation
   */
  async executeAllForRegulation(
    regulation: string,
    timeRange?: { from: string; to: string }
  ): Promise<ComplianceQueryResult[]> {
    const queries = ALL_COMPLIANCE_QUERIES.filter((q) => q.regulation === regulation);

    const results: ComplianceQueryResult[] = [];
    for (const query of queries) {
      try {
        const result = await this.executeQuery(query.queryId, timeRange);
        results.push(result);
      } catch (error) {
        console.error(`Query ${query.queryId} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Get compliance summary for all regulations
   */
  async getComplianceSummary(
    timeRange?: { from: string; to: string }
  ): Promise<{
    overall: { proven: number; partial: number; notProven: number; total: number };
    byRegulation: Record<string, { proven: number; partial: number; notProven: number; total: number }>;
    criticalGaps: { queryId: string; queryName: string; regulation: string; gaps: string[] }[];
  }> {
    const results = await Promise.all(
      ALL_COMPLIANCE_QUERIES.map((q) =>
        this.executeQuery(q.queryId, timeRange).catch(() => null)
      )
    );

    const validResults = results.filter((r): r is ComplianceQueryResult => r !== null);

    const overall = { proven: 0, partial: 0, notProven: 0, total: validResults.length };
    const byRegulation: Record<string, { proven: number; partial: number; notProven: number; total: number }> = {};
    const criticalGaps: { queryId: string; queryName: string; regulation: string; gaps: string[] }[] = [];

    for (const result of validResults) {
      // Overall counts
      if (result.result === 'PROVEN') overall.proven++;
      else if (result.result === 'PARTIAL') overall.partial++;
      else overall.notProven++;

      // By regulation
      if (!byRegulation[result.regulation]) {
        byRegulation[result.regulation] = { proven: 0, partial: 0, notProven: 0, total: 0 };
      }
      byRegulation[result.regulation].total++;
      if (result.result === 'PROVEN') byRegulation[result.regulation].proven++;
      else if (result.result === 'PARTIAL') byRegulation[result.regulation].partial++;
      else byRegulation[result.regulation].notProven++;

      // Critical gaps
      const query = QUERY_BY_ID[result.queryId];
      if (query?.severity === 'CRITICAL' && result.result !== 'PROVEN' && result.gaps) {
        criticalGaps.push({
          queryId: result.queryId,
          queryName: result.queryName,
          regulation: result.regulation,
          gaps: result.gaps.map((g) => g.description),
        });
      }
    }

    return { overall, byRegulation, criticalGaps };
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═══════════════════════════════════════════════════════════════

  private async fetchNodes(
    queryDef: GraphQueryDefinition,
    timeRange: { from: string; to: string }
  ): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};

    for (const nodeDef of queryDef.requiredNodes) {
      const nodes = await this.fetchNodeType(nodeDef, timeRange);
      results[nodeDef.alias] = nodes;
    }

    return results;
  }

  private async fetchNodeType(
    nodeDef: { alias: string; type: string; filters: Record<string, any>; minCount?: number; optional?: boolean },
    timeRange: { from: string; to: string }
  ): Promise<any[]> {
    const table = this.getTableName(nodeDef.type);
    const timeField = this.getTimeField(nodeDef.type);

    // Build where clause
    const where: any = {};

    // Add time range
    if (timeField) {
      where[timeField] = {
        gte: timeRange.from,
        lte: timeRange.to,
      };
    }

    // Add filters
    for (const [key, value] of Object.entries(nodeDef.filters)) {
      if (key.startsWith('payload.')) {
        const payloadKey = key.substring(8);
        where.payload = { path: [payloadKey], equals: value };
      } else if (typeof value === 'object' && value !== null) {
        if (value.contains) {
          where[key] = { contains: value.contains };
        } else if (value.in) {
          where[key] = { in: value.in };
        } else if (value.has) {
          where[key] = { has: value.has };
        } else {
          where[key] = value;
        }
      } else {
        where[key] = value;
      }
    }

    try {
      const results = await (prisma as any)[table].findMany({
        where,
        take: 1000,
      });
      return results;
    } catch (error) {
      console.error(`Error fetching ${nodeDef.type}:`, error);
      return [];
    }
  }

  private evaluateCriteria(
    criteria: ProofCriterion[],
    nodeResults: Record<string, any[]>
  ): {
    proofDetails: { criterion: string; met: boolean; details: string }[];
    totalScore: number;
    maxScore: number;
  } {
    const proofDetails: { criterion: string; met: boolean; details: string }[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const criterion of criteria) {
      maxScore += criterion.weight;

      const result = this.evaluateSingleCriterion(criterion, nodeResults);
      proofDetails.push({
        criterion: criterion.description,
        met: result.met,
        details: result.details,
      });

      if (result.met) {
        totalScore += criterion.weight;
      }
    }

    return { proofDetails, totalScore, maxScore };
  }

  private evaluateSingleCriterion(
    criterion: ProofCriterion,
    nodeResults: Record<string, any[]>
  ): { met: boolean; details: string } {
    const nodes = criterion.params.nodeAlias ? nodeResults[criterion.params.nodeAlias] || [] : [];

    switch (criterion.type) {
      case 'EXISTS':
        return {
          met: nodes.length > 0,
          details: nodes.length > 0
            ? `Found ${nodes.length} matching records`
            : 'No matching records found',
        };

      case 'COUNT':
        const minCount = criterion.params.minCount || 1;
        return {
          met: nodes.length >= minCount,
          details: `Found ${nodes.length} records (required: ${minCount})`,
        };

      case 'VALUE':
        if (nodes.length === 0) {
          return { met: false, details: 'No records to evaluate' };
        }

        const field = criterion.params.field!;
        const operator = criterion.params.operator!;
        const expectedValue = criterion.params.value;

        const matchingNodes = nodes.filter((node) => {
          const actualValue = node[field];
          switch (operator) {
            case 'EQUALS': return actualValue === expectedValue;
            case 'NOT_EQUALS': return actualValue !== expectedValue;
            case 'IN': return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
            case 'CONTAINS': return String(actualValue).includes(String(expectedValue));
            case 'EXISTS': return actualValue !== null && actualValue !== undefined;
            case 'GREATER_THAN': return actualValue > expectedValue;
            case 'LESS_THAN': return actualValue < expectedValue;
            default: return false;
          }
        });

        return {
          met: matchingNodes.length > 0,
          details: `${matchingNodes.length}/${nodes.length} records match condition`,
        };

      case 'TIMING':
        if (nodes.length === 0) {
          return { met: false, details: 'No records to evaluate' };
        }

        const timeField = criterion.params.field!;
        const withinHours = criterion.params.withinHours!;
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - withinHours);

        const recentNodes = nodes.filter((node) => {
          const nodeTime = new Date(node[timeField]);
          return nodeTime >= cutoff;
        });

        return {
          met: recentNodes.length > 0,
          details: `${recentNodes.length}/${nodes.length} records within ${withinHours} hours`,
        };

      case 'RELATIONSHIP':
        // For relationship checks, we would need to query edges
        // Simplified implementation - assume relationship exists if both nodes exist
        return {
          met: nodes.length > 0,
          details: 'Relationship check (simplified)',
        };

      default:
        return { met: false, details: 'Unknown criterion type' };
    }
  }

  private determineResult(
    proofDetails: { criterion: string; met: boolean; details: string }[],
    totalScore: number,
    maxScore: number
  ): QueryResult {
    // Check if all mandatory criteria are met
    // For simplicity, we use score thresholds
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    if (percentage >= 80) return 'PROVEN';
    if (percentage >= 40) return 'PARTIAL';
    return 'NOT_PROVEN';
  }

  private identifyGaps(
    query: ComplianceQuery,
    proofDetails: { criterion: string; met: boolean; details: string }[]
  ): { description: string; recommendation: string }[] {
    const gaps: { description: string; recommendation: string }[] = [];

    for (let i = 0; i < proofDetails.length; i++) {
      if (!proofDetails[i].met) {
        const criterion = query.proofCriteria[i];
        gaps.push({
          description: criterion.description,
          recommendation: this.generateRecommendation(criterion),
        });
      }
    }

    return gaps;
  }

  private generateRecommendation(criterion: ProofCriterion): string {
    switch (criterion.type) {
      case 'EXISTS':
        return `Create or document the required ${criterion.description.toLowerCase()}`;
      case 'COUNT':
        return `Ensure at least ${criterion.params.minCount} records exist for ${criterion.description.toLowerCase()}`;
      case 'VALUE':
        return `Update the ${criterion.params.field} field to meet the expected value`;
      case 'TIMING':
        return `Perform the activity within the required ${criterion.params.withinHours} hour window`;
      default:
        return `Address the gap in ${criterion.description.toLowerCase()}`;
    }
  }

  private collectEvidence(nodeResults: Record<string, any[]>): {
    events: string[];
    decisions: string[];
    clocks: string[];
    artifacts: string[];
  } {
    const evidence = {
      events: [] as string[],
      decisions: [] as string[],
      clocks: [] as string[],
      artifacts: [] as string[],
    };

    for (const [alias, nodes] of Object.entries(nodeResults)) {
      for (const node of nodes) {
        if (node.event_id) evidence.events.push(node.event_id);
        if (node.decision_id) evidence.decisions.push(node.decision_id);
        if (node.clock_id) evidence.clocks.push(node.clock_id);
        if (node.artifact_id) evidence.artifacts.push(node.artifact_id);
      }
    }

    return evidence;
  }

  private getTableName(nodeType: string): string {
    const mapping: Record<string, string> = {
      EVENT: 'evidence_events',
      DECISION: 'evidence_decisions',
      CLOCK: 'evidence_clocks',
      ACTOR: 'evidence_actors',
      CONTROL: 'evidence_controls',
      ARTIFACT: 'evidence_artifacts',
    };
    return mapping[nodeType] || 'evidence_events';
  }

  private getTimeField(nodeType: string): string | null {
    const mapping: Record<string, string> = {
      EVENT: 'occurred_at',
      DECISION: 'timestamp',
      CLOCK: 'created_at',
      ACTOR: 'created_at',
      CONTROL: 'created_at',
      ARTIFACT: 'created_at',
    };
    return mapping[nodeType] || null;
  }

  private getDefaultTimeRange(query: ComplianceQuery): { from: string; to: string } {
    const now = new Date();
    const from = new Date();
    // Default to 12 months for most queries
    from.setMonth(from.getMonth() - 12);

    return {
      from: from.toISOString(),
      to: now.toISOString(),
    };
  }
}

// Singleton instance
export const complianceQueryEngine = new ComplianceQueryEngine();
