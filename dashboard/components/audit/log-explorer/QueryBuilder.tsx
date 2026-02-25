"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar as CalendarIcon, X, RotateCcw } from "lucide-react";
import { format, subDays, subMonths } from "date-fns";

interface QueryBuilderProps {
  onSearch: (filters: any) => void;
  isLoading: boolean;
}

const EVENT_TYPES = [
  { value: "INCIDENT", label: "Incidents" },
  { value: "BREACH", label: "Data Breaches" },
  { value: "DECISION", label: "Decisions" },
  { value: "CLOCK", label: "Regulatory Clocks" },
  { value: "AI", label: "AI Events" },
  { value: "COMMUNICATION", label: "Communications" },
  { value: "GOVERNANCE", label: "Governance" },
  { value: "ASSET", label: "Assets" },
  { value: "VENDOR", label: "Vendors" },
  { value: "RISK", label: "Risk" },
  { value: "CONSENT", label: "Consent" },
  { value: "DSR", label: "Data Subject Requests" },
];

const SEVERITIES = [
  { value: "CRITICAL", label: "Critical", color: "bg-red-500" },
  { value: "HIGH", label: "High", color: "bg-orange-500" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-500" },
  { value: "LOW", label: "Low", color: "bg-blue-500" },
  { value: "INFO", label: "Info", color: "bg-gray-500" },
];

const REGULATIONS = [
  { value: "GDPR", label: "GDPR" },
  { value: "DORA", label: "DORA" },
  { value: "NIS2", label: "NIS2" },
  { value: "AI_ACT", label: "AI Act" },
];

const TIME_PRESETS = [
  { value: "TODAY", label: "Today", days: 0 },
  { value: "7_DAYS", label: "Last 7 days", days: 7 },
  { value: "30_DAYS", label: "Last 30 days", days: 30 },
  { value: "90_DAYS", label: "Last 90 days", days: 90 },
  { value: "12_MONTHS", label: "Last 12 months", months: 12 },
];

export function QueryBuilder({ onSearch, isLoading }: QueryBuilderProps) {
  const [filters, setFilters] = useState({
    correlationId: "",
    eventType: "",
    severity: "",
    regulation: "",
    searchText: "",
    timeRange: {
      preset: "30_DAYS",
      from: subDays(new Date(), 30).toISOString(),
      to: new Date().toISOString(),
    },
  });

  const handlePresetChange = (preset: string) => {
    const now = new Date();
    let from: Date;

    const presetConfig = TIME_PRESETS.find((p) => p.value === preset);
    if (presetConfig?.months) {
      from = subMonths(now, presetConfig.months);
    } else if (presetConfig?.days) {
      from = subDays(now, presetConfig.days);
    } else {
      from = now;
    }

    setFilters({
      ...filters,
      timeRange: {
        preset,
        from: from.toISOString(),
        to: now.toISOString(),
      },
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      correlationId: "",
      eventType: "",
      severity: "",
      regulation: "",
      searchText: "",
      timeRange: {
        preset: "30_DAYS",
        from: subDays(new Date(), 30).toISOString(),
        to: new Date().toISOString(),
      },
    });
  };

  const activeFiltersCount = [
    filters.correlationId,
    filters.eventType,
    filters.severity,
    filters.regulation,
    filters.searchText,
  ].filter(Boolean).length;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Search className="h-4 w-4" />
          Query Builder
        </h4>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary">{activeFiltersCount} filters</Badge>
        )}
      </div>

      {/* Time Range */}
      <div>
        <Label className="text-xs text-muted-foreground">Time Range</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {TIME_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={filters.timeRange.preset === preset.value ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => handlePresetChange(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Correlation ID */}
      <div>
        <Label className="text-xs text-muted-foreground">Correlation ID</Label>
        <Input
          placeholder="e.g., INC-2025-0042"
          value={filters.correlationId}
          onChange={(e) => setFilters({ ...filters, correlationId: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Event Type */}
      <div>
        <Label className="text-xs text-muted-foreground">Event Type</Label>
        <Select
          value={filters.eventType}
          onValueChange={(v) => setFilters({ ...filters, eventType: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All event types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All event types</SelectItem>
            {EVENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Severity */}
      <div>
        <Label className="text-xs text-muted-foreground">Severity</Label>
        <Select
          value={filters.severity}
          onValueChange={(v) => setFilters({ ...filters, severity: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All severities</SelectItem>
            {SEVERITIES.map((sev) => (
              <SelectItem key={sev.value} value={sev.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sev.color}`} />
                  {sev.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Regulation */}
      <div>
        <Label className="text-xs text-muted-foreground">Regulation</Label>
        <Select
          value={filters.regulation}
          onValueChange={(v) => setFilters({ ...filters, regulation: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All regulations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All regulations</SelectItem>
            {REGULATIONS.map((reg) => (
              <SelectItem key={reg.value} value={reg.value}>
                {reg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Free Text Search */}
      <div>
        <Label className="text-xs text-muted-foreground">Search Text</Label>
        <Input
          placeholder="Search in event payload..."
          value={filters.searchText}
          onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
          <Search className="h-4 w-4 mr-2" />
          {isLoading ? "Searching..." : "Search"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
