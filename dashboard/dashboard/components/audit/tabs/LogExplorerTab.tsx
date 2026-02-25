"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryBuilder } from "../log-explorer/QueryBuilder";
import { SavedQueries } from "../log-explorer/SavedQueries";
import { ResultsPanel } from "../log-explorer/ResultsPanel";
import { ComplianceQueries } from "../log-explorer/ComplianceQueries";
import { Button } from "@/components/ui/button";
import { Search, BookmarkCheck, Shield, Download } from "lucide-react";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

interface LogExplorerTabProps {
  events?: any[];
  isLoading?: boolean;
}

export function LogExplorerTab({ events = [], isLoading = false }: LogExplorerTabProps) {
  const [activeView, setActiveView] = useState<"search" | "compliance">("search");
  const [queryResults, setQueryResults] = useState<any>(events.length > 0 ? { events } : null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Update queryResults when events prop changes
  React.useEffect(() => {
    if (events.length > 0) {
      setQueryResults({ events });
    }
  }, [events]);

  const handleSearch = async (filters: any) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.correlationId) params.set('correlationId', filters.correlationId);
      if (filters.eventType) params.set('eventType', filters.eventType);
      if (filters.sourceSystem) params.set('sourceSystem', filters.sourceSystem);
      if (filters.severity) params.set('severity', filters.severity);
      if (filters.regulation) params.set('regulation', filters.regulation);
      if (filters.timeRange?.from) params.set('from', filters.timeRange.from);
      if (filters.timeRange?.to) params.set('to', filters.timeRange.to);
      params.set('limit', '100');

      const response = await fetch(`${API_BASE}/audit/events?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setQueryResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleComplianceQuery = async (queryId: string, timeRange?: any) => {
    setSearchLoading(true);
    try {
      const response = await fetch(`${API_BASE}/audit/compliance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ queryId, timeRange }),
      });
      const data = await response.json();
      setQueryResults({ complianceResult: data });
    } catch (error) {
      console.error('Compliance query failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Log Explorer</h3>
          <p className="text-sm text-muted-foreground">
            Query and analyze audit events with compliance verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeView === "search" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("search")}
          >
            <Search className="h-4 w-4 mr-2" />
            Event Search
          </Button>
          <Button
            variant={activeView === "compliance" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("compliance")}
          >
            <Shield className="h-4 w-4 mr-2" />
            Compliance Queries
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Query Builder or Compliance Queries */}
        <div className="col-span-4 space-y-4">
          {activeView === "search" ? (
            <>
              <QueryBuilder onSearch={handleSearch} isLoading={searchLoading} />
              <SavedQueries onSelect={handleSearch} />
            </>
          ) : (
            <ComplianceQueries onExecute={handleComplianceQuery} isLoading={searchLoading} />
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="col-span-8">
          <ResultsPanel
            results={queryResults}
            isLoading={isLoading || searchLoading}
            viewType={activeView}
          />
        </div>
      </div>
    </div>
  );
}