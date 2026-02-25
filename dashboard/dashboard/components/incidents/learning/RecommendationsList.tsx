"use client";

import { useState, useEffect } from "react";
import { ImprovementRecommendation, RecommendationPriority, RecommendationStatus } from "@/lib/dora/incident-learning-types";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Lightbulb,
  CheckCircle,
  XCircle,
  Play,
  TrendingDown,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PRIORITY_COLORS: Record<RecommendationPriority, string> = {
  CRITICAL: "bg-red-500/10 text-red-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-400",
  LOW: "bg-gray-500/10 text-gray-400",
};

const STATUS_COLORS: Record<RecommendationStatus, string> = {
  PROPOSED: "bg-blue-500/10 text-blue-400",
  APPROVED: "bg-green-500/10 text-green-400",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-400",
  IMPLEMENTED: "bg-green-500/10 text-green-400",
  VERIFIED: "bg-purple-500/10 text-purple-400",
  REJECTED: "bg-red-500/10 text-red-400",
  DEFERRED: "bg-gray-500/10 text-gray-400",
};

export function RecommendationsList() {
  const [recommendations, setRecommendations] = useState<ImprovementRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRec, setSelectedRec] = useState<ImprovementRecommendation | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [actionReason, setActionReason] = useState("");
  const [effectivenessData, setEffectivenessData] = useState({ before: "", after: "" });

  useEffect(() => {
    fetchRecommendations();
  }, [statusFilter, priorityFilter]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ view: "recommendations" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);

      const response = await fetch(`/api/v1/incidents/learning?${params}`);
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRec) return;

    try {
      const body: any = {
        status: actionType,
        changedBy: "current-user",
        reason: actionReason,
      };

      if (actionType === "VERIFIED" && effectivenessData.before && effectivenessData.after) {
        const before = parseInt(effectivenessData.before);
        const after = parseInt(effectivenessData.after);
        const reduction = before > 0 ? Math.round(((before - after) / before) * 100) : 0;
        
        body.effectiveness = {
          incidentsBeforeCount: before,
          incidentsAfterCount: after,
          actualReduction: reduction,
          notes: actionReason,
        };
      }

      await fetch(`/api/v1/incidents/learning/recommendations/${selectedRec.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setShowActionDialog(false);
      setSelectedRec(null);
      setActionReason("");
      setEffectivenessData({ before: "", after: "" });
      fetchRecommendations();
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const openActionDialog = (rec: ImprovementRecommendation, action: string) => {
    setSelectedRec(rec);
    setActionType(action);
    setShowActionDialog(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PROPOSED">Proposed</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36 bg-slate-900 border-slate-800">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-800 bg-slate-900 animate-pulse">
              <CardHeader>
                <div className="h-6 w-64 bg-slate-700 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-slate-700 rounded" />
              </CardContent>
            </Card>
          ))
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-white">No Recommendations</h3>
            <p className="text-slate-400">
              Run pattern analysis to generate improvement recommendations
            </p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <Card key={rec.id} className="border-slate-800 bg-slate-900">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base text-white">{rec.title}</CardTitle>
                    <CardDescription className="text-slate-500">{rec.recommendationId}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={PRIORITY_COLORS[rec.priority]}>
                      {rec.priority}
                    </Badge>
                    <Badge className={STATUS_COLORS[rec.status]}>
                      {rec.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-4">{rec.description}</p>

                {/* Impact prediction */}
                <div className="grid grid-cols-3 gap-4 p-3 rounded bg-slate-800/50 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{rec.impactPrediction.incidentReduction}%</p>
                      <p className="text-xs text-slate-500">Incident Reduction</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{rec.implementation.estimatedDays}d</p>
                      <p className="text-xs text-slate-500">Effort</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{rec.impactPrediction.confidenceLevel}%</p>
                      <p className="text-xs text-slate-500">Confidence</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Created {formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true })}
                  </span>

                  <div className="flex gap-2">
                    {rec.status === "PROPOSED" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(rec, "REJECTED")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openActionDialog(rec, "APPROVED")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                    {rec.status === "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() => openActionDialog(rec, "IN_PROGRESS")}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Implementation
                      </Button>
                    )}
                    {rec.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        onClick={() => openActionDialog(rec, "IMPLEMENTED")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Implemented
                      </Button>
                    )}
                    {rec.status === "IMPLEMENTED" && (
                      <Button
                        size="sm"
                        onClick={() => openActionDialog(rec, "VERIFIED")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify Effectiveness
                      </Button>
                    )}
                  </div>
                </div>

                {/* Show effectiveness if verified */}
                {rec.status === "VERIFIED" && rec.effectiveness && (
                  <div className="mt-4 p-3 rounded bg-green-500/10 border border-green-500/20">
                    <p className="text-sm font-medium text-green-400">
                      Verified Effectiveness: {(rec.effectiveness as any).actualReduction}% reduction
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Incidents before: {(rec.effectiveness as any).incidentsBeforeCount} →
                      After: {(rec.effectiveness as any).incidentsAfterCount}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {actionType === "APPROVED" && "Approve Recommendation"}
              {actionType === "REJECTED" && "Reject Recommendation"}
              {actionType === "IN_PROGRESS" && "Start Implementation"}
              {actionType === "IMPLEMENTED" && "Mark as Implemented"}
              {actionType === "VERIFIED" && "Verify Effectiveness"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              {selectedRec?.title}
            </p>

            <div>
              <label className="text-sm font-medium text-white">
                {actionType === "REJECTED" ? "Rejection Reason" : "Notes (optional)"}
              </label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionType === "REJECTED" ? "Please provide a reason..." : "Add any notes..."}
                rows={3}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {actionType === "VERIFIED" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-white">Incidents Before</label>
                  <Input
                    type="number"
                    value={effectivenessData.before}
                    onChange={(e) => setEffectivenessData({ ...effectivenessData, before: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-white">Incidents After</label>
                  <Input
                    type="number"
                    value={effectivenessData.after}
                    onChange={(e) => setEffectivenessData({ ...effectivenessData, after: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              variant={actionType === "REJECTED" ? "destructive" : "default"}
              disabled={actionType === "REJECTED" && !actionReason}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

