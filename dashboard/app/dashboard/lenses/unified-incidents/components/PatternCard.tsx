"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  CheckCircle,
  Archive,
  Calendar,
  AlertTriangle,
  GitBranch,
  Link2,
  Building,
  User,
  Settings
} from 'lucide-react';

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

interface PatternCardProps {
  pattern: Pattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const getPatternTypeConfig = (type: Pattern['type']) => {
    switch (type) {
      case 'RECURRING':
        return { icon: GitBranch, label: 'Recurring', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
      case 'SEASONAL':
        return { icon: Calendar, label: 'Seasonal', color: 'text-green-400', bgColor: 'bg-green-500/20' };
      case 'CASCADE':
        return { icon: Link2, label: 'Cascade', color: 'text-red-400', bgColor: 'bg-red-500/20' };
      case 'CORRELATED':
        return { icon: Link2, label: 'Correlated', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
      case 'ESCALATING':
        return { icon: AlertTriangle, label: 'Escalating', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
      case 'VENDOR_RELATED':
        return { icon: Building, label: 'Vendor', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
      case 'HUMAN_ERROR':
        return { icon: User, label: 'Human Error', color: 'text-pink-400', bgColor: 'bg-pink-500/20' };
      case 'CONFIGURATION':
        return { icon: Settings, label: 'Configuration', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' };
      default:
        return { icon: AlertTriangle, label: type, color: 'text-slate-400', bgColor: 'bg-slate-500/20' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
      case 'RESOLVED':
        return { color: 'text-green-400', bgColor: 'bg-green-500/20' };
      case 'ARCHIVED':
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20' };
      default:
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20' };
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const config = getPatternTypeConfig(pattern.type);
  const statusConfig = getStatusConfig(pattern.status);
  const Icon = config.icon;

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
            <Icon size={20} className={config.color} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${config.bgColor} text-white border-0`}>
                {config.label}
              </Badge>
              <Badge className={`${statusConfig.bgColor} text-white border-0`}>
                {pattern.status.toLowerCase()}
              </Badge>
            </div>
            <h3 className="text-white font-medium">{pattern.title}</h3>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-400">Confidence</span>
            <span className={`text-sm font-medium ${getConfidenceColor(pattern.confidence)}`}>
              {pattern.confidence}%
            </span>
          </div>
          <Progress value={pattern.confidence} className="w-20 h-1" />
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-3">{pattern.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-xs text-slate-400">Occurrences</p>
          <p className="text-white font-medium">{pattern.occurrences}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Last Seen</p>
          <p className="text-white font-medium">{formatLastSeen(pattern.lastSeen)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Incidents</p>
          <p className="text-white font-medium">{pattern.incidentIds.length}</p>
        </div>
      </div>

      {/* Affected Systems */}
      {pattern.affectedSystems.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-1">Affected Systems</p>
          <div className="flex flex-wrap gap-1">
            {pattern.affectedSystems.map(system => (
              <Badge key={system} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                {system}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Linked Incidents */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-1">Recent Incidents</p>
        <div className="flex flex-wrap gap-1">
          {pattern.incidentIds.slice(0, 3).map(id => (
            <Badge
              key={id}
              variant="outline"
              className="text-xs border-slate-600 text-slate-400 cursor-pointer hover:bg-slate-800"
            >
              {id}
            </Badge>
          ))}
          {pattern.incidentIds.length > 3 && (
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
              +{pattern.incidentIds.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <Eye size={14} className="mr-1" />
            Investigate
          </Button>
          {pattern.status === 'ACTIVE' && (
            <Button variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-green-900">
              <CheckCircle size={14} className="mr-1" />
              Mark Resolved
            </Button>
          )}
        </div>

        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <Archive size={14} />
        </Button>
      </div>
    </div>
  );
}