"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegulatoryClock } from "./RegulatoryClock";
import { PatternAnalysisTab } from "@/components/incidents/PatternAnalysisTab";
import { AlertTriangle } from "lucide-react";
import { complianceApi } from "@/app/lib/api-client";
import { UnifiedIncidentsData } from "@/app/types/incidents";
import { mockIncidentsData } from "@/app/api/mock/incidents-data";

export function UnifiedIncidentsPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [unifiedData, setUnifiedData] = useState<UnifiedIncidentsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUnifiedIncidents();
  }, []);

  const fetchUnifiedIncidents = async () => {
    try {
      setUnifiedData(null);
      setIsLoading(true);

      const data = await complianceApi.get<UnifiedIncidentsData>('/incidents/unified');
      setUnifiedData(data);
    } catch (error) {
      console.error("Failed to fetch unified incidents:", error);
      // Fallback to mock data if API fails
      console.log("Falling back to mock data...");
      const mockData = mockIncidentsData;
      setUnifiedData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Unified Incidents</h1>
          <p className="text-slate-400">
            Cross-regulation incident management & learning
          </p>
        </div>
      </div>

      {/* Unified Summary */}
      {unifiedData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
            <div className="text-sm text-slate-400">Total Incidents</div>
            <div className="text-2xl font-bold text-white">{unifiedData.summary.total}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
            <div className="text-sm text-slate-400">Active</div>
            <div className="text-2xl font-bold text-amber-400">{unifiedData.summary.active}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
            <div className="text-sm text-slate-400">Critical</div>
            <div className="text-2xl font-bold text-red-400">{unifiedData.summary.critical}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
            <div className="text-sm text-slate-400">Overdue</div>
            <div className="text-2xl font-bold text-red-400">{unifiedData.summary.overdue}</div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-800">
            Incidents Dashboard
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-slate-800">
            Pattern Analysis
            <span className="ml-2 text-xs bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">
              AI
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <RegulatoryClock />
        </TabsContent>

        <TabsContent value="patterns" className="mt-6">
          <PatternAnalysisTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

