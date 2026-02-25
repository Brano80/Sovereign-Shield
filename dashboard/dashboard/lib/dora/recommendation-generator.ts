import 'server-only';
import {
  IncidentPattern,
  ImprovementRecommendation,
  RecommendationType,
  RecommendationPriority,
  RootCauseAnalysis,
  RootCauseCategory,
} from "./incident-learning-types";
import prisma from "@/lib/prisma";
import { createEvidenceEvent } from "@/lib/audit/evidence-graph";

// ═══════════════════════════════════════════════════════════════
// RECOMMENDATION TEMPLATES
// ═══════════════════════════════════════════════════════════════

interface RecommendationTemplate {
  type: RecommendationType;
  titleTemplate: string;
  descriptionTemplate: string;
  rationaleTemplate: string;
  expectedBenefitTemplate: string;
  implementation: {
    effort: "LOW" | "MEDIUM" | "HIGH";
    estimatedDays: number;
    requiredResources: string[];
  };
}

const PATTERN_RECOMMENDATION_TEMPLATES: Record<string, RecommendationTemplate[]> = {
  RECURRING: [
    {
      type: "PREVENTIVE",
      titleTemplate: "Implement automated monitoring for {category} incidents",
      descriptionTemplate: "Deploy proactive monitoring to detect early warning signs of {category} incidents before they impact services.",
      rationaleTemplate: "Pattern analysis shows {count} recurring {category} incidents with average interval of {interval} days.",
      expectedBenefitTemplate: "Expected {reduction}% reduction in {category} incidents through early detection.",
      implementation: {
        effort: "MEDIUM",
        estimatedDays: 14,
        requiredResources: ["Monitoring team", "Infrastructure access"],
      },
    },
    {
      type: "PROCESS_IMPROVEMENT",
      titleTemplate: "Establish runbook for {category} incident response",
      descriptionTemplate: "Create standardized runbook with automated actions for rapid response to {category} incidents.",
      rationaleTemplate: "Recurring pattern detected with {count} similar incidents, enabling standardized response.",
      expectedBenefitTemplate: "Expected {reduction}% reduction in MTTR for {category} incidents.",
      implementation: {
        effort: "LOW",
        estimatedDays: 7,
        requiredResources: ["Operations team", "Documentation"],
      },
    },
  ],
  SEASONAL: [
    {
      type: "PREVENTIVE",
      titleTemplate: "Schedule preventive maintenance before peak periods",
      descriptionTemplate: "Implement scheduled maintenance windows before identified peak incident periods ({timePattern}).",
      rationaleTemplate: "Temporal pattern shows {percentage}% higher incident rate during {timePattern}.",
      expectedBenefitTemplate: "Expected {reduction}% reduction in peak-period incidents.",
      implementation: {
        effort: "LOW",
        estimatedDays: 3,
        requiredResources: ["Operations team"],
      },
    },
    {
      type: "DETECTIVE",
      titleTemplate: "Enhance monitoring during peak periods",
      descriptionTemplate: "Increase monitoring sensitivity and staffing during identified peak incident periods ({timePattern}).",
      rationaleTemplate: "Pattern analysis identifies {timePattern} as high-incident periods.",
      expectedBenefitTemplate: "Expected {reduction}% faster detection during peak periods.",
      implementation: {
        effort: "LOW",
        estimatedDays: 5,
        requiredResources: ["Monitoring team", "On-call schedule adjustment"],
      },
    },
  ],
  CASCADE: [
    {
      type: "TECHNICAL_CONTROL",
      titleTemplate: "Implement circuit breaker for {systems}",
      descriptionTemplate: "Deploy circuit breaker pattern to prevent cascade failures between {systems}.",
      rationaleTemplate: "Cascade pattern detected affecting {systemCount} systems within {window} minutes.",
      expectedBenefitTemplate: "Expected prevention of cascade failures, limiting blast radius by {reduction}%.",
      implementation: {
        effort: "HIGH",
        estimatedDays: 21,
        requiredResources: ["Development team", "Architecture review"],
      },
    },
    {
      type: "PROCESS_IMPROVEMENT",
      titleTemplate: "Define dependency-aware incident escalation",
      descriptionTemplate: "Implement escalation procedures that account for system dependencies identified in cascade patterns.",
      rationaleTemplate: "Cascade analysis shows {systems} are interconnected with high failure correlation.",
      expectedBenefitTemplate: "Expected {reduction}% faster cascade containment through coordinated response.",
      implementation: {
        effort: "MEDIUM",
        estimatedDays: 10,
        requiredResources: ["Operations team", "System owners"],
      },
    },
  ],
  CORRELATED: [
    {
      type: "TECHNICAL_CONTROL",
      titleTemplate: "Implement shared monitoring for correlated systems",
      descriptionTemplate: "Deploy unified monitoring dashboard for correlated systems: {systems}.",
      rationaleTemplate: "{systems} show {correlation}% incident correlation, suggesting shared dependencies.",
      expectedBenefitTemplate: "Expected {reduction}% improvement in cross-system incident detection.",
      implementation: {
        effort: "MEDIUM",
        estimatedDays: 14,
        requiredResources: ["Monitoring team", "System owners"],
      },
    },
    {
      type: "PREVENTIVE",
      titleTemplate: "Review shared infrastructure for {systems}",
      descriptionTemplate: "Conduct infrastructure review to identify and address shared single points of failure.",
      rationaleTemplate: "High correlation ({correlation}%) between {systems} incidents suggests shared failure modes.",
      expectedBenefitTemplate: "Expected identification and remediation of {count} shared failure points.",
      implementation: {
        effort: "MEDIUM",
        estimatedDays: 10,
        requiredResources: ["Infrastructure team", "Architecture review"],
      },
    },
  ],
};

const ROOT_CAUSE_RECOMMENDATION_TEMPLATES: Record<RootCauseCategory, RecommendationTemplate[]> = {
  HUMAN_ERROR: [
    {
      type: "TRAINING",
      titleTemplate: "Conduct training on {area}",
      descriptionTemplate: "Implement targeted training program to address human error patterns in {area}.",
      rationaleTemplate: "Root cause analysis identified human error as primary cause in {count} incidents.",
      expectedBenefitTemplate: "Expected {reduction}% reduction in human-error incidents.",
      implementation: {
        effort: "MEDIUM",
        estimatedDays: 14,
        requiredResources: ["Training team", "Subject matter experts"],
      },
    },
    {
      type: "PROCESS_IMPROVEMENT",
      titleTemplate: "Implement pre-change checklist for {area}",
      descriptionTemplate: "Create mandatory checklist to prevent common human errors in {area} operations.",
      rationaleTemplate: "Pattern of human errors identified in {area}, requiring procedural safeguards.",
      expectedBenefitTemplate: "Expected {reduction}% reduction in procedural errors.",
      implementation: {
        effort: "LOW",
        estimatedDays: 5,
        requiredResources: ["Operations team"],
      },
    },
  ],
  CONFIGURATION_ERROR: [
    {
      type: "TECHNICAL_CONTROL",
      titleTemplate: "Implement configuration validation",
      descriptionTemplate: "Deploy automated configuration validation to prevent deployment of invalid configurations.",
      rationaleTemplate: "Configuration errors identified as root cause in {count} incidents.",
      expectedBenefitTemplate: "Expected {reduction}% reduction in configuration-related incidents.",
      implementation: {
        effort: "MEDIUM",
        estimatedDays: 14,
        requiredResources: ["DevOps team", "Configuration management"],
      },
    },
    {
      type: "PREVENTIVE",
      titleTemplate: "Implement configuration drift detection",
      descriptionTemplate: "Deploy continuous configuration monitoring to detect unauthorized or unintended changes.",
      rationaleTemplate: "Configuration drift identified as contributing factor in {count} incidents.",
      expectedBenefitTemplate: "Expected early detection of {reduction}% of configuration issues.",
      implementation: {
        effort: "MEDIUM",
        estimatedDays: 10,
        requiredResources: ["DevOps team", "Security team"],
      },
    },
  ],
  CAPACITY_ISSUE: [
    {
      type: "PREVENTIVE",
      titleTemplate: "Implement capacity planning for {resource}",
      descriptionTemplate: "Establish proactive capacity monitoring and planning process for {resource}.",
      rationaleTemplate: "Capacity constraints identified as root cause in {count} incidents.",
      expectedBenefitTemplate: "Expected prevention of {reduction}% of capacity-related incidents.",
      implementation: {
        effort: "MEDIUM",
        estimatedDays: 21,
        requiredResources: ["Capacity planning team", "Infrastructure team"],
      },
    },
    {
      type: "TECHNICAL_CONTROL",
      titleTemplate: "Implement auto-scaling for {resource}",
      descriptionTemplate: "Deploy automatic scaling capabilities to handle demand spikes for {resource}.",
      rationaleTemplate: "Recurring capacity incidents indicate need for elastic scaling.",
      expectedBenefitTemplate: "Expected {reduction}% reduction in capacity-related outages.",
      implementation: {
        effort: "HIGH",
        estimatedDays: 28,
        requiredResources: ["Cloud team", "Architecture review"],
      },
    },
  ],
  VENDOR_ISSUE: [
    {
      type: "VENDOR_ACTION",
      titleTemplate: "Escalate recurring issues to {vendor}",
      descriptionTemplate: "Formally escalate pattern of vendor-related incidents to {vendor} with documented evidence.",
      rationaleTemplate: "Pattern of {count} incidents traced to {vendor} services/products.",
      expectedBenefitTemplate: "Expected vendor remediation addressing {reduction}% of related incidents.",
      implementation: {
        effort: "LOW",
        estimatedDays: 7,
        requiredResources: ["Vendor management", "Technical documentation"],
      },
    },
    {
      type: "PREVENTIVE",
      titleTemplate: "Implement vendor monitoring for {vendor}",
      descriptionTemplate: "Deploy dedicated monitoring for {vendor} services to enable early detection of issues.",
      rationaleTemplate: "Vendor-related incidents require improved visibility into {vendor} service health.",
      expectedBenefitTemplate: "Expected {reduction}% faster detection of vendor issues.",
      implementation: {
        effort: "LOW",
        estimatedDays: 5,
        requiredResources: ["Monitoring team"],
      },
    },
  ],
  // Add more categories as needed...
  TECHNICAL_FAILURE: [],
  PROCESS_GAP: [],
  EXTERNAL_FACTOR: [],
  SECURITY_BREACH: [],
  DEPENDENCY_FAILURE: [],
  UNKNOWN: [],
};

// ═══════════════════════════════════════════════════════════════
// RECOMMENDATION GENERATOR
// ═══════════════════════════════════════════════════════════════

export class RecommendationGenerator {
  /**
   * Generate recommendations from patterns
   */
  async generateFromPatterns(patterns: IncidentPattern[]): Promise<ImprovementRecommendation[]> {
    const recommendations: ImprovementRecommendation[] = [];

    for (const pattern of patterns) {
      if (pattern.status !== "ACTIVE") continue;
      if (pattern.confidenceScore < 50) continue;

      const templates = PATTERN_RECOMMENDATION_TEMPLATES[pattern.type] || [];

      for (const template of templates) {
        const recommendation = this.buildRecommendation(template, {
          pattern,
          category: pattern.characteristics.affectedCategories[0] || "General",
          count: pattern.relatedIncidents.length,
          interval: Math.round(pattern.characteristics.averageInterval),
          systems: pattern.characteristics.affectedSystems.join(", "),
          systemCount: pattern.characteristics.affectedSystems.length,
          timePattern: this.formatTimePattern(pattern.characteristics.timePatterns),
          percentage: Math.round(pattern.confidenceScore),
          correlation: Math.round(pattern.confidenceScore),
          reduction: this.estimateReduction(pattern, template.type),
          window: Math.round(pattern.characteristics.typicalDuration),
        });

        recommendation.sourceType = "PATTERN";
        recommendation.sourceId = pattern.id;
        recommendation.impactPrediction.affectedPatterns = [pattern.patternId];

        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Generate recommendations from root cause analysis
   */
  async generateFromRootCause(rca: RootCauseAnalysis): Promise<ImprovementRecommendation[]> {
    const recommendations: ImprovementRecommendation[] = [];

    for (const rootCause of rca.rootCauses) {
      if (!rootCause.isPrimary && rootCause.confidence < 70) continue;

      const templates = ROOT_CAUSE_RECOMMENDATION_TEMPLATES[rootCause.category] || [];

      for (const template of templates) {
        const recommendation = this.buildRecommendation(template, {
          area: rootCause.description.substring(0, 50),
          count: 1,
          vendor: rootCause.category === "VENDOR_ISSUE" ? "Vendor" : undefined,
          resource: rootCause.description.substring(0, 30),
          reduction: this.estimateReductionFromRCA(rootCause.confidence),
        });

        recommendation.sourceType = "ROOT_CAUSE";
        recommendation.sourceId = rca.id;

        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Save recommendations to database
   */
  async saveRecommendations(recommendations: ImprovementRecommendation[]): Promise<void> {
    for (const recommendation of recommendations) {
      // Check for duplicates
      const existing = await (prisma as any).improvementRecommendation.findFirst({
        where: {
          title: recommendation.title,
          status: { in: ["PROPOSED", "APPROVED", "IN_PROGRESS"] },
        },
      });

      if (existing) {
        console.log(`Skipping duplicate recommendation: ${recommendation.title}`);
        continue;
      }

      await (prisma as any).improvementRecommendation.create({
        data: recommendation,
      });

      // Create Evidence Graph event
      await createEvidenceEvent({
        eventType: "INCIDENT.RECOMMENDATION.GENERATED",
        severity: recommendation.priority === "CRITICAL" ? "HIGH" : "MEDIUM",
        regulatoryTags: ["DORA"],
        articles: ["Art.13"],
        metadata: {
          recommendationId: recommendation.recommendationId,
          title: recommendation.title,
          type: recommendation.type,
          priority: recommendation.priority,
          sourceType: recommendation.sourceType,
          generatedBy: recommendation.generatedBy,
        },
      });
    }
  }

  /**
   * Build recommendation from template
   */
  private buildRecommendation(
    template: RecommendationTemplate,
    params: Record<string, any>
  ): ImprovementRecommendation {
    const now = new Date().toISOString();

    return {
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recommendationId: `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      title: this.interpolate(template.titleTemplate, params),
      description: this.interpolate(template.descriptionTemplate, params),
      type: template.type,
      priority: this.calculatePriority(params),
      sourceType: "PATTERN",
      generatedBy: "ML_ENGINE",
      rationale: this.interpolate(template.rationaleTemplate, params),
      expectedBenefit: this.interpolate(template.expectedBenefitTemplate, params),
      impactPrediction: {
        incidentReduction: params.reduction || 20,
        riskReduction: (params.reduction || 20) * 0.8,
        confidenceLevel: params.percentage || 70,
        affectedPatterns: [],
      },
      implementation: {
        ...template.implementation,
        responsibleTeam: "TBD",
        dependencies: [],
      },
      status: "PROPOSED",
      statusHistory: [
        {
          status: "PROPOSED",
          changedBy: "system/recommendation-engine",
          changedAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
  }

  private interpolate(template: string, params: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => params[key]?.toString() || key);
  }

  private calculatePriority(params: Record<string, any>): RecommendationPriority {
    const count = params.count || 0;
    const confidence = params.percentage || params.confidence || 50;

    if (count >= 10 && confidence >= 80) return "CRITICAL";
    if (count >= 5 && confidence >= 70) return "HIGH";
    if (count >= 3 && confidence >= 50) return "MEDIUM";
    return "LOW";
  }

  private estimateReduction(pattern: IncidentPattern, type: RecommendationType): number {
    const baseReduction: Record<RecommendationType, number> = {
      PREVENTIVE: 30,
      DETECTIVE: 20,
      CORRECTIVE: 25,
      PROCESS_IMPROVEMENT: 20,
      TRAINING: 15,
      POLICY_UPDATE: 10,
      TECHNICAL_CONTROL: 35,
      VENDOR_ACTION: 25,
    };

    const confidenceMultiplier = pattern.confidenceScore / 100;
    return Math.round(baseReduction[type] * confidenceMultiplier);
  }

  private estimateReductionFromRCA(confidence: number): number {
    return Math.round(25 * (confidence / 100));
  }

  private formatTimePattern(timePatterns?: { dayOfWeek?: number[]; hourOfDay?: number[] }): string {
    if (!timePatterns) return "various times";

    const parts: string[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (timePatterns.dayOfWeek?.length) {
      parts.push(timePatterns.dayOfWeek.map((d) => dayNames[d]).join(", "));
    }

    if (timePatterns.hourOfDay?.length) {
      const hours = timePatterns.hourOfDay.sort((a, b) => a - b);
      parts.push(`${hours[0]}:00-${hours[hours.length - 1]}:00`);
    }

    return parts.join(" at ") || "various times";
  }
}

// Singleton instance
export const recommendationGenerator = new RecommendationGenerator();


