"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Target,
  Clock,
  Database,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CriticalFunction {
  id: string;
  name: string;
  description: string;
  icon: string;
  assets: number;
  providers: number;
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
  lastTest: string;
  testResult: 'PASSED' | 'FAILED' | 'DEGRADED';
  status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  nextScheduledTest: string;
}

interface CriticalFunctionsPanelProps {
  fullView?: boolean;
}

export function CriticalFunctionsPanel({ fullView = false }: CriticalFunctionsPanelProps) {
  // Mock data for demonstration
  const mockFunctions: CriticalFunction[] = [
    {
      id: '1',
      name: 'Payment Processing',
      description: 'Core payment flows, card processing, settlements',
      icon: '💳',
      assets: 4,
      providers: 3,
      rto: 15,
      rpo: 0,
      lastTest: 'Dec 10, 2025',
      testResult: 'PASSED',
      status: 'OPERATIONAL',
      nextScheduledTest: 'Jan 10, 2026'
    },
    {
      id: '2',
      name: 'Authentication',
      description: 'User login, session management, MFA',
      icon: '🔐',
      assets: 3,
      providers: 2,
      rto: 5,
      rpo: 0,
      lastTest: 'Dec 15, 2025',
      testResult: 'PASSED',
      status: 'OPERATIONAL',
      nextScheduledTest: 'Jan 15, 2026'
    },
    {
      id: '3',
      name: 'Data Storage',
      description: 'Customer data, transaction records, audit logs',
      icon: '💾',
      assets: 5,
      providers: 2,
      rto: 60,
      rpo: 5,
      lastTest: 'Dec 12, 2025',
      testResult: 'PASSED',
      status: 'OPERATIONAL',
      nextScheduledTest: 'Jan 12, 2026'
    },
    {
      id: '4',
      name: 'Regulatory Reporting',
      description: 'Compliance reports, audit trails',
      icon: '📊',
      assets: 2,
      providers: 1,
      rto: 240,
      rpo: 60,
      lastTest: 'Dec 8, 2025',
      testResult: 'PASSED',
      status: 'OPERATIONAL',
      nextScheduledTest: 'Jan 8, 2026'
    },
    {
      id: '5',
      name: 'Customer Portal',
      description: 'Web banking, account access',
      icon: '🌐',
      assets: 3,
      providers: 2,
      rto: 30,
      rpo: 15,
      lastTest: 'Nov 28, 2025',
      testResult: 'DEGRADED',
      status: 'DEGRADED',
      nextScheduledTest: 'Dec 28, 2025'
    },
    {
      id: '6',
      name: 'Mobile Banking',
      description: 'Mobile app, push notifications',
      icon: '📱',
      assets: 4,
      providers: 3,
      rto: 60,
      rpo: 30,
      lastTest: 'Dec 5, 2025',
      testResult: 'PASSED',
      status: 'OPERATIONAL',
      nextScheduledTest: 'Jan 5, 2026'
    }
  ];

  const displayedFunctions = fullView ? mockFunctions : mockFunctions.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-green-600 bg-green-50 border-green-200';
      case 'DEGRADED': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'DOWN': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTestResultColor = (result: string) => {
    switch (result) {
      case 'PASSED': return 'text-green-600';
      case 'DEGRADED': return 'text-yellow-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hr`;
    return `${Math.round(minutes / 1440)} days`;
  };

  const getTestStatusIcon = (result: string) => {
    switch (result) {
      case 'PASSED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'DEGRADED': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'FAILED': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              CRITICAL FUNCTIONS
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              DORA Art.7(2) │ Business continuity and resilience
            </p>
          </div>
          {!fullView && (
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Define Function
            </Button>
          )}
          {fullView && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Define Function
              </Button>
              <Button variant="outline" size="sm">
                <PlayCircle className="h-4 w-4 mr-2" />
                Schedule Tests
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!fullView ? (
          /* Compact Table View for Overview */
          <div className="space-y-3">
            {displayedFunctions.map((func) => (
              <div key={func.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{func.icon}</span>
                    <div>
                      <h3 className="font-semibold">{func.name}</h3>
                      <p className="text-sm text-muted-foreground">{func.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("font-medium", getStatusColor(func.status))}
                  >
                    {func.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{func.assets}</div>
                      <div className="text-xs text-muted-foreground">Assets</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{func.providers}</div>
                      <div className="text-xs text-muted-foreground">Providers</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{formatTime(func.rto)}</div>
                      <div className="text-xs text-muted-foreground">RTO</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{formatTime(func.rpo)}</div>
                      <div className="text-xs text-muted-foreground">RPO</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t mt-3">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Last test: {func.lastTest}</span>
                    <span className="flex items-center gap-1">
                      {getTestStatusIcon(func.testResult)}
                      Result: {func.testResult}
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    View Function Map →
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm">
                View Function Map →
              </Button>
            </div>
          </div>
        ) : (
          /* Detailed Table View for Functions Page */
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                <div>Function</div>
                <div>Assets</div>
                <div>Providers</div>
                <div>RTO</div>
                <div>RPO</div>
                <div>Status</div>
              </div>

              {displayedFunctions.map((func, index) => (
                <div key={func.id} className={cn(
                  "grid grid-cols-6 gap-4 p-4 text-sm border-b last:border-b-0",
                  index % 2 === 1 && "bg-muted/20"
                )}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{func.icon}</span>
                      <div>
                        <div className="font-medium">{func.name}</div>
                        <div className="text-xs text-muted-foreground">{func.description}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Badge variant="secondary">{func.assets}</Badge>
                  </div>

                  <div className="flex items-center">
                    <Badge variant="secondary">{func.providers}</Badge>
                  </div>

                  <div>{formatTime(func.rto)}</div>

                  <div>{formatTime(func.rpo)}</div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("font-medium", getStatusColor(func.status))}
                      >
                        {func.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getTestStatusIcon(func.testResult)}
                        {func.testResult}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last: {func.lastTest}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            <div className="flex items-center justify-between pt-4 border-t text-sm">
              <div className="text-muted-foreground">
                <strong>RTO</strong> = Recovery Time Objective │ <strong>RPO</strong> = Recovery Point Objective
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  View Function Map
                </Button>
                <Button variant="outline" size="sm">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Schedule Tests
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}