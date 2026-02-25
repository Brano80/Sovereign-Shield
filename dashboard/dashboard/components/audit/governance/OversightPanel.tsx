"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, Users, FileText, CheckCircle } from "lucide-react";
import { OversightActivity, OversightType } from "@/lib/audit/governance-types";
import { format } from "date-fns";
import { API_BASE } from "@/utils/api-config";

const OVERSIGHT_TYPES: { value: OversightType; label: string }[] = [
  { value: "BOARD_MEETING", label: "Board Meeting" },
  { value: "COMMITTEE_MEETING", label: "Committee Meeting" },
  { value: "QUARTERLY_REVIEW", label: "Quarterly Review" },
  { value: "ANNUAL_REVIEW", label: "Annual Review" },
  { value: "AD_HOC_REVIEW", label: "Ad-hoc Review" },
  { value: "AUDIT_REVIEW", label: "Audit Review" },
  { value: "RISK_ASSESSMENT", label: "Risk Assessment" },
];

interface OversightPanelProps {
  upcomingActivities: OversightActivity[];
  onUpdate: () => void;
}

export function OversightPanel({ upcomingActivities, onUpdate }: OversightPanelProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newActivity, setNewActivity] = useState({
    activityType: "" as OversightType,
    title: "",
    description: "",
    scheduledAt: "",
    agendaItems: "",
  });

  const handleCreateActivity = async () => {
    try {
      await fetch(`${API_BASE}/audit/governance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recordOversight',
          data: {
            ...newActivity,
            agendaItems: newActivity.agendaItems.split('\n').filter(Boolean),
            participants: [],
            decisions: [],
            actionItems: [],
            regulations: ['DORA', 'NIS2'],
            articles: ['DORA-5', 'NIS2-20'],
          },
        }),
      });
      setShowCreateDialog(false);
      setNewActivity({
        activityType: "" as OversightType,
        title: "",
        description: "",
        scheduledAt: "",
        agendaItems: "",
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to create oversight activity:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Management Oversight</h3>
          <p className="text-sm text-muted-foreground">
            DORA Art.5 - Management body oversight activities
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Oversight Activity</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Activity Type</Label>
                <Select
                  value={newActivity.activityType}
                  onValueChange={(v) =>
                    setNewActivity({ ...newActivity, activityType: v as OversightType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {OVERSIGHT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="e.g., Q1 2025 ICT Risk Review"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={newActivity.description}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Scheduled Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newActivity.scheduledAt}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, scheduledAt: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Agenda Items (one per line)</Label>
                <Textarea
                  value={newActivity.agendaItems}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, agendaItems: e.target.value })
                  }
                  placeholder="ICT risk status update&#10;Major incident review&#10;Policy approval"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateActivity}>Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Activities */}
      <div className="grid gap-4">
        {upcomingActivities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No upcoming activities</p>
              <p className="text-sm text-muted-foreground">
                Schedule your first oversight activity
              </p>
            </CardContent>
          </Card>
        ) : (
          upcomingActivities.map((activity) => (
            <Card key={activity.activityId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{activity.title}</CardTitle>
                    <CardDescription>
                      {activity.activityType.replace(/_/g, ' ')}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(activity.scheduledAt), 'MMM d, yyyy HH:mm')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {activity.description}
                </p>
                {activity.agendaItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Agenda</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {activity.agendaItems.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
