import React from 'react';
import { Regulation } from '../types';
import { Shield, Activity, Zap, Globe } from 'lucide-react';

interface RegulationBadgeProps {
  regulation: Regulation;
  className?: string;
  size?: string;
}

export function RegulationBadge({ regulation, className = '' }: RegulationBadgeProps) {
  const getRegulationConfig = (regulation: Regulation) => {
    switch (regulation) {
      case 'GDPR':
        return {
          label: 'GDPR',
          icon: Shield,
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
      case 'DORA':
        return {
          label: 'DORA',
          icon: Activity,
          color: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'AI_ACT':
        return {
          label: 'AI Act',
          icon: Zap,
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        };
      case 'NIS2':
        return {
          label: 'NIS2',
          icon: Globe,
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        };
      default:
        return {
          label: regulation,
          icon: Shield,
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        };
    }
  };

  const config = getRegulationConfig(regulation);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.color} ${className}`}>
      <IconComponent className="h-3 w-3" />
      {config.label}
    </span>
  );
}