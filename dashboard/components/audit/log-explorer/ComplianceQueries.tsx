"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Play, Search, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

interface ComplianceQueriesProps {
  onExecute: (queryId: string, timeRange?: any) => void;
  isLoading: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500/10 text-red-500 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  LOW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export function ComplianceQueries({ onExecute, isLoading }: ComplianceQueriesProps) {
  const [queries, setQueries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit/compliance?view=queries`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setQueries(data.queries);
    } catch (error) {
      console.error('Failed to fetch queries:', error);
    }
  };

  // Group queries by regulation
  const groupedQueries = queries.reduce((acc, query) => {
    if (!acc[query.regulation]) acc[query.regulation] = [];
    acc[query.regulation].push(query);
    return acc;
  }, {} as Record<string, any[]>);

  // Filter queries
  const filteredQueries = searchTerm
    ? queries.filter(
        (q) =>
          q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.queryId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const handleRunAll = async (regulation: string) => {
    // Run all queries for a regulation
    const regQueries = groupedQueries[regulation] || [];
    for (const query of regQueries) {
      await onExecute(query.queryId);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Compliance Queries
        </h4>
        <Badge variant="secondary">{queries.length} queries</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Search Results */}
      {filteredQueries ? (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredQueries.map((query) => (
            <QueryCard
              key={query.queryId}
              query={query}
              onExecute={onExecute}
              isLoading={isLoading}
            />
          ))}
          {filteredQueries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No queries match your search
            </p>
          )}
        </div>
      ) : (
        /* Grouped by Regulation */
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(groupedQueries as Record<string, any[]>).map(([regulation, regQueries]) => (
            <AccordionItem key={regulation} value={regulation}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{regulation}</span>
                    <Badge variant="outline" className="text-xs">
                      {regQueries.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunAll(regulation);
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run All
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {regQueries.map((query) => (
                    <QueryCard
                      key={query.queryId}
                      query={query}
                      onExecute={onExecute}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

function QueryCard({
  query,
  onExecute,
  isLoading,
}: {
  query: any;
  onExecute: (queryId: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{query.name}</p>
            <Badge
              variant="outline"
              className={`text-xs ${SEVERITY_COLORS[query.severity] || ""}`}
            >
              {query.severity}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {query.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {query.articles.map((article: string) => (
              <Badge key={article} variant="secondary" className="text-xs">
                {article}
              </Badge>
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 shrink-0"
          onClick={() => onExecute(query.queryId)}
          disabled={isLoading}
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
