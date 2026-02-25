"use client";

import { useState, useEffect } from "react";
import { TrainingRecord } from "@/lib/dora/governance-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraduationCap, AlertTriangle, CheckCircle, Clock, Plus } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TrainingStatus {
  records: TrainingRecord[];
  summary: {
    total: number;
    current: number;
    expiringSoon: number;
    expired: number;
  };
}

const STATUS_COLORS = {
  CURRENT: "bg-green-500/10 text-green-400",
  EXPIRING_SOON: "bg-yellow-500/10 text-yellow-400",
  EXPIRED: "bg-red-500/10 text-red-400",
};

export function TrainingCompliance() {
  const [data, setData] = useState<TrainingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrainingStatus();
  }, []);

  const fetchTrainingStatus = async () => {
    try {
      const response = await fetch("/api/v1/governance?view=training");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch training status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecordStatus = (validUntil: string): "CURRENT" | "EXPIRING_SOON" | "EXPIRED" => {
    const now = new Date();
    const valid = new Date(validUntil);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (valid < now) return "EXPIRED";
    if (valid < thirtyDaysFromNow) return "EXPIRING_SOON";
    return "CURRENT";
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-slate-700 rounded-lg" />
        <div className="h-64 bg-slate-700 rounded-lg" />
      </div>
    );
  }

  const complianceRate = data?.summary.total
    ? ((data.summary.current + data.summary.expiringSoon) / data.summary.total) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Compliance Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${complianceRate >= 90 ? "text-green-400" : "text-orange-400"}`}>
              {Math.round(complianceRate)}%
            </span>
          </div>
          <Progress value={complianceRate} className="mt-2" />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-slate-400">Current</span>
          </div>
          <span className="text-2xl font-bold text-green-400">{data?.summary.current || 0}</span>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-slate-400">Expiring Soon</span>
          </div>
          <span className="text-2xl font-bold text-yellow-400">{data?.summary.expiringSoon || 0}</span>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-slate-400">Expired</span>
          </div>
          <span className="text-2xl font-bold text-red-400">{data?.summary.expired || 0}</span>
        </div>
      </div>

      {/* Training Records Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h4 className="font-medium text-white">Training Records</h4>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-300">Person</TableHead>
              <TableHead className="text-slate-300">Training</TableHead>
              <TableHead className="text-slate-300">Provider</TableHead>
              <TableHead className="text-slate-300">Completed</TableHead>
              <TableHead className="text-slate-300">Valid Until</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <GraduationCap className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">No training records found</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.records.map((record) => {
                const status = getRecordStatus(record.validUntil);
                return (
                  <TableRow key={record.id} className="border-slate-800">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{record.actorName}</p>
                        <p className="text-xs text-slate-500">{record.actorRole}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{record.trainingName}</p>
                        <p className="text-xs text-slate-500">
                          {record.trainingType.replace(/_/g, " ")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{record.provider}</TableCell>
                    <TableCell className="text-slate-300">
                      {format(new Date(record.completedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {formatDistanceToNow(new Date(record.validUntil), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[status]}>
                        {status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

