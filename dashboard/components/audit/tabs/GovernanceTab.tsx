"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoliciesPanel } from "../governance/PoliciesPanel";
import { ApprovalsPanel } from "../governance/ApprovalsPanel";
import { OversightPanel } from "../governance/OversightPanel";
import { TrainingPanel } from "../governance/TrainingPanel";
import { RolesPanel } from "../governance/RolesPanel";
import { GovernanceStats } from "@/lib/audit/governance-types";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  Users,
  GraduationCap,
  Shield,
  AlertTriangle
} from "lucide-react";
import { API_BASE } from "@/utils/api-config";

export function GovernanceTab() {
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("policies");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit/governance?view=stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch governance stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          icon={FileText}
          label="Policies"
          value={stats?.policies.active || 0}
          subValue={stats?.policies.pendingApproval || 0}
          subLabel="pending"
          alert={stats?.policies.overdueReview || 0}
          alertLabel="overdue"
        />
        <StatCard
          icon={CheckCircle}
          label="Approvals"
          value={stats?.approvals.pending || 0}
          subValue={stats?.approvals.approved || 0}
          subLabel="approved"
        />
        <StatCard
          icon={Users}
          label="Oversight"
          value={stats?.oversight.completed || 0}
          subValue={stats?.oversight.scheduled || 0}
          subLabel="scheduled"
        />
        <StatCard
          icon={GraduationCap}
          label="Training"
          value={`${stats?.training.completionRate || 0}%`}
          subValue={stats?.training.overdueCount || 0}
          subLabel="overdue"
          alert={stats?.training.overdueCount || 0}
        />
        <StatCard
          icon={Shield}
          label="Roles"
          value={stats?.roles.assigned || 0}
          subValue={stats?.roles.vacant || 0}
          subLabel="vacant"
          alert={stats?.roles.vacant || 0}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Policies
            {(stats?.policies.pendingApproval || 0) > 0 && (
              <Badge variant="secondary" className="ml-1">
                {stats?.policies.pendingApproval}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approvals
            {(stats?.approvals.pending || 0) > 0 && (
              <Badge variant="destructive" className="ml-1">
                {stats?.approvals.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="oversight" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Oversight
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-6">
          <PoliciesPanel onUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <ApprovalsPanel onUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="oversight" className="mt-6">
          <OversightPanel
            upcomingActivities={stats?.oversight.upcoming || []}
            onUpdate={fetchStats}
          />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <TrainingPanel onUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesPanel onUpdate={fetchStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  subLabel,
  alert,
  alertLabel,
}: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: number;
  subLabel?: string;
  alert?: number;
  alertLabel?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {subValue !== undefined && subLabel && (
          <span className="text-xs text-muted-foreground">
            {subValue} {subLabel}
          </span>
        )}
        {alert !== undefined && alert > 0 && alertLabel && (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {alert} {alertLabel}
          </Badge>
        )}
      </div>
    </div>
  );
}