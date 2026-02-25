"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { InventorySummary } from "@/lib/dora/asset-inventory-types";
import { AssetRegistryTab } from "@/components/dora/assets/AssetRegistryTab";
import { WhitelistTab } from "@/components/dora/assets/WhitelistTab";
import { ViolationsTab } from "@/components/dora/assets/ViolationsTab";
import { DependencyGraphTab } from "@/components/dora/assets/DependencyGraphTab";
import { ExternalInteractionsTab } from "@/components/dora/assets/ExternalInteractionsTab";
import { AssetKPIs } from "@/components/dora/assets/AssetKPIs";
import { Server, Download } from "lucide-react";
import { complianceApi } from "@/app/lib/api-client";

export function DORAAssetsPanel() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("registry");

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await complianceApi.get<InventorySummary>("/dora/assets?view=summary");
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">DORA - ICT Assets</h1>
            <p className="text-slate-400">
              Inventory · Critical functions · Dependencies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
            DORA Art.7
          </span>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <AssetKPIs summary={summary} isLoading={isLoading} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="registry" className="data-[state=active]:bg-slate-800">Asset Registry</TabsTrigger>
          <TabsTrigger value="whitelist" className="data-[state=active]:bg-slate-800">Whitelist</TabsTrigger>
          <TabsTrigger value="violations" className="data-[state=active]:bg-slate-800">
            Violations
            {summary?.violations.open ? (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {summary.violations.open}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="data-[state=active]:bg-slate-800">Dependencies</TabsTrigger>
          <TabsTrigger value="external" className="data-[state=active]:bg-slate-800">External Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="mt-6">
          <AssetRegistryTab />
        </TabsContent>

        <TabsContent value="whitelist" className="mt-6">
          <WhitelistTab />
        </TabsContent>

        <TabsContent value="violations" className="mt-6">
          <ViolationsTab />
        </TabsContent>

        <TabsContent value="dependencies" className="mt-6">
          <DependencyGraphTab />
        </TabsContent>

        <TabsContent value="external" className="mt-6">
          <ExternalInteractionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

