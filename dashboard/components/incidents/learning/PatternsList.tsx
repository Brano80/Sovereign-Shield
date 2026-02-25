"use client";

import { useState, useEffect } from "react";
import { IncidentPattern, PatternType } from "@/lib/dora/incident-learning-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  GitBranch,
  Calendar,
  Link2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const PATTERN_TYPE_ICONS: Record<PatternType, typeof GitBranch> = {
  RECURRING: GitBranch,
  SEASONAL: Calendar,
  CASCADE: Link2,
  CORRELATED: Link2,
  ESCALATING: AlertTriangle,
  SYSTEMIC: AlertTriangle,
  VENDOR_RELATED: AlertTriangle,
  HUMAN_ERROR: AlertTriangle,
  CONFIGURATION: AlertTriangle,
  CAPACITY: AlertTriangle,
};

const PATTERN_TYPE_COLORS: Record<PatternType, string> = {
  RECURRING: "bg-blue-500/10 text-blue-400",
  SEASONAL: "bg-purple-500/10 text-purple-400",
  CASCADE: "bg-red-500/10 text-red-400",
  CORRELATED: "bg-orange-500/10 text-orange-400",
  ESCALATING: "bg-red-500/10 text-red-400",
  SYSTEMIC: "bg-red-500/10 text-red-400",
  VENDOR_RELATED: "bg-yellow-500/10 text-yellow-400",
  HUMAN_ERROR: "bg-yellow-500/10 text-yellow-400",
  CONFIGURATION: "bg-yellow-500/10 text-yellow-400",
  CAPACITY: "bg-orange-500/10 text-orange-400",
};

const CONFIDENCE_COLORS = {
  HIGH: "bg-green-500/10 text-green-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-400",
  LOW: "bg-gray-500/10 text-gray-400",
};

export function PatternsList() {
  const [patterns, setPatterns] = useState<IncidentPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  useEffect(() => {
    fetchPatterns();
  }, [typeFilter, statusFilter]);

  const fetchPatterns = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ view: "patterns" });
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const response = await fetch(`/api/v1/incidents/learning?${params}`);
      const data = await response.json();
      setPatterns(data);
    } catch (error) {
      console.error("Failed to fetch patterns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="RECURRING">Recurring</SelectItem>
            <SelectItem value="SEASONAL">Seasonal</SelectItem>
            <SelectItem value="CASCADE">Cascade</SelectItem>
            <SelectItem value="CORRELATED">Correlated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-slate-900 border-slate-800">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="MITIGATED">Mitigated</SelectItem>
            <SelectItem value="MONITORING">Monitoring</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-800 bg-slate-900 animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 w-48 bg-slate-700 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-slate-700 rounded" />
              </CardContent>
            </Card>
          ))
        ) : patterns.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <GitBranch className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-white">No Patterns Found</h3>
            <p className="text-slate-400">
              Run pattern analysis to discover incident patterns
            </p>
          </div>
        ) : (
          patterns.map((pattern) => {
            const Icon = PATTERN_TYPE_ICONS[pattern.type];
            return (
              <Card key={pattern.id} className="border-slate-800 bg-slate-900">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${PATTERN_TYPE_COLORS[pattern.type]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-white">{pattern.name}</CardTitle>
                        <CardDescription className="text-slate-500">{pattern.patternId}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={PATTERN_TYPE_COLORS[pattern.type]}>
                        {pattern.type}
                      </Badge>
                      <Badge className={CONFIDENCE_COLORS[pattern.confidence]}>
                        {pattern.confidence}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-4">
                    {pattern.description}
                  </p>

                  {/* Confidence bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400">Confidence</span>
                      <span className="font-medium text-white">{pattern.confidenceScore}%</span>
                    </div>
                    <Progress value={pattern.confidenceScore} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center border-t border-slate-800 pt-4">
                    <div>
                      <p className="text-lg font-bold text-white">{pattern.relatedIncidents.length}</p>
                      <p className="text-xs text-slate-500">Incidents</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        {Math.round(pattern.cumulativeImpact.totalDowntimeMinutes / 60)}h
                      </p>
                      <p className="text-xs text-slate-500">Total Downtime</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        {Math.round(pattern.characteristics.averageInterval)}d
                      </p>
                      <p className="text-xs text-slate-500">Avg Interval</p>
                    </div>
                  </div>

                  {/* Affected systems */}
                  {pattern.characteristics.affectedSystems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <p className="text-xs text-slate-500 mb-2">Affected Systems</p>
                      <div className="flex flex-wrap gap-1">
                        {pattern.characteristics.affectedSystems.slice(0, 4).map((system) => (
                          <Badge key={system} variant="outline" className="text-xs border-slate-700 text-slate-300">
                            {system}
                          </Badge>
                        ))}
                        {pattern.characteristics.affectedSystems.length > 4 && (
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                            +{pattern.characteristics.affectedSystems.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

