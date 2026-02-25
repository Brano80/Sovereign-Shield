"use client";

import { useState, useEffect } from "react";
import { ManagementOversight } from "@/lib/dora/governance-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, AlertTriangle, DollarSign, Shield, GraduationCap } from "lucide-react";
import { format } from "date-fns";

const ACTIVITY_ICONS: Record<string, typeof Users> = {
  POLICY_APPROVAL: FileText,
  RISK_REVIEW: AlertTriangle,
  INCIDENT_ESCALATION: Shield,
  BUDGET_APPROVAL: DollarSign,
  STRATEGY_REVIEW: Users,
  AUDIT_REVIEW: FileText,
  TRAINING_COMPLETION: GraduationCap,
};

const AUTHORITY_COLORS = {
  EXECUTIVE: "bg-purple-500/10 text-purple-400",
  BOARD: "bg-blue-500/10 text-blue-400",
  COMMITTEE: "bg-green-500/10 text-green-400",
};

export function OversightActivities() {
  const [activities, setActivities] = useState<ManagementOversight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchActivities();
  }, [period]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/governance?view=oversight&period=${period}`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Failed to fetch oversight activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-white">Management Body Oversight Activities</h4>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activities Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-700" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-slate-700 rounded mb-2" />
                <div className="h-3 w-32 bg-slate-700 rounded" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>No oversight activities in this period</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.activityType] || Users;
            return (
              <div key={activity.id} className="flex gap-4 p-4 rounded-lg border border-slate-800 bg-slate-900">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-400">
                          {activity.actorName}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-sm text-slate-400">
                          {activity.actorRole}
                        </span>
                        <Badge className={AUTHORITY_COLORS[activity.authorityLevel]}>
                          {activity.authorityLevel}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm text-slate-400">
                      {format(new Date(activity.occurredAt), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>

                  {(activity.decision || activity.outcome) && (
                    <div className="mt-2 p-2 rounded bg-slate-800/50 text-sm">
                      {activity.decision && (
                        <p className="text-slate-300"><span className="font-medium">Decision:</span> {activity.decision}</p>
                      )}
                      {activity.outcome && (
                        <p className="text-slate-300"><span className="font-medium">Outcome:</span> {activity.outcome}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {activity.regulatoryTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-slate-700 text-slate-300">
                        {tag}
                      </Badge>
                    ))}
                    {activity.articles.map((article) => (
                      <Badge key={article} variant="outline" className="text-xs border-slate-700 text-slate-300">
                        {article}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

