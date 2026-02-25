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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Shield, User, CheckCircle, AlertTriangle } from "lucide-react";
import { RoleAssignment, RoleType } from "@/lib/audit/governance-types";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

const ROLES: { value: RoleType; label: string; required: boolean }[] = [
  { value: "DPO", label: "Data Protection Officer", required: true },
  { value: "CISO", label: "Chief Information Security Officer", required: true },
  { value: "CTO", label: "Chief Technology Officer", required: true },
  { value: "CIO", label: "Chief Information Officer", required: false },
  { value: "CEO", label: "Chief Executive Officer", required: false },
  { value: "CFO", label: "Chief Financial Officer", required: false },
  { value: "BOARD_MEMBER", label: "Board Member", required: true },
  { value: "RISK_COMMITTEE_MEMBER", label: "Risk Committee Member", required: false },
  { value: "AUDIT_COMMITTEE_MEMBER", label: "Audit Committee Member", required: false },
  { value: "INCIDENT_MANAGER", label: "Incident Manager", required: false },
  { value: "SECURITY_ANALYST", label: "Security Analyst", required: false },
  { value: "COMPLIANCE_OFFICER", label: "Compliance Officer", required: false },
];

const AUTHORITY_LEVELS = [
  { value: "OPERATOR", label: "Operator" },
  { value: "MANAGER", label: "Manager" },
  { value: "EXECUTIVE", label: "Executive" },
  { value: "BOARD", label: "Board" },
];

interface RolesPanelProps {
  onUpdate: () => void;
}

export function RolesPanel({ onUpdate }: RolesPanelProps) {
  const [roles, setRoles] = useState<RoleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRole, setNewRole] = useState({
    actorId: "",
    actorName: "",
    actorEmail: "",
    role: "" as RoleType,
    department: "",
    authorityLevel: "MANAGER" as const,
    canApprove: false,
    canEscalate: true,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit/governance?view=roles`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async () => {
    try {
      await fetch(`${API_BASE}/audit/governance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'assignRole',
          data: {
            ...newRole,
            actorId: `USER-${Date.now()}`,
            effectiveFrom: new Date().toISOString(),
          },
        }),
      });
      setShowCreateDialog(false);
      setNewRole({
        actorId: "",
        actorName: "",
        actorEmail: "",
        role: "" as RoleType,
        department: "",
        authorityLevel: "MANAGER",
        canApprove: false,
        canEscalate: true,
      });
      fetchRoles();
      onUpdate();
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  // Check which required roles are missing
  const assignedRoleTypes = new Set(roles.filter((r) => r.isActive).map((r) => r.role));
  const missingRequiredRoles = ROLES.filter(
    (r) => r.required && !assignedRoleTypes.has(r.value)
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Role Assignments</h3>
          <p className="text-sm text-muted-foreground">
            DORA Art.5 - Key function holders and responsibilities
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input
                  value={newRole.actorName}
                  onChange={(e) => setNewRole({ ...newRole, actorName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newRole.actorEmail}
                  onChange={(e) => setNewRole({ ...newRole, actorEmail: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={newRole.role}
                  onValueChange={(v) => setNewRole({ ...newRole, role: v as RoleType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                        {role.required && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Required)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Input
                  value={newRole.department}
                  onChange={(e) => setNewRole({ ...newRole, department: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Authority Level</Label>
                <Select
                  value={newRole.authorityLevel}
                  onValueChange={(v) => setNewRole({ ...newRole, authorityLevel: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTHORITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newRole.canApprove}
                    onCheckedChange={(c) => setNewRole({ ...newRole, canApprove: !!c })}
                  />
                  <Label>Can Approve</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newRole.canEscalate}
                    onCheckedChange={(c) => setNewRole({ ...newRole, canEscalate: !!c })}
                  />
                  <Label>Can Escalate</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignRole}>Assign Role</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Missing Required Roles Warning */}
      {missingRequiredRoles.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-semibold text-destructive">Missing Required Roles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingRequiredRoles.map((role) => (
              <Badge key={role.value} variant="outline" className="border-destructive">
                {role.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Roles Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Authority</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No roles assigned yet
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.assignmentId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{role.actorName}</p>
                        <p className="text-xs text-muted-foreground">{role.actorEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ROLES.find((r) => r.value === role.role)?.label || role.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{role.department}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.authorityLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {role.canApprove && (
                        <Badge variant="outline" className="text-xs">Approve</Badge>
                      )}
                      {role.canEscalate && (
                        <Badge variant="outline" className="text-xs">Escalate</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {role.isActive ? (
                      <Badge className="bg-green-500/10 text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
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
