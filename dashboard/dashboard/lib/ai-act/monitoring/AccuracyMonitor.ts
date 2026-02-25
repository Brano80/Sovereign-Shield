/**
 * Accuracy Monitor
 * Calculates various accuracy metrics and validates performance against thresholds
 */

export interface AccuracyMetrics {
  accuracy: number;          // Overall accuracy (0.0-1.0)
  precision: number;         // Precision score (0.0-1.0)
  recall: number;           // Recall/sensitivity (0.0-1.0)
  f1Score: number;          // F1 score (harmonic mean of precision/recall)
  specificity: number;      // Specificity (0.0-1.0)
  aucROC?: number;          // Area Under ROC Curve (binary classification)
  confusionMatrix: {
    truePositives: number;
    trueNegatives: number;
    falsePositives: number;
    falseNegatives: number;
  };
  confidenceInterval?: {
    accuracy: [number, number];
    precision: [number, number];
    recall: [number, number];
  };
}

export interface PerformanceValidationResult {
  isValid: boolean;
  violations: string[];
  recommendations: string[];
  degradationLevel: 'none' | 'minor' | 'moderate' | 'severe' | 'critical';
  metadata: Record<string, any>;
}

export interface PerformanceReport {
  systemId: string;
  timeRange: {
    start: string;
    end: string;
  };
  metrics: AccuracyMetrics;
  validation: PerformanceValidationResult;
  trends: {
    accuracyChange: number;    // Percentage change from previous period
    precisionChange: number;
    recallChange: number;
    trend: 'improving' | 'stable' | 'degrading';
  };
  benchmarks: {
    industryAverage?: number;
    targetThreshold: number;
    benchmarkComparison: 'above' | 'at' | 'below';
  };
  recommendations: string[];
  metadata: Record<string, any>;
}

export class AccuracyMonitor {
  private confidenceLevel: number = 0.95;

  /**
   * Calculate accuracy from predictions and ground truth
   * @param predictions Model predictions (binary: 0/1, or probabilities)
   * @param groundTruth True labels
   * @returns Accuracy score (0.0-1.0)
   */
  calculateAccuracy(predictions: number[], groundTruth: number[]): number {
    if (predictions.length !== groundTruth.length) {
      throw new Error('Predictions and ground truth must have same length');
    }

    if (predictions.length === 0) return 0;

    // For binary predictions (0/1), use direct comparison
    // For probabilities, threshold at 0.5
    const binarizedPredictions = predictions.map(p => p >= 0.5 ? 1 : 0);

    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (binarizedPredictions[i] === groundTruth[i]) {
        correct++;
      }
    }

    return correct / predictions.length;
  }

  /**
   * Calculate precision and recall for binary classification
   * @param predictions Model predictions (binarized)
   * @param groundTruth True labels
   * @returns Object with precision and recall scores
   */
  calculatePrecisionRecall(predictions: number[], groundTruth: number[]): { precision: number; recall: number } {
    if (predictions.length !== groundTruth.length) {
      throw new Error('Predictions and ground truth must have same length');
    }

    // Build confusion matrix
    const cm = this.buildConfusionMatrix(predictions, groundTruth);

    const precision = cm.truePositives / (cm.truePositives + cm.falsePositives) || 0;
    const recall = cm.truePositives / (cm.truePositives + cm.falseNegatives) || 0;

    return { precision, recall };
  }

  /**
   * Calculate F1 score (harmonic mean of precision and recall)
   * @param precision Precision score
   * @param recall Recall score
   * @returns F1 score
   */
  calculateF1Score(precision: number, recall: number): number {
    if (precision + recall === 0) return 0;
    return 2 * (precision * recall) / (precision + recall);
  }

  /**
   * Calculate comprehensive accuracy metrics
   * @param predictions Model predictions
   * @param groundTruth True labels
   * @param calculateAUC Whether to calculate AUC-ROC (requires probability predictions)
   * @returns Complete accuracy metrics
   */
  calculateMetrics(
    predictions: number[],
    groundTruth: number[],
    calculateAUC: boolean = false
  ): AccuracyMetrics {
    const accuracy = this.calculateAccuracy(predictions, groundTruth);

    // Binarize predictions for precision/recall calculation
    const binarizedPredictions = predictions.map(p => p >= 0.5 ? 1 : 0);
    const { precision, recall } = this.calculatePrecisionRecall(binarizedPredictions, groundTruth);
    const f1Score = this.calculateF1Score(precision, recall);

    const confusionMatrix = this.buildConfusionMatrix(binarizedPredictions, groundTruth);
    const specificity = confusionMatrix.trueNegatives /
                       (confusionMatrix.trueNegatives + confusionMatrix.falsePositives) || 0;

    let aucROC: number | undefined;
    if (calculateAUC && this.isProbabilityDistribution(predictions)) {
      aucROC = this.calculateAUCROC(predictions, groundTruth);
    }

    // Calculate confidence intervals (simplified)
    const confidenceInterval = this.calculateConfidenceIntervals(
      accuracy, precision, recall, predictions.length
    );

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      specificity,
      aucROC,
      confusionMatrix,
      confidenceInterval
    };
  }

  /**
   * Calculate AUC-ROC for binary classification
   * @param predictions Probability predictions (0.0-1.0)
   * @param groundTruth True binary labels (0 or 1)
   * @returns AUC-ROC score (0.0-1.0, where 0.5 = random)
   */
  calculateAUCROC(predictions: number[], groundTruth: number[]): number {
    if (predictions.length !== groundTruth.length) {
      throw new Error('Predictions and ground truth must have same length');
    }

    // Create pairs of (prediction, label)
    const pairs: Array<{ pred: number; label: number }> = predictions.map((pred, i) => ({
      pred,
      label: groundTruth[i]
    }));

    // Sort by prediction score (descending)
    pairs.sort((a, b) => b.pred - a.pred);

    let auc = 0;
    let prevPred = -Infinity;
    let tp = 0, fp = 0;
    let tpPrev = 0, fpPrev = 0;
    let aucTemp = 0;

    const totalPositives = groundTruth.reduce((sum, val) => sum + val, 0);
    const totalNegatives = groundTruth.length - totalPositives;

    for (const pair of pairs) {
      if (pair.pred !== prevPred) {
        // Add trapezoid area
        aucTemp += (fp - fpPrev) * (tp + tpPrev) / 2;
        tpPrev = tp;
        fpPrev = fp;
        prevPred = pair.pred;
      }

      if (pair.label === 1) {
        tp++;
      } else {
        fp++;
      }
    }

    // Add final trapezoid
    aucTemp += (fp - fpPrev) * (tp + tpPrev) / 2;

    auc = aucTemp / (totalPositives * totalNegatives);

    return Math.max(0, Math.min(1, auc));
  }

  /**
   * Validate performance against thresholds
   * @param metrics Calculated accuracy metrics
   * @param thresholds Performance thresholds
   * @returns Validation result
   */
  validateAgainstThreshold(
    metrics: AccuracyMetrics,
    thresholds: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
      aucROC?: number;
    }
  ): PerformanceValidationResult {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // Check accuracy
    if (metrics.accuracy < thresholds.accuracy) {
      violations.push(`Accuracy ${metrics.accuracy.toFixed(3)} below threshold ${thresholds.accuracy}`);
      recommendations.push('Consider model retraining or hyperparameter tuning');
    }

    // Check precision
    if (metrics.precision < thresholds.precision) {
      violations.push(`Precision ${metrics.precision.toFixed(3)} below threshold ${thresholds.precision}`);
      recommendations.push('Review false positive reduction strategies');
    }

    // Check recall
    if (metrics.recall < thresholds.recall) {
      violations.push(`Recall ${metrics.recall.toFixed(3)} below threshold ${thresholds.recall}`);
      recommendations.push('Review false negative reduction strategies');
    }

    // Check F1 score
    if (metrics.f1Score < thresholds.f1Score) {
      violations.push(`F1 Score ${metrics.f1Score.toFixed(3)} below threshold ${thresholds.f1Score}`);
      recommendations.push('Balance precision and recall optimization');
    }

    // Check AUC-ROC if available
    if (metrics.aucROC !== undefined && thresholds.aucROC !== undefined) {
      if (metrics.aucROC < thresholds.aucROC) {
        violations.push(`AUC-ROC ${metrics.aucROC.toFixed(3)} below threshold ${thresholds.aucROC}`);
        recommendations.push('Review model calibration and discrimination ability');
      }
    }

    // Determine degradation level
    const violationCount = violations.length;
    let degradationLevel: 'none' | 'minor' | 'moderate' | 'severe' | 'critical';

    if (violationCount === 0) {
      degradationLevel = 'none';
    } else if (violationCount === 1) {
      degradationLevel = 'minor';
    } else if (violationCount === 2) {
      degradationLevel = 'moderate';
    } else if (violationCount === 3) {
      degradationLevel = 'severe';
    } else {
      degradationLevel = 'critical';
    }

    return {
      isValid: violations.length === 0,
      violations,
      recommendations,
      degradationLevel,
      metadata: {
        thresholds,
        metrics,
        violationCount
      }
    };
  }

  /**
   * Generate comprehensive performance report
   * @param systemId AI system identifier
   * @param predictions Model predictions
   * @param groundTruth True labels
   * @param timeRange Time range for the report
   * @param thresholds Performance thresholds
   * @param previousMetrics Optional previous period metrics for trend analysis
   * @returns Complete performance report
   */
  generatePerformanceReport(
    systemId: string,
    predictions: number[],
    groundTruth: number[],
    timeRange: { start: string; end: string },
    thresholds: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
      aucROC?: number;
    },
    previousMetrics?: AccuracyMetrics
  ): PerformanceReport {
    const metrics = this.calculateMetrics(predictions, groundTruth, true);
    const validation = this.validateAgainstThreshold(metrics, thresholds);

    // Calculate trends
    let trends: PerformanceReport['trends'];
    if (previousMetrics) {
      const accuracyChange = ((metrics.accuracy - previousMetrics.accuracy) / previousMetrics.accuracy) * 100;
      const precisionChange = ((metrics.precision - previousMetrics.precision) / previousMetrics.precision) * 100;
      const recallChange = ((metrics.recall - previousMetrics.recall) / previousMetrics.recall) * 100;

      let trend: 'improving' | 'stable' | 'degrading';
      const avgChange = (accuracyChange + precisionChange + recallChange) / 3;

      if (avgChange > 5) {
        trend = 'improving';
      } else if (avgChange < -5) {
        trend = 'degrading';
      } else {
        trend = 'stable';
      }

      trends = {
        accuracyChange,
        precisionChange,
        recallChange,
        trend
      };
    } else {
      trends = {
        accuracyChange: 0,
        precisionChange: 0,
        recallChange: 0,
        trend: 'stable'
      };
    }

    // Generate benchmarks comparison
    const benchmarkComparison = metrics.accuracy > thresholds.accuracy ? 'above' :
                               metrics.accuracy === thresholds.accuracy ? 'at' : 'below';

    const benchmarks: PerformanceReport['benchmarks'] = {
      targetThreshold: thresholds.accuracy,
      benchmarkComparison,
      // In a real implementation, you might fetch industry averages
      industryAverage: 0.85
    };

    // Generate recommendations based on analysis
    const recommendations = this.generatePerformanceRecommendations(
      validation,
      trends,
      metrics,
      thresholds
    );

    return {
      systemId,
      timeRange,
      metrics,
      validation,
      trends,
      benchmarks,
      recommendations,
      metadata: {
        sampleSize: predictions.length,
        calculationTime: new Date().toISOString(),
        confidenceLevel: this.confidenceLevel
      }
    };
  }

  /**
   * Analyze performance degradation over time
   * @param performanceHistory Array of performance reports over time
   * @returns Degradation analysis
   */
  analyzePerformanceDegradation(performanceHistory: PerformanceReport[]): {
    overallTrend: 'improving' | 'stable' | 'degrading';
    degradationRate: number; // Percentage per period
    criticalMetrics: string[];
    recommendations: string[];
  } {
    if (performanceHistory.length < 2) {
      return {
        overallTrend: 'stable',
        degradationRate: 0,
        criticalMetrics: [],
        recommendations: ['Need more performance history for trend analysis']
      };
    }

    // Calculate trends for each metric
    const accuracyTrend = this.calculateTrend(performanceHistory.map(r => r.metrics.accuracy));
    const precisionTrend = this.calculateTrend(performanceHistory.map(r => r.metrics.precision));
    const recallTrend = this.calculateTrend(performanceHistory.map(r => r.metrics.recall));

    // Determine overall trend
    const trends = [accuracyTrend, precisionTrend, recallTrend];
    const avgTrend = trends.reduce((sum, t) => sum + t, 0) / trends.length;

    let overallTrend: 'improving' | 'stable' | 'degrading';
    if (avgTrend > 0.02) { // 2% improvement per period
      overallTrend = 'improving';
    } else if (avgTrend < -0.02) { // 2% degradation per period
      overallTrend = 'degrading';
    } else {
      overallTrend = 'stable';
    }

    // Identify critical metrics (degrading significantly)
    const criticalMetrics: string[] = [];
    if (accuracyTrend < -0.05) criticalMetrics.push('accuracy');
    if (precisionTrend < -0.05) criticalMetrics.push('precision');
    if (recallTrend < -0.05) criticalMetrics.push('recall');

    // Generate recommendations
    const recommendations = this.generateDegradationRecommendations(
      overallTrend,
      criticalMetrics,
      Math.abs(avgTrend) * 100
    );

    return {
      overallTrend,
      degradationRate: avgTrend * 100, // Convert to percentage
      criticalMetrics,
      recommendations
    };
  }

  // Private helper methods

  private buildConfusionMatrix(predictions: number[], groundTruth: number[]): {
    truePositives: number;
    trueNegatives: number;
    falsePositives: number;
    falseNegatives: number;
  } {
    let tp = 0, tn = 0, fp = 0, fn = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i];
      const actual = groundTruth[i];

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 1) fn++;
    }

    return { truePositives: tp, trueNegatives: tn, falsePositives: fp, falseNegatives: fn };
  }

  private calculateConfidenceIntervals(
    accuracy: number,
    precision: number,
    recall: number,
    sampleSize: number
  ): { accuracy: [number, number]; precision: [number, number]; recall: [number, number] } | undefined {
    if (sampleSize < 30) return undefined; // Need sufficient sample size

    // Simplified confidence interval calculation using normal approximation
    const z = 1.96; // 95% confidence
    const accuracySE = Math.sqrt((accuracy * (1 - accuracy)) / sampleSize);

    // For precision and recall, use more complex formulas (simplified here)
    const precisionSE = Math.sqrt((precision * (1 - precision)) / sampleSize);
    const recallSE = Math.sqrt((recall * (1 - recall)) / sampleSize);

    return {
      accuracy: [
        Math.max(0, accuracy - z * accuracySE),
        Math.min(1, accuracy + z * accuracySE)
      ],
      precision: [
        Math.max(0, precision - z * precisionSE),
        Math.min(1, precision + z * precisionSE)
      ],
      recall: [
        Math.max(0, recall - z * recallSE),
        Math.min(1, recall + z * recallSE)
      ]
    };
  }

  private isProbabilityDistribution(predictions: number[]): boolean {
    // Check if predictions are between 0 and 1 and not just 0/1
    return predictions.every(p => p >= 0 && p <= 1) &&
           predictions.some(p => p > 0 && p < 1);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return slope;
  }

  private generatePerformanceRecommendations(
    validation: PerformanceValidationResult,
    trends: PerformanceReport['trends'],
    metrics: AccuracyMetrics,
    thresholds: any
  ): string[] {
    const recommendations: string[] = [];

    // Add validation-based recommendations
    recommendations.push(...validation.recommendations);

    // Add trend-based recommendations
    if (trends.trend === 'degrading') {
      recommendations.push('🚨 Performance is degrading over time - investigate root causes');
      recommendations.push('Consider model retraining with recent data');
    } else if (trends.trend === 'improving') {
      recommendations.push('✅ Performance is improving - continue current approach');
    }

    // Add metric-specific recommendations
    if (metrics.precision > 0.8 && metrics.recall < 0.6) {
      recommendations.push('High precision but low recall - consider adjusting decision threshold');
    } else if (metrics.recall > 0.8 && metrics.precision < 0.6) {
      recommendations.push('High recall but low precision - review false positive handling');
    }

    // Add confidence interval recommendations
    if (metrics.confidenceInterval) {
      const accuracyCI = metrics.confidenceInterval.accuracy;
      if (accuracyCI[0] < thresholds.accuracy && accuracyCI[1] > thresholds.accuracy) {
        recommendations.push('Accuracy confidence interval spans threshold - consider larger sample');
      }
    }

    return recommendations;
  }

  private generateDegradationRecommendations(
    trend: string,
    criticalMetrics: string[],
    degradationRate: number
  ): string[] {
    const recommendations: string[] = [];

    if (trend === 'degrading') {
      recommendations.push(`🚨 Performance degrading at ${(degradationRate).toFixed(2)}% per period`);

      if (criticalMetrics.includes('accuracy')) {
        recommendations.push('Accuracy degradation detected - check for data quality issues');
      }
      if (criticalMetrics.includes('precision')) {
        recommendations.push('Precision degradation - review false positive sources');
      }
      if (criticalMetrics.includes('recall')) {
        recommendations.push('Recall degradation - investigate false negative patterns');
      }

      recommendations.push('Schedule model maintenance and retraining');
      recommendations.push('Monitor data distribution changes');
    }

    return recommendations;
  }
}

// Factory function for creating accuracy monitor
export function createAccuracyMonitor(confidenceLevel: number = 0.95): AccuracyMonitor {
  const monitor = new AccuracyMonitor();
  // Note: In a real implementation, you might expose confidence level setting
  return monitor;
}

// Utility function to run comprehensive accuracy analysis
export function runAccuracyAnalysis(
  predictions: number[],
  groundTruth: number[],
  thresholds: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    aucROC?: number;
  },
  previousMetrics?: AccuracyMetrics
): PerformanceReport {
  const monitor = createAccuracyMonitor();
  const timeRange = {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
    end: new Date().toISOString()
  };

  return monitor.generatePerformanceReport(
    'system-analysis',
    predictions,
    groundTruth,
    timeRange,
    thresholds,
    previousMetrics
  );
}