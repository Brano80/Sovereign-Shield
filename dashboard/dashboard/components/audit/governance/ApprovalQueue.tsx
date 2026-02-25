"use client";

import { useState, useEffect } from "react";
import { ChangeRequest } from "@/lib/dora/governance-types";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const RISK_COLORS = {
  LOW: "bg-green-500/10 text-green-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-400",
};

export function ApprovalQueue() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/v1/governance?view=change-requests&status=PENDING_APPROVAL");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (decision: "APPROVED" | "REJECTED") => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/v1/governance/approvals/${selectedRequest.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: "current-user", // Would come from auth context
          decision,
          comments: approvalComments,
        }),
      });

      if (response.ok) {
        setShowApprovalDialog(false);
        setSelectedRequest(null);
        setApprovalComments("");
        fetchRequests();
      }
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-800 bg-slate-900 p-4 animate-pulse">
            <div className="h-6 w-64 bg-slate-700 rounded mb-2" />
            <div className="h-4 w-48 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
        <h3 className="text-lg font-semibold text-white">All Caught Up!</h3>
        <p className="text-slate-400">No pending approvals in your queue</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="border-slate-800 bg-slate-900">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base text-white">{request.title}</CardTitle>
                <CardDescription className="text-slate-400">{request.requestNumber}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={RISK_COLORS[request.impactAssessment.riskLevel]}>
                  {request.impactAssessment.riskLevel} Risk
                </Badge>
                <Badge variant="outline" className="border-slate-700 text-slate-300">
                  Level {request.currentApprovalLevel}/{request.totalApprovalLevels}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">{request.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {request.type.replace(/_/g, " ")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowApprovalDialog(true);
                  }}
                >
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Review Change Request</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedRequest?.requestNumber} - {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1 text-white">Description</h4>
              <p className="text-sm text-slate-400">{selectedRequest?.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1 text-white">Justification</h4>
              <p className="text-sm text-slate-400">{selectedRequest?.justification}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1 text-white">Impact Assessment</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-300">Risk Level: <Badge className={RISK_COLORS[selectedRequest?.impactAssessment.riskLevel || "LOW"]}>{selectedRequest?.impactAssessment.riskLevel}</Badge></div>
                <div className="text-slate-300">Business: {selectedRequest?.impactAssessment.businessImpact}</div>
                <div className="text-slate-300">Security: {selectedRequest?.impactAssessment.securityImpact}</div>
                <div className="text-slate-300">Compliance: {selectedRequest?.impactAssessment.complianceImpact}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1 text-white">Comments (optional)</h4>
              <Textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Add any comments or conditions..."
                rows={3}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleApproval("REJECTED")}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleApproval("APPROVED")}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

