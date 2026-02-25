"use client";

import { useState, useEffect } from "react";
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
import { Plus, GraduationCap, AlertTriangle, CheckCircle } from "lucide-react";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

interface TrainingPanelProps {
  onUpdate: () => void;
}

export function TrainingPanel({ onUpdate }: TrainingPanelProps) {
  const [trainingStatus, setTrainingStatus] = useState<{
    overall: number;
    byProgram: { programId: string; programName: string; completionRate: number }[];
    overdue: { actorId: string; actorName: string; programId: string; programName: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrainingStatus();
  }, []);

  const fetchTrainingStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit/governance?view=training`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setTrainingStatus(data);
    } catch (error) {
      console.error('Failed to fetch training status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading training data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Training Programs</h3>
          <p className="text-sm text-muted-foreground">
            Staff competency and awareness training
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      {/* Overall Compliance */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <span className="font-semibold">Overall Training Compliance</span>
          </div>
          <span className="text-2xl font-bold">{trainingStatus?.overall || 0}%</span>
        </div>
        <Progress value={trainingStatus?.overall || 0} className="h-3" />
      </div>

      {/* Program Completion Rates */}
      {trainingStatus?.byProgram && trainingStatus.byProgram.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingStatus.byProgram.map((program) => (
                <TableRow key={program.programId}>
                  <TableCell className="font-medium">{program.programName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={program.completionRate} className="w-24 h-2" />
                      <span className="text-sm">{program.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {program.completionRate >= 80 ? (
                      <Badge className="bg-green-500/10 text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        On Track
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-500">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Needs Attention
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Overdue Training */}
      {trainingStatus?.overdue && trainingStatus.overdue.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-semibold text-destructive">Overdue Training</span>
          </div>
          <div className="space-y-2">
            {trainingStatus.overdue.map((item, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{item.actorName}</span>
                <span className="text-muted-foreground"> needs to complete </span>
                <span className="font-medium">{item.programName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
