import {
  ICTAsset,
  RiskFactor,
  RiskFactorCategory,
  RiskLevel,
  RiskTrend,
  RiskThreshold,
  ThresholdBreach,
  ThresholdStatus,
  ICTRiskProfile,
  RiskAssessment,
} from "./ict-risk-types";

// ═══════════════════════════════════════════════════════════════
// RISK FACTOR WEIGHTS (DORA-aligned)
// ═══════════════════════════════════════════════════════════════

const DEFAULT_FACTOR_WEIGHTS: Record<RiskFactorCategory, number> = {
  AVAILABILITY: 0.15,
  INTEGRITY: 0.12,
  CONFIDENTIALITY: 0.12,
  CONTINUITY: 0.15,
  THIRD_PARTY: 0.10,
  CHANGE: 0.08,
  VULNERABILITY: 0.10,
  COMPLIANCE: 0.08,
  CONCENTRATION: 0.05,
  OBSOLESCENCE: 0.05,
};

// Criticality multipliers
const CRITICALITY_MULTIPLIERS = {
  CRITICAL: 1.5,
  IMPORTANT: 1.2,
  STANDARD: 1.0,
};

// Likelihood scores
const LIKELIHOOD_SCORES = {
  RARE: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  ALMOST_CERTAIN: 5,
};

// Impact scores
const IMPACT_SCORES = {
  NEGLIGIBLE: 1,
  MINOR: 2,
  MODERATE: 3,
  MAJOR: 4,
  SEVERE: 5,
};

// ═══════════════════════════════════════════════════════════════
// RISK SCORING ENGINE
// ═══════════════════════════════════════════════════════════════

export class RiskScoringEngine {
  private thresholds: RiskThreshold[];

  constructor(thresholds: RiskThreshold[]) {
    this.thresholds = thresholds;
  }

  /**
   * Calculate risk score for a single asset
   */
  calculateAssetRiskScore(asset: ICTAsset, factors: RiskFactor[]): ICTRiskProfile {
    // 1. Calculate weighted factor scores
    const weightedFactors = factors.map(factor => ({
      ...factor,
      weightedScore: factor.score * (factor.weight || DEFAULT_FACTOR_WEIGHTS[factor.category]),
    }));

    // 2. Sum weighted scores
    const baseScore = weightedFactors.reduce((sum, f) => sum + f.weightedScore, 0);

    // 3. Apply criticality multiplier
    const criticalityMultiplier = CRITICALITY_MULTIPLIERS[asset.criticality];
    const adjustedScore = Math.min(100, baseScore * criticalityMultiplier);

    // 4. Determine risk level
    const riskLevel = this.scoreToRiskLevel(adjustedScore);

    // 5. Calculate trend
    const trend = this.calculateTrend(asset.riskProfile?.overallScore, adjustedScore);

    // 6. Check thresholds
    const thresholdBreaches = this.checkThresholds(asset, adjustedScore);
    const thresholdStatus = this.determineThresholdStatus(thresholdBreaches);

    // 7. Build risk profile
    return {
      assetId: asset.id,
      overallScore: Math.round(adjustedScore * 100) / 100,
      riskLevel,
      trend,
      factors: weightedFactors,
      thresholdStatus,
      thresholdBreaches,
      previousScore: asset.riskProfile?.overallScore || 0,
      scoreChange: adjustedScore - (asset.riskProfile?.overallScore || 0),
      assessedAt: new Date().toISOString(),
      nextAssessmentDue: this.calculateNextAssessmentDate(riskLevel),
    };
  }

  /**
   * Calculate risk factor score from likelihood and impact
   */
  calculateFactorScore(
    likelihood: RiskFactor["likelihood"],
    impact: RiskFactor["impact"],
    mitigationStatus: RiskFactor["mitigationStatus"]
  ): number {
    const likelihoodScore = LIKELIHOOD_SCORES[likelihood];
    const impactScore = IMPACT_SCORES[impact];

    // Base score: likelihood * impact (max 25)
    const baseScore = likelihoodScore * impactScore;

    // Normalize to 0-100
    const normalizedScore = (baseScore / 25) * 100;

    // Apply mitigation reduction
    const mitigationReduction = {
      NONE: 1.0,
      PARTIAL: 0.7,
      FULL: 0.3,
    };

    return normalizedScore * mitigationReduction[mitigationStatus];
  }

  /**
   * Assess multiple risk factors for an asset
   */
  assessRiskFactors(asset: ICTAsset, inputs: RiskFactorInput[]): RiskFactor[] {
    return inputs.map(input => {
      const score = this.calculateFactorScore(
        input.likelihood,
        input.impact,
        input.mitigationStatus
      );

      return {
        id: `${asset.id}-${input.category}`,
        category: input.category,
        name: input.name,
        description: input.description,
        score,
        weight: input.weight || DEFAULT_FACTOR_WEIGHTS[input.category],
        weightedScore: score * (input.weight || DEFAULT_FACTOR_WEIGHTS[input.category]),
        likelihood: input.likelihood,
        impact: input.impact,
        evidenceSource: input.evidenceSource,
        lastUpdated: new Date().toISOString(),
        mitigationStatus: input.mitigationStatus,
        mitigationControls: input.mitigationControls || [],
      };
    });
  }

  /**
   * Check thresholds and generate breaches
   */
  private checkThresholds(asset: ICTAsset, score: number): ThresholdBreach[] {
    const breaches: ThresholdBreach[] = [];

    for (const threshold of this.thresholds) {
      if (!threshold.isActive) continue;
      if (!this.isAssetInScope(asset, threshold.scope)) continue;

      if (score >= threshold.criticalThreshold) {
        breaches.push(this.createBreach(asset, threshold, "CRITICAL", score));
      } else if (score >= threshold.warningThreshold) {
        breaches.push(this.createBreach(asset, threshold, "WARNING", score));
      }
    }

    return breaches;
  }

  private createBreach(
    asset: ICTAsset,
    threshold: RiskThreshold,
    type: "WARNING" | "CRITICAL",
    score: number
  ): ThresholdBreach {
    return {
      id: `breach-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      thresholdId: threshold.id,
      thresholdName: threshold.name,
      assetId: asset.id,
      assetName: asset.name,
      breachType: type,
      thresholdValue: type === "CRITICAL" ? threshold.criticalThreshold : threshold.warningThreshold,
      actualValue: score,
      status: "OPEN",
      actionsTaken: [],
      detectedAt: new Date().toISOString(),
    };
  }

  private isAssetInScope(asset: ICTAsset, scope: RiskThreshold["scope"]): boolean {
    switch (scope.type) {
      case "GLOBAL":
        return true;
      case "ASSET_TYPE":
        return scope.assetTypes?.includes(asset.type) || false;
      case "CRITICALITY":
        return scope.criticalities?.includes(asset.criticality) || false;
      case "DEPARTMENT":
        return scope.departments?.includes(asset.department) || false;
      case "SPECIFIC_ASSET":
        return scope.assetIds?.includes(asset.id) || false;
      default:
        return false;
    }
  }

  private scoreToRiskLevel(score: number): RiskLevel {
    if (score >= 80) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 40) return "MEDIUM";
    if (score >= 20) return "LOW";
    return "MINIMAL";
  }

  private calculateTrend(previousScore: number | undefined, currentScore: number): RiskTrend {
    if (!previousScore) return "STABLE";
    const change = currentScore - previousScore;
    if (change > 5) return "INCREASING";
    if (change < -5) return "DECREASING";
    return "STABLE";
  }

  private determineThresholdStatus(breaches: ThresholdBreach[]): ThresholdStatus {
    if (breaches.some(b => b.breachType === "CRITICAL")) return "EXCEEDED";
    if (breaches.some(b => b.breachType === "WARNING")) return "WARNING";
    return "NORMAL";
  }

  private calculateNextAssessmentDate(riskLevel: RiskLevel): string {
    const daysUntilNext = {
      CRITICAL: 1,
      HIGH: 7,
      MEDIUM: 14,
      LOW: 30,
      MINIMAL: 90,
    };
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysUntilNext[riskLevel]);
    return nextDate.toISOString();
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════

export interface RiskFactorInput {
  category: RiskFactorCategory;
  name: string;
  description: string;
  likelihood: RiskFactor["likelihood"];
  impact: RiskFactor["impact"];
  mitigationStatus: RiskFactor["mitigationStatus"];
  mitigationControls?: string[];
  evidenceSource: string;
  weight?: number;
}

