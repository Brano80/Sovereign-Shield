"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunicationTimeline } from "./communication/CommunicationTimeline";
import { CommunicationSummary } from "./communication/CommunicationSummary";
import { EscalationStatus } from "./communication/EscalationStatus";
import { SendNotificationDialog } from "./communication/SendNotificationDialog";
import { Button } from "@/components/ui/button";
import { Send, AlertTriangle } from "lucide-react";

interface CommunicationTabProps {
  incidentId: string;
  incidentSeverity: string;
}

export function CommunicationTab({ incidentId, incidentSeverity }: CommunicationTabProps) {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("timeline");
  const [showSendDialog, setShowSendDialog] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [incidentId]);

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `/api/v1/incidents/${incidentId}/communications?view=summary`
      );
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch communication summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerEscalation = async () => {
    try {
      await fetch(`/api/v1/incidents/${incidentId}/communications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger-escalation", trigger: "MANUAL" }),
      });
      fetchSummary();
    } catch (error) {
      console.error("Failed to trigger escalation:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Communication & Escalation</h3>
          <p className="text-sm text-slate-400">
            Stakeholder notifications, escalation status, and audit trail
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded border border-purple-500/20">
            DORA Art.14
          </span>
          {summary?.escalationStatus !== "ACTIVE" && (
            <Button variant="outline" size="sm" onClick={triggerEscalation}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Trigger Escalation
            </Button>
          )}
          <Button size="sm" onClick={() => setShowSendDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Summary */}
      <CommunicationSummary summary={summary} isLoading={isLoading} />

      {/* Escalation Status */}
      {(summary?.escalationStatus === "ACTIVE" || summary?.escalationLevel > 0) && (
        <EscalationStatus incidentId={incidentId} />
      )}

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="timeline">
            Timeline
            {summary?.timelineEntries ? (
              <span className="ml-2 text-xs bg-gray-500/20 px-1.5 py-0.5 rounded">
                {summary.timelineEntries}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="communications">
            Communications
            {summary?.totalCommunications ? (
              <span className="ml-2 text-xs bg-gray-500/20 px-1.5 py-0.5 rounded">
                {summary.totalCommunications}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <CommunicationTimeline incidentId={incidentId} />
        </TabsContent>

        <TabsContent value="communications" className="mt-4">
          <CommunicationsList incidentId={incidentId} />
        </TabsContent>

        <TabsContent value="stakeholders" className="mt-4">
          <StakeholdersList incidentId={incidentId} />
        </TabsContent>
      </Tabs>

      {/* Send Notification Dialog */}
      <SendNotificationDialog
        incidentId={incidentId}
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        onSent={fetchSummary}
      />
    </div>
  );
}

// Placeholder components - to be implemented
function CommunicationsList({ incidentId }: { incidentId: string }) {
  const [communications, setCommunications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/incidents/${incidentId}/communications?view=list`)
      .then((res) => res.json())
      .then((data) => {
        setCommunications(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch communications:", error);
        setIsLoading(false);
      });
  }, [incidentId]);

  if (isLoading) {
    return <div className="text-slate-400">Loading communications...</div>;
  }

  if (communications.length === 0) {
    return <div className="text-slate-400 text-center py-8">No communications yet</div>;
  }

  return (
    <div className="space-y-4">
      {communications.map((comm) => (
        <div key={comm.id} className="border border-slate-700 rounded-lg p-4 bg-slate-900/50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-white">{comm.subject}</h4>
              <p className="text-sm text-slate-400 mt-1">{comm.type} via {comm.channel}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              comm.status === "SENT" ? "bg-green-500/10 text-green-500" :
              comm.status === "FAILED" ? "bg-red-500/10 text-red-500" :
              "bg-gray-500/10 text-gray-500"
            }`}>
              {comm.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StakeholdersList({ incidentId }: { incidentId: string }) {
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/stakeholders?active=true")
      .then((res) => res.json())
      .then((data) => {
        setStakeholders(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch stakeholders:", error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="text-slate-400">Loading stakeholders...</div>;
  }

  if (stakeholders.length === 0) {
    return <div className="text-slate-400 text-center py-8">No stakeholders configured</div>;
  }

  const grouped = stakeholders.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4">
      {Object.entries(grouped as Record<string, any[]>).map(([type, list]) => (
        <div key={type} className="border border-slate-700 rounded-lg p-4 bg-slate-900/50">
          <h4 className="font-medium text-white mb-3">{type.replace(/_/g, " ")}</h4>
          <div className="space-y-2">
            {list.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                <div>
                  <p className="font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.role}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">
                  {s.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

