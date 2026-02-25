"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  List,
  Clock,
  Network,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

interface ResultsPanelProps {
  results: any;
  isLoading: boolean;
  viewType: "search" | "compliance";
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-blue-500",
  INFO: "bg-gray-500",
};

const RESULT_ICONS: Record<string, typeof CheckCircle> = {
  PROVEN: CheckCircle,
  PARTIAL: AlertTriangle,
  NOT_PROVEN: XCircle,
};

const RESULT_COLORS: Record<string, string> = {
  PROVEN: "text-green-500 bg-green-500/10",
  PARTIAL: "text-yellow-500 bg-yellow-500/10",
  NOT_PROVEN: "text-red-500 bg-red-500/10",
};

export function ResultsPanel({ results, isLoading, viewType }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("table");

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Executing query...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="rounded-lg border bg-card p-8 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {viewType === "search"
              ? "Use the query builder to search events"
              : "Select a compliance query to execute"}
          </p>
        </div>
      </div>
    );
  }

  // Compliance query result
  if (results.complianceResult) {
    return <ComplianceResultPanel result={results.complianceResult} />;
  }

  // Event search results
  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h4 className="font-semibold">Results</h4>
          <p className="text-sm text-muted-foreground">
            Found {results.total} events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8">
              <TabsTrigger value="table" className="h-6 px-2">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="timeline" className="h-6 px-2">
                <Clock className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="graph" className="h-6 px-2">
                <Network className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "table" && <EventsTable events={results.events} />}
        {activeTab === "timeline" && <EventsTimeline events={results.events} />}
        {activeTab === "graph" && <EventsGraph events={results.events} />}
      </div>

      {/* Pagination */}
      {results.hasMore && (
        <div className="flex justify-center p-4 border-t">
          <Button variant="outline" size="sm">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

function EventsTable({ events }: { events: any[] }) {
  return (
    <div className="max-h-[600px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Time</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Regulation</TableHead>
            <TableHead>Correlation ID</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.event_id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-mono text-xs">
                {format(new Date(event.occurred_at), "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell>
                <span className="font-medium">{event.event_type}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${SEVERITY_COLORS[event.severity]}`} />
                  {event.severity}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {event.regulatory_tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {event.correlation_id?.substring(0, 20)}...
              </TableCell>
              <TableCell className="text-muted-foreground">
                {event.source_system}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EventsTimeline({ events }: { events: any[] }) {
  return (
    <div className="relative max-h-[600px] overflow-auto">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4 pl-8">
        {events.map((event) => (
          <div key={event.event_id} className="relative">
            <div
              className={`absolute -left-8 w-3 h-3 rounded-full border-2 border-background ${SEVERITY_COLORS[event.severity]}`}
            />
            <div className="p-3 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <span className="font-medium">{event.event_type}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(event.occurred_at), "HH:mm:ss")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {event.correlation_id}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsGraph({ events }: { events: any[] }) {
  return (
    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <Network className="h-12 w-12 mx-auto mb-4" />
        <p>Graph visualization coming soon</p>
        <p className="text-sm">Shows relationships between events, decisions, and clocks</p>
      </div>
    </div>
  );
}

function ComplianceResultPanel({ result }: { result: any }) {
  const ResultIcon = RESULT_ICONS[result.result] || AlertTriangle;
  const resultColor = RESULT_COLORS[result.result] || "";

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{result.queryName}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{result.regulation}</Badge>
              {result.articles.map((article: string) => (
                <Badge key={article} variant="secondary">
                  {article}
                </Badge>
              ))}
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${resultColor}`}>
            <ResultIcon className="h-5 w-5" />
            <span className="font-semibold">{result.result}</span>
          </div>
        </div>
      </div>

      {/* Confidence & Evidence */}
      <div className="p-6 border-b grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Confidence Score</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  result.confidence >= 80
                    ? "bg-green-500"
                    : result.confidence >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
            <span className="font-bold">{result.confidence}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Evidence Count</p>
          <p className="text-2xl font-bold">{result.evidenceCount}</p>
        </div>
      </div>

      {/* Proof Details */}
      <div className="p-6 border-b">
        <h4 className="font-semibold mb-4">Proof Criteria</h4>
        <div className="space-y-3">
          {result.proofDetails.map((detail: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg ${
                detail.met ? "bg-green-500/10" : "bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {detail.met ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>{detail.criterion}</span>
              </div>
              <span className="text-sm text-muted-foreground">{detail.details}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gaps */}
      {result.gaps && result.gaps.length > 0 && (
        <div className="p-6">
          <h4 className="font-semibold mb-4 text-orange-500">Identified Gaps</h4>
          <div className="space-y-3">
            {result.gaps.map((gap: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <p className="font-medium text-orange-500">{gap.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Recommendation: {gap.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Info */}
      <div className="p-4 bg-muted/50 text-xs text-muted-foreground flex items-center justify-between">
        <span>Executed: {format(new Date(result.executedAt), "yyyy-MM-dd HH:mm:ss")}</span>
        <span>Execution time: {result.executionTimeMs}ms</span>
      </div>
    </div>
  );
}
