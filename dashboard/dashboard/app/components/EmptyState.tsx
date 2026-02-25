'use client';

import React from 'react';
import {
  Globe,
  AlertTriangle,
  FileText,
  Activity,
  Eye,
  Shield,
  CheckCircle,
  Bot,
  Lock,
  Database,
  Zap,
  ExternalLink
} from 'lucide-react';

interface EmptyStateConfig {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  setupSteps: string[];
  illustration: string;
}

export interface EmptyStateProps {
  type: 'sovereign-shield' | 'unified-incidents' | 'audit-evidence' | 'risk-overview' |
        'transparency' | 'gdpr-rights' | 'gdpr-consent' | 'ai-governance' | 'dora-compliance' |
        'nis2-compliance' | 'generic';
  title?: string;  // Optional override
  description?: string;  // Optional override
  actionLabel?: string;  // Optional button text
  onAction?: () => void;  // Optional button callback
  showSetupGuide?: boolean;  // Default true
}

const emptyStateConfigs: Record<EmptyStateProps['type'], EmptyStateConfig> = {
  'sovereign-shield': {
    icon: Globe,
    title: 'No International Transfers Detected',
    description: 'Once your application starts making cross-border data transfers, they will appear here with real-time GDPR compliance status.',
    setupSteps: [
      'Configure your data transfer policies in Settings',
      'Enable Sovereign Shield monitoring',
      'Start your application - transfers will be tracked automatically'
    ],
    illustration: '🌍'
  },
  'unified-incidents': {
    icon: AlertTriangle,
    title: 'No Incidents Recorded',
    description: 'All systems operating normally. Any GDPR breaches, DORA incidents, or AI Act violations will be tracked here.',
    setupSteps: [
      'Configure incident notification rules',
      'Set up alerting channels (email, Slack)',
      'Enable real-time incident monitoring'
    ],
    illustration: '🚨'
  },
  'audit-evidence': {
    icon: FileText,
    title: 'Evidence Vault Empty',
    description: 'Your cryptographically sealed compliance evidence will be stored here. Each action generates tamper-proof audit records.',
    setupSteps: [
      'Configure eIDAS-compliant sealing',
      'Enable evidence collection for key actions',
      'Start using Veridion - evidence is collected automatically'
    ],
    illustration: '🔐'
  },
  'risk-overview': {
    icon: Activity,
    title: 'Risk Assessment Pending',
    description: 'Complete your first AI system risk assessment to see compliance scores and recommendations here.',
    setupSteps: [
      'Navigate to Risk Assessment (Art. 9)',
      'Add your AI systems to inventory',
      'Complete risk assessment questionnaire'
    ],
    illustration: '📊'
  },
  'transparency': {
    icon: Eye,
    title: 'Active Monitoring',
    description: 'Veridion Nexus is actively monitoring. No violations detected in current Tier 4 scope.',
    setupSteps: [
      'Configure transparency notification templates',
      'Enable Human Oversight module',
      'Integrate notification API'
    ],
    illustration: '👁️'
  },
  'gdpr-rights': {
    icon: Shield,
    title: 'No Data Subject Requests',
    description: 'User requests for access, erasure, or rectification will be managed here (GDPR Art. 15-22).',
    setupSteps: [
      'Configure data subject request portal',
      'Set up request routing',
      'Enable automated response workflows'
    ],
    illustration: '🛡️'
  },
  'gdpr-consent': {
    icon: CheckCircle,
    title: 'No Consent Records',
    description: 'User consent and withdrawal tracking will appear here once consent collection is active.',
    setupSteps: [
      'Configure consent categories',
      'Integrate consent management API',
      'Deploy consent collection interface'
    ],
    illustration: '✅'
  },
  'ai-governance': {
    icon: Bot,
    title: 'AI Systems Not Registered',
    description: 'Register your AI systems to enable monitoring, risk assessment, and compliance tracking.',
    setupSteps: [
      'Navigate to AI System Inventory',
      'Add AI systems and models',
      'Complete technical documentation (Annex IV)'
    ],
    illustration: '🤖'
  },
  'dora-compliance': {
    icon: Lock,
    title: 'DORA Monitoring Inactive',
    description: 'ICT third-party risk management and operational resilience tracking will appear here.',
    setupSteps: [
      'Enable DORA Lite module in Setup Wizard',
      'Configure ICT vendor registry',
      'Start incident monitoring'
    ],
    illustration: '🏦'
  },
  'nis2-compliance': {
    icon: Shield,
    title: 'NIS2 Compliance Not Configured',
    description: 'Management accountability, baseline measures, and incident reporting will be tracked here.',
    setupSteps: [
      'Complete management body identification',
      'Implement baseline cybersecurity measures',
      'Configure incident reporting workflow'
    ],
    illustration: '🔒'
  },
  'generic': {
    icon: Database,
    title: 'No Data Available',
    description: 'Data will appear here once monitoring is active.',
    setupSteps: [],
    illustration: '📦'
  }
};

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title: overrideTitle,
  description: overrideDescription,
  actionLabel,
  onAction,
  showSetupGuide = true
}) => {
  const config = emptyStateConfigs[type];
  const IconComponent = config.icon;

  const displayTitle = overrideTitle || config.title;
  const displayDescription = overrideDescription || config.description;
  const shouldShowSetupGuide = showSetupGuide && config.setupSteps.length > 0;

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="text-center max-w-2xl">
        {/* Icon with gradient background */}
        <div className="relative inline-block mb-8">
          {/* Gradient background blob */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full blur-xl scale-150" />

          {/* Icon container */}
          <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="text-6xl mb-2">{config.illustration}</div>
            <IconComponent className="w-16 h-16 text-emerald-400 mx-auto" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-white mb-4">
          {displayTitle}
        </h2>

        {/* Description */}
        <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
          {displayDescription}
        </p>

        {/* Action Button */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-emerald-500/25 mb-8"
          >
            <Zap className="w-4 h-4" />
            {actionLabel}
          </button>
        )}

        {/* Setup Guide */}
        {shouldShowSetupGuide && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Quick Setup Guide
            </h3>

            <div className="space-y-3">
              {config.setupSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 text-left">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentation Link */}
        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

// Convenience wrapper functions
export function SovereignShieldEmpty() {
  return <EmptyState type="sovereign-shield" />;
}

export function UnifiedIncidentsEmpty() {
  return <EmptyState type="unified-incidents" />;
}

export function AuditEvidenceEmpty() {
  return <EmptyState type="audit-evidence" />;
}

export function RiskOverviewEmpty() {
  return <EmptyState type="risk-overview" />;
}

export function GDPRRightsEmpty() {
  return <EmptyState type="gdpr-rights" />;
}

export function AIGovernanceEmpty() {
  return <EmptyState type="ai-governance" />;
}

export function DORAComplianceEmpty() {
  return <EmptyState type="dora-compliance" />;
}

export function NIS2ComplianceEmpty() {
  return <EmptyState type="nis2-compliance" />;
}

export default EmptyState;
