/**
 * Drift Detection Engine
 * Implements various algorithms for detecting data drift, concept drift, and prediction drift
 */

import { calculateKSStatistic, kolmogorovSmirnovTest } from '../../../utils/statistics/kolmogorov-smirnov';
import { chiSquareTest, calculatePSI, createContingencyTable } from '../../../utils/statistics/chi-square';
import { calculatePSI as calculatePSIBinned } from '../../../utils/statistics/population-stability-index';
import { mannWhitneyUTest, confidenceInterval } from '../../../utils/statistics/significance-testing';

export interface DriftDetectionConfig {
  baselineWindowDays: number;
  comparisonWindowDays: number;
  significanceLevel: number; // p-value threshold (default: 0.05)
  minSampleSize: number;
  driftThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface DriftDetectionResult {
  driftType: 'data_drift' | 'concept_drift' | 'prediction_drift';
  driftScore: number; // 0.0 (no drift) to 1.0 (complete drift)
  severity: 'low' | 'medium' | 'high' | 'critical' | 'none';
  confidence: number; // 0.0 to 1.0
  statisticalSignificance: number; // p-value
  affectedFeatures: string[];
  detectionMethod: string;
  baselineStats: {
    mean?: number;
    std?: number;
    distribution?: number[];
  };
  currentStats: {
    mean?: number;
    std?: number;
    distribution?: number[];
  };
  recommendations: string[];
  metadata: Record<string, any>;
}

export class DriftDetectionEngine {
  private config: DriftDetectionConfig;

  constructor(config?: Partial<DriftDetectionConfig>) {
    this.config = {
      baselineWindowDays: 30,
      comparisonWindowDays: 7,
      significanceLevel: 0.05,
      minSampleSize: 100,
      driftThresholds: {
        low: 0.05,
        medium: 0.10,
        high: 0.20,
        critical: 0.30
      },
      ...config
    };
  }

  /**
   * Detect data drift between baseline and current distributions
   * @param baselineData Baseline dataset
   * @param currentData Current dataset
   * @param featureName Name of the feature being analyzed
   * @returns Drift detection result
   */
  detectDataDrift(
    baselineData: number[],
    currentData: number[],
    featureName: string = 'feature'
  ): DriftDetectionResult {
    if (baselineData.length < this.config.minSampleSize ||
        currentData.length < this.config.minSampleSize) {
      return {
        driftType: 'data_drift',
        driftScore: 0,
        severity: 'none',
        confidence: 0,
        statisticalSignificance: 1.0,
        affectedFeatures: [],
        detectionMethod: 'insufficient_data',
        baselineStats: {},
        currentStats: {},
        recommendations: ['Collect more data for reliable drift detection'],
        metadata: {
          baselineSize: baselineData.length,
          currentSize: currentData.length,
          minRequired: this.config.minSampleSize
        }
      };
    }

    // Kolmogorov-Smirnov test for numerical data
    const ksResult = kolmogorovSmirnovTest(baselineData, currentData);

    // Calculate distribution statistics
    const baselineMean = baselineData.reduce((sum, val) => sum + val, 0) / baselineData.length;
    const currentMean = currentData.reduce((sum, val) => sum + val, 0) / currentData.length;

    const baselineVariance = baselineData.reduce((sum, val) => sum + Math.pow(val - baselineMean, 2), 0) / baselineData.length;
    const currentVariance = currentData.reduce((sum, val) => sum + Math.pow(val - currentMean, 2), 0) / currentData.length;

    // Calculate drift score (normalized KS statistic)
    const driftScore = Math.min(ksResult.statistic, 1.0);

    // Determine severity
    const severity = this.calculateSeverity(driftScore);

    // Generate recommendations
    const recommendations = this.generateDriftRecommendations(
      severity,
      ksResult.isSignificant,
      Math.abs(currentMean - baselineMean),
      featureName
    );

    return {
      driftType: 'data_drift',
      driftScore,
      severity,
      confidence: 1 - ksResult.pValue,
      statisticalSignificance: ksResult.pValue,
      affectedFeatures: ksResult.isSignificant ? [featureName] : [],
      detectionMethod: 'kolmogorov_smirnov',
      baselineStats: {
        mean: baselineMean,
        std: Math.sqrt(baselineVariance),
        distribution: this.createDistributionSummary(baselineData)
      },
      currentStats: {
        mean: currentMean,
        std: Math.sqrt(currentVariance),
        distribution: this.createDistributionSummary(currentData)
      },
      recommendations,
      metadata: {
        ksStatistic: ksResult.statistic,
        effectSize: ksResult.effectSize,
        baselineSize: baselineData.length,
        currentSize: currentData.length
      }
    };
  }

  /**
   * Detect concept drift using ADWIN-like algorithm
   * @param predictions Historical predictions
   * @param windowSize Size of sliding window
   * @returns Concept drift detection result
   */
  detectConceptDrift(
    predictions: number[],
    windowSize: number = 100
  ): DriftDetectionResult {
    if (predictions.length < windowSize * 2) {
      return {
        driftType: 'concept_drift',
        driftScore: 0,
        severity: 'none',
        confidence: 0,
        statisticalSignificance: 1.0,
        affectedFeatures: [],
        detectionMethod: 'insufficient_data',
        baselineStats: {},
        currentStats: {},
        recommendations: ['Need more prediction data for concept drift detection'],
        metadata: {
          availableData: predictions.length,
          requiredWindow: windowSize
        }
      };
    }

    // Split into baseline and current windows
    const midPoint = Math.floor(predictions.length / 2);
    const baselineWindow = predictions.slice(0, midPoint);
    const currentWindow = predictions.slice(midPoint);

    // Calculate prediction distribution changes
    const baselineStats = this.calculateDistributionStats(baselineWindow);
    const currentStats = this.calculateDistributionStats(currentWindow);

    // Use Mann-Whitney U test for distribution difference
    const mwTest = mannWhitneyUTest(baselineWindow, currentWindow);

    // Calculate drift score based on distribution difference
    const meanDiff = Math.abs(currentStats.mean - baselineStats.mean);
    const stdDiff = Math.abs(currentStats.std - baselineStats.std);
    const driftScore = Math.min((meanDiff / (baselineStats.std + 1e-6) +
                                stdDiff / (baselineStats.std + 1e-6)) / 2, 1.0);

    const severity = this.calculateSeverity(driftScore);

    const recommendations = this.generateConceptDriftRecommendations(
      severity,
      mwTest.isSignificant,
      driftScore
    );

    return {
      driftType: 'concept_drift',
      driftScore,
      severity,
      confidence: 1 - mwTest.pValue,
      statisticalSignificance: mwTest.pValue,
      affectedFeatures: mwTest.isSignificant ? ['prediction_distribution'] : [],
      detectionMethod: 'mann_whitney_u_test',
      baselineStats: {
        mean: baselineStats.mean,
        std: baselineStats.std,
        distribution: this.createDistributionSummary(baselineWindow)
      },
      currentStats: {
        mean: currentStats.mean,
        std: currentStats.std,
        distribution: this.createDistributionSummary(currentWindow)
      },
      recommendations,
      metadata: {
        windowSize,
        mwStatistic: mwTest.statistic,
        effectSize: mwTest.effectSize,
        totalPredictions: predictions.length
      }
    };
  }

  /**
   * Detect prediction drift by comparing prediction distributions
   * @param baselinePredictions Baseline predictions
   * @param currentPredictions Current predictions
   * @returns Prediction drift detection result
   */
  detectPredictionDrift(
    baselinePredictions: number[],
    currentPredictions: number[]
  ): DriftDetectionResult {
    if (baselinePredictions.length < this.config.minSampleSize ||
        currentPredictions.length < this.config.minSampleSize) {
      return {
        driftType: 'prediction_drift',
        driftScore: 0,
        severity: 'none',
        confidence: 0,
        statisticalSignificance: 1.0,
        affectedFeatures: [],
        detectionMethod: 'insufficient_data',
        baselineStats: {},
        currentStats: {},
        recommendations: ['Collect more prediction data for reliable analysis'],
        metadata: {
          baselineSize: baselinePredictions.length,
          currentSize: currentPredictions.length
        }
      };
    }

    // KS test on prediction distributions
    const ksResult = kolmogorovSmirnovTest(baselinePredictions, currentPredictions);

    // Calculate confidence interval differences
    const baselineCI = confidenceInterval(baselinePredictions);
    const currentCI = confidenceInterval(currentPredictions);

    const ciOverlap = Math.max(0, Math.min(baselineCI[1], currentCI[1]) - Math.max(baselineCI[0], currentCI[0]));
    const ciUnion = Math.max(baselineCI[1], currentCI[1]) - Math.min(baselineCI[0], currentCI[0]);

    const ciDriftScore = ciUnion > 0 ? 1 - (ciOverlap / ciUnion) : 1;

    // Combine KS statistic and CI drift
    const driftScore = Math.min((ksResult.statistic + ciDriftScore) / 2, 1.0);

    const severity = this.calculateSeverity(driftScore);

    const recommendations = this.generatePredictionDriftRecommendations(
      severity,
      ksResult.isSignificant,
      driftScore
    );

    return {
      driftType: 'prediction_drift',
      driftScore,
      severity,
      confidence: 1 - ksResult.pValue,
      statisticalSignificance: ksResult.pValue,
      affectedFeatures: ksResult.isSignificant ? ['prediction_confidence'] : [],
      detectionMethod: 'ks_test_with_ci_analysis',
      baselineStats: {
        distribution: this.createDistributionSummary(baselinePredictions)
      },
      currentStats: {
        distribution: this.createDistributionSummary(currentPredictions)
      },
      recommendations,
      metadata: {
        ksStatistic: ksResult.statistic,
        ciDriftScore,
        baselineCI,
        currentCI,
        effectSize: ksResult.effectSize
      }
    };
  }

  /**
   * Detect drift in categorical data using chi-square test
   * @param baselineCategories Baseline categorical values
   * @param currentCategories Current categorical values
   * @param featureName Name of the categorical feature
   * @returns Drift detection result
   */
  detectCategoricalDrift(
    baselineCategories: string[],
    currentCategories: string[],
    featureName: string = 'categorical_feature'
  ): DriftDetectionResult {
    if (baselineCategories.length < this.config.minSampleSize ||
        currentCategories.length < this.config.minSampleSize) {
      return {
        driftType: 'data_drift',
        driftScore: 0,
        severity: 'none',
        confidence: 0,
        statisticalSignificance: 1.0,
        affectedFeatures: [],
        detectionMethod: 'insufficient_data',
        baselineStats: {},
        currentStats: {},
        recommendations: ['Collect more categorical data for reliable drift detection'],
        metadata: {
          baselineSize: baselineCategories.length,
          currentSize: currentCategories.length
        }
      };
    }

    // Create contingency table and run chi-square test
    const contingencyTable = createContingencyTable(baselineCategories, currentCategories);
    const chiSquareResult = chiSquareTest(contingencyTable);

    // Calculate PSI for additional drift measurement
    const baselineFreq = contingencyTable[0];
    const currentFreq = contingencyTable[1];
    const psiValue = calculatePSI(baselineFreq, currentFreq);

    // Combine chi-square significance and PSI for drift score
    const driftScore = Math.min((1 - chiSquareResult.pValue + psiValue) / 2, 1.0);

    const severity = this.calculateSeverity(driftScore);

    const recommendations = this.generateCategoricalDriftRecommendations(
      severity,
      chiSquareResult.isSignificant,
      featureName
    );

    return {
      driftType: 'data_drift',
      driftScore,
      severity,
      confidence: 1 - chiSquareResult.pValue,
      statisticalSignificance: chiSquareResult.pValue,
      affectedFeatures: chiSquareResult.isSignificant ? [featureName] : [],
      detectionMethod: 'chi_square_with_psi',
      baselineStats: {
        distribution: contingencyTable[0].map((freq, i) => freq / baselineCategories.length)
      },
      currentStats: {
        distribution: contingencyTable[1].map((freq, i) => freq / currentCategories.length)
      },
      recommendations,
      metadata: {
        chiSquareStatistic: chiSquareResult.statistic,
        degreesOfFreedom: chiSquareResult.degreesOfFreedom,
        psiValue,
        effectSize: chiSquareResult.effectSize
      }
    };
  }

  /**
   * Run comprehensive drift analysis on a dataset
   * @param baselineData Baseline dataset with features
   * @param currentData Current dataset with features
   * @param featureTypes Map of feature names to types ('numeric' | 'categorical')
   * @returns Array of drift detection results for each feature
   */
  analyzeDatasetDrift(
    baselineData: Record<string, number[] | string[]>,
    currentData: Record<string, number[] | string[]>,
    featureTypes: Record<string, 'numeric' | 'categorical'>
  ): DriftDetectionResult[] {
    const results: DriftDetectionResult[] = [];

    for (const [featureName, featureType] of Object.entries(featureTypes)) {
      const baselineValues = baselineData[featureName];
      const currentValues = currentData[featureName];

      if (!baselineValues || !currentValues) continue;

      let result: DriftDetectionResult;

      if (featureType === 'numeric') {
        result = this.detectDataDrift(
          baselineValues as number[],
          currentValues as number[],
          featureName
        );
      } else {
        result = this.detectCategoricalDrift(
          baselineValues as string[],
          currentValues as string[],
          featureName
        );
      }

      results.push(result);
    }

    return results;
  }

  // Private helper methods

  private calculateSeverity(driftScore: number): 'low' | 'medium' | 'high' | 'critical' | 'none' {
    if (driftScore >= this.config.driftThresholds.critical) return 'critical';
    if (driftScore >= this.config.driftThresholds.high) return 'high';
    if (driftScore >= this.config.driftThresholds.medium) return 'medium';
    if (driftScore >= this.config.driftThresholds.low) return 'low';
    return 'none';
  }

  private calculateDistributionStats(data: number[]): { mean: number; std: number; min: number; max: number } {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const std = Math.sqrt(variance);

    return {
      mean,
      std,
      min: Math.min(...data),
      max: Math.max(...data)
    };
  }

  private createDistributionSummary(data: number[]): number[] {
    // Create a simple histogram with 10 bins
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / 10;

    const bins = new Array(10).fill(0);
    for (const value of data) {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex >= 10) binIndex = 9;
      if (binIndex < 0) binIndex = 0;
      bins[binIndex]++;
    }

    return bins;
  }

  private generateDriftRecommendations(
    severity: string,
    isSignificant: boolean,
    meanDifference: number,
    featureName: string
  ): string[] {
    const recommendations: string[] = [];

    if (severity === 'critical') {
      recommendations.push(`🚨 CRITICAL: ${featureName} shows severe data drift (${meanDifference.toFixed(3)} mean difference)`);
      recommendations.push('Immediate model retraining required');
      recommendations.push('Consider data quality issues or concept changes');
    } else if (severity === 'high') {
      recommendations.push(`⚠️ HIGH: ${featureName} shows significant data drift`);
      recommendations.push('Schedule model retraining within 1-2 weeks');
      recommendations.push('Monitor prediction performance closely');
    } else if (severity === 'medium') {
      recommendations.push(`🟡 MEDIUM: ${featureName} shows moderate data drift`);
      recommendations.push('Consider model recalibration');
      recommendations.push('Monitor drift trends over next month');
    } else if (isSignificant) {
      recommendations.push(`🟢 LOW: ${featureName} shows minor data drift`);
      recommendations.push('Continue monitoring - no immediate action required');
    }

    if (isSignificant) {
      recommendations.push(`Investigate source of distribution change in ${featureName}`);
      recommendations.push('Check for data collection issues or population changes');
    }

    return recommendations;
  }

  private generateConceptDriftRecommendations(
    severity: string,
    isSignificant: boolean,
    driftScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (severity === 'critical') {
      recommendations.push('🚨 CRITICAL: Severe concept drift detected - model may be obsolete');
      recommendations.push('Immediate model retraining with recent data required');
      recommendations.push('Consider if underlying business logic has changed');
    } else if (severity === 'high') {
      recommendations.push('⚠️ HIGH: Significant concept drift detected');
      recommendations.push('Model performance likely degrading');
      recommendations.push('Plan model update within 1-2 weeks');
    } else if (severity === 'medium') {
      recommendations.push('🟡 MEDIUM: Moderate concept drift detected');
      recommendations.push('Monitor model performance metrics');
      recommendations.push('Consider gradual model updates');
    }

    if (isSignificant) {
      recommendations.push('Analyze recent data patterns and business changes');
      recommendations.push('Update model training data with recent examples');
    }

    return recommendations;
  }

  private generatePredictionDriftRecommendations(
    severity: string,
    isSignificant: boolean,
    driftScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (severity === 'critical') {
      recommendations.push('🚨 CRITICAL: Severe prediction drift - model confidence unreliable');
      recommendations.push('Stop using model predictions until retrained');
      recommendations.push('Investigate root cause immediately');
    } else if (severity === 'high') {
      recommendations.push('⚠️ HIGH: Significant prediction drift detected');
      recommendations.push('Reduce confidence in model predictions');
      recommendations.push('Implement prediction confidence thresholds');
    } else if (severity === 'medium') {
      recommendations.push('🟡 MEDIUM: Moderate prediction drift');
      recommendations.push('Add prediction uncertainty estimates');
      recommendations.push('Monitor prediction accuracy trends');
    }

    if (isSignificant) {
      recommendations.push('Review model calibration and confidence estimation');
      recommendations.push('Consider ensemble methods or model updates');
    }

    return recommendations;
  }

  private generateCategoricalDriftRecommendations(
    severity: string,
    isSignificant: boolean,
    featureName: string
  ): string[] {
    const recommendations: string[] = [];

    if (severity === 'critical') {
      recommendations.push(`🚨 CRITICAL: Severe categorical drift in ${featureName}`);
      recommendations.push('Category distribution completely changed');
      recommendations.push('Model may be using outdated category mappings');
    } else if (severity === 'high') {
      recommendations.push(`⚠️ HIGH: Significant categorical drift in ${featureName}`);
      recommendations.push('Several categories show major frequency changes');
      recommendations.push('Review category encoding and model training');
    } else if (severity === 'medium') {
      recommendations.push(`🟡 MEDIUM: Moderate categorical drift in ${featureName}`);
      recommendations.push('Some categories show notable frequency changes');
      recommendations.push('Monitor category distributions over time');
    }

    if (isSignificant) {
      recommendations.push(`Check if new categories appeared in ${featureName}`);
      recommendations.push('Update category preprocessing and encoding');
      recommendations.push('Consider model retraining with updated categories');
    }

    return recommendations;
  }
}

// Factory function for creating drift detection engine with default config
export function createDriftDetectionEngine(config?: Partial<DriftDetectionConfig>): DriftDetectionEngine {
  return new DriftDetectionEngine(config);
}

// Utility function to run comprehensive drift analysis
export async function runComprehensiveDriftAnalysis(
  baselineData: Record<string, number[] | string[]>,
  currentData: Record<string, number[] | string[]>,
  featureTypes: Record<string, 'numeric' | 'categorical'>,
  config?: Partial<DriftDetectionConfig>
): Promise<{
  overallDriftScore: number;
  maxSeverity: string;
  featureResults: DriftDetectionResult[];
  summary: string;
}> {
  const engine = createDriftDetectionEngine(config);

  const featureResults = engine.analyzeDatasetDrift(baselineData, currentData, featureTypes);

  // Calculate overall drift score
  const overallDriftScore = featureResults.reduce((sum, result) => sum + result.driftScore, 0) / featureResults.length;

  // Find maximum severity
  const severities = ['none', 'low', 'medium', 'high', 'critical'];
  const maxSeverity = featureResults
    .map(r => severities.indexOf(r.severity))
    .reduce((max, current) => Math.max(max, current), 0);
  const maxSeverityStr = severities[maxSeverity];

  // Generate summary
  const significantDrifts = featureResults.filter(r => r.severity !== 'none').length;
  const summary = `Analyzed ${featureResults.length} features. Found ${significantDrifts} with significant drift. Overall drift score: ${overallDriftScore.toFixed(3)}. Maximum severity: ${maxSeverityStr}.`;

  return {
    overallDriftScore,
    maxSeverity: maxSeverityStr,
    featureResults,
    summary
  };
}