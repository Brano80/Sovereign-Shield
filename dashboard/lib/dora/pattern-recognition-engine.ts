import 'server-only';
import {
  IncidentPattern,
  PatternType,
  PatternAnalysisResult,
} from "./incident-learning-types";
import prisma from "@/lib/prisma";
import { createEvidenceEvent } from "@/lib/audit/evidence-graph";

// ═══════════════════════════════════════════════════════════════
// FEATURE EXTRACTION
// ═══════════════════════════════════════════════════════════════

interface IncidentFeatures {
  incidentId: string;
  
  // Temporal features
  dayOfWeek: number;
  hourOfDay: number;
  monthOfYear: number;
  weekOfYear: number;
  
  // Categorical features
  category: string;
  severity: string;
  type: string;
  
  // Numerical features
  durationMinutes: number;
  affectedUsers: number;
  
  // System features
  affectedSystems: string[];
  affectedServices: string[];
  
  // Text features (for NLP)
  titleTokens: string[];
  descriptionTokens: string[];
  rootCauseTokens: string[];
  
  // Correlation features
  precedingIncidentIds: string[];
  followingIncidentIds: string[];
}

type IncidentLike = {
  id: string;
  occurredAt: string;
  resolvedAt?: string | null;
  title?: string;
  description?: string;
  category?: string;
  type?: string;
  severity?: string;
  status?: string;
  durationMinutes?: number;
  affectedUsers?: number;
  affectedSystems?: string[];
  affectedServices?: string[];
  rootCauseAnalysis?: { rootCauses?: Array<{ description?: string }> };
};

// ═══════════════════════════════════════════════════════════════
// PATTERN RECOGNITION ENGINE
// ═══════════════════════════════════════════════════════════════

export class PatternRecognitionEngine {
  private readonly SIMILARITY_THRESHOLD = 0.7;
  private readonly MIN_PATTERN_INCIDENTS = 3;
  private readonly ANALYSIS_WINDOW_DAYS = 365;

  /**
   * Run full pattern analysis
   */
  async analyzePatterns(): Promise<PatternAnalysisResult> {
    const startTime = Date.now();
    const analysisId = `analysis-${Date.now()}`;

    console.log("Starting pattern analysis...");

    // 1. Fetch incidents for analysis
    const timeRangeStart = new Date();
    timeRangeStart.setDate(timeRangeStart.getDate() - this.ANALYSIS_WINDOW_DAYS);
    const timeRangeEnd = new Date();

    // Fetch incidents - try dora_incidents table first, fallback to dora_lite_incidents
    // Note: This assumes incidents table exists. Adjust based on actual schema.
    const incidents = (await prisma.$queryRaw<unknown[]>`
      SELECT 
        id,
        title,
        description,
        detected_at as "occurredAt",
        resolved_at as "resolvedAt",
        severity,
        status,
        category,
        type,
        duration_minutes as "durationMinutes",
        affected_users as "affectedUsers",
        affected_systems as "affectedSystems",
        affected_services as "affectedServices"
      FROM dora_incidents
      WHERE detected_at >= ${timeRangeStart.toISOString()}
        AND detected_at <= ${timeRangeEnd.toISOString()}
        AND status IN ('RESOLVED', 'CLOSED')
      ORDER BY detected_at ASC
    `.catch(async () => {
      // Fallback to dora_lite_incidents if dora_incidents doesn't exist
      return await prisma.$queryRaw<unknown[]>`
        SELECT 
          id,
          incident_type as title,
          description,
          detected_at as "occurredAt",
          resolved_at as "resolvedAt",
          severity,
          status,
          'UNKNOWN' as category,
          incident_type as type,
          0 as "durationMinutes",
          0 as "affectedUsers",
          ARRAY[]::text[] as "affectedSystems",
          ARRAY[]::text[] as "affectedServices"
        FROM dora_lite_incidents
        WHERE detected_at >= ${timeRangeStart.toISOString()}
          AND detected_at <= ${timeRangeEnd.toISOString()}
          AND status IN ('RESOLVED', 'CLOSED')
        ORDER BY detected_at ASC
      `;
    })) as unknown as IncidentLike[];

    console.log(`Analyzing ${incidents.length} incidents...`);

    // 2. Extract features
    const features = incidents.map((incident) => this.extractFeatures(incident));

    // 3. Detect patterns using multiple methods
    const patterns: IncidentPattern[] = [];

    // Recurring pattern detection
    const recurringPatterns = await this.detectRecurringPatterns(incidents);
    patterns.push(...recurringPatterns);

    // Temporal pattern detection
    const temporalPatterns = await this.detectTemporalPatterns(incidents, features);
    patterns.push(...temporalPatterns);

    // Cascade pattern detection
    const cascadePatterns = await this.detectCascadePatterns(incidents);
    patterns.push(...cascadePatterns);

    // Correlation pattern detection
    const correlatedPatterns = await this.detectCorrelatedPatterns(incidents);
    patterns.push(...correlatedPatterns);

    // Anomaly detection
    const anomalies = await this.detectAnomalies(incidents);

    // 4. Update existing patterns
    let newPatterns = 0;
    let updatedPatterns = 0;

    for (const pattern of patterns) {
      const existing = await (prisma as any).incidentPattern.findFirst({
        where: {
          type: pattern.type,
          characteristics: {
            path: ["affectedCategories"],
            array_contains: pattern.characteristics.affectedCategories,
          },
        },
      });

      if (existing) {
        await this.updatePattern(existing.id, pattern);
        updatedPatterns++;
      } else {
        await this.createPattern(pattern);
        newPatterns++;
      }
    }

    // 5. Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "INCIDENT.PATTERN.ANALYSIS_COMPLETED",
      severity: "INFO",
      regulatoryTags: ["DORA"],
      articles: ["Art.13"],
      metadata: {
        analysisId,
        incidentsAnalyzed: incidents.length,
        patternsFound: patterns.length,
        newPatterns,
        updatedPatterns,
        anomaliesDetected: anomalies.length,
      },
    });

    // 6. Compile results
    const result: PatternAnalysisResult = {
      analysisId,
      analyzedAt: new Date().toISOString(),
      incidentsAnalyzed: incidents.length,
      timeRangeStart: timeRangeStart.toISOString(),
      timeRangeEnd: timeRangeEnd.toISOString(),
      patternsFound: {
        new: newPatterns,
        updated: updatedPatterns,
        total: patterns.length,
      },
      patternsByType: this.groupByType(patterns),
      topPatterns: patterns
        .sort((a, b) => b.relatedIncidents.length - a.relatedIncidents.length)
        .slice(0, 10)
        .map((p) => ({
          patternId: p.patternId,
          name: p.name,
          type: p.type,
          incidentCount: p.relatedIncidents.length,
          confidence: p.confidenceScore,
        })),
      recommendationsGenerated: 0, // Will be updated by recommendation engine
      anomalies,
      modelVersion: "1.0.0",
      processingTimeMs: Date.now() - startTime,
    };

    console.log(`Pattern analysis completed in ${result.processingTimeMs}ms`);

    return result;
  }

  /**
   * Extract features from incident
   */
  private extractFeatures(incident: IncidentLike): IncidentFeatures {
    const occurredAt = new Date(incident.occurredAt);

    return {
      incidentId: incident.id,
      dayOfWeek: occurredAt.getDay(),
      hourOfDay: occurredAt.getHours(),
      monthOfYear: occurredAt.getMonth() + 1,
      weekOfYear: this.getWeekOfYear(occurredAt),
      category: incident.category || "",
      severity: incident.severity || "",
      type: incident.type || "",
      durationMinutes: incident.durationMinutes || 0,
      affectedUsers: incident.affectedUsers || 0,
      affectedSystems: incident.affectedSystems || [],
      affectedServices: incident.affectedServices || [],
      titleTokens: this.tokenize(incident.title || ""),
      descriptionTokens: this.tokenize(incident.description || ""),
      rootCauseTokens: this.tokenize(incident.rootCauseAnalysis?.rootCauses?.[0]?.description || ""),
      precedingIncidentIds: [],
      followingIncidentIds: [],
    };
  }

  /**
   * Detect recurring patterns (same type of incident repeating)
   */
  private async detectRecurringPatterns(
    incidents: IncidentLike[]
  ): Promise<IncidentPattern[]> {
    const patterns: IncidentPattern[] = [];

    // Group by category and type
    const grouped = new Map<string, IncidentLike[]>();
    for (const incident of incidents) {
      const key = `${incident.category || "UNKNOWN"}-${incident.type || "UNKNOWN"}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(incident);
    }

    // Analyze each group
    for (const [key, groupIncidents] of grouped) {
      if (groupIncidents.length < this.MIN_PATTERN_INCIDENTS) continue;

      const [category, type] = key.split("-");

      // Calculate intervals between incidents
      const intervals: number[] = [];
      for (let i = 1; i < groupIncidents.length; i++) {
        const prev = new Date(groupIncidents[i - 1].occurredAt);
        const curr = new Date(groupIncidents[i].occurredAt);
        intervals.push((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (intervals.length === 0) continue;

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);

      // If coefficient of variation is low, it's a recurring pattern
      const cv = avgInterval > 0 ? stdDev / avgInterval : 1;
      if (cv < 0.5 && avgInterval < 60) {
        // CV < 0.5 and interval < 60 days
        const confidence = Math.min(100, Math.round((1 - cv) * 100));

        patterns.push(this.buildPattern({
          type: "RECURRING",
          name: `Recurring ${category} - ${type}`,
          description: `Pattern of ${type} incidents in ${category} category occurring approximately every ${Math.round(avgInterval)} days`,
          incidents: groupIncidents,
          confidence,
          avgInterval,
        }));
      }
    }

    return patterns;
  }

  /**
   * Detect temporal patterns (time-based)
   */
  private async detectTemporalPatterns(
    incidents: IncidentLike[],
    features: IncidentFeatures[]
  ): Promise<IncidentPattern[]> {
    const patterns: IncidentPattern[] = [];

    if (incidents.length < 10) return patterns; // Need minimum data

    // Analyze day of week distribution
    const dayDistribution = new Array(7).fill(0);
    for (const f of features) {
      dayDistribution[f.dayOfWeek]++;
    }

    const avgPerDay = incidents.length / 7;
    const peakDays = dayDistribution
      .map((count, day) => ({ day, count, ratio: count / avgPerDay }))
      .filter((d) => d.ratio > 1.5 && d.count >= 3);

    if (peakDays.length > 0 && peakDays.length <= 3) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const peakDayNames = peakDays.map((d) => dayNames[d.day]).join(", ");

      patterns.push(this.buildPattern({
        type: "SEASONAL",
        name: `Weekly Peak Pattern (${peakDayNames})`,
        description: `Incidents are ${Math.round(peakDays[0].ratio * 100 - 100)}% more likely to occur on ${peakDayNames}`,
        incidents: incidents.filter((i) => {
          const day = new Date(i.occurredAt).getDay();
          return peakDays.some((p) => p.day === day);
        }),
        confidence: Math.min(100, Math.round(peakDays[0].ratio * 50)),
        timePatterns: { dayOfWeek: peakDays.map((d) => d.day) },
      }));
    }

    // Analyze hour of day distribution
    const hourDistribution = new Array(24).fill(0);
    for (const f of features) {
      hourDistribution[f.hourOfDay]++;
    }

    const avgPerHour = incidents.length / 24;
    const peakHours = hourDistribution
      .map((count, hour) => ({ hour, count, ratio: count / avgPerHour }))
      .filter((h) => h.ratio > 2 && h.count >= 3);

    if (peakHours.length > 0 && peakHours.length <= 6) {
      const peakHourRanges = this.groupConsecutiveHours(peakHours.map((h) => h.hour));

      patterns.push(this.buildPattern({
        type: "SEASONAL",
        name: `Daily Peak Pattern (${peakHourRanges})`,
        description: `Incidents are significantly more likely during ${peakHourRanges}`,
        incidents: incidents.filter((i) => {
          const hour = new Date(i.occurredAt).getHours();
          return peakHours.some((p) => p.hour === hour);
        }),
        confidence: Math.min(100, Math.round(peakHours[0].ratio * 30)),
        timePatterns: { hourOfDay: peakHours.map((h) => h.hour) },
      }));
    }

    return patterns;
  }

  /**
   * Detect cascade patterns (one incident causing others)
   */
  private async detectCascadePatterns(incidents: IncidentLike[]): Promise<IncidentPattern[]> {
    const patterns: IncidentPattern[] = [];
    const CASCADE_WINDOW_MINUTES = 60;

    if (incidents.length < this.MIN_PATTERN_INCIDENTS) return patterns;

    // Group incidents by time proximity
    const cascades: IncidentLike[][] = [];
    let currentCascade: IncidentLike[] = [];

    for (const incident of incidents) {
      if (currentCascade.length === 0) {
        currentCascade.push(incident);
        continue;
      }

      const lastIncident = currentCascade[currentCascade.length - 1];
      const timeDiff =
        (new Date(incident.occurredAt).getTime() - new Date(lastIncident.occurredAt).getTime()) /
        (1000 * 60);

      if (timeDiff <= CASCADE_WINDOW_MINUTES) {
        currentCascade.push(incident);
      } else {
        if (currentCascade.length >= this.MIN_PATTERN_INCIDENTS) {
          cascades.push([...currentCascade]);
        }
        currentCascade = [incident];
      }
    }

    // Add final cascade if exists
    if (currentCascade.length >= this.MIN_PATTERN_INCIDENTS) {
      cascades.push(currentCascade);
    }

    // Analyze cascades
    for (const cascade of cascades) {
      if (cascade.length < 3) continue;

      // Check if there's a common trigger
      const firstIncident = cascade[0];
      const affectedSystems = new Set<string>();
      for (const incident of cascade) {
        (incident.affectedSystems || []).forEach((s: string) => affectedSystems.add(s));
      }

      if (affectedSystems.size >= 2) {
        patterns.push(this.buildPattern({
          type: "CASCADE",
          name: `Cascade Pattern from ${firstIncident.category || "Unknown"}`,
          description: `${cascade.length} incidents cascading within ${CASCADE_WINDOW_MINUTES} minutes, affecting ${affectedSystems.size} systems`,
          incidents: cascade,
          confidence: Math.min(100, cascade.length * 20),
        }));
      }
    }

    return patterns;
  }

  /**
   * Detect correlated patterns (incidents occurring together)
   */
  private async detectCorrelatedPatterns(
    incidents: IncidentLike[]
  ): Promise<IncidentPattern[]> {
    const patterns: IncidentPattern[] = [];

    if (incidents.length < this.MIN_PATTERN_INCIDENTS) return patterns;

    // Group by affected systems
    const systemIncidents = new Map<string, IncidentLike[]>();
    for (const incident of incidents) {
      const systems = incident.affectedSystems || [];
      if (systems.length === 0) continue;
      
      for (const system of systems) {
        if (!systemIncidents.has(system)) {
          systemIncidents.set(system, []);
        }
        systemIncidents.get(system)!.push(incident);
      }
    }

    // Find systems with high incident correlation
    const systemPairs: { systems: string[]; correlation: number; incidents: IncidentLike[] }[] = [];
    const systems = Array.from(systemIncidents.keys());

    for (let i = 0; i < systems.length; i++) {
      for (let j = i + 1; j < systems.length; j++) {
        const system1Incidents = new Set(systemIncidents.get(systems[i])!.map((i) => i.id));
        const system2Incidents = new Set(systemIncidents.get(systems[j])!.map((i) => i.id));

        // Calculate Jaccard similarity
        const intersection = [...system1Incidents].filter((id) => system2Incidents.has(id));
        const union = new Set([...system1Incidents, ...system2Incidents]);
        const similarity = union.size > 0 ? intersection.length / union.size : 0;

        if (similarity > 0.3 && intersection.length >= this.MIN_PATTERN_INCIDENTS) {
          systemPairs.push({
            systems: [systems[i], systems[j]],
            correlation: similarity,
            incidents: incidents.filter((inc) => intersection.includes(inc.id)),
          });
        }
      }
    }

    // Sort by correlation and take top 5
    systemPairs.sort((a, b) => b.correlation - a.correlation);

    for (const pair of systemPairs.slice(0, 5)) {
      patterns.push(this.buildPattern({
        type: "CORRELATED",
        name: `Correlated Systems: ${pair.systems.join(" & ")}`,
        description: `${pair.systems[0]} and ${pair.systems[1]} have ${Math.round(pair.correlation * 100)}% incident correlation`,
        incidents: pair.incidents,
        confidence: Math.round(pair.correlation * 100),
      }));
    }

    return patterns;
  }

  /**
   * Detect anomalies
   */
  private async detectAnomalies(
    incidents: IncidentLike[]
  ): Promise<{ type: string; description: string; severity: string }[]> {
    const anomalies: { type: string; description: string; severity: string }[] = [];

    if (incidents.length < 10) return anomalies;

    // Check for sudden spikes
    const monthlyCount = new Map<string, number>();
    for (const incident of incidents) {
      const month = incident.occurredAt.substring(0, 7);
      monthlyCount.set(month, (monthlyCount.get(month) || 0) + 1);
    }

    const counts = Array.from(monthlyCount.values());
    if (counts.length < 3) return anomalies;

    const avgMonthly = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, c) => sum + Math.pow(c - avgMonthly, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    for (const [month, count] of monthlyCount) {
      if (count > avgMonthly + 2 * stdDev) {
        anomalies.push({
          type: "SPIKE",
          description: `Unusual spike in incidents during ${month} (${count} vs average ${Math.round(avgMonthly)})`,
          severity: count > avgMonthly + 3 * stdDev ? "HIGH" : "MEDIUM",
        });
      }
    }

    return anomalies;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  private buildPattern(params: {
    type: PatternType;
    name: string;
    description: string;
    incidents: IncidentLike[];
    confidence: number;
    avgInterval?: number;
    timePatterns?: { dayOfWeek?: number[]; hourOfDay?: number[] };
  }): IncidentPattern {
    const now = new Date().toISOString();

    // Calculate cumulative impact
    const totalDowntime = params.incidents.reduce(
      (sum, i) => sum + (i.durationMinutes || 0),
      0
    );
    const affectedUsers = params.incidents.reduce(
      (sum, i) => sum + (i.affectedUsers || 0),
      0
    );

    // Get affected systems/services
    const affectedSystems = new Set<string>();
    const affectedServices = new Set<string>();
    const categories = new Set<string>();

    for (const incident of params.incidents) {
      if (incident.category) categories.add(incident.category);
      (incident.affectedSystems || []).forEach((s: string) => affectedSystems.add(s));
      (incident.affectedServices || []).forEach((s: string) => affectedServices.add(s));
    }

    // Calculate average severity
    const severityOrder = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
    type SeverityLevel = (typeof severityOrder)[number];
    const avgSeverityIndex = Math.round(
      params.incidents.reduce(
        (sum, i) => sum + severityOrder.indexOf((i.severity || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"),
        0
      ) / params.incidents.length
    );

    return {
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patternId: `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      name: params.name,
      description: params.description,
      type: params.type,
      confidence: params.confidence >= 80 ? "HIGH" : params.confidence >= 50 ? "MEDIUM" : "LOW",
      confidenceScore: params.confidence,
      detectionMethod: "ML_CLUSTERING",
      characteristics: {
        frequency: `${params.incidents.length} occurrences`,
        averageInterval: params.avgInterval || 0,
        typicalDuration: totalDowntime / params.incidents.length,
        typicalSeverity: (severityOrder[avgSeverityIndex] ?? "MEDIUM") as SeverityLevel,
        affectedCategories: Array.from(categories),
        affectedSystems: Array.from(affectedSystems),
        affectedServices: Array.from(affectedServices),
        commonRootCauses: [],
        timePatterns: params.timePatterns,
      },
      relatedIncidents: params.incidents.map((i) => ({
        incidentId: i.id,
        occurredAt: i.occurredAt,
        severity: i.severity || "MEDIUM",
        matchScore: 100,
      })),
      cumulativeImpact: {
        totalIncidents: params.incidents.length,
        totalDowntimeMinutes: totalDowntime,
        affectedUsers,
      },
      riskImplications: {
        riskScoreContribution: params.confidence * 0.1,
        linkedAssetIds: [],
      },
      status: "ACTIVE",
      firstDetectedAt: now,
      lastOccurrenceAt: params.incidents[params.incidents.length - 1]?.occurredAt || now,
      lastAnalyzedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  private async createPattern(pattern: IncidentPattern): Promise<void> {
    await (prisma as any).incidentPattern.create({
      data: pattern,
    });

    await createEvidenceEvent({
      eventType: "INCIDENT.PATTERN.DETECTED",
      severity: pattern.confidence === "HIGH" ? "HIGH" : "MEDIUM",
      regulatoryTags: ["DORA"],
      articles: ["Art.13"],
      metadata: {
        patternId: pattern.patternId,
        patternName: pattern.name,
        patternType: pattern.type,
        confidence: pattern.confidenceScore,
        incidentCount: pattern.relatedIncidents.length,
      },
    });
  }

  private async updatePattern(existingId: string, newData: IncidentPattern): Promise<void> {
    await (prisma as any).incidentPattern.update({
      where: { id: existingId },
      data: {
        relatedIncidents: newData.relatedIncidents,
        cumulativeImpact: newData.cumulativeImpact,
        confidenceScore: newData.confidenceScore,
        confidence: newData.confidence,
        lastOccurrenceAt: newData.lastOccurrenceAt,
        lastAnalyzedAt: newData.lastAnalyzedAt,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((token) => token.length > 2);
  }

  private getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    return Math.ceil((diff / (1000 * 60 * 60 * 24) + start.getDay() + 1) / 7);
  }

  private groupConsecutiveHours(hours: number[]): string {
    if (hours.length === 0) return "";
    
    hours.sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = hours[0];
    let end = hours[0];

    for (let i = 1; i < hours.length; i++) {
      if (hours[i] === end + 1) {
        end = hours[i];
      } else {
        ranges.push(start === end ? `${start}:00` : `${start}:00-${end}:00`);
        start = hours[i];
        end = hours[i];
      }
    }
    ranges.push(start === end ? `${start}:00` : `${start}:00-${end}:00`);

    return ranges.join(", ");
  }

  private groupByType(patterns: IncidentPattern[]): Record<PatternType, number> {
    const result: Record<PatternType, number> = {
      RECURRING: 0,
      SEASONAL: 0,
      CASCADE: 0,
      CORRELATED: 0,
      ESCALATING: 0,
      SYSTEMIC: 0,
      VENDOR_RELATED: 0,
      HUMAN_ERROR: 0,
      CONFIGURATION: 0,
      CAPACITY: 0,
    };

    for (const pattern of patterns) {
      result[pattern.type]++;
    }

    return result;
  }
}

// Singleton instance
export const patternRecognitionEngine = new PatternRecognitionEngine();


