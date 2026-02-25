"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Lightbulb,
  User,
  Clock,
  TrendingUp,
  CheckCircle,
  Play,
  AlertTriangle,
  Target,
  UserCheck
} from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  expectedImpact: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'VERIFIED';
  assignee?: string;
  patternId: string;
  createdAt: Date;
}

interface RecommendationsListProps {
  isAnalyzing?: boolean;
}

export function RecommendationsList({ isAnalyzing = false }: RecommendationsListProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock recommendations data
  const mockRecommendations: Recommendation[] = [
    {
      id: 'rec-001',
      title: 'Implement Database Connection Pooling',
      description: 'Add connection pooling to prevent database connectivity issues during peak hours',
      expectedImpact: 85,
      priority: 'HIGH',
      status: 'NOT_STARTED',
      assignee: undefined,
      patternId: 'pat-001',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'rec-002',
      title: 'Add Circuit Breaker Pattern',
      description: 'Implement circuit breaker for third-party API calls to prevent cascading failures',
      expectedImpact: 75,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignee: 'Sarah Chen',
      patternId: 'pat-003',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'rec-003',
      title: 'Automate Month-End Processing Scaling',
      description: 'Implement auto-scaling for financial systems during month-end processing periods',
      expectedImpact: 65,
      priority: 'MEDIUM',
      status: 'IMPLEMENTED',
      assignee: 'Michael Rodriguez',
      patternId: 'pat-002',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'rec-004',
      title: 'Enhanced Configuration Validation',
      description: 'Add automated validation and testing for configuration changes before deployment',
      expectedImpact: 70,
      priority: 'MEDIUM',
      status: 'VERIFIED',
      assignee: 'Emma Thompson',
      patternId: 'pat-003',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ];

  const recommendations = mockRecommendations;

  const filteredRecommendations = recommendations.filter(rec => {
    if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    return true;
  });

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'High' };
      case 'MEDIUM':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Medium' };
      case 'LOW':
        return { color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Low' };
      default:
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: priority };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: 'Not Started', icon: AlertTriangle };
      case 'IN_PROGRESS':
        return { color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'In Progress', icon: Play };
      case 'IMPLEMENTED':
        return { color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Implemented', icon: CheckCircle };
      case 'VERIFIED':
        return { color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Verified', icon: UserCheck };
      default:
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: status, icon: AlertTriangle };
    }
  };

  const handleAssign = (recommendation: Recommendation) => {
    console.log('Assign recommendation:', recommendation.id);
  };

  const handleStart = (recommendation: Recommendation) => {
    console.log('Start recommendation:', recommendation.id);
  };

  const handleComplete = (recommendation: Recommendation) => {
    console.log('Complete recommendation:', recommendation.id);
  };

  const handleVerify = (recommendation: Recommendation) => {
    console.log('Verify recommendation:', recommendation.id);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb size={20} />
            AI Recommendations
          </CardTitle>
          <Badge className="bg-slate-700 text-slate-300">
            {filteredRecommendations.length} recommendations
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32 bg-slate-900/50 border-slate-600 text-slate-300">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-slate-900/50 border-slate-600 text-slate-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-slate-700/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredRecommendations.length > 0 ? (
          <div className="space-y-4">
            {filteredRecommendations.map(recommendation => {
              const priorityConfig = getPriorityConfig(recommendation.priority);
              const statusConfig = getStatusConfig(recommendation.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={recommendation.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${priorityConfig.bgColor} text-white border-0`}>
                          {priorityConfig.label} Priority
                        </Badge>
                        <Badge className={`${statusConfig.bgColor} text-white border-0`}>
                          <StatusIcon size={12} className="mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <h3 className="text-white font-medium mb-1">{recommendation.title}</h3>
                      <p className="text-slate-300 text-sm">{recommendation.description}</p>
                    </div>

                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-green-400" />
                        <span className="text-green-400 font-medium">{recommendation.expectedImpact}%</span>
                      </div>
                      <p className="text-xs text-slate-400">Expected Impact</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400">Implementation Progress</span>
                      <span className="text-white">
                        {recommendation.status === 'VERIFIED' ? '100%' :
                         recommendation.status === 'IMPLEMENTED' ? '75%' :
                         recommendation.status === 'IN_PROGRESS' ? '50%' : '0%'}
                      </span>
                    </div>
                    <Progress
                      value={
                        recommendation.status === 'VERIFIED' ? 100 :
                        recommendation.status === 'IMPLEMENTED' ? 75 :
                        recommendation.status === 'IN_PROGRESS' ? 50 : 0
                      }
                      className="h-2"
                    />
                  </div>

                  {/* Assignee and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-300">
                        {recommendation.assignee || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {recommendation.status === 'NOT_STARTED' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssign(recommendation)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          >
                            <User size={14} className="mr-1" />
                            Assign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStart(recommendation)}
                            className="border-blue-600 text-blue-400 hover:bg-blue-900"
                          >
                            <Play size={14} className="mr-1" />
                            Start
                          </Button>
                        </>
                      )}

                      {recommendation.status === 'IN_PROGRESS' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(recommendation)}
                          className="border-green-600 text-green-400 hover:bg-green-900"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Complete
                        </Button>
                      )}

                      {recommendation.status === 'IMPLEMENTED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(recommendation)}
                          className="border-purple-600 text-purple-400 hover:bg-purple-900"
                        >
                          <UserCheck size={14} className="mr-1" />
                          Verify
                        </Button>
                      )}

                      {recommendation.status === 'VERIFIED' && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle size={12} className="mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No recommendations found</h3>
            <p className="text-slate-400">
              Try adjusting your filters or run a new pattern analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}