"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  Download,
  Send,
  Check,
  AlertTriangle,
  Clock,
  Shield,
  Link
} from 'lucide-react';
import { RegulationBadge } from './RegulationBadge';
import type { Incident, PendingReport } from '../types';

interface ReportGeneratorProps {
  onClose: () => void;
  selectedReport?: PendingReport | null;
}

type GeneratorStep = 1 | 2 | 3 | 4 | 5 | 6;

interface ReportData {
  incidentId: string;
  reportType: string;
  regulation: string;
  title: string;
  description: string;
  incidentDate: string;
  detectionDate: string;
  notificationDate: string;
  affectedDataCategories: string[];
  affectedIndividuals: number;
  riskAssessment: string;
  measuresTaken: string;
  contactDetails: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  additionalInfo: string;
}

const INITIAL_REPORT_DATA: ReportData = {
  incidentId: '',
  reportType: '',
  regulation: '',
  title: '',
  description: '',
  incidentDate: '',
  detectionDate: '',
  notificationDate: '',
  affectedDataCategories: [],
  affectedIndividuals: 0,
  riskAssessment: '',
  measuresTaken: '',
  contactDetails: {
    name: '',
    position: '',
    email: '',
    phone: ''
  },
  additionalInfo: ''
};

export function ReportGenerator({ onClose, selectedReport }: ReportGeneratorProps) {
  const [currentStep, setCurrentStep] = useState<GeneratorStep>(1);
  const [data, setData] = useState<ReportData>(INITIAL_REPORT_DATA);
  const [isPreview, setIsPreview] = useState(false);

  const updateData = (updates: Partial<ReportData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const getRequiredFieldsForStep = (step: GeneratorStep) => {
    switch (step) {
      case 1: return ['incidentId', 'reportType', 'regulation'];
      case 2: return ['title', 'description', 'incidentDate', 'detectionDate'];
      case 3: return ['affectedDataCategories', 'affectedIndividuals', 'riskAssessment'];
      case 4: return ['measuresTaken'];
      case 5: return ['contactDetails.name', 'contactDetails.email'];
      case 6: return []; // Review step
      default: return [];
    }
  };

  const calculateCompleteness = () => {
    const allFields = [
      'incidentId', 'reportType', 'regulation', 'title', 'description',
      'incidentDate', 'detectionDate', 'notificationDate',
      'affectedDataCategories', 'affectedIndividuals', 'riskAssessment',
      'measuresTaken', 'contactDetails.name', 'contactDetails.email'
    ];

    let completed = 0;
    allFields.forEach(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if ((data as any)[parent]?.[child]) completed++;
      } else if ((data as any)[field]) completed++;
    });

    return Math.round((completed / allFields.length) * 100);
  };

  const canProceedToNext = () => {
    const requiredFields = getRequiredFieldsForStep(currentStep);
    return requiredFields.every(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return (data as any)[parent]?.[child];
      }
      return (data as any)[field];
    });
  };

  const handleSubmit = () => {
    console.log('Submitting report:', data);
    // Here you would call the API to submit the report
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {[
        { step: 1, title: 'Select Incident', icon: FileText },
        { step: 2, title: 'Report Details', icon: FileText },
        { step: 3, title: 'Impact Assessment', icon: AlertTriangle },
        { step: 4, 'Measures & Actions': Clock },
        { step: 5, title: 'Contact & Review', icon: Shield },
        { step: 6, title: 'Preview & Submit', icon: Send }
      ].map(({ step, title, icon: Icon }, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
            step < currentStep ? 'bg-green-600 text-white' :
            step === currentStep ? 'bg-blue-600 text-white' :
            'bg-slate-700 text-slate-400'
          }`}>
            {step < currentStep ? <Check size={14} /> : step}
          </div>
          <span className={`ml-2 text-sm hidden md:block ${
            step <= currentStep ? 'text-white' : 'text-slate-400'
          }`}>
            {title}
          </span>
          {index < 5 && (
            <div className={`w-8 h-px mx-4 ${
              step < currentStep ? 'bg-green-600' : 'bg-slate-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Select Incident & Report Type</Label>
        <p className="text-slate-400 text-sm mt-1">
          Choose the incident and type of report to generate
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white">Incident *</Label>
          <Select
            value={data.incidentId}
            onValueChange={(value) => updateData({ incidentId: value })}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select incident" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="INC-2025-047">INC-2025-047 - Data Breach - Customer Database</SelectItem>
              <SelectItem value="INC-2025-046">INC-2025-046 - Major ICT Disruption - Payment System</SelectItem>
              <SelectItem value="INC-2025-045">INC-2025-045 - Significant Incident - Email Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white">Report Type *</Label>
          <Select
            value={data.reportType}
            onValueChange={(value) => {
              updateData({ reportType: value });
              // Auto-set regulation based on report type
              if (value.includes('GDPR')) updateData({ regulation: 'GDPR' });
              else if (value.includes('DORA')) updateData({ regulation: 'DORA' });
              else if (value.includes('NIS2')) updateData({ regulation: 'NIS2' });
              else if (value.includes('AI')) updateData({ regulation: 'AI_ACT' });
            }}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="BREACH_NOTIFICATION">GDPR Breach Notification (Art. 33)</SelectItem>
              <SelectItem value="SUBJECT_NOTIFICATION">GDPR Data Subject Notification (Art. 34)</SelectItem>
              <SelectItem value="MAJOR_INCIDENT">DORA Major Incident Report (Art. 19)</SelectItem>
              <SelectItem value="INCIDENT_NOTIFICATION">NIS2 Incident Notification (Art. 23)</SelectItem>
              <SelectItem value="EARLY_WARNING">NIS2 Early Warning (Art. 23)</SelectItem>
              <SelectItem value="SERIOUS_INCIDENT">AI Act Serious Incident Report (Art. 62)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white">Regulation *</Label>
          <div className="mt-2">
            <RegulationBadge regulation={data.regulation as any} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Report Details</Label>
        <p className="text-slate-400 text-sm mt-1">
          Basic information about the incident and notification
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white">Report Title *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Brief title for the report"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white">Incident Description *</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Detailed description of the incident"
            rows={4}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="incident-date" className="text-white">Incident Date *</Label>
            <Input
              id="incident-date"
              type="datetime-local"
              value={data.incidentDate}
              onChange={(e) => updateData({ incidentDate: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="detection-date" className="text-white">Detection Date *</Label>
            <Input
              id="detection-date"
              type="datetime-local"
              value={data.detectionDate}
              onChange={(e) => updateData({ detectionDate: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notification-date" className="text-white">Notification Date</Label>
          <Input
            id="notification-date"
            type="datetime-local"
            value={data.notificationDate}
            onChange={(e) => updateData({ notificationDate: e.target.value })}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Impact Assessment</Label>
        <p className="text-slate-400 text-sm mt-1">
          Assess the impact and risks of the incident
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white">Affected Data Categories</Label>
          <div className="space-y-2 mt-2">
            {['Personal Data', 'Special Categories', 'Financial Data', 'Health Data', 'Contact Information'].map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={data.affectedDataCategories.includes(category)}
                  onCheckedChange={(checked) => {
                    const categories = checked
                      ? [...data.affectedDataCategories, category]
                      : data.affectedDataCategories.filter(c => c !== category);
                    updateData({ affectedDataCategories: categories });
                  }}
                  className="border-slate-600"
                />
                <Label htmlFor={`category-${category}`} className="text-slate-300">{category}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="affected-individuals" className="text-white">Estimated Affected Individuals *</Label>
          <Input
            id="affected-individuals"
            type="number"
            value={data.affectedIndividuals || ''}
            onChange={(e) => updateData({ affectedIndividuals: parseInt(e.target.value) || 0 })}
            placeholder="Number of individuals affected"
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="risk-assessment" className="text-white">Risk Assessment *</Label>
          <Textarea
            id="risk-assessment"
            value={data.riskAssessment}
            onChange={(e) => updateData({ riskAssessment: e.target.value })}
            placeholder="Assess the risks and potential consequences"
            rows={3}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Measures & Actions Taken</Label>
        <p className="text-slate-400 text-sm mt-1">
          Describe the measures taken to contain and mitigate the incident
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="measures-taken" className="text-white">Measures Taken *</Label>
          <Textarea
            id="measures-taken"
            value={data.measuresTaken}
            onChange={(e) => updateData({ measuresTaken: e.target.value })}
            placeholder="Describe containment measures, recovery actions, and preventive measures"
            rows={6}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Contact Information & Final Review</Label>
        <p className="text-slate-400 text-sm mt-1">
          Provide contact details and review the report
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-name" className="text-white">Contact Name *</Label>
            <Input
              id="contact-name"
              value={data.contactDetails.name}
              onChange={(e) => updateData({
                contactDetails: { ...data.contactDetails, name: e.target.value }
              })}
              placeholder="Full name"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="contact-position" className="text-white">Position</Label>
            <Input
              id="contact-position"
              value={data.contactDetails.position}
              onChange={(e) => updateData({
                contactDetails: { ...data.contactDetails, position: e.target.value }
              })}
              placeholder="Job title"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-email" className="text-white">Email *</Label>
            <Input
              id="contact-email"
              type="email"
              value={data.contactDetails.email}
              onChange={(e) => updateData({
                contactDetails: { ...data.contactDetails, email: e.target.value }
              })}
              placeholder="contact@company.com"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="contact-phone" className="text-white">Phone</Label>
            <Input
              id="contact-phone"
              value={data.contactDetails.phone}
              onChange={(e) => updateData({
                contactDetails: { ...data.contactDetails, phone: e.target.value }
              })}
              placeholder="+1 (555) 123-4567"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="additional-info" className="text-white">Additional Information</Label>
          <Textarea
            id="additional-info"
            value={data.additionalInfo}
            onChange={(e) => updateData({ additionalInfo: e.target.value })}
            placeholder="Any additional information or context"
            rows={3}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-white text-base font-medium">Preview & Submit Report</Label>
        <p className="text-slate-400 text-sm mt-1">
          Review the completed report before submission
        </p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">{data.title}</CardTitle>
          <div className="flex items-center gap-2">
            <RegulationBadge regulation={data.regulation as any} />
            <Badge className="bg-blue-500/20 text-blue-400">{data.reportType}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-400 text-sm">Description</Label>
            <p className="text-white mt-1">{data.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-slate-400">Incident Date</Label>
              <p className="text-white">{new Date(data.incidentDate).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-slate-400">Detection Date</Label>
              <p className="text-white">{new Date(data.detectionDate).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <Label className="text-slate-400 text-sm">Affected Categories</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.affectedDataCategories.map(category => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-slate-400 text-sm">Risk Assessment</Label>
            <p className="text-white mt-1">{data.riskAssessment}</p>
          </div>

          <div>
            <Label className="text-slate-400 text-sm">Contact</Label>
            <p className="text-white mt-1">
              {data.contactDetails.name} ({data.contactDetails.email})
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setIsPreview(true)}
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <Eye size={14} className="mr-2" />
          Full Preview
        </Button>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
          <Download size={14} className="mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-xl">
                Report Generator
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

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Completeness</span>
                <span className="text-white">{calculateCompleteness()}%</span>
              </div>
              <Progress value={calculateCompleteness()} className="h-2" />
            </div>

            {renderStepIndicator()}
          </DialogHeader>

          <div className="py-6">
            {renderCurrentStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => (prev - 1) as GeneratorStep)}
              disabled={currentStep === 1}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <ChevronLeft size={16} className="mr-2" />
              Previous
            </Button>

            <div className="text-sm text-slate-400">
              Step {currentStep} of 6
            </div>

            {currentStep < 6 ? (
              <Button
                onClick={() => setCurrentStep(prev => (prev + 1) as GeneratorStep)}
                disabled={!canProceedToNext()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send size={16} className="mr-2" />
                Submit Report
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Preview Modal */}
      {isPreview && (
        <Dialog open={isPreview} onOpenChange={() => setIsPreview(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Report Preview</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <div className="text-gray-900 space-y-4">
                <h1 className="text-2xl font-bold">{data.title}</h1>
                <div className="border-b pb-4">
                  <p className="text-gray-600">{data.description}</p>
                </div>
                {/* Add more preview content here */}
                <p className="text-center text-gray-500">Full report preview would be displayed here...</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}