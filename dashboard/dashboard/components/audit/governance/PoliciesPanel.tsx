"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, FileText, Send, Eye, AlertTriangle } from "lucide-react";
import { Policy, PolicyCategory } from "@/lib/audit/governance-types";
import { format } from "date-fns";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-500/10 text-gray-500",
  PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-500",
  ACTIVE: "bg-green-500/10 text-green-500",
  DEPRECATED: "bg-orange-500/10 text-orange-500",
  ARCHIVED: "bg-gray-500/10 text-gray-500",
};

const CATEGORIES: { value: PolicyCategory; label: string }[] = [
  { value: "ICT_RISK_MANAGEMENT", label: "ICT Risk Management" },
  { value: "ICT_SECURITY", label: "ICT Security" },
  { value: "ICT_OPERATIONS", label: "ICT Operations" },
  { value: "ICT_CONTINUITY", label: "ICT Continuity" },
  { value: "INCIDENT_MANAGEMENT", label: "Incident Management" },
  { value: "THIRD_PARTY_RISK", label: "Third Party Risk" },
  { value: "ACCESS_CONTROL", label: "Access Control" },
  { value: "DATA_PROTECTION", label: "Data Protection" },
  { value: "AI_GOVERNANCE", label: "AI Governance" },
  { value: "CHANGE_MANAGEMENT", label: "Change Management" },
  { value: "TESTING", label: "Testing" },
  { value: "AUDIT", label: "Audit" },
  { value: "COMMUNICATION", label: "Communication" },
];

interface PoliciesPanelProps {
  onUpdate: () => void;
}

export function PoliciesPanel({ onUpdate }: PoliciesPanelProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    category: "" as PolicyCategory,
    summary: "",
    scope: "",
    reviewFrequency: "ANNUAL" as const,
    requiredApprovalLevel: "EXECUTIVE" as const,
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit/governance?view=policies`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit/governance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'createPolicy',
          data: {
            ...newPolicy,
            scope: newPolicy.scope.split(',').map((s) => s.trim()),
            ownerId: 'current-user', // Would come from auth
            ownerRole: 'COMPLIANCE_OFFICER',
            regulations: ['DORA', 'NIS2'],
            articles: ['DORA-5', 'NIS2-20'],
          },
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setNewPolicy({
          name: "",
          description: "",
          category: "" as PolicyCategory,
          summary: "",
          scope: "",
          reviewFrequency: "ANNUAL",
          requiredApprovalLevel: "EXECUTIVE",
        });
        fetchPolicies();
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to create policy:', error);
    }
  };

  const handleSubmitForApproval = async (policyId: string) => {
    try {
      await fetch(`${API_BASE}/audit/governance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'submitForApproval',
          policyId,
          approverIds: ['approver-1'], // Would come from role assignments
        }),
      });
      fetchPolicies();
      onUpdate();
    } catch (error) {
      console.error('Failed to submit for approval:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading policies...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">ICT Policies Registry</h3>
          <p className="text-sm text-muted-foreground">
            DORA Art.5 - ICT risk management framework policies
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Policy Name</Label>
                <Input
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  placeholder="e.g., ICT Security Policy"
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={newPolicy.category}
                  onValueChange={(v) => setNewPolicy({ ...newPolicy, category: v as PolicyCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Brief description of the policy"
                />
              </div>
              <div className="grid gap-2">
                <Label>Summary</Label>
                <Textarea
                  value={newPolicy.summary}
                  onChange={(e) => setNewPolicy({ ...newPolicy, summary: e.target.value })}
                  placeholder="Executive summary"
                />
              </div>
              <div className="grid gap-2">
                <Label>Scope (comma-separated)</Label>
                <Input
                  value={newPolicy.scope}
                  onChange={(e) => setNewPolicy({ ...newPolicy, scope: e.target.value })}
                  placeholder="e.g., All ICT systems, Critical infrastructure"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Review Frequency</Label>
                  <Select
                    value={newPolicy.reviewFrequency}
                    onValueChange={(v) => setNewPolicy({ ...newPolicy, reviewFrequency: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                      <SelectItem value="ANNUAL">Annual</SelectItem>
                      <SelectItem value="BIENNIAL">Biennial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Required Approval Level</Label>
                  <Select
                    value={newPolicy.requiredApprovalLevel}
                    onValueChange={(v) => setNewPolicy({ ...newPolicy, requiredApprovalLevel: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive</SelectItem>
                      <SelectItem value="BOARD">Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePolicy}>Create Policy</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Policies Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Review Due</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No policies created yet
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.policyId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{policy.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {policy.policyId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {policy.category.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>v{policy.version}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[policy.status]}>
                      {policy.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {policy.nextReviewDue ? (
                      <div className="flex items-center gap-1">
                        {new Date(policy.nextReviewDue) < new Date() && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        {format(new Date(policy.nextReviewDue), 'MMM d, yyyy')}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {policy.status === 'DRAFT' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSubmitForApproval(policy.policyId)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
