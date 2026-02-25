"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { Policy, PolicyApproval } from "@/lib/audit/governance-types";
import { format } from "date-fns";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

interface ApprovalsPanelProps {
  onUpdate: () => void;
}

export function ApprovalsPanel({ onUpdate }: ApprovalsPanelProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit/governance?view=policies`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      // Filter to only policies with pending approvals
      const pendingPolicies = (data.policies || []).filter((p: Policy) =>
        p.approvals.some((a) => a.status === 'PENDING')
      );
      setPolicies(pendingPolicies);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (approvalId: string, decision: 'APPROVED' | 'REJECTED') => {
    setProcessingId(approvalId);
    try {
      await fetch(`${API_BASE}/audit/governance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'processApproval',
          approvalId,
          decision,
          comments: comments[approvalId] || '',
        }),
      });
      fetchPendingApprovals();
      onUpdate();
    } catch (error) {
      console.error('Failed to process approval:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading approvals...</div>;
  }

  const pendingApprovals: { policy: Policy; approval: PolicyApproval }[] = [];
  for (const policy of policies) {
    for (const approval of policy.approvals) {
      if (approval.status === 'PENDING') {
        pendingApprovals.push({ policy, approval });
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Pending Approvals</h3>
        <p className="text-sm text-muted-foreground">
          Review and approve policy submissions
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No pending approvals at this time
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingApprovals.map(({ policy, approval }) => (
            <Card key={approval.approvalId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{policy.name}</CardTitle>
                      <CardDescription>
                        Version {policy.version} • {policy.category.replace(/_/g, ' ')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending since {format(new Date(approval.requestedAt), 'MMM d')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Summary</p>
                  <p className="text-sm text-muted-foreground">{policy.summary}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Scope</p>
                    <p className="text-muted-foreground">{policy.scope.join(', ')}</p>
                  </div>
                  <div>
                    <p className="font-medium">Regulatory Coverage</p>
                    <div className="flex gap-1 mt-1">
                      {policy.regulations.map((reg) => (
                        <Badge key={reg} variant="secondary">{reg}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Your Comments (Optional)</p>
                  <Textarea
                    placeholder="Add comments or conditions..."
                    value={comments[approval.approvalId] || ''}
                    onChange={(e) =>
                      setComments({ ...comments, [approval.approvalId]: e.target.value })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleApproval(approval.approvalId, 'REJECTED')}
                  disabled={processingId === approval.approvalId}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproval(approval.approvalId, 'APPROVED')}
                  disabled={processingId === approval.approvalId}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
