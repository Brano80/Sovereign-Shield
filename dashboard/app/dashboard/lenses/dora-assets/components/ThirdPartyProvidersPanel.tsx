"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Eye,
  FileText,
  Shield,
  AlertTriangle,
  Calendar,
  Users,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThirdPartyProvider {
  id: string;
  name: string;
  shortName: string;
  type: string;
  criticality: 'CRITICAL' | 'IMPORTANT' | 'STANDARD';
  services: string[];
  contractStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'TERMINATED';
  contractExpiry: string;
  lastAssessment: string;
  nextAssessment: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  concentration: number;
  dependentAssets: number;
  criticalFunctions: number;
  assessmentScore: number;
  issues?: string[];
}

interface ThirdPartyProvidersPanelProps {
  fullView?: boolean;
}

export function ThirdPartyProvidersPanel({ fullView = false }: ThirdPartyProvidersPanelProps) {
  // Mock data for demonstration
  const mockProviders: ThirdPartyProvider[] = [
    {
      id: '1',
      name: 'Amazon Web Services',
      shortName: 'AWS',
      type: 'Cloud Service Provider',
      criticality: 'CRITICAL',
      services: ['RDS', 'EC2', 'S3', 'Lambda', 'CloudFront', 'Route53', 'SQS', 'SNS'],
      contractStatus: 'ACTIVE',
      contractExpiry: 'Dec 31, 2026',
      lastAssessment: 'Oct 15, 2025',
      nextAssessment: 'Apr 15, 2026',
      riskRating: 'LOW',
      concentration: 34,
      dependentAssets: 12,
      criticalFunctions: 4,
      assessmentScore: 78
    },
    {
      id: '2',
      name: 'Microsoft Azure',
      shortName: 'Azure',
      type: 'Cloud Service Provider',
      criticality: 'CRITICAL',
      services: ['Azure AD', 'Key Vault', 'Blob Storage', 'Functions', 'App Service'],
      contractStatus: 'ACTIVE',
      contractExpiry: 'Jun 30, 2026',
      lastAssessment: 'Nov 1, 2025',
      nextAssessment: 'May 1, 2026',
      riskRating: 'LOW',
      concentration: 22,
      dependentAssets: 8,
      criticalFunctions: 2,
      assessmentScore: 82
    },
    {
      id: '3',
      name: 'Stripe',
      shortName: 'Stripe',
      type: 'Payment Processor',
      criticality: 'CRITICAL',
      services: ['Payments', 'Billing', 'Connect'],
      contractStatus: 'ACTIVE',
      contractExpiry: 'Rolling',
      lastAssessment: 'Sep 20, 2025',
      nextAssessment: 'Mar 20, 2026',
      riskRating: 'MEDIUM',
      concentration: 100,
      dependentAssets: 3,
      criticalFunctions: 1,
      assessmentScore: 65,
      issues: ['Single provider for payment processing']
    },
    {
      id: '4',
      name: 'Anthropic',
      shortName: 'Anthropic',
      type: 'AI Service Provider',
      criticality: 'IMPORTANT',
      services: ['Claude API'],
      contractStatus: 'ACTIVE',
      contractExpiry: 'Dec 31, 2025',
      lastAssessment: 'Dec 1, 2025',
      nextAssessment: 'Jun 1, 2026',
      riskRating: 'LOW',
      concentration: 5,
      dependentAssets: 2,
      criticalFunctions: 0,
      assessmentScore: 88
    },
    {
      id: '5',
      name: 'Datadog',
      shortName: 'Datadog',
      type: 'Monitoring & Observability',
      criticality: 'IMPORTANT',
      services: ['APM', 'Infrastructure Monitoring', 'Log Management'],
      contractStatus: 'ACTIVE',
      contractExpiry: 'Mar 15, 2026',
      lastAssessment: 'Nov 10, 2025',
      nextAssessment: 'May 10, 2026',
      riskRating: 'LOW',
      concentration: 8,
      dependentAssets: 15,
      criticalFunctions: 0,
      assessmentScore: 85
    }
  ];

  const displayedProviders = fullView ? mockProviders : mockProviders.slice(0, 3);

  const getProviderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'aws': return '☁️';
      case 'azure': return '☁️';
      case 'stripe': return '💳';
      case 'anthropic': return '🤖';
      case 'datadog': return '📊';
      default: return '🔗';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'IMPORTANT': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'STANDARD': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600';
      case 'EXPIRING': return 'text-yellow-600';
      case 'EXPIRED': return 'text-red-600';
      case 'TERMINATED': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              THIRD-PARTY ICT PROVIDERS
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              DORA Art.28-30 │ Risk assessment and contract management
            </p>
          </div>
          {!fullView && (
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          )}
          {fullView && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Assessment Schedule
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {displayedProviders.map((provider) => (
          <div key={provider.id} className="border rounded-lg p-4 space-y-4">
            {/* Provider Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getProviderIcon(provider.shortName)}</span>
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {provider.name}
                    <Badge
                      variant="outline"
                      className={cn("font-medium", getCriticalityColor(provider.criticality))}
                    >
                      {provider.criticality === 'CRITICAL' && '⚠️ CRITICAL'}
                      {provider.criticality === 'IMPORTANT' && '🟡 IMPORTANT'}
                      {provider.criticality === 'STANDARD' && '🟢 STANDARD'}
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">{provider.type}</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="text-sm font-medium mb-2">Services Used: {provider.services.length}</div>
              <div className="flex flex-wrap gap-1">
                {provider.services.map((service, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Contract & Assessment Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Contract Status</div>
                <div className={cn("mt-1", getContractStatusColor(provider.contractStatus))}>
                  ✅ {provider.contractStatus}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Expires: {provider.contractExpiry}
                </div>
              </div>

              <div>
                <div className="font-medium">Last Assessment</div>
                <div className="mt-1 text-muted-foreground">{provider.lastAssessment}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Next: {provider.nextAssessment}
                </div>
              </div>

              <div>
                <div className="font-medium">Risk Rating</div>
                <Badge
                  variant="outline"
                  className={cn("mt-1 font-medium", getRiskColor(provider.riskRating))}
                >
                  {provider.riskRating}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  Score: {provider.assessmentScore}/100
                </div>
              </div>

              <div>
                <div className="font-medium">Concentration</div>
                <div className="mt-1">
                  <Progress value={provider.concentration} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {provider.concentration}% of infra
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2 border-t">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{provider.dependentAssets}</div>
                  <div className="text-xs text-muted-foreground">Assets Dependent</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{provider.criticalFunctions}</div>
                  <div className="text-xs text-muted-foreground">Critical Functions</div>
                </div>
              </div>

              <div className="col-span-2">
                {provider.issues && provider.issues.length > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      {provider.issues.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Assessment
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Contract
              </Button>
              <Button size="sm" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Exit Plan
              </Button>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Summary: {mockProviders.length} providers │ {mockProviders.filter(p => p.criticality === 'CRITICAL').length} Critical │ {mockProviders.filter(p => p.criticality === 'IMPORTANT').length} Important │ {mockProviders.filter(p => p.criticality === 'STANDARD').length} Standard
            </div>
            {!fullView && (
              <Button variant="outline" size="sm">
                View All Providers →
              </Button>
            )}
          </div>

          {fullView && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Concentration Report
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Assessment Schedule
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}