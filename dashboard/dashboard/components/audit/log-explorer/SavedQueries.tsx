"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkCheck, Trash2, Play } from "lucide-react";

interface SavedQueriesProps {
  onSelect: (filters: any) => void;
}

// Predefined regulator templates
const REGULATOR_TEMPLATES = [
  {
    id: "breach-timeline",
    name: "Breach Notification Timeline",
    description: "All events related to data breach notification",
    filters: {
      eventType: "BREACH",
      timeRange: { preset: "30_DAYS" },
    },
  },
  {
    id: "critical-incidents",
    name: "Critical Incidents (Last 7 Days)",
    description: "All critical severity incidents",
    filters: {
      eventType: "INCIDENT",
      severity: "CRITICAL",
      timeRange: { preset: "7_DAYS" },
    },
  },
  {
    id: "ai-decisions",
    name: "AI Decisions & Overrides",
    description: "All AI-related events including human overrides",
    filters: {
      eventType: "AI",
      regulation: "AI_ACT",
      timeRange: { preset: "30_DAYS" },
    },
  },
  {
    id: "gdpr-dsr",
    name: "Data Subject Requests",
    description: "All DSR events and their status",
    filters: {
      eventType: "DSR",
      regulation: "GDPR",
      timeRange: { preset: "90_DAYS" },
    },
  },
  {
    id: "dora-clocks",
    name: "DORA Regulatory Clocks",
    description: "All DORA regulatory deadline events",
    filters: {
      eventType: "CLOCK",
      regulation: "DORA",
      timeRange: { preset: "30_DAYS" },
    },
  },
];

export function SavedQueries({ onSelect }: SavedQueriesProps) {
  const [savedQueries] = useState<any[]>([]);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <BookmarkCheck className="h-4 w-4" />
          Saved Queries
        </h4>
      </div>

      {/* Regulator Templates */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Regulator Templates</p>
        <div className="space-y-2">
          {REGULATOR_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelect(template.filters)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{template.name}</span>
                <Play className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* User Saved Queries */}
      {savedQueries.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">My Queries</p>
          <div className="space-y-2">
            {savedQueries.map((query) => (
              <div
                key={query.id}
                className="p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div onClick={() => onSelect(query.filters)}>
                  <span className="text-sm font-medium">{query.name}</span>
                  <p className="text-xs text-muted-foreground">
                    Used {query.useCount} times
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
