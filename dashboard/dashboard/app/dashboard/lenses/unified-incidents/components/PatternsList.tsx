"use client";

import { useState, useMemo } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  GitBranch,
  Calendar,
  Link2,
  AlertTriangle,
  Building,
  User,
  Settings,
  Eye,
  Archive,
  CheckCircle
} from 'lucide-react';
import { PatternCard } from './PatternCard';

interface Pattern {
  id: string;
  type: 'RECURRING' | 'SEASONAL' | 'CASCADE' | 'CORRELATED' | 'ESCALATING' | 'VENDOR_RELATED' | 'HUMAN_ERROR' | 'CONFIGURATION';
  title: string;
  description: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  affectedSystems: string[];
  incidentIds: string[];
}

interface PatternsListProps {
  isAnalyzing?: boolean;
}

export function PatternsList({ isAnalyzing = false }: PatternsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');

  // Mock patterns data
  const mockPatterns: Pattern[] = [
    {
      id: 'pat-001',
      type: 'RECURRING',
      title: 'Database Connection Failures',
      description: 'Recurring database connectivity issues during peak hours',
      confidence: 92,
      occurrences: 15,
      lastSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      affectedSystems: ['Database Layer', 'API Gateway'],
      incidentIds: ['INC-2025-047', 'INC-2025-042', 'INC-2025-038']
    },
    {
      id: 'pat-002',
      type: 'SEASONAL',
      title: 'End-of-Month Processing Spikes',
      description: 'Increased incident rate during month-end financial processing',
      confidence: 87,
      occurrences: 12,
      lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      affectedSystems: ['Financial Systems', 'Reporting Engine'],
      incidentIds: ['INC-2025-044', 'INC-2025-039', 'INC-2025-035']
    },
    {
      id: 'pat-003',
      type: 'HUMAN_ERROR',
      title: 'Configuration Deployment Errors',
      description: 'Manual configuration changes causing service disruptions',
      confidence: 78,
      occurrences: 8,
      lastSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      affectedSystems: ['Load Balancer', 'CDN Configuration'],
      incidentIds: ['INC-2025-046', 'INC-2025-041']
    },
    {
      id: 'pat-004',
      type: 'VENDOR_RELATED',
      title: 'Third-Party API Timeouts',
      description: 'External service provider API timeouts affecting user experience',
      confidence: 85,
      occurrences: 6,
      lastSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'RESOLVED',
      affectedSystems: ['Payment Gateway', 'User Authentication'],
      incidentIds: ['INC-2025-043', 'INC-2025-040']
    }
  ];

  const patterns = mockPatterns;

  const filteredPatterns = useMemo(() => {
    return patterns.filter(pattern => {
      // Search filter
      if (searchTerm && !pattern.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !pattern.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && pattern.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && pattern.status !== statusFilter) {
        return false;
      }

      // Confidence filter
      if (confidenceFilter !== 'all') {
        const confidence = parseInt(confidenceFilter);
        if (confidenceFilter === 'high' && pattern.confidence < 80) return false;
        if (confidenceFilter === 'medium' && (pattern.confidence < 60 || pattern.confidence >= 80)) return false;
        if (confidenceFilter === 'low' && pattern.confidence >= 60) return false;
      }

      return true;
    });
  }, [patterns, searchTerm, typeFilter, statusFilter, confidenceFilter]);

  const getPatternTypeConfig = (type: Pattern['type']) => {
    switch (type) {
      case 'RECURRING':
        return { icon: GitBranch, label: 'Recurring', color: 'text-blue-400' };
      case 'SEASONAL':
        return { icon: Calendar, label: 'Seasonal', color: 'text-green-400' };
      case 'CASCADE':
        return { icon: Link2, label: 'Cascade', color: 'text-red-400' };
      case 'CORRELATED':
        return { icon: Link2, label: 'Correlated', color: 'text-orange-400' };
      case 'ESCALATING':
        return { icon: AlertTriangle, label: 'Escalating', color: 'text-yellow-400' };
      case 'VENDOR_RELATED':
        return { icon: Building, label: 'Vendor', color: 'text-purple-400' };
      case 'HUMAN_ERROR':
        return { icon: User, label: 'Human Error', color: 'text-pink-400' };
      case 'CONFIGURATION':
        return { icon: Settings, label: 'Configuration', color: 'text-cyan-400' };
      default:
        return { icon: AlertTriangle, label: type, color: 'text-slate-400' };
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Detected Patterns</CardTitle>
          <Badge className="bg-slate-700 text-slate-300">
            {filteredPatterns.length} patterns
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 bg-slate-900/50 border-slate-600 text-slate-300">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="RECURRING">Recurring</SelectItem>
              <SelectItem value="SEASONAL">Seasonal</SelectItem>
              <SelectItem value="CASCADE">Cascade</SelectItem>
              <SelectItem value="CORRELATED">Correlated</SelectItem>
              <SelectItem value="ESCALATING">Escalating</SelectItem>
              <SelectItem value="VENDOR_RELATED">Vendor</SelectItem>
              <SelectItem value="HUMAN_ERROR">Human Error</SelectItem>
              <SelectItem value="CONFIGURATION">Configuration</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-slate-900/50 border-slate-600 text-slate-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <SelectTrigger className="w-36 bg-slate-900/50 border-slate-600 text-slate-300">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High (80%+)</SelectItem>
              <SelectItem value="medium">Medium (60-79%)</SelectItem>
              <SelectItem value="low">Low (&lt;60%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isAnalyzing ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-slate-700/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredPatterns.length > 0 ? (
          <div className="space-y-4">
            {filteredPatterns.map(pattern => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No patterns found</h3>
            <p className="text-slate-400">
              Try adjusting your filters or run a new analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}