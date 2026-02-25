"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  FileText
} from 'lucide-react';
import { RegulationBadge } from '../components/RegulationBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import type { Incident, Regulation, IncidentSeverity } from '../types';

interface NewIncidentWizardProps {
  onClose: () => void;
  onComplete: (incident: Incident) => void;
}

type WizardStep = 1 | 2 | 3 | 4;

interface WizardData {
  // Step 1: Classification
  incidentType: Regulation | '';
  detectionTimestamp: string;
  initialSeverity: IncidentSeverity | '';

  // Step 2: Details
  title: string;
  description: string;
  affectedSystems: string[];
  dataCategories: string[];
  riskLevel: 'low' | 'medium' | 'high' | '';

  // Step 3: Stakeholder Notification
  internalNotifications: string[];
  externalNotifications: string[];
  incidentManager: string;

  // Step 4: Review
  confirmations: string[];
}

const INITIAL_DATA: WizardData = {
  incidentType: '',
  detectionTimestamp: new Date().toISOString().slice(0, 16),
  initialSeverity: '',
  title: '',
  description: '',
  affectedSystems: [],
  dataCategories: [],
  riskLevel: '',
  internalNotifications: [],
  externalNotifications: [],
  incidentManager: '',
  confirmations: []
};

export function NewIncidentWizard({ onClose, onComplete }: NewIncidentWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [data, setData] = useState<WizardData>(INITIAL_DATA);

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return data.incidentType && data.initialSeverity && data.detectionTimestamp;
      case 2:
        return data.title && data.description;
      case 3:
        return data.incidentManager;
      case 4:
        return data.confirmations.length >= 2;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    // Create the incident object
    const newIncident = {
      id: `INC-${Date.now()}`,
      title: data.title,
      description: data.description,
      regulations: [data.incidentType as Regulation],
      severity: data.initialSeverity as IncidentSeverity,
      status: 'NEW',
      detectedAt: new Date(data.detectionTimestamp),
      classifiedAt: new Date(),
      resolvedAt: null,
      assignee: data.incidentManager,
      deadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
      evidenceSealLevel: 'L3',
      reportType: data.incidentType === 'GDPR' ? 'BREACH_NOTIFICATION' :
                  data.incidentType === 'DORA' ? 'MAJOR_INCIDENT' :
                  data.incidentType === 'NIS2' ? 'INCIDENT_NOTIFICATION' :
                  'SERIOUS_INCIDENT'
    };

    onComplete(newIncident as unknown as Incident);
  };

  const getStepTitle = (step: WizardStep) => {
    switch (step) {
      case 1: return 'Classification';
      case 2: return 'Details';
      case 3: return 'Stakeholder Notification';
      case 4: return 'Review & Create';
      default: return '';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Incident Classification</Label>
        <p className="text-slate-400 text-sm mt-1">
          Select the primary regulation and initial assessment
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="incident-type" className="text-white">Primary Regulation *</Label>
          <Select
            value={data.incidentType}
            onValueChange={(value) => updateData({ incidentType: value as Regulation })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select regulation" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="GDPR">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-blue-400" />
                  GDPR - General Data Protection Regulation
                </div>
              </SelectItem>
              <SelectItem value="DORA">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-400" />
                  DORA - Digital Operational Resilience Act
                </div>
              </SelectItem>
              <SelectItem value="NIS2">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-orange-400" />
                  NIS2 - Network and Information Security Directive
                </div>
              </SelectItem>
              <SelectItem value="AI_ACT">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-purple-400" />
                  AI Act - Artificial Intelligence Act
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="detection-time" className="text-white">Detection Timestamp *</Label>
          <Input
            id="detection-time"
            type="datetime-local"
            value={data.detectionTimestamp}
            onChange={(e) => updateData({ detectionTimestamp: e.target.value })}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div>
          <Label className="text-white">Initial Severity Assessment *</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as IncidentSeverity[]).map(severity => (
              <button
                key={severity}
                onClick={() => updateData({ initialSeverity: severity })}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  data.initialSeverity === severity
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={severity} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {severity === 'CRITICAL' && 'Immediate action required, severe impact'}
                  {severity === 'HIGH' && 'Urgent response needed, significant impact'}
                  {severity === 'MEDIUM' && 'Response within hours, moderate impact'}
                  {severity === 'LOW' && 'Response within days, minimal impact'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Incident Details</Label>
        <p className="text-slate-400 text-sm mt-1">
          Provide comprehensive information about the incident
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white">Incident Title *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Brief, descriptive title"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white">Description *</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Detailed description of what happened, how it was detected, and initial impact assessment"
            rows={4}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        {data.incidentType === 'GDPR' && (
          <div className="space-y-3">
            <Label className="text-white">GDPR Breach Classification</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personal-data"
                  checked={data.dataCategories.includes('personal-data')}
                  onCheckedChange={(checked) => {
                    const categories = checked
                      ? [...data.dataCategories, 'personal-data']
                      : data.dataCategories.filter(c => c !== 'personal-data');
                    updateData({ dataCategories: categories });
                  }}
                  className="border-slate-600"
                />
                <Label htmlFor="personal-data" className="text-slate-300">Personal Data Breach</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="special-categories"
                  checked={data.dataCategories.includes('special-categories')}
                  onCheckedChange={(checked) => {
                    const categories = checked
                      ? [...data.dataCategories, 'special-categories']
                      : data.dataCategories.filter(c => c !== 'special-categories');
                    updateData({ dataCategories: categories });
                  }}
                  className="border-slate-600"
                />
                <Label htmlFor="special-categories" className="text-slate-300">Special Categories Data</Label>
              </div>
            </div>
          </div>
        )}

        {data.incidentType === 'DORA' && (
          <div className="space-y-3">
            <Label className="text-white">DORA Classification Criteria</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ict-service-disruption"
                  checked={data.affectedSystems.includes('ict-service-disruption')}
                  onCheckedChange={(checked) => {
                    const systems = checked
                      ? [...data.affectedSystems, 'ict-service-disruption']
                      : data.affectedSystems.filter(s => s !== 'ict-service-disruption');
                    updateData({ affectedSystems: systems });
                  }}
                  className="border-slate-600"
                />
                <Label htmlFor="ict-service-disruption" className="text-slate-300">ICT Service Disruption</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="critical-functions"
                  checked={data.affectedSystems.includes('critical-functions')}
                  onCheckedChange={(checked) => {
                    const systems = checked
                      ? [...data.affectedSystems, 'critical-functions']
                      : data.affectedSystems.filter(s => s !== 'critical-functions');
                    updateData({ affectedSystems: systems });
                  }}
                  className="border-slate-600"
                />
                <Label htmlFor="critical-functions" className="text-slate-300">Critical Functions Impacted</Label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Stakeholder Notification</Label>
        <p className="text-slate-400 text-sm mt-1">
          Configure who needs to be notified about this incident
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white">Internal Notifications</Label>
          <div className="space-y-2 mt-2">
            {['CISO', 'CTO', 'Legal Team', 'Compliance Officer', 'Business Units'].map(role => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`internal-${role}`}
                  checked={data.internalNotifications.includes(role)}
                  onCheckedChange={(checked) => {
                    const notifications = checked
                      ? [...data.internalNotifications, role]
                      : data.internalNotifications.filter(n => n !== role);
                    updateData({ internalNotifications: notifications });
                  }}
                  className="border-slate-600"
                />
                <Label htmlFor={`internal-${role}`} className="text-slate-300">{role}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-white">External Notifications Required</Label>
          <div className="space-y-2 mt-2">
            {['Data Protection Authority', 'Customers', 'Business Partners', 'Insurance Provider'].map(entity => (
              <div key={entity} className="flex items-center space-x-2">
                <Checkbox
                  id={`external-${entity}`}
                  checked={data.externalNotifications.includes(entity)}
                  onCheckedChange={(checked) => {
                    const notifications = checked
                      ? [...data.externalNotifications, entity]
                      : data.externalNotifications.filter(n => n !== entity);
                    updateData({ externalNotifications: notifications });
                  }}
                  className="border-slate-600"
                />
                <Label htmlFor={`external-${entity}`} className="text-slate-300">{entity}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="incident-manager" className="text-white">Incident Manager *</Label>
          <Select
            value={data.incidentManager}
            onValueChange={(value) => updateData({ incidentManager: value })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select incident manager" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="Sarah Chen">Sarah Chen (CISO)</SelectItem>
              <SelectItem value="Michael Rodriguez">Michael Rodriguez (CTO)</SelectItem>
              <SelectItem value="Emma Thompson">Emma Thompson (Compliance)</SelectItem>
              <SelectItem value="David Park">David Park (Security Lead)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Review & Create Incident</Label>
        <p className="text-slate-400 text-sm mt-1">
          Please review all information and confirm to create the incident
        </p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Incident Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-400">Regulation</Label>
              <div className="mt-1">
                <RegulationBadge regulation={data.incidentType as Regulation} />
              </div>
            </div>
            <div>
              <Label className="text-slate-400">Severity</Label>
              <div className="mt-1">
                <SeverityBadge severity={data.initialSeverity as IncidentSeverity} />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-slate-400">Title</Label>
            <p className="text-white mt-1">{data.title}</p>
          </div>

          <div>
            <Label className="text-slate-400">Description</Label>
            <p className="text-slate-300 mt-1">{data.description}</p>
          </div>

          <div>
            <Label className="text-slate-400">Incident Manager</Label>
            <p className="text-white mt-1">{data.incidentManager}</p>
          </div>

          <div>
            <Label className="text-slate-400">Calculated Deadlines</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded">
                <Clock size={16} className="text-blue-400" />
                <div>
                  <p className="text-white text-sm">GDPR 72h Notification</p>
                  <p className="text-slate-400 text-xs">Due: {new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Label className="text-white">Confirmation Checkboxes</Label>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirm-accuracy"
              checked={data.confirmations.includes('accuracy')}
              onCheckedChange={(checked) => {
                const confirmations = checked
                  ? [...data.confirmations, 'accuracy']
                  : data.confirmations.filter(c => c !== 'accuracy');
                updateData({ confirmations });
              }}
              className="border-slate-600 mt-1"
            />
            <Label htmlFor="confirm-accuracy" className="text-slate-300 text-sm">
              All information provided is accurate and complete to the best of my knowledge
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirm-notifications"
              checked={data.confirmations.includes('notifications')}
              onCheckedChange={(checked) => {
                const confirmations = checked
                  ? [...data.confirmations, 'notifications']
                  : data.confirmations.filter(c => c !== 'notifications');
                updateData({ confirmations });
              }}
              className="border-slate-600 mt-1"
            />
            <Label htmlFor="confirm-notifications" className="text-slate-300 text-sm">
              Required notifications will be initiated immediately after incident creation
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              New Incident Wizard
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step < currentStep ? 'bg-green-600 text-white' :
                  step === currentStep ? 'bg-blue-600 text-white' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {step < currentStep ? <Check size={14} /> : step}
                </div>
                <span className={`ml-2 text-sm ${
                  step <= currentStep ? 'text-white' : 'text-slate-400'
                }`}>
                  {getStepTitle(step as WizardStep)}
                </span>
                {step < 4 && (
                  <div className={`w-8 h-px mx-4 ${
                    step < currentStep ? 'bg-green-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => (prev - 1) as WizardStep)}
            disabled={currentStep === 1}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>

          <div className="text-sm text-slate-400">
            Step {currentStep} of 4
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(prev => (prev + 1) as WizardStep)}
              disabled={!canProceedToNext()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
              <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceedToNext()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check size={16} className="mr-2" />
              Create Incident
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}