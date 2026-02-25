"use client";

import { useState, useEffect } from "react";
import { Policy, PolicyStatus } from "@/lib/dora/governance-types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, User, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<PolicyStatus, string> = {
  DRAFT: "bg-gray-500/10 text-gray-400",
  PENDING_APPROVAL: "bg-orange-500/10 text-orange-400",
  APPROVED: "bg-blue-500/10 text-blue-400",
  ACTIVE: "bg-green-500/10 text-green-400",
  DEPRECATED: "bg-yellow-500/10 text-yellow-400",
  ARCHIVED: "bg-gray-500/10 text-gray-400",
};

export function PolicyRegistry() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchPolicies();
  }, [statusFilter, categoryFilter]);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      let url = "/api/v1/governance?view=policies";
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (categoryFilter !== "all") url += `&category=${categoryFilter}`;

      const response = await fetch(url);
      const data = await response.json();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DEPRECATED">Deprecated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-slate-900 border-slate-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ICT_SECURITY">ICT Security</SelectItem>
              <SelectItem value="ICT_RISK">ICT Risk</SelectItem>
              <SelectItem value="INCIDENT_MANAGEMENT">Incident Management</SelectItem>
              <SelectItem value="BUSINESS_CONTINUITY">Business Continuity</SelectItem>
              <SelectItem value="THIRD_PARTY">Third Party</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Policy
        </Button>
      </div>

      {/* Policies Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-300">Policy</TableHead>
              <TableHead className="text-slate-300">Category</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Version</TableHead>
              <TableHead className="text-slate-300">Owner</TableHead>
              <TableHead className="text-slate-300">Next Review</TableHead>
              <TableHead className="text-slate-300"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <FileText className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">No policies found</p>
                </TableCell>
              </TableRow>
            ) : (
              policies.map((policy) => (
                <TableRow key={policy.id} className="border-slate-800">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{policy.name}</p>
                      <p className="text-xs text-slate-500">{policy.policyNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-300">
                      {policy.category.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[policy.status]}>
                      {policy.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-slate-300">{policy.currentVersion}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-500" />
                      <span className="text-sm text-slate-300">{policy.ownerDepartment}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      <span className="text-sm text-slate-300">
                        {formatDistanceToNow(new Date(policy.nextReviewDate), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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

