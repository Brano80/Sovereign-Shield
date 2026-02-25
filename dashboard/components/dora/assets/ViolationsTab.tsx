"use client";

import { useState, useEffect } from "react";
import { WhitelistViolation } from "@/lib/dora/asset-inventory-types";
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
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SEVERITY_COLORS = {
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  LOW: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const STATUS_COLORS = {
  OPEN: "bg-red-500/10 text-red-400",
  ACKNOWLEDGED: "bg-yellow-500/10 text-yellow-400",
  REMEDIATED: "bg-green-500/10 text-green-400",
  EXEMPTED: "bg-purple-500/10 text-purple-400",
  FALSE_POSITIVE: "bg-gray-500/10 text-gray-500",
};

export function ViolationsTab() {
  const [violations, setViolations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [severityFilter, setSeverityFilter] = useState("all");

  useEffect(() => {
    fetchViolations();
  }, [statusFilter, severityFilter]);

  const fetchViolations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ view: "violations" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);

      const response = await fetch(`/api/v1/dora/assets?${params}`);
      const data = await response.json();
      setViolations(data);
    } catch (error) {
      console.error("Failed to fetch violations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const summaryStats = {
    critical: violations.filter((v) => v.severity === "CRITICAL" && v.status === "OPEN").length,
    high: violations.filter((v) => v.severity === "HIGH" && v.status === "OPEN").length,
    total: violations.filter((v) => v.status === "OPEN").length,
    overdue: violations.filter(
      (v) => v.status === "OPEN" && new Date(v.resolutionDeadline) < new Date()
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={`border-slate-800 bg-slate-900 ${summaryStats.critical > 0 ? "border-red-500/50" : ""}`}>
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Critical</CardDescription>
            <CardTitle className="text-2xl text-red-400">{summaryStats.critical}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={`border-slate-800 bg-slate-900 ${summaryStats.high > 0 ? "border-orange-500/50" : ""}`}>
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">High</CardDescription>
            <CardTitle className="text-2xl text-orange-400">{summaryStats.high}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Total Open</CardDescription>
            <CardTitle className="text-2xl text-white">{summaryStats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={`border-slate-800 bg-slate-900 ${summaryStats.overdue > 0 ? "border-red-500/50" : ""}`}>
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Overdue</CardDescription>
            <CardTitle className="text-2xl text-red-400">{summaryStats.overdue}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
            <SelectItem value="REMEDIATED">Remediated</SelectItem>
            <SelectItem value="EXEMPTED">Exempted</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36 bg-slate-900 border-slate-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : violations.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white">No Violations</h3>
            <p className="text-slate-400">All assets are compliant with the whitelist</p>
          </div>
        ) : (
          violations.map((violation) => (
            <Card key={violation.id} className={`border ${SEVERITY_COLORS[violation.severity as keyof typeof SEVERITY_COLORS] || ''.split(" ")[2]} bg-slate-900`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${SEVERITY_COLORS[violation.severity as keyof typeof SEVERITY_COLORS] || ''.split(" ").slice(0, 2).join(" ")}`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-white">{violation.assetName}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {violation.currentVendor} {violation.currentProduct} v{violation.currentVersion}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={SEVERITY_COLORS[violation.severity as keyof typeof SEVERITY_COLORS] || ''}>
                      {violation.severity}
                    </Badge>
                    <Badge className={STATUS_COLORS[violation.status as keyof typeof STATUS_COLORS] || ''}>
                      {violation.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 text-slate-300">{violation.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Detected {formatDistanceToNow(new Date(violation.detectedAt), { addSuffix: true })}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      new Date(violation.resolutionDeadline) < new Date() ? "text-red-400" : ""
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                      Due {formatDistanceToNow(new Date(violation.resolutionDeadline), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {violation.status === "OPEN" && (
                      <>
                        <Button variant="outline" size="sm">
                          Acknowledge
                        </Button>
                        <Button variant="outline" size="sm">
                          Request Exemption
                        </Button>
                        <Button size="sm">
                          Remediate
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


