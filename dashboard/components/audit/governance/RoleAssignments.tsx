"use client";

import { useState, useEffect } from "react";
import { RoleAssignment } from "@/lib/dora/governance-types";
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
import { Users, Plus, Shield, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { getApiBase, API_ENDPOINTS } from "@/app/utils/api-config";

// Badge variants for authority levels
const getAuthorityVariant = (authorityLevel: string) => {
  switch (authorityLevel) {
    case "OPERATOR":
      return "secondary";
    case "MANAGER":
      return "default";
    case "EXECUTIVE":
      return "outline";
    case "BOARD":
      return "destructive";
    default:
      return "secondary";
  }
};

const ROLE_TYPE_ICONS = {
  ICT_GOVERNANCE: Shield,
  ICT_RISK: AlertTriangle,
  ICT_OPERATIONS: Users,
  COMPLIANCE: Shield,
  AUDIT: Shield,
};

export function RoleAssignments() {
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${getApiBase()}${API_ENDPOINTS.DORA_GOVERNANCE.ROLES}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        console.error("Failed to fetch role assignments:", response.statusText);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Failed to fetch role assignments:", error);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Role Assignments</h4>
          <p className="text-sm text-slate-400">
            ICT governance roles and segregation of duties
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Assign Role
        </Button>
      </div>

      {/* Segregation of Duties Warning */}
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-400">Segregation of Duties</p>
            <p className="text-sm text-slate-400">
              The system automatically checks for incompatible role combinations.
              Violations are blocked and logged for audit purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-300">Person</TableHead>
              <TableHead className="text-slate-300">Role</TableHead>
              <TableHead className="text-slate-300">Type</TableHead>
              <TableHead className="text-slate-300">Department</TableHead>
              <TableHead className="text-slate-300">Authority</TableHead>
              <TableHead className="text-slate-300">Effective From</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">No role assignments found</p>
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => {
                const Icon = ROLE_TYPE_ICONS[assignment.roleType] || Users;
                return (
                  <TableRow key={assignment.id} className="border-slate-800">
                    <TableCell>
                      <p className="font-medium text-white">{assignment.actorName}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="text-white">{assignment.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-300">
                        {assignment.roleType.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-300">{assignment.department}</TableCell>
                    <TableCell>
                      <Badge variant={getAuthorityVariant(assignment.authorityLevel)}>
                        {assignment.authorityLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {format(new Date(assignment.effectiveFrom), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={assignment.status === "ACTIVE" ? "default" : "destructive"}>
                        {assignment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Incompatible Roles Reference */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h5 className="font-medium mb-3 text-white">Incompatible Role Combinations</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ICT Risk Manager</span>
            <span className="text-red-400">✕</span>
            <span className="text-slate-400">ICT Operations Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Policy Author</span>
            <span className="text-red-400">✕</span>
            <span className="text-slate-400">Policy Approver</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Change Requestor</span>
            <span className="text-red-400">✕</span>
            <span className="text-slate-400">Change Approver (same request)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Internal Auditor</span>
            <span className="text-red-400">✕</span>
            <span className="text-slate-400">ICT Operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

