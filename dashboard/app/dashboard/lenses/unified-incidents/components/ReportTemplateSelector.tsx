"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Clock,
  Shield,
  Activity,
  Zap,
  Globe,
  Eye,
  Settings
} from 'lucide-react';
import { RegulationBadge } from './RegulationBadge';

interface Template {
  id: string;
  name: string;
  regulation: string;
  description: string;
  requiredFields: number;
  lastUpdated: Date;
  icon: React.ComponentType<any>;
  color: string;
}

const templates: Template[] = [
  {
    id: 'gdpr-breach-33',
    name: 'GDPR Breach Notification (Art. 33)',
    regulation: 'GDPR',
    description: 'Personal data breach notification to supervisory authority within 72 hours',
    requiredFields: 12,
    lastUpdated: new Date('2024-01-15'),
    icon: Shield,
    color: 'text-blue-400'
  },
  {
    id: 'gdpr-subject-34',
    name: 'GDPR Data Subject Notification (Art. 34)',
    regulation: 'GDPR',
    description: 'Communication to individuals affected by personal data breach',
    requiredFields: 8,
    lastUpdated: new Date('2024-01-15'),
    icon: Shield,
    color: 'text-blue-400'
  },
  {
    id: 'dora-major-19',
    name: 'DORA Major Incident Report (Art. 19)',
    regulation: 'DORA',
    description: 'Major ICT incident notification with detailed technical analysis',
    requiredFields: 15,
    lastUpdated: new Date('2024-01-10'),
    icon: Activity,
    color: 'text-green-400'
  },
  {
    id: 'nis2-incident-23',
    name: 'NIS2 Incident Notification (Art. 23)',
    regulation: 'NIS2',
    description: 'Significant incident reporting for critical infrastructure operators',
    requiredFields: 14,
    lastUpdated: new Date('2024-01-12'),
    icon: Globe,
    color: 'text-orange-400'
  },
  {
    id: 'nis2-early-warning',
    name: 'NIS2 Early Warning (Art. 23)',
    regulation: 'NIS2',
    description: 'Early warning notification for potential significant incidents',
    requiredFields: 9,
    lastUpdated: new Date('2024-01-12'),
    icon: Globe,
    color: 'text-orange-400'
  },
  {
    id: 'ai-act-serious-62',
    name: 'AI Act Serious Incident Report (Art. 62)',
    regulation: 'AI_ACT',
    description: 'Serious incident reporting for high-risk AI systems',
    requiredFields: 11,
    lastUpdated: new Date('2024-01-08'),
    icon: Zap,
    color: 'text-purple-400'
  }
];

export function ReportTemplateSelector() {
  const handlePreview = (template: Template) => {
    console.log('Preview template:', template.id);
  };

  const handleCustomize = (template: Template) => {
    console.log('Customize template:', template.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Regulatory Report Templates</h3>
          <p className="text-slate-400 text-sm mt-1">
            Pre-configured templates for regulatory reporting requirements
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
          <Settings size={14} className="mr-2" />
          Manage Templates
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => {
          const Icon = template.icon;

          return (
            <Card key={template.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                      <Icon size={20} className={template.color} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base">{template.name}</CardTitle>
                      <RegulationBadge regulation={template.regulation as any} size="sm" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm">{template.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FileText size={14} className="text-slate-500" />
                      <span className="text-slate-400">{template.requiredFields} fields</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-slate-400">
                        {template.lastUpdated.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Eye size={14} className="mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomize(template)}
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Settings size={14} className="mr-1" />
                    Customize
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Usage Statistics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Template Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">24</p>
              <p className="text-sm text-slate-400">Reports Generated</p>
              <p className="text-xs text-emerald-400">+12% this month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-sm text-slate-400">Compliance Rate</p>
              <p className="text-xs text-emerald-400">On-time submissions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">4.2h</p>
              <p className="text-sm text-slate-400">Avg. Generation Time</p>
              <p className="text-xs text-blue-400">-0.8h improvement</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">6</p>
              <p className="text-sm text-slate-400">Active Templates</p>
              <p className="text-xs text-slate-400">All regulations covered</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}