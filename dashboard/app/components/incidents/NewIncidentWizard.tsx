"use client";

import { useState, useEffect } from "react";
import { X, Shield, Building2, Bot, Settings, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "@/lib/utils";

type IncidentType = {
  id: 'gdpr-breach' | 'dora-incident' | 'ai-incident' | 'other';
  title: string;
  description: string;
  icon: React.ReactNode;
  regulation: string;
  deadline: string;
  deadlineHours: number;
  color: string;
};

const incidentTypes: IncidentType[] = [
  {
    id: 'gdpr-breach',
    title: 'GDPR Data Breach',
    description: 'Personal data breach requiring notification under Article 33',
    icon: <Shield className="h-8 w-8" />,
    regulation: 'GDPR Article 33',
    deadline: '72 hours',
    deadlineHours: 72,
    color: 'blue'
  },
  {
    id: 'dora-incident',
    title: 'DORA Major ICT Incident',
    description: 'Major incident affecting ICT systems under DORA regulation',
    icon: <Building2 className="h-8 w-8" />,
    regulation: 'DORA Article 19',
    deadline: '24 hours',
    deadlineHours: 24,
    color: 'green'
  },
  {
    id: 'ai-incident',
    title: 'AI Act Serious Incident',
    description: 'Serious incident with AI systems requiring reporting',
    icon: <Bot className="h-8 w-8" />,
    regulation: 'AI Act Article 62',
    deadline: '15 days',
    deadlineHours: 360,
    color: 'purple'
  },
  {
    id: 'other',
    title: 'Other Compliance Incident',
    description: 'Custom compliance incident with configurable deadline',
    icon: <Settings className="h-8 w-8" />,
    regulation: 'Custom',
    deadline: 'Custom deadline',
    deadlineHours: 0,
    color: 'slate'
  }
];

type WizardStep = 'type' | 'discovery' | 'impact' | 'response' | 'review';

type WizardData = {
  incidentType?: IncidentType;
  discoveryTime?: Date;
  // Impact Assessment fields
  affectedDataCategories?: string[];
  affectedIndividualsCount?: number;
  affectedIndividualsCategories?: string[];
  geographicScope?: 'EU' | 'NON_EU' | 'BOTH';
  // Response Actions fields
  containmentMeasures?: string[];
  containmentDetails?: string;
  notifySupervisoryAuthority?: boolean;
  notifyDataSubjects?: boolean;
  incidentOwner?: string;
  confirmedSeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  // Review confirmation fields
  confirmDataAccuracy?: boolean;
  confirmResponsibility?: boolean;
  // Additional fields will be added for other steps
};

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete?: (data: WizardData) => void;
};

export function NewIncidentWizard({ open, onClose, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [wizardData, setWizardData] = useState<WizardData>({});

  if (!open) return null;

  const steps: { id: WizardStep; title: string; description: string }[] = [
    { id: 'type', title: 'Select Type', description: 'Choose incident category' },
    { id: 'discovery', title: 'Discovery', description: 'How was it discovered' },
    { id: 'impact', title: 'Impact', description: 'Assess the impact' },
    { id: 'response', title: 'Response Actions', description: 'Plan containment and notifications' },
    { id: 'review', title: 'Review', description: 'Confirm and submit' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSelectType = (incidentType: IncidentType) => {
    setWizardData({ ...wizardData, incidentType });
  };

  const handleDiscoveryTimeChange = (discoveryTime: Date) => {
    setWizardData({ ...wizardData, discoveryTime });
  };

  const handleImpactAssessmentChange = (field: keyof WizardData, value: any) => {
    setWizardData({ ...wizardData, [field]: value });
  };

  const handleResponseActionsChange = (field: keyof WizardData, value: any) => {
    setWizardData({ ...wizardData, [field]: value });
  };

  const handleReviewConfirmationChange = (field: keyof WizardData, value: any) => {
    setWizardData({ ...wizardData, [field]: value });
  };

  const handleComplete = () => {
    onComplete?.(wizardData);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <StepTypeSelection
            selectedType={wizardData.incidentType}
            onSelectType={handleSelectType}
          />
        );
      case 'discovery':
        return (
          <StepDiscovery
            incidentType={wizardData.incidentType}
            discoveryTime={wizardData.discoveryTime}
            onDiscoveryTimeChange={handleDiscoveryTimeChange}
          />
        );
      case 'impact':
        return (
          <StepImpactAssessment
            wizardData={wizardData}
            onImpactChange={handleImpactAssessmentChange}
          />
        );
      case 'response':
        return (
          <StepResponseActions
            wizardData={wizardData}
            onResponseChange={handleResponseActionsChange}
          />
        );
      case 'review':
        return (
          <StepReview
            wizardData={wizardData}
            onReviewChange={handleReviewConfirmationChange}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">New Incident Report</h2>
            <p className="text-sm text-slate-400 mt-1">Create and classify a new compliance incident</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${currentStepIndex >= index
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                  }
                `}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    currentStepIndex >= index ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    mx-4 h-px w-12
                    ${currentStepIndex > index ? 'bg-blue-600' : 'bg-slate-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="text-sm text-slate-400">
            Step {currentStepIndex + 1} of {steps.length}
          </div>

          {currentStepIndex === steps.length - 1 ? null : (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 'type' && !wizardData.incidentType) ||
                (currentStep === 'discovery' && !wizardData.discoveryTime) ||
                (currentStep === 'impact' && (
                  !wizardData.affectedIndividualsCount ||
                  !(wizardData.affectedDataCategories && wizardData.affectedDataCategories.length > 0) ||
                  !wizardData.geographicScope
                )) ||
                (currentStep === 'response' && (
                  !wizardData.containmentMeasures ||
                  wizardData.containmentMeasures.length === 0 ||
                  !wizardData.incidentOwner ||
                  !wizardData.confirmedSeverity
                ))
              }
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type StepTypeSelectionProps = {
  selectedType?: IncidentType;
  onSelectType: (type: IncidentType) => void;
};

function StepTypeSelection({ selectedType, onSelectType }: StepTypeSelectionProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Select Incident Type</h3>
        <p className="text-slate-400">
          Choose the type of incident you're reporting. Each type has specific regulatory requirements and deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidentTypes.map((incidentType) => (
          <div
            key={incidentType.id}
            onClick={() => onSelectType(incidentType)}
            className={`
              relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
              ${selectedType?.id === incidentType.id
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }
            `}
          >
            {/* Selection indicator */}
            {selectedType?.id === incidentType.id && (
              <div className="absolute top-3 right-3 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}

            {/* Icon */}
            <div className={`
              mb-4 p-3 rounded-lg w-fit
              ${incidentType.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                incidentType.color === 'green' ? 'bg-green-500/20 text-green-400' :
                incidentType.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                'bg-slate-500/20 text-slate-400'}
            `}>
              {incidentType.icon}
            </div>

            {/* Title */}
            <h4 className="text-lg font-semibold text-white mb-2">
              {incidentType.title}
            </h4>

            {/* Description */}
            <p className="text-slate-400 text-sm mb-4">
              {incidentType.description}
            </p>

            {/* Regulation and deadline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Regulation</span>
                <span className="text-xs text-slate-300 font-medium">{incidentType.regulation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Deadline</span>
                <span className="text-xs text-amber-400 font-medium">{incidentType.deadline}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type StepDiscoveryProps = {
  incidentType?: IncidentType;
  discoveryTime?: Date;
  onDiscoveryTimeChange: (time: Date) => void;
};

function StepDiscovery({ incidentType, discoveryTime, onDiscoveryTimeChange }: StepDiscoveryProps) {
  const calculateDeadline = (discovery: Date, deadlineHours: number): Date => {
    const deadline = new Date(discovery);
    deadline.setHours(deadline.getHours() + deadlineHours);
    return deadline;
  };

  const formatDeadline = (deadline: Date): string => {
    return deadline.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = new Date(event.target.value);
    if (!isNaN(selectedTime.getTime())) {
      onDiscoveryTimeChange(selectedTime);
    }
  };

  const deadline = incidentType && discoveryTime && incidentType.deadlineHours > 0
    ? calculateDeadline(discoveryTime, incidentType.deadlineHours)
    : null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Discovery Information</h3>
        <p className="text-slate-400">
          When and how was this incident discovered? This information is critical for regulatory compliance timing.
        </p>
      </div>

      <div className="space-y-6">
        {/* Discovery Time Input */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300 font-semibold">
            Discovery Date & Time *
          </label>
          <input
            type="datetime-local"
            value={discoveryTime ? discoveryTime.toISOString().slice(0, 16) : ''}
            onChange={handleTimeChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            required
          />
          <p className="text-xs text-slate-500">
            Enter the exact date and time when the incident was first discovered or reported.
          </p>
        </div>

        {/* Regulatory Deadline Display */}
        {deadline && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-amber-400 font-semibold mb-1">Regulatory Deadline</h4>
                <p className="text-amber-300 text-sm mb-2">
                  Based on {incidentType?.regulation} requirements ({incidentType?.deadlineHours} hours from discovery)
                </p>
                <div className="text-white font-mono text-lg">
                  {formatDeadline(deadline)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning Text */}
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-400 font-semibold mb-2">Important Notice</h4>
              <p className="text-red-300 text-sm">
                The {incidentType?.deadlineHours || "regulatory"}-hour notification clock will start when you confirm this discovery time.
                This timestamp cannot be changed once the incident is created and will be used for all regulatory compliance calculations.
              </p>
            </div>
          </div>
        </div>

        {/* How was it discovered */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300 font-semibold">
            How was the incident discovered? (Optional)
          </label>
          <textarea
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
            rows={3}
            placeholder="e.g., Security monitoring alert, User report, Automated scan, etc."
          />
          <p className="text-xs text-slate-500">
            Provide details about how the incident was initially detected or reported.
          </p>
        </div>
      </div>
    </div>
  );
}

type StepImpactAssessmentProps = {
  wizardData: WizardData;
  onImpactChange: (field: keyof WizardData, value: any) => void;
};

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface RiskFactor {
  text: string;
  type: 'warning' | 'success' | 'danger';
  icon: string;
}

function calculateRiskLevel(wizardData: WizardData): { level: RiskLevel; percentage: number; factors: RiskFactor[] } {
  let riskScore = 0;
  const factors: RiskFactor[] = [];

  const affectedData = wizardData.affectedDataCategories || [];
  const affectedIndividuals = wizardData.affectedIndividualsCategories || [];
  const individualCount = wizardData.affectedIndividualsCount || 0;

  // Check for sensitive data categories (HIGH risk)
  const sensitiveData = ['Health data', 'Biometric data'];
  const hasSensitiveData = affectedData.some(cat => sensitiveData.includes(cat));
  if (hasSensitiveData) {
    riskScore += 50;
    factors.push({ text: 'Sensitive data categories exposed (Health/Biometric)', type: 'danger', icon: '🚨' });
  }

  // Check for minors (HIGH risk)
  const hasMinors = affectedIndividuals.includes('Minors (under 18 years)');
  if (hasMinors) {
    riskScore += 50;
    factors.push({ text: 'Minors under 18 years affected', type: 'danger', icon: '👶' });
  }

  // Check for passwords (MEDIUM risk)
  const hasPasswords = affectedData.includes('Encrypted passwords');
  if (hasPasswords) {
    riskScore += 25;
    factors.push({ text: 'Passwords were encrypted', type: 'success', icon: '✅' });
  } else if (affectedData.includes('Phone numbers') || affectedData.includes('Email addresses')) {
    riskScore += 20;
    factors.push({ text: 'Contact information exposed', type: 'warning', icon: '⚠️' });
  }

  // Check for financial data (MEDIUM risk)
  const hasFinancial = affectedData.includes('Financial data');
  if (hasFinancial) {
    riskScore += 25;
    factors.push({ text: 'Financial data compromised', type: 'warning', icon: '💰' });
  }

  // Check for government IDs (MEDIUM risk)
  const hasGovIds = affectedData.includes('Government IDs');
  if (hasGovIds) {
    riskScore += 25;
    factors.push({ text: 'Government identification data exposed', type: 'warning', icon: '🆔' });
  }

  // Large number of individuals increases risk
  if (individualCount > 1000) {
    riskScore += 15;
    factors.push({ text: `Large scale incident (${individualCount.toLocaleString()} individuals)`, type: 'warning', icon: '👥' });
  } else if (individualCount > 100) {
    riskScore += 10;
    factors.push({ text: `Medium scale incident (${individualCount.toLocaleString()} individuals)`, type: 'warning', icon: '👤' });
  }

  // Geographic scope consideration
  const scope = wizardData.geographicScope;
  if (scope === 'EU' || scope === 'BOTH') {
    factors.push({ text: 'EU residents affected - GDPR compliance required', type: 'warning', icon: '🇪🇺' });
  }

  // Determine risk level
  let level: RiskLevel;
  if (riskScore >= 50) {
    level = 'HIGH';
  } else if (riskScore >= 20) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  // Add positive factors for low risk
  if (level === 'LOW' && factors.length === 0) {
    factors.push({ text: 'No sensitive data categories identified', type: 'success', icon: '✅' });
  }

  return { level, percentage: Math.min(riskScore, 100), factors };
}

type RiskAssessmentSectionProps = {
  wizardData: WizardData;
};

function RiskAssessmentSection({ wizardData }: RiskAssessmentSectionProps) {
  const riskAssessment = calculateRiskLevel(wizardData);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'LOW': return 'green';
      case 'MEDIUM': return 'yellow';
      case 'HIGH': return 'red';
      default: return 'gray';
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'LOW': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'HIGH': return '🔴';
      default: return '⚪';
    }
  };

  const getFactorIcon = (type: RiskFactor['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Level Gauge */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-2">Risk Assessment</h4>
          <p className="text-slate-400 text-sm">
            Automatic evaluation based on affected data categories, individuals, and geographic scope.
          </p>
        </div>

        {/* Visual Gauge */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Risk Level</span>
            <span className={`text-lg font-bold flex items-center gap-2 ${
              riskAssessment.level === 'LOW' ? 'text-green-400' :
              riskAssessment.level === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {getRiskIcon(riskAssessment.level)} {riskAssessment.level} RISK
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                riskAssessment.level === 'LOW' ? 'bg-green-500' :
                riskAssessment.level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${riskAssessment.percentage}%` }}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-xs text-slate-500">
            <span>LOW</span>
            <span>MEDIUM</span>
            <span>HIGH</span>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
        <h4 className="text-white font-semibold mb-4">Risk Factors</h4>

        {riskAssessment.factors.length === 0 ? (
          <p className="text-slate-400 text-sm">No risk factors identified</p>
        ) : (
          <div className="space-y-3">
            {riskAssessment.factors.map((factor, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-lg">{factor.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm ${getFactorIcon(factor.type)}`}>
                    {factor.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendation */}
      {(riskAssessment.level === 'MEDIUM' || riskAssessment.level === 'HIGH') && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-blue-400 font-semibold mb-2">Recommendation</h4>
              <p className="text-blue-300 text-sm mb-3">
                <strong>Notification to data subjects: RECOMMENDED</strong>
              </p>
              <p className="text-blue-300 text-sm">
                Based on the risk assessment, this incident may require notifying affected individuals
                about the data breach. This is particularly important for incidents involving sensitive
                personal data or a significant number of individuals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Low Risk Notice */}
      {riskAssessment.level === 'LOW' && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-lg bg-green-500/20">
              <span className="text-green-400 text-sm">✅</span>
            </div>
            <p className="text-green-300 text-sm">
              <strong>Low Risk Incident:</strong> Notification to data subjects may not be required,
              but internal documentation and regulatory compliance should still be maintained.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StepImpactAssessment({ wizardData, onImpactChange }: StepImpactAssessmentProps) {
  const dataCategories = [
    'Names',
    'Email addresses',
    'Phone numbers',
    'Encrypted passwords',
    'Financial data',
    'Health data',
    'Biometric data',
    'Government IDs'
  ];

  const individualCategories = [
    'Customers',
    'Employees',
    'Business contacts',
    'Minors (under 18 years)'
  ];

  const handleDataCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = wizardData.affectedDataCategories || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    onImpactChange('affectedDataCategories', newCategories);
  };

  const handleIndividualCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = wizardData.affectedIndividualsCategories || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    onImpactChange('affectedIndividualsCategories', newCategories);
  };

  const handleGeographicScopeChange = (scope: 'EU' | 'NON_EU' | 'BOTH') => {
    onImpactChange('geographicScope', scope);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Impact Assessment</h3>
        <p className="text-slate-400">
          Assess the scope and impact of the incident. This information will determine regulatory reporting requirements.
        </p>
      </div>

      <div className="space-y-8">
        {/* Affected Data Categories */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Affected Data Categories</h4>
            <p className="text-slate-400 text-sm mb-4">
              Select all categories of personal data that may have been compromised.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataCategories.map((category) => (
              <label key={category} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={(wizardData.affectedDataCategories || []).includes(category)}
                  onChange={(e) => handleDataCategoryChange(category, e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-slate-300 text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Affected Individuals */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Affected Individuals</h4>
            <p className="text-slate-400 text-sm mb-4">
              Estimate the number of individuals affected and select relevant categories.
            </p>
          </div>

          {/* Number of affected individuals */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-semibold">
              Estimated number of affected individuals *
            </label>
            <input
              type="number"
              min="0"
              value={wizardData.affectedIndividualsCount || ''}
              onChange={(e) => onImpactChange('affectedIndividualsCount', parseInt(e.target.value) || 0)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              placeholder="Enter estimated number"
              required
            />
            <p className="text-xs text-slate-500">
              Provide your best estimate. This will be updated as more information becomes available.
            </p>
          </div>

          {/* Individual categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {individualCategories.map((category) => (
              <label key={category} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={(wizardData.affectedIndividualsCategories || []).includes(category)}
                  onChange={(e) => handleIndividualCategoryChange(category, e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-slate-300 text-sm">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Geographic Scope */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Geographic Scope</h4>
            <p className="text-slate-400 text-sm mb-4">
              Select the geographic scope of affected individuals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center space-x-3 p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer flex-1">
              <input
                type="radio"
                name="geographicScope"
                value="EU"
                checked={wizardData.geographicScope === 'EU'}
                onChange={() => handleGeographicScopeChange('EU')}
                className="text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span className="text-slate-300 font-medium">EU residents only</span>
                <p className="text-xs text-slate-500">Individuals located in EU member states</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer flex-1">
              <input
                type="radio"
                name="geographicScope"
                value="NON_EU"
                checked={wizardData.geographicScope === 'NON_EU'}
                onChange={() => handleGeographicScopeChange('NON_EU')}
                className="text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span className="text-slate-300 font-medium">Non-EU residents only</span>
                <p className="text-xs text-slate-500">Individuals located outside EU member states</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer flex-1">
              <input
                type="radio"
                name="geographicScope"
                value="BOTH"
                checked={wizardData.geographicScope === 'BOTH'}
                onChange={() => handleGeographicScopeChange('BOTH')}
                className="text-blue-600 focus:ring-blue-500 focus:ring-2"
              />
              <div>
                <span className="text-slate-300 font-medium">Both EU and Non-EU</span>
                <p className="text-xs text-slate-500">Individuals in both EU and non-EU locations</p>
              </div>
            </label>
          </div>
        </div>

        {/* Risk Assessment */}
        <RiskAssessmentSection wizardData={wizardData} />
      </div>
    </div>
  );
}

type StepResponseActionsProps = {
  wizardData: WizardData;
  onResponseChange: (field: keyof WizardData, value: any) => void;
};

function StepResponseActions({ wizardData, onResponseChange }: StepResponseActionsProps) {
  const containmentOptions = [
    'Access revoked',
    'Systems isolated',
    'Password reset forced'
  ];

  const incidentOwners = [
    'Maria DPO',
    'Peter CISO',
    'Anna Security Lead',
    'John IT Manager'
  ];

  const severityOptions = [
    { value: 'CRITICAL', label: 'Critical', description: 'Immediate threat to operations' },
    { value: 'HIGH', label: 'High', description: 'Significant impact, urgent response needed' },
    { value: 'MEDIUM', label: 'Medium', description: 'Moderate impact, response within hours' },
    { value: 'LOW', label: 'Low', description: 'Minor impact, routine handling' }
  ];

  // Calculate notification recommendations based on risk assessment
  const riskAssessment = calculateRiskLevel(wizardData);
  const recommendSupervisoryNotification = riskAssessment.level !== 'LOW';
  const recommendDataSubjectNotification = riskAssessment.level === 'HIGH' ||
    (riskAssessment.level === 'MEDIUM' && (wizardData.affectedIndividualsCount || 0) > 100);

  const handleContainmentChange = (measure: string, checked: boolean) => {
    const currentMeasures = wizardData.containmentMeasures || [];
    const newMeasures = checked
      ? [...currentMeasures, measure]
      : currentMeasures.filter(m => m !== measure);
    onResponseChange('containmentMeasures', newMeasures);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Response Actions</h3>
        <p className="text-slate-400">
          Plan immediate containment measures, notification strategy, and assign responsibilities.
        </p>
      </div>

      <div className="space-y-8">
        {/* Containment Measures */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Containment Measures</h4>
            <p className="text-slate-400 text-sm mb-4">
              Select immediate actions taken to contain the incident.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {containmentOptions.map((measure) => (
              <label key={measure} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={(wizardData.containmentMeasures || []).includes(measure)}
                  onChange={(e) => handleContainmentChange(measure, e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-slate-300 text-sm">{measure}</span>
              </label>
            ))}
          </div>

          {/* Containment Details */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300 font-semibold">
              Containment Details *
            </label>
            <textarea
              value={wizardData.containmentDetails || ''}
              onChange={(e) => onResponseChange('containmentDetails', e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
              rows={4}
              placeholder="Describe specific containment actions taken, systems affected, and any additional measures..."
              required
            />
            <p className="text-xs text-slate-500">
              Provide detailed information about containment measures and their effectiveness.
            </p>
          </div>
        </div>

        {/* Notification Plan */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Notification Plan</h4>
            <p className="text-slate-400 text-sm mb-4">
              Determine notification requirements based on regulatory obligations.
            </p>
          </div>

          <div className="space-y-6">
            {/* Supervisory Authority Notification */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="text-white font-medium">Supervisory Authority (Art. 33)</h5>
                    {recommendSupervisoryNotification && (
                      <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    Notify the relevant data protection supervisory authority within 72 hours of becoming aware of the breach.
                  </p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="supervisoryAuthority"
                        checked={wizardData.notifySupervisoryAuthority !== false}
                        onChange={() => onResponseChange('notifySupervisoryAuthority', true)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300 text-sm">Yes, notify supervisory authority</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="supervisoryAuthority"
                        checked={wizardData.notifySupervisoryAuthority === false}
                        onChange={() => onResponseChange('notifySupervisoryAuthority', false)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300 text-sm">No, not required</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Subjects Notification */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="text-white font-medium">Data Subjects (Art. 34)</h5>
                    {recommendDataSubjectNotification && (
                      <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mb-3">
                    Notify affected individuals without undue delay when the breach is likely to result in a risk to their rights and freedoms.
                  </p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dataSubjects"
                        checked={wizardData.notifyDataSubjects === true}
                        onChange={() => onResponseChange('notifyDataSubjects', true)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300 text-sm">Yes, notify data subjects</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dataSubjects"
                        checked={wizardData.notifyDataSubjects === false}
                        onChange={() => onResponseChange('notifyDataSubjects', false)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-300 text-sm">No, not required</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-semibold text-white mb-3">Assignment</h4>
            <p className="text-slate-400 text-sm mb-4">
              Assign responsibility and confirm final severity assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incident Owner */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-semibold">
                Incident Owner *
              </label>
              <select
                value={wizardData.incidentOwner || ''}
                onChange={(e) => onResponseChange('incidentOwner', e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                required
              >
                <option value="">Select incident owner...</option>
                {incidentOwners.map((owner) => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Person responsible for managing this incident response.
              </p>
            </div>

            {/* Severity Confirmation */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300 font-semibold">
                Confirmed Severity *
              </label>
              <select
                value={wizardData.confirmedSeverity || ''}
                onChange={(e) => onResponseChange('confirmedSeverity', e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                required
              >
                <option value="">Select severity...</option>
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Final severity assessment based on impact and risk evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <AlertTriangle className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">Response Summary</h4>
              <div className="text-blue-300 text-sm space-y-1">
                <p>• <strong>Containment:</strong> {wizardData.containmentMeasures?.length || 0} measures selected</p>
                <p>• <strong>Notifications:</strong> {
                  (wizardData.notifySupervisoryAuthority !== false ? 'Supervisory Authority' : '') +
                  (wizardData.notifySupervisoryAuthority !== false && wizardData.notifyDataSubjects ? ', ' : '') +
                  (wizardData.notifyDataSubjects ? 'Data Subjects' : '')
                }</p>
                <p>• <strong>Owner:</strong> {wizardData.incidentOwner || 'Not assigned'}</p>
                <p>• <strong>Severity:</strong> {wizardData.confirmedSeverity || 'Not confirmed'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type StepReviewProps = {
  wizardData: WizardData;
  onReviewChange: (field: keyof WizardData, value: any) => void;
  onComplete: () => void;
};

function StepReview({ wizardData, onReviewChange, onComplete }: StepReviewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Calculate regulatory deadlines based on incident type and discovery time
  const calculateDeadlines = () => {
    if (!wizardData.discoveryTime || !wizardData.incidentType) return [];

    const discovery = wizardData.discoveryTime;
    const deadlines = [];

    // Supervisory Authority notification (72 hours for GDPR, 24 hours for DORA)
    const authorityHours = wizardData.incidentType.id === 'gdpr-breach' ? 72 : 24;
    const authorityDeadline = new Date(discovery.getTime() + authorityHours * 60 * 60 * 1000);
    deadlines.push({
      title: `Supervisory Authority Notification (Art. ${wizardData.incidentType.id === 'gdpr-breach' ? '33' : '19'})`,
      hours: authorityHours,
      deadline: authorityDeadline,
      urgent: true
    });

    // Data subjects notification (if required)
    if (wizardData.notifyDataSubjects) {
      deadlines.push({
        title: 'Data Subjects Notification (Art. 34)',
        hours: 72, // Without undue delay, typically within days
        deadline: new Date(discovery.getTime() + 72 * 60 * 60 * 1000),
        urgent: false
      });
    }

    return deadlines;
  };

  const deadlines = calculateDeadlines();

  // Format time remaining
  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return 'EXPIRED';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Start countdown timer when incident is created
  useEffect(() => {
    if (creationSuccess && incidentId && deadlines.length > 0) {
      const timer = setInterval(() => {
        const now = new Date();
        const nextDeadline = deadlines[0].deadline;
        const remaining = nextDeadline.getTime() - now.getTime();
        setTimeRemaining(remaining > 0 ? remaining : 0);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [creationSuccess, incidentId, deadlines]);

  // Handle incident creation
  const handleCreateIncident = async () => {
    if (!wizardData.confirmDataAccuracy || !wizardData.confirmResponsibility) {
      alert('Please confirm all required checkboxes before creating the incident.');
      return;
    }

    setIsCreating(true);

    try {
      // Prepare incident data for backend submission
      const incidentData = {
        incidentType: wizardData.incidentType?.id,
        title: `${wizardData.incidentType?.title} - ${wizardData.incidentType?.regulation}`,
        description: `Incident reported via Unified Incident Wizard`,
        severity: wizardData.confirmedSeverity,
        discoveryTime: wizardData.discoveryTime?.toISOString(),
        affectedDataCategories: wizardData.affectedDataCategories || [],
        affectedIndividualsCount: wizardData.affectedIndividualsCount || 0,
        affectedIndividualsCategories: wizardData.affectedIndividualsCategories || [],
        geographicScope: wizardData.geographicScope || 'EU',
        containmentMeasures: wizardData.containmentMeasures || [],
        containmentDetails: wizardData.containmentDetails || '',
        incidentOwner: wizardData.incidentOwner,
        notifySupervisoryAuthority: wizardData.notifySupervisoryAuthority,
        notifyDataSubjects: wizardData.notifyDataSubjects,
        sourceSystem: 'WEB_INTERFACE',
        detectedBy: 'USER_REPORT'
      };

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      // Submit to backend API
      console.log('Submitting incident to backend:', incidentData);

      const response = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(incidentData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Incident created successfully:', result);

      // Set incident ID from response
      setIncidentId(result.incidentId);

      // Log evidence seal information if available
      if (result.evidenceSealId) {
        console.log('L4 Evidence seal created:', {
          sealId: result.evidenceSealId,
          hash: result.evidenceSealHash,
          incidentId: result.incidentId
        });
      }

      setCreationSuccess(true);

      // Call the onComplete callback
      setTimeout(() => {
        onComplete?.();
      }, 5000); // Auto-close after 5 seconds

    } catch (error) {
      console.error('Error creating incident:', error);
      alert(`Error creating incident: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Success screen
  if (creationSuccess && incidentId) {
    return (
      <div className="p-6">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Incident Created Successfully!</h2>
            <p className="text-slate-400">The regulatory clock has started. All deadlines are now active.</p>
          </div>

          {/* Incident ID */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Incident ID</div>
            <div className="text-2xl font-mono font-bold text-white">{incidentId}</div>
          </div>

          {/* Active Deadlines */}
          {deadlines.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Active Regulatory Deadlines</h3>
              {deadlines.map((deadline, index) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex justify-between items-center">
                    <div className="text-white font-medium">{deadline.title}</div>
                    <div className={`text-xl font-mono font-bold ${
                      timeRemaining && timeRemaining < 3600000 ? 'text-red-400 animate-pulse' :
                      timeRemaining && timeRemaining < 86400000 ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {timeRemaining !== null ? formatTimeRemaining(deadline.deadline) : '--:--'}
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Deadline: {deadline.deadline.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Evidence Vault Confirmation */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-blue-400 font-medium">Evidence Vault Entry Created</div>
                <div className="text-sm text-blue-300">
                  Incident creation logged with cryptographic seal for audit compliance
                </div>
              </div>
            </div>
          </div>

          {/* Auto-close notice */}
          <p className="text-xs text-slate-500">This window will close automatically in 5 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Review & Create Incident</h3>
        <p className="text-slate-400">
          Review all incident details before creation. Once created, the regulatory clock will start and cannot be stopped.
        </p>
      </div>

      <div className="space-y-6">
        {/* Incident Summary */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h4 className="text-white font-semibold mb-4">Incident Summary</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-400">Type</div>
                <div className="text-white font-medium">{wizardData.incidentType?.title || 'Not selected'}</div>
              </div>

              <div>
                <div className="text-sm text-slate-400">Severity</div>
                <div className={`font-medium ${
                  wizardData.confirmedSeverity === 'CRITICAL' ? 'text-red-400' :
                  wizardData.confirmedSeverity === 'HIGH' ? 'text-orange-400' :
                  wizardData.confirmedSeverity === 'MEDIUM' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {wizardData.confirmedSeverity || 'Not confirmed'}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400">Discovery Time</div>
                <div className="text-white font-medium">
                  {wizardData.discoveryTime ? wizardData.discoveryTime.toLocaleString() : 'Not set'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-400">Affected Individuals</div>
                <div className="text-white font-medium">
                  {wizardData.affectedIndividualsCount?.toLocaleString() || '0'} individuals
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400">Data Categories</div>
                <div className="text-white font-medium">
                  {wizardData.affectedDataCategories?.length || 0} categories affected
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400">Geographic Scope</div>
                <div className="text-white font-medium">
                  {wizardData.geographicScope === 'EU' ? 'EU residents only' :
                   wizardData.geographicScope === 'NON_EU' ? 'Non-EU residents only' :
                   wizardData.geographicScope === 'BOTH' ? 'Both EU and Non-EU' : 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Deadlines Box */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-amber-400 font-semibold">Regulatory Deadlines</h4>
              <p className="text-amber-300 text-sm">
                These clocks will start immediately upon incident creation
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {deadlines.map((deadline, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="text-white font-medium">{deadline.title}</div>
                  <div className="text-sm text-slate-400">
                    {deadline.hours} hours from discovery
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-white">
                    {deadline.hours}h 00m
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDateTimeDDMMYYYY(deadline.deadline)}
                  </div>
                </div>
              </div>
            ))}

            {deadlines.length === 0 && (
              <div className="text-center text-slate-400 py-4">
                No regulatory deadlines applicable
              </div>
            )}
          </div>
        </div>

        {/* Confirmations */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h4 className="text-white font-semibold mb-4">Final Confirmations</h4>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wizardData.confirmDataAccuracy || false}
                onChange={(e) => onReviewChange('confirmDataAccuracy', e.target.checked)}
                className="mt-1 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                required
              />
              <div>
                <div className="text-white font-medium">Data Accuracy Confirmation</div>
                <div className="text-sm text-slate-400">
                  I confirm that all provided information is accurate and complete to the best of my knowledge.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wizardData.confirmResponsibility || false}
                onChange={(e) => onReviewChange('confirmResponsibility', e.target.checked)}
                className="mt-1 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                required
              />
              <div>
                <div className="text-white font-medium">Responsibility Acceptance</div>
                <div className="text-sm text-slate-400">
                  I accept responsibility for the accuracy of this incident report and understand that regulatory compliance requirements will be initiated immediately.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Create Incident Button */}
        <div className="flex justify-center pt-6">
          <button
            onClick={handleCreateIncident}
            disabled={isCreating || !wizardData.confirmDataAccuracy || !wizardData.confirmResponsibility}
            className="flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white transition-colors"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Creating Incident...
              </>
            ) : (
              <>
                🚨 Create Incident & Start Clock
              </>
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            This action cannot be undone. The regulatory clock will start immediately and evidence will be logged to the compliance vault.
          </p>
        </div>
      </div>
    </div>
  );
}
