"use client";
import React from "react";
import { AuditKPICards } from "@/components/audit/KPICards";
import { EventsByRegulation } from "@/components/audit/EventsByRegulation";
import { ActiveClocks } from "@/components/audit/ActiveClocks";
import { SealedEvidencePanel } from "@/app/dashboard/lenses/components/SealedEvidencePanel";

interface OverviewTabProps {
  events: any[];
  isLoading: boolean;
  showKPICards?: boolean;
}

export function OverviewTab({ events, isLoading, showKPICards = true }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards - conditionally rendered */}
      {showKPICards && <AuditKPICards instanceName="Almaco" evidenceEvents={events} />}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EventsByRegulation />
        <ActiveClocks />
      </div>


      {/* Sealed Evidence Vault (existing component) */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <SealedEvidencePanel events={events} isLoading={isLoading} />
      </div>
    </div>
  );
}
