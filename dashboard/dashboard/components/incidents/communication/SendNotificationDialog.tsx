"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stakeholder, CommunicationType, CommunicationChannel } from "@/lib/dora/communication-types";
import { Send, Users } from "lucide-react";

interface SendNotificationDialogProps {
  incidentId: string;
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}

const COMMUNICATION_TYPES: { value: CommunicationType; label: string }[] = [
  { value: "INITIAL_NOTIFICATION", label: "Initial Notification" },
  { value: "STATUS_UPDATE", label: "Status Update" },
  { value: "ESCALATION", label: "Escalation" },
  { value: "RESOLUTION", label: "Resolution Notice" },
  { value: "INTERNAL_BRIEFING", label: "Internal Briefing" },
  { value: "CUSTOMER_ADVISORY", label: "Customer Advisory" },
  { value: "REGULATORY_REPORT", label: "Regulatory Report" },
];

const CHANNELS: { value: CommunicationChannel; label: string }[] = [
  { value: "EMAIL", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "SLACK", label: "Slack" },
  { value: "TEAMS", label: "Microsoft Teams" },
];

export function SendNotificationDialog({
  incidentId,
  open,
  onClose,
  onSent,
}: SendNotificationDialogProps) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);
  const [notificationType, setNotificationType] = useState<CommunicationType>("STATUS_UPDATE");
  const [channel, setChannel] = useState<CommunicationChannel>("EMAIL");
  const [useCustomContent, setUseCustomContent] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStakeholders();
    }
  }, [open]);

  const fetchStakeholders = async () => {
    try {
      const response = await fetch("/api/v1/stakeholders?active=true");
      const data = await response.json();
      setStakeholders(data);
    } catch (error) {
      console.error("Failed to fetch stakeholders:", error);
    }
  };

  const handleSend = async () => {
    if (selectedStakeholders.length === 0) return;

    setIsSending(true);
    try {
      if (selectedStakeholders.length === 1) {
        // Single notification
        await fetch(`/api/v1/incidents/${incidentId}/communications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send",
            stakeholderId: selectedStakeholders[0],
            type: notificationType,
            channel,
            customContent: useCustomContent ? { subject, body } : undefined,
          }),
        });
      } else {
        // Bulk notification
        const roles = [...new Set(
          stakeholders
            .filter((s) => selectedStakeholders.includes(s.id))
            .map((s) => s.role)
        )];

        await fetch(`/api/v1/incidents/${incidentId}/communications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send-bulk",
            stakeholderRoles: roles,
            type: notificationType,
            channel,
          }),
        });
      }

      onSent();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Failed to send notification. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setSelectedStakeholders([]);
    setNotificationType("STATUS_UPDATE");
    setChannel("EMAIL");
    setUseCustomContent(false);
    setSubject("");
    setBody("");
  };

  const toggleStakeholder = (id: string) => {
    setSelectedStakeholders((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectByRole = (role: string) => {
    const ids = stakeholders.filter((s) => s.role === role).map((s) => s.id);
    setSelectedStakeholders((prev) => [...new Set([...prev, ...ids])]);
  };

  // Group stakeholders by type
  const groupedStakeholders = stakeholders.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {} as Record<string, Stakeholder[]>);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Send className="h-5 w-5" />
            Send Notification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notification Type & Channel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Notification Type</Label>
              <Select
                value={notificationType}
                onValueChange={(v) => setNotificationType(v as CommunicationType)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNICATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300">Channel</Label>
              <Select
                value={channel}
                onValueChange={(v) => setChannel(v as CommunicationChannel)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>
                      {ch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recipients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-300">
                Recipients ({selectedStakeholders.length} selected)
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectByRole("CISO")}
                  className="text-xs"
                >
                  + CISO
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectByRole("INCIDENT_MANAGER")}
                  className="text-xs"
                >
                  + Incident Manager
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStakeholders([])}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="border border-slate-700 rounded-lg max-h-48 overflow-y-auto bg-slate-800/50">
              {Object.entries(groupedStakeholders).map(([type, list]) => (
                <div key={type} className="border-b border-slate-700 last:border-0">
                  <div className="px-3 py-2 bg-slate-800/70 font-medium text-sm text-slate-300">
                    {type.replace(/_/g, " ")}
                  </div>
                  <div className="p-2 space-y-1">
                    {list.map((stakeholder) => (
                      <div
                        key={stakeholder.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedStakeholders.includes(stakeholder.id)
                            ? "bg-blue-500/10 border border-blue-500/20"
                            : "hover:bg-slate-700/50"
                        }`}
                        onClick={() => toggleStakeholder(stakeholder.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedStakeholders.includes(stakeholder.id)}
                            onCheckedChange={() => toggleStakeholder(stakeholder.id)}
                          />
                          <div>
                            <p className="font-medium text-white text-sm">{stakeholder.name}</p>
                            <p className="text-xs text-slate-400">
                              {stakeholder.role}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {stakeholder.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Content */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="customContent"
                checked={useCustomContent}
                onCheckedChange={(checked) => setUseCustomContent(!!checked)}
              />
              <Label htmlFor="customContent" className="text-slate-300 cursor-pointer">
                Use custom content
              </Label>
            </div>

            {useCustomContent && (
              <div className="space-y-4 pl-6">
                <div>
                  <Label className="text-slate-300">Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Notification subject..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Message</Label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Notification message..."
                    rows={5}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedStakeholders.length === 0 || isSending}
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedStakeholders.length} recipient(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

