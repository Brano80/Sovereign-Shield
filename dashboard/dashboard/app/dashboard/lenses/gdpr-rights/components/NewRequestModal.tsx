"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface NewRequestData {
  requestType: string;
  dataSubjectEmail: string;
  requestSource: 'portal' | 'email' | 'phone' | 'letter';
  scope?: string;
  grounds?: string;
  details?: string;
}

interface NewRequestModalProps {
  onClose: () => void;
  onSubmit: (data: NewRequestData) => void;
}

export function NewRequestModal({ onClose, onSubmit }: NewRequestModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<NewRequestData>({
    requestType: '',
    dataSubjectEmail: '',
    requestSource: 'portal'
  });

  const requestTypes = [
    {
      id: 'access',
      label: '📥 Access Request (Art. 15)',
      description: 'Provide copy of all personal data',
      article: 'Article 15'
    },
    {
      id: 'rectification',
      label: '✏️ Rectification (Art. 16)',
      description: 'Correct inaccurate personal data',
      article: 'Article 16'
    },
    {
      id: 'erasure',
      label: '🗑️ Erasure (Art. 17)',
      description: 'Delete personal data ("Right to be forgotten")',
      article: 'Article 17'
    },
    {
      id: 'restriction',
      label: '⏸️ Restriction (Art. 18)',
      description: 'Restrict processing of personal data',
      article: 'Article 18'
    },
    {
      id: 'portability',
      label: '📤 Portability (Art. 20)',
      description: 'Export data in machine-readable format',
      article: 'Article 20'
    },
    {
      id: 'objection',
      label: '🚫 Objection (Art. 21)',
      description: 'Object to processing',
      article: 'Article 21'
    }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const updateFormData = (field: keyof NewRequestData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.requestType && formData.dataSubjectEmail && formData.requestSource;
      case 2:
        return true; // Details are optional
      case 3:
        return true; // Review step
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h3 className="text-xl font-bold text-white">NEW DATA SUBJECT REQUEST</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                1
              </div>
              <div className={`w-12 h-0.5 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-600'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                2
              </div>
              <div className={`w-12 h-0.5 ${
                currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-600'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                3
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-2">
                {currentStep === 1 && 'Request Type'}
                {currentStep === 2 && 'Request Details'}
                {currentStep === 3 && 'Review & Submit'}
              </h4>
              <p className="text-slate-400 text-sm">
                Step {currentStep} of 3
              </p>
            </div>
          </div>

          {/* Step 1: Request Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Request Type *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {requestTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        formData.requestType === type.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestType"
                        value={type.id}
                        checked={formData.requestType === type.id}
                        onChange={(e) => updateFormData('requestType', e.target.value)}
                        className="mt-0.5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{type.label}</div>
                        <div className="text-sm text-slate-400">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Data Subject Email *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={formData.dataSubjectEmail}
                    onChange={(e) => updateFormData('dataSubjectEmail', e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Request Source *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'portal', label: 'Self-service portal', icon: User },
                    { id: 'email', label: 'Email', icon: Mail },
                    { id: 'phone', label: 'Phone', icon: Phone },
                    { id: 'letter', label: 'Written letter', icon: FileText }
                  ].map((source) => (
                    <label
                      key={source.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.requestSource === source.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestSource"
                        value={source.id}
                        checked={formData.requestSource === source.id}
                        onChange={(e) => updateFormData('requestSource', e.target.value as any)}
                        className="text-blue-600"
                      />
                      <source.icon size={16} className="text-slate-400" />
                      <span className="text-white text-sm">{source.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Request Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <div>
                    <div className="text-white font-medium">
                      {requestTypes.find(t => t.id === formData.requestType)?.label}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {requestTypes.find(t => t.id === formData.requestType)?.article}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  Data Subject: {formData.dataSubjectEmail}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Request Scope
                </label>
                <textarea
                  value={formData.scope || ''}
                  onChange={(e) => updateFormData('scope', e.target.value)}
                  placeholder="Describe what data or processing the request applies to..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(formData.requestType === 'erasure' || formData.requestType === 'objection') && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Legal Grounds
                  </label>
                  <textarea
                    value={formData.grounds || ''}
                    onChange={(e) => updateFormData('grounds', e.target.value)}
                    placeholder="Specify the legal grounds for this request..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Additional Details
                </label>
                <textarea
                  value={formData.details || ''}
                  onChange={(e) => updateFormData('details', e.target.value)}
                  placeholder="Any additional information or context..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <h5 className="text-white font-medium mb-4">Request Summary</h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white">
                      {requestTypes.find(t => t.id === formData.requestType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data Subject:</span>
                    <span className="text-white">{formData.dataSubjectEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source:</span>
                    <span className="text-white capitalize">{formData.requestSource}</span>
                  </div>
                  {formData.scope && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scope:</span>
                      <span className="text-white">{formData.scope}</span>
                    </div>
                  )}
                  {formData.grounds && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Grounds:</span>
                      <span className="text-white">{formData.grounds}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-blue-400 mt-0.5" />
                  <div>
                    <h5 className="text-blue-400 font-medium mb-1">Processing Timeline</h5>
                    <ul className="text-blue-300 text-sm space-y-1">
                      <li>• Request will be logged to Evidence Graph with L2 integrity</li>
                      <li>• SLA: 30 days for access requests, 1 month for others</li>
                      <li>• Automated notifications will be sent to data subject</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
                >
                  Next: {currentStep === 1 ? 'Request Details' : 'Review & Submit'} →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
                >
                  Submit Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
