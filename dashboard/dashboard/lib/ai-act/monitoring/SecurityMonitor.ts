/**
 * Security Monitor for AI Systems
 * Detects AI-specific security threats and attacks
 */

export interface SecurityThreat {
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0.0-1.0
  description: string;
  indicators: string[];
  affectedComponents: string[];
  potentialImpact: {
    confidentiality: 'none' | 'low' | 'medium' | 'high';
    integrity: 'none' | 'low' | 'medium' | 'high';
    availability: 'none' | 'low' | 'medium' | 'high';
  };
  recommendedActions: string[];
  detectionTime: string;
  source: string;
}

export interface ModelExtractionAttempt {
  attemptType: 'query_based' | 'architecture_inference' | 'parameter_inference';
  confidence: number;
  indicators: string[];
  queryPatterns: string[];
  potentialDataExposed: string[];
  mitigationSuggestions: string[];
}

export interface AdversarialInputDetection {
  attackType: 'evasion' | 'poisoning' | 'model_inversion' | 'membership_inference';
  confidence: number;
  perturbationMagnitude: number;
  affectedPredictions: number[];
  inputCharacteristics: Record<string, any>;
  detectionMethod: string;
}

export interface DataPoisoningDetection {
  poisoningType: 'label_flipping' | 'feature_manipulation' | 'backdoor_insertion';
  affectedDataPoints: number;
  contaminationRate: number; // 0.0-1.0
  suspiciousPatterns: string[];
  sourceAnalysis: {
    potentialAttackers: string[];
    attackVectors: string[];
    timingPatterns: string[];
  };
}

export interface SecurityMonitoringResult {
  overallSecurityScore: number; // 0.0-1.0
  activeThreats: SecurityThreat[];
  threatSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  detectionCoverage: {
    modelExtraction: boolean;
    adversarialInputs: boolean;
    dataPoisoning: boolean;
    unauthorizedAccess: boolean;
  };
  recommendations: string[];
  lastAssessment: string;
}

export class SecurityMonitor {
  private config: {
    sensitivity: {
      modelExtraction: number;
      adversarialInputs: number;
      dataPoisoning: number;
      accessControl: number;
    };
    monitoring: {
      enableRealTimeDetection: boolean;
      logAllQueries: boolean;
      trackQueryPatterns: boolean;
      alertThresholds: {
        critical: number;
        high: number;
        medium: number;
      };
    };
  };

  constructor(config?: Partial<typeof this.config>) {
    this.config = {
      sensitivity: {
        modelExtraction: 0.7,
        adversarialInputs: 0.6,
        dataPoisoning: 0.8,
        accessControl: 0.9,
        ...config?.sensitivity
      },
      monitoring: {
        enableRealTimeDetection: true,
        logAllQueries: true,
        trackQueryPatterns: true,
        alertThresholds: {
          critical: 0.9,
          high: 0.7,
          medium: 0.5
        },
        ...config?.monitoring
      }
    };
  }

  /**
   * Analyze query patterns for model extraction attempts
   * @param queries Array of recent queries
   * @param responses Corresponding responses
   * @returns Model extraction analysis
   */
  detectModelExtraction(queries: string[], responses: any[]): ModelExtractionAttempt[] {
    const attempts: ModelExtractionAttempt[] = [];

    // Analyze query patterns for systematic model probing
    const queryPatterns = this.analyzeQueryPatterns(queries);
    const responsePatterns = this.analyzeResponsePatterns(responses);

    // Check for query-based extraction
    if (queryPatterns.systematicProbing > this.config.sensitivity.modelExtraction) {
      attempts.push({
        attemptType: 'query_based',
        confidence: queryPatterns.systematicProbing,
        indicators: [
          'Systematic query pattern detected',
          'High query frequency with similar structures',
          'Queries targeting model boundaries'
        ],
        queryPatterns: queryPatterns.suspiciousPatterns,
        potentialDataExposed: ['Model architecture hints', 'Decision boundaries', 'Feature importance'],
        mitigationSuggestions: [
          'Implement query rate limiting',
          'Add noise to responses',
          'Monitor for suspicious query patterns'
        ]
      });
    }

    // Check for architecture inference attempts
    if (queryPatterns.architectureProbing > this.config.sensitivity.modelExtraction) {
      attempts.push({
        attemptType: 'architecture_inference',
        confidence: queryPatterns.architectureProbing,
        indicators: [
          'Queries designed to infer model architecture',
          'Boundary testing patterns',
          'Systematic parameter exploration'
        ],
        queryPatterns: queryPatterns.architecturePatterns,
        potentialDataExposed: ['Model type', 'Layer information', 'Activation functions'],
        mitigationSuggestions: [
          'Implement response filtering',
          'Use model watermarking',
          'Limit detailed error messages'
        ]
      });
    }

    return attempts;
  }

  /**
   * Detect adversarial inputs and attacks
   * @param inputs Array of model inputs
   * @param predictions Model predictions
   * @param metadata Additional context
   * @returns Adversarial input detections
   */
  detectAdversarialInputs(
    inputs: number[][],
    predictions: number[],
    metadata?: Record<string, any>[]
  ): AdversarialInputDetection[] {
    const detections: AdversarialInputDetection[] = [];

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const prediction = predictions[i];
      const meta = metadata?.[i] || {};

      // Statistical anomaly detection
      const inputStats = this.calculateInputStatistics(input);
      const predictionAnomaly = this.detectPredictionAnomaly(prediction, meta);

      // Check for potential adversarial characteristics
      const adversarialScore = this.calculateAdversarialScore(inputStats, predictionAnomaly, meta);

      if (adversarialScore > this.config.sensitivity.adversarialInputs) {
        const attackType = this.classifyAdversarialAttack(inputStats, predictionAnomaly);

        detections.push({
          attackType,
          confidence: adversarialScore,
          perturbationMagnitude: inputStats.anomalyScore,
          affectedPredictions: [prediction],
          inputCharacteristics: {
            ...inputStats,
            source: meta.source || 'unknown',
            timestamp: meta.timestamp || new Date().toISOString()
          },
          detectionMethod: 'statistical_anomaly_detection'
        });
      }
    }

    return detections;
  }

  /**
   * Detect potential data poisoning attempts
   * @param trainingData Recent training data or updates
   * @param performanceMetrics Performance metrics before/after updates
   * @returns Data poisoning detections
   */
  detectDataPoisoning(
    trainingData: Array<{ features: number[]; label: number; source?: string; timestamp?: string }>,
    performanceMetrics?: { before: number; after: number }
  ): DataPoisoningDetection[] {
    const detections: DataPoisoningDetection[] = [];

    // Analyze data distribution for anomalies
    const distributionAnalysis = this.analyzeDataDistribution(trainingData);

    // Check for suspicious patterns
    const suspiciousPatterns = this.identifySuspiciousPatterns(trainingData);

    // Analyze source attribution
    const sourceAnalysis = this.analyzeDataSources(trainingData);

    // Calculate poisoning confidence
    const poisoningConfidence = this.calculatePoisoningConfidence(
      distributionAnalysis,
      suspiciousPatterns,
      performanceMetrics
    );

    if (poisoningConfidence > this.config.sensitivity.dataPoisoning) {
      const poisoningType = this.classifyPoisoningType(suspiciousPatterns, distributionAnalysis);

      detections.push({
        poisoningType,
        affectedDataPoints: suspiciousPatterns.length,
        contaminationRate: suspiciousPatterns.length / trainingData.length,
        suspiciousPatterns: suspiciousPatterns.map(p => p.pattern),
        sourceAnalysis
      });
    }

    return detections;
  }

  /**
   * Monitor for unauthorized access attempts
   * @param accessLogs Access logs with user, action, resource, timestamp
   * @returns Security threats detected
   */
  detectUnauthorizedAccess(accessLogs: Array<{
    user: string;
    action: string;
    resource: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
  }>): SecurityThreat[] {
    const threats: SecurityThreat[] = [];

    // Analyze access patterns
    const accessPatterns = this.analyzeAccessPatterns(accessLogs);

    // Detect brute force attempts
    if (accessPatterns.bruteForceIndicators > this.config.sensitivity.accessControl) {
      threats.push({
        threatType: 'brute_force_attack',
        severity: 'high',
        confidence: accessPatterns.bruteForceIndicators,
        description: 'Multiple failed authentication attempts detected',
        indicators: [
          'High frequency of failed logins',
          'Sequential IP addresses',
          'Common password patterns'
        ],
        affectedComponents: ['authentication_system'],
        potentialImpact: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'medium'
        },
        recommendedActions: [
          'Implement account lockout',
          'Enable multi-factor authentication',
          'Monitor for IP blocking'
        ],
        detectionTime: new Date().toISOString(),
        source: 'access_pattern_analysis'
      });
    }

    // Detect privilege escalation attempts
    if (accessPatterns.privilegeEscalation > this.config.sensitivity.accessControl) {
      threats.push({
        threatType: 'privilege_escalation',
        severity: 'critical',
        confidence: accessPatterns.privilegeEscalation,
        description: 'Attempted unauthorized privilege escalation detected',
        indicators: [
          'Access to restricted resources',
          'Unusual permission combinations',
          'Sequential privilege requests'
        ],
        affectedComponents: ['authorization_system', 'access_control'],
        potentialImpact: {
          confidentiality: 'high',
          integrity: 'high',
          availability: 'medium'
        },
        recommendedActions: [
          'Review user permissions',
          'Implement principle of least privilege',
          'Enable audit logging for privilege changes'
        ],
        detectionTime: new Date().toISOString(),
        source: 'authorization_analysis'
      });
    }

    // Detect anomalous access patterns
    if (accessPatterns.anomalousAccess > this.config.sensitivity.accessControl) {
      threats.push({
        threatType: 'anomalous_access',
        severity: 'medium',
        confidence: accessPatterns.anomalousAccess,
        description: 'Unusual access patterns detected',
        indicators: [
          'Access outside normal hours',
          'Access from unusual locations',
          'Unusual resource combinations'
        ],
        affectedComponents: ['access_monitoring'],
        potentialImpact: {
          confidentiality: 'medium',
          integrity: 'low',
          availability: 'low'
        },
        recommendedActions: [
          'Review access logs',
          'Implement behavioral analytics',
          'Consider additional authentication factors'
        ],
        detectionTime: new Date().toISOString(),
        source: 'behavioral_analysis'
      });
    }

    return threats;
  }

  /**
   * Run comprehensive security assessment
   * @param systemContext System context and recent activity
   * @returns Complete security monitoring results
   */
  async runSecurityAssessment(systemContext: {
    recentQueries?: string[];
    recentInputs?: number[][];
    recentPredictions?: number[];
    accessLogs?: Array<any>;
    trainingData?: Array<any>;
    performanceMetrics?: any;
  }): Promise<SecurityMonitoringResult> {
    const threats: SecurityThreat[] = [];
    let detectionCoverage = {
      modelExtraction: false,
      adversarialInputs: false,
      dataPoisoning: false,
      unauthorizedAccess: false
    };

    // Model extraction detection
    if (systemContext.recentQueries && systemContext.recentQueries.length > 0) {
      const extractionAttempts = this.detectModelExtraction(
        systemContext.recentQueries,
        [] // Would need actual responses in real implementation
      );

      if (extractionAttempts.length > 0) {
        detectionCoverage.modelExtraction = true;
        for (const attempt of extractionAttempts) {
          threats.push({
            threatType: `model_extraction_${attempt.attemptType}`,
            severity: attempt.confidence > 0.8 ? 'high' : 'medium',
            confidence: attempt.confidence,
            description: `Potential model extraction attempt: ${attempt.attemptType}`,
            indicators: attempt.indicators,
            affectedComponents: ['model_inference'],
            potentialImpact: {
              confidentiality: 'high',
              integrity: 'medium',
              availability: 'low'
            },
            recommendedActions: attempt.mitigationSuggestions,
            detectionTime: new Date().toISOString(),
            source: 'query_pattern_analysis'
          });
        }
      }
    }

    // Adversarial input detection
    if (systemContext.recentInputs && systemContext.recentPredictions) {
      const adversarialDetections = this.detectAdversarialInputs(
        systemContext.recentInputs,
        systemContext.recentPredictions
      );

      if (adversarialDetections.length > 0) {
        detectionCoverage.adversarialInputs = true;
        for (const detection of adversarialDetections) {
          threats.push({
            threatType: `adversarial_${detection.attackType}`,
            severity: detection.confidence > 0.8 ? 'critical' : 'high',
            confidence: detection.confidence,
            description: `Adversarial input detected: ${detection.attackType}`,
            indicators: [
              `Perturbation magnitude: ${detection.perturbationMagnitude.toFixed(3)}`,
              `Detection method: ${detection.detectionMethod}`
            ],
            affectedComponents: ['input_processing', 'model_inference'],
            potentialImpact: {
              confidentiality: 'low',
              integrity: 'high',
              availability: 'low'
            },
            recommendedActions: [
              'Reject suspicious inputs',
              'Log adversarial attempts',
              'Consider input sanitization'
            ],
            detectionTime: new Date().toISOString(),
            source: 'input_analysis'
          });
        }
      }
    }

    // Data poisoning detection
    if (systemContext.trainingData) {
      const poisoningDetections = this.detectDataPoisoning(
        systemContext.trainingData,
        systemContext.performanceMetrics
      );

      if (poisoningDetections.length > 0) {
        detectionCoverage.dataPoisoning = true;
        for (const detection of poisoningDetections) {
          threats.push({
            threatType: `data_poisoning_${detection.poisoningType}`,
            severity: detection.contaminationRate > 0.1 ? 'critical' : 'high',
            confidence: 0.8, // Simplified
            description: `Data poisoning detected: ${detection.poisoningType}`,
            indicators: [
              `Affected data points: ${detection.affectedDataPoints}`,
              `Contamination rate: ${(detection.contaminationRate * 100).toFixed(1)}%`
            ],
            affectedComponents: ['training_data', 'model_accuracy'],
            potentialImpact: {
              confidentiality: 'medium',
              integrity: 'high',
              availability: 'low'
            },
            recommendedActions: [
              'Review training data sources',
              'Implement data validation',
              'Consider model retraining with clean data'
            ],
            detectionTime: new Date().toISOString(),
            source: 'data_integrity_analysis'
          });
        }
      }
    }

    // Unauthorized access detection
    if (systemContext.accessLogs) {
      const accessThreats = this.detectUnauthorizedAccess(systemContext.accessLogs);

      if (accessThreats.length > 0) {
        detectionCoverage.unauthorizedAccess = true;
        threats.push(...accessThreats);
      }
    }

    // Calculate overall security score
    const threatSeverity = threats.reduce((sum, threat) => {
      const severityScore = { low: 1, medium: 2, high: 3, critical: 4 }[threat.severity] || 1;
      return sum + (severityScore * threat.confidence);
    }, 0);

    const overallSecurityScore = Math.max(0, 1 - (threatSeverity / (threats.length * 4 || 1)));

    // Generate threat summary
    const threatSummary = threats.reduce((summary, threat) => {
      summary[threat.severity] = (summary[threat.severity] || 0) + 1;
      return summary;
    }, { critical: 0, high: 0, medium: 0, low: 0 } as any);

    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(
      overallSecurityScore,
      threats,
      detectionCoverage
    );

    return {
      overallSecurityScore,
      activeThreats: threats,
      threatSummary,
      detectionCoverage,
      recommendations,
      lastAssessment: new Date().toISOString()
    };
  }

  // Private helper methods

  private analyzeQueryPatterns(queries: string[]): {
    systematicProbing: number;
    architectureProbing: number;
    suspiciousPatterns: string[];
    architecturePatterns: string[];
  } {
    // Simplified analysis - in practice, would use ML-based pattern recognition
    const patterns = {
      systematicProbing: 0.0,
      architectureProbing: 0.0,
      suspiciousPatterns: [] as string[],
      architecturePatterns: [] as string[]
    };

    // Check for systematic probing patterns
    const uniqueQueries = new Set(queries);
    const repetitionRatio = 1 - (uniqueQueries.size / queries.length);

    if (repetitionRatio > 0.3) {
      patterns.systematicProbing = Math.min(repetitionRatio, 1.0);
      patterns.suspiciousPatterns.push('High query repetition detected');
    }

    // Check for architecture probing patterns
    const architectureKeywords = ['version', 'model', 'parameters', 'layers', 'architecture'];
    const architectureQueries = queries.filter(q =>
      architectureKeywords.some(keyword => q.toLowerCase().includes(keyword))
    );

    if (architectureQueries.length > queries.length * 0.1) {
      patterns.architectureProbing = Math.min(architectureQueries.length / queries.length, 1.0);
      patterns.architecturePatterns.push('Architecture-related queries detected');
    }

    return patterns;
  }

  private analyzeResponsePatterns(responses: any[]): any {
    // Placeholder for response pattern analysis
    return {};
  }

  private calculateInputStatistics(input: number[]): {
    mean: number;
    std: number;
    anomalyScore: number;
    outliers: number[];
  } {
    const mean = input.reduce((sum, val) => sum + val, 0) / input.length;
    const variance = input.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / input.length;
    const std = Math.sqrt(variance);

    // Simple anomaly detection based on z-scores
    const zScores = input.map(val => Math.abs(val - mean) / (std || 1));
    const outliers = input.filter((_, i) => zScores[i] > 3);

    // Anomaly score based on number of outliers and extreme values
    const anomalyScore = Math.min((outliers.length / input.length) + (zScores.reduce((sum, z) => sum + Math.max(0, z - 2), 0) / input.length), 1);

    return { mean, std, anomalyScore, outliers };
  }

  private detectPredictionAnomaly(prediction: number, metadata: Record<string, any>): {
    isAnomalous: boolean;
    anomalyScore: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let anomalyScore = 0;

    // Check for extreme predictions
    if (prediction < 0.1 || prediction > 0.9) {
      anomalyScore += 0.3;
      reasons.push('Extreme prediction value');
    }

    // Check for metadata anomalies
    if (metadata.confidence !== undefined && metadata.confidence < 0.5) {
      anomalyScore += 0.4;
      reasons.push('Low confidence prediction');
    }

    return {
      isAnomalous: anomalyScore > 0.5,
      anomalyScore,
      reasons
    };
  }

  private calculateAdversarialScore(
    inputStats: any,
    predictionAnomaly: any,
    metadata: Record<string, any>
  ): number {
    let score = 0;

    // Input anomaly contribution
    score += inputStats.anomalyScore * 0.4;

    // Prediction anomaly contribution
    score += predictionAnomaly.anomalyScore * 0.4;

    // Metadata anomaly contribution
    if (metadata.suspiciousFlags) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private classifyAdversarialAttack(inputStats: any, predictionAnomaly: any): AdversarialInputDetection['attackType'] {
    if (predictionAnomaly.anomalyScore > 0.7) {
      return 'evasion';
    } else if (inputStats.outliers.length > inputStats.outliers.length * 0.3) {
      return 'poisoning';
    } else {
      return 'evasion'; // Default classification
    }
  }

  private analyzeDataDistribution(data: Array<{ features: number[]; label: number }>): {
    labelDistribution: Record<number, number>;
    featureCorrelations: number[];
    statisticalAnomalies: string[];
  } {
    // Simplified distribution analysis
    const labelDistribution: Record<number, number> = {};
    for (const item of data) {
      labelDistribution[item.label] = (labelDistribution[item.label] || 0) + 1;
    }

    return {
      labelDistribution,
      featureCorrelations: [],
      statisticalAnomalies: []
    };
  }

  private identifySuspiciousPatterns(data: Array<{ features: number[]; label: number; source?: string }>): Array<{ pattern: string; severity: number }> {
    const patterns: Array<{ pattern: string; severity: number }> = [];

    // Check for label flipping patterns
    const labelInconsistencies = data.filter(item =>
      item.features.some(f => Math.abs(f) > 10) && item.label === 0
    );

    if (labelInconsistencies.length > data.length * 0.05) {
      patterns.push({
        pattern: 'Potential label flipping in extreme feature values',
        severity: 0.8
      });
    }

    return patterns;
  }

  private analyzeDataSources(data: Array<{ source?: string; timestamp?: string }>): {
    potentialAttackers: string[];
    attackVectors: string[];
    timingPatterns: string[];
  } {
    const sources = data.map(item => item.source).filter(Boolean) as string[];
    const uniqueSources = [...new Set(sources)];

    return {
      potentialAttackers: uniqueSources.filter(source => sources.filter(s => s === source).length > data.length * 0.1),
      attackVectors: ['data_injection', 'label_manipulation'],
      timingPatterns: ['concentrated_uploads']
    };
  }

  private calculatePoisoningConfidence(
    distribution: any,
    patterns: Array<{ pattern: string; severity: number }>,
    performanceMetrics?: { before: number; after: number }
  ): number {
    let confidence = 0;

    // Pattern-based confidence
    confidence += patterns.reduce((sum, p) => sum + p.severity, 0) / (patterns.length || 1);

    // Performance impact
    if (performanceMetrics) {
      const degradation = performanceMetrics.before - performanceMetrics.after;
      if (degradation > 0.1) {
        confidence += 0.3;
      }
    }

    return Math.min(confidence, 1.0);
  }

  private classifyPoisoningType(
    patterns: Array<{ pattern: string; severity: number }>,
    distribution: any
  ): DataPoisoningDetection['poisoningType'] {
    if (patterns.some(p => p.pattern.includes('label'))) {
      return 'label_flipping';
    } else if (patterns.some(p => p.pattern.includes('feature'))) {
      return 'feature_manipulation';
    } else {
      return 'backdoor_insertion';
    }
  }

  private analyzeAccessPatterns(accessLogs: Array<any>): {
    bruteForceIndicators: number;
    privilegeEscalation: number;
    anomalousAccess: number;
  } {
    let bruteForceIndicators = 0;
    let privilegeEscalation = 0;
    let anomalousAccess = 0;

    // Simple pattern analysis (would be more sophisticated in production)
    const failedAttempts = accessLogs.filter(log => !log.success);

    if (failedAttempts.length > accessLogs.length * 0.1) {
      bruteForceIndicators = Math.min(failedAttempts.length / accessLogs.length, 1.0);
    }

    // Check for privilege escalation patterns
    const privilegeChanges = accessLogs.filter(log =>
      log.action.includes('permission') || log.action.includes('role')
    );

    if (privilegeChanges.length > 5) {
      privilegeEscalation = 0.7;
    }

    return {
      bruteForceIndicators,
      privilegeEscalation,
      anomalousAccess
    };
  }

  private generateSecurityRecommendations(
    overallScore: number,
    threats: SecurityThreat[],
    detectionCoverage: any
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore < 0.6) {
      recommendations.push('🚨 CRITICAL: Multiple security vulnerabilities detected');
      recommendations.push('Immediate security audit and remediation required');
      recommendations.push('Consider suspending system access until secured');
    } else if (overallScore < 0.8) {
      recommendations.push('⚠️ SECURITY CONCERNS: Vulnerabilities detected requiring attention');
      recommendations.push('Implement recommended security measures');
      recommendations.push('Schedule security improvements in next sprint');
    } else {
      recommendations.push('✅ GOOD SECURITY: System shows adequate security posture');
    }

    // Add specific recommendations based on threat types
    const threatTypes = threats.map(t => t.threatType);
    if (threatTypes.some(t => t.includes('model_extraction'))) {
      recommendations.push('Implement model extraction countermeasures (rate limiting, response obfuscation)');
    }

    if (threatTypes.some(t => t.includes('adversarial'))) {
      recommendations.push('Deploy adversarial input detection and filtering');
    }

    if (threatTypes.some(t => t.includes('data_poisoning'))) {
      recommendations.push('Strengthen data validation and poisoning detection');
    }

    if (threatTypes.some(t => t.includes('unauthorized'))) {
      recommendations.push('Review and strengthen access controls and monitoring');
    }

    // Coverage recommendations
    if (!detectionCoverage.modelExtraction) {
      recommendations.push('Enable model extraction detection monitoring');
    }

    if (!detectionCoverage.adversarialInputs) {
      recommendations.push('Implement adversarial input detection');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// Factory function for creating security monitor
export function createSecurityMonitor(config?: Partial<SecurityMonitor['config']>): SecurityMonitor {
  return new SecurityMonitor(config);
}

// Utility function for quick security assessment
export async function runQuickSecurityAssessment(systemContext: {
  recentQueries?: string[];
  recentInputs?: number[][];
  recentPredictions?: number[];
  accessLogs?: Array<any>;
}): Promise<{
  securityScore: number;
  criticalThreats: number;
  recommendations: string[];
}> {
  const monitor = createSecurityMonitor();

  const results = await monitor.runSecurityAssessment(systemContext);

  return {
    securityScore: results.overallSecurityScore,
    criticalThreats: results.threatSummary.critical,
    recommendations: results.recommendations.slice(0, 5) // Top 5 recommendations
  };
}