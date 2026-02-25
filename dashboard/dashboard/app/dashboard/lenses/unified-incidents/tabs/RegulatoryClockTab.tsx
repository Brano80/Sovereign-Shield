"use client";

import { useState, useMemo } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Grid3X3,
  List,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { RegulationBadge } from '../components/RegulationBadge';
import { DeadlineCard } from '../components/DeadlineCard';
import { useIncidents } from '../hooks/useIncidents';
import { useDeadlines } from '../hooks/useDeadlines';
import type { IncidentDeadline, Regulation } from '../types';

type ViewMode = 'grid' | 'list';
type UrgencyGroup = 'overdue' | 'critical' | 'urgent' | 'warning' | 'normal';

interface GroupedDeadlines {
  overdue: IncidentDeadline[];
  critical: IncidentDeadline[];
  urgent: IncidentDeadline[];
  warning: IncidentDeadline[];
  normal: IncidentDeadline[];
}

export function RegulatoryClockTab() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | 'all'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<UrgencyGroup>>(new Set(['overdue', 'critical', 'urgent']));

  const { data } = useIncidents();
  const { deadlines: rawDeadlines } = useDeadlines();

  // Mock deadlines data for development
  const mockDeadlines: IncidentDeadline[] = [
    {
      id: "dl-001",
      incidentId: "INC-2025-047",
      regulation: "GDPR",
      reportType: "BREACH_NOTIFICATION",
      article: "Article 33",
      dueAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
      status: "OVERDUE",
      description: "Personal data breach notification"
    },
    {
      id: "dl-002",
      incidentId: "INC-2025-046",
      regulation: "DORA",
      reportType: "MAJOR_INCIDENT",
      article: "Article 19",
      dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now (critical)
      status: "PENDING",
      description: "Major ICT incident notification"
    },
    {
      id: "dl-003",
      incidentId: "INC-2025-045",
      regulation: "NIS2",
      reportType: "INCIDENT_NOTIFICATION",
      article: "Article 23",
      dueAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now (urgent)
      status: "PENDING",
      description: "Significant incident notification"
    },
    {
      id: "dl-004",
      incidentId: "INC-2025-044",
      regulation: "GDPR",
      reportType: "BREACH_NOTIFICATION",
      article: "Article 34",
      dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now (warning)
      status: "PENDING",
      description: "Data subject notification"
    }
  ];

  const deadlines = rawDeadlines || mockDeadlines;

  // Group deadlines by urgency
  const groupedDeadlines = useMemo(() => {
    const groups: GroupedDeadlines = {
      overdue: [],
      critical: [],
      urgent: [],
      warning: [],
      normal: []
    };

    const now = new Date();

    deadlines.forEach(deadline => {
      if (selectedRegulation !== 'all' && deadline.regulation !== selectedRegulation) {
        return;
      }

      const timeDiff = new Date(deadline.dueAt).getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (timeDiff < 0) {
        groups.overdue.push(deadline);
      } else if (hoursDiff <= 1) {
        groups.critical.push(deadline);
      } else if (hoursDiff <= 4) {
        groups.urgent.push(deadline);
      } else if (hoursDiff <= 24) {
        groups.warning.push(deadline);
      } else {
        groups.normal.push(deadline);
      }
    });

    return groups;
  }, [deadlines, selectedRegulation]);

  const toggleGroup = (group: UrgencyGroup) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const getGroupConfig = (group: UrgencyGroup) => {
    switch (group) {
      case 'overdue':
        return {
          title: 'OVERDUE',
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          count: groupedDeadlines.overdue.length
        };
      case 'critical':
        return {
          title: 'DUE WITHIN 1 HOUR',
          icon: AlertTriangle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          count: groupedDeadlines.critical.length
        };
      case 'urgent':
        return {
          title: 'DUE WITHIN 4 HOURS',
          icon: Clock,
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          count: groupedDeadlines.urgent.length
        };
      case 'warning':
        return {
          title: 'DUE WITHIN 24 HOURS',
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          count: groupedDeadlines.warning.length
        };
      case 'normal':
        return {
          title: 'DUE WITHIN 30 DAYS',
          icon: Clock,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          count: groupedDeadlines.normal.length
        };
    }
  };

  const totalDeadlines = Object.values(groupedDeadlines).reduce((sum, group) => sum + group.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Regulatory Clock</h2>
          <p className="text-slate-400 mt-1">Real-time deadline tracking across all regulations</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedRegulation} onValueChange={(value) => setSelectedRegulation(value as Regulation | 'all')}>
            <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-slate-300">
              <SelectValue placeholder="Filter by regulation" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Regulations</SelectItem>
              <SelectItem value="GDPR">GDPR</SelectItem>
              <SelectItem value="DORA">DORA</SelectItem>
              <SelectItem value="NIS2">NIS2</SelectItem>
              <SelectItem value="AI_ACT">AI Act</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-blue-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            >
              <Grid3X3 size={14} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-blue-600' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
            >
              <List size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(['overdue', 'critical', 'urgent', 'warning', 'normal'] as UrgencyGroup[]).map(group => {
          const config = getGroupConfig(group);
          const Icon = config.icon;

          return (
            <Card key={group} className={`${config.bgColor} ${config.borderColor} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{config.title}</p>
                    <p className="text-2xl font-bold text-white">{config.count}</p>
                  </div>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deadline Groups */}
      <div className="space-y-4">
        {(['overdue', 'critical', 'urgent', 'warning', 'normal'] as UrgencyGroup[]).map(group => {
          const config = getGroupConfig(group);
          const Icon = config.icon;
          const isExpanded = expandedGroups.has(group);
          const groupDeadlines = groupedDeadlines[group];

          if (groupDeadlines.length === 0) return null;

          return (
            <Card key={group} className={`${config.bgColor} ${config.borderColor} border`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroup(group)}
                      className="p-0 h-auto text-white hover:bg-transparent"
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </Button>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <CardTitle className="text-white">{config.title}</CardTitle>
                    <Badge className={`${config.bgColor} text-white border-0`}>
                      {groupDeadlines.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupDeadlines.map(deadline => (
                        <DeadlineCard
                          key={deadline.id}
                          deadline={deadline}
                          onView={() => console.log('View deadline', deadline.id)}
                          onSubmit={() => console.log('Submit report', deadline.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {groupDeadlines.map(deadline => (
                        <div
                          key={deadline.id}
                          className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center gap-4">
                            <RegulationBadge regulation={deadline.regulation} />
                            <div>
                              <p className="text-white font-medium">{deadline.incidentId}</p>
                              <p className="text-sm text-slate-400">{deadline.description}</p>
                              <p className="text-xs text-slate-500">{deadline.article}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm text-slate-300">
                                Due: {new Date(deadline.dueAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(deadline.dueAt).toLocaleTimeString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                                <Eye size={14} className="mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                                <FileText size={14} className="mr-1" />
                                Submit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {totalDeadlines === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Active Deadlines</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                All regulatory deadlines have been met. The system is compliant.
              </p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                System Compliant
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}