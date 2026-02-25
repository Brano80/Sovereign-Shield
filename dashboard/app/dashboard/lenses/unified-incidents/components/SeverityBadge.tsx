import React from 'react';
import { IncidentSeverity } from '../types';
import { AlertTriangle, AlertCircle, Minus, CheckCircle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const getSeverityConfig = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          label: 'CRITICAL',
          icon: AlertTriangle,
          color: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
      case 'HIGH':
        return {
          label: 'HIGH',
          icon: AlertTriangle,
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM',
          icon: AlertCircle,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
      case 'LOW':
        return {
          label: 'LOW',
          icon: Minus,
          color: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      default:
        return {
          label: severity,
          icon: CheckCircle,
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        };
    }
  };

  const config = getSeverityConfig(severity);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.color} ${className}`}>
      <IconComponent className="h-3 w-3" />
      {config.label}
    </span>
  );
}