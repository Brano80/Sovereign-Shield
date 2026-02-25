import React from 'react';
import { IncidentStatus } from '../types';

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

export function IncidentStatusBadge({ status, className = '' }: IncidentStatusBadgeProps) {
  const getStatusConfig = (status: IncidentStatus) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'NEW',
          color: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'INVESTIGATING':
        return {
          label: 'INVESTIGATING',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
      case 'ACTIVE':
        return {
          label: 'ACTIVE',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
      case 'REPORTING':
        return {
          label: 'REPORTING',
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        };
      case 'RESOLVED':
        return {
          label: 'RESOLVED',
          color: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'CLOSED':
        return {
          label: 'CLOSED',
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        };
      default:
        return {
          label: status,
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${config.color} ${className}`}>
      {config.label}
    </span>
  );
}