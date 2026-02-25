"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningKPIs } from "./learning/LearningKPIs";
import { PatternsList } from "./learning/PatternsList";
import { RecommendationsList } from "./learning/RecommendationsList";
import { RootCauseAnalysis } from "./learning/RootCauseAnalysis";
import { TrendsChart } from "./learning/TrendsChart";
import { Button } from "@/components/ui/button";
import { RefreshCw, Brain } from "lucide-react";
import { getApiBase } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";
import { useCurrentUser } from "../../app/hooks/useCurrentUser";

export function PatternAnalysisTab() {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("patterns");
  const { user } = useCurrentUser();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      // TODO: Replace with actual Rust API call when endpoint is available
      // const response = await fetch(`${getApiBase()}/api/v1/incidents/patterns?view=summary`, {
      //   headers: getAuthHeaders(),
      // });
      // const data = await response.json();

      // Mock data for now - replace with actual API call later
      const mockData = {
        patterns: {
          active: 12,
          totalAnalyzed: 145,
          confidence: 0.87,
          categories: {
            infrastructure: 5,
            application: 4,
            security: 3,
          }
        },
        recommendations: {
          proposed: 8,
          implemented: 3,
          pending: 5,
          impact: "high"
        },
        learning: {
          accuracy: 0.92,
          improvementRate: 0.15,
          lastUpdated: new Date().toISOString()
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setSummary(mockData);
    } catch (error) {
      console.error("Failed to fetch learning summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // TODO: Replace with actual Rust API call when endpoint is available
      // const response = await fetch(`${getApiBase()}/api/v1/incidents/patterns`, {
      //   method: "POST",
      //   headers: {
      //     ...getAuthHeaders(),
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({ action: "analyze-patterns" }),
      // });
      // const result = await response.json();

      // Mock analysis result
      const mockResult = {
        affectedServices: ["web-server", "database", "api-gateway"],
        patternsDetected: 3,
        recommendationsGenerated: 5
      };

      console.log("Analysis result:", mockResult);

      // TODO: Replace with actual Rust API audit logging when available
      // try {
      //   await fetch(`${getApiBase()}/audit/events`, {
      //     method: "POST",
      //     headers: {
      //       ...getAuthHeaders(),
      //       "Content-Type": "application/json"
      //     },
      //     body: JSON.stringify({
      //       eventType: "INCIDENT.PATTERN_ANALYSIS",
      //       sourceSystem: "pattern-analysis",
      //       correlationId: `analysis-${Date.now()}`,
      //       severity: "INFO",
      //       payload: {
      //         category: "PATTERN_ANALYSIS",
      //         affectedServices: mockResult.affectedServices,
      //         patternsDetected: mockResult.patternsDetected
      //       },
      //       regulatoryTags: ["DORA"],
      //       articles: ["DORA-13"]
      //     }),
      //   });
      // } catch (error) {
      //   console.error("Audit logging failed:", error);
      // }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      fetchSummary();
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Pattern Analysis & Learning</h3>
          <p className="text-sm text-slate-400">
            ML-powered incident pattern recognition and improvement recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
            DORA Art.13
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={runAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isAnalyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <LearningKPIs summary={summary} isLoading={isLoading} />

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="patterns" className="data-[state=active]:bg-slate-800">
            Detected Patterns
            {summary?.patterns.active ? (
              <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {summary.patterns.active}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-slate-800">
            Recommendations
            {summary?.recommendations.proposed ? (
              <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {summary.recommendations.proposed}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="root-causes" className="data-[state=active]:bg-slate-800">Root Cause Analysis</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-slate-800">Trends & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="mt-4">
          <PatternsList />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <RecommendationsList />
        </TabsContent>

        <TabsContent value="root-causes" className="mt-4">
          <RootCauseAnalysis />
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <TrendsChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}

