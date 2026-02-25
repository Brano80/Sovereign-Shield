'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Building2, FileText, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { API_BASE } from '@/app/utils/api-config';
import { complianceApi } from '@/app/lib/api-client';
import type { SCCRegistryResponse } from '@/app/hooks/useSccRegistries';

// SCC Module enum
enum SccModule {
  Module1 = 'Module1', // Controller to Processor (C2P)
  Module2 = 'Module2', // Controller to Controller (C2C)
  Module3 = 'Module3', // Hybrid
  Module4 = 'Module4', // Other/Custom
}

// Countries requiring SCC for international data transfers
const SCC_REQUIRED_COUNTRIES = [
  { code: 'US', name: 'United States', reason: 'No adequacy decision - SCC required' },
  { code: 'IN', name: 'India', reason: 'No adequacy decision - SCC required' },
  { code: 'BR', name: 'Brazil', reason: 'No adequacy decision - SCC required' },
  { code: 'MX', name: 'Mexico', reason: 'No adequacy decision - SCC required' },
  { code: 'SG', name: 'Singapore', reason: 'No adequacy decision - SCC required' },
  { code: 'KR', name: 'South Korea', reason: 'Partial adequacy - SCC recommended' },
  { code: 'ZA', name: 'South Africa', reason: 'No adequacy decision - SCC required' },
  { code: 'AR', name: 'Argentina', reason: 'Adequacy decision exists but SCC often used' },
  { code: 'IL', name: 'Israel', reason: 'Adequacy decision exists but SCC often used' },
  { code: 'UY', name: 'Uruguay', reason: 'Adequacy decision exists but SCC often used' },
];

// Countries blocked from SCC compliance (high-risk jurisdictions)
const BLOCKED_SCC_COUNTRIES = ['CN', 'RU', 'KP', 'IR', 'SY', 'VE', 'BY'];

// Partner suggestions for autocomplete
const PARTNER_SUGGESTIONS = [
  'AWS Inc.',
  'Google Cloud',
  'Microsoft Azure',
  'Salesforce',
  'Wipro Ltd',
  'TCS',
  'Rakuten',
  'Adobe',
  'Oracle',
  'IBM',
  'SAP',
  'Amazon Web Services',
  'Alibaba Cloud',
  'Tencent Cloud',
  'DigitalOcean',
  'Linode',
  'Vultr',
  'Heroku',
  'Netlify',
  'Vercel',
  'Cloudflare',
  'Stripe',
  'PayPal',
  'Braintree',
  'Authorize.net',
  '2Checkout',
  'Shopify',
  'BigCommerce',
  'Magento',
  'WooCommerce',
];

interface SccWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface WizardData {
  partnerName: string;
  countryCode: string;
  sccModule: SccModule | '';
  dpaId: string;
  signedDate: string;
  expiryDate: string;
  tiaCompleted: boolean;
}

const SccWizard: React.FC<SccWizardProps> = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [data, setData] = useState<WizardData>({
    partnerName: '',
    countryCode: '',
    sccModule: '',
    dpaId: '',
    signedDate: '',
    expiryDate: '',
    tiaCompleted: false,
  });

  const resetWizard = () => {
    setCurrentStep(1);
    setData({
      partnerName: '',
      countryCode: '',
      sccModule: '',
      dpaId: '',
      signedDate: '',
      expiryDate: '',
      tiaCompleted: false,
    });
    setPartnerSearch('');
    setShowSuggestions(false);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        partner_name: data.partnerName,
        country_code: data.countryCode,
        scc_module: data.sccModule,
        dpa_id: data.dpaId,
        signed_date: data.signedDate,
        expiry_date: data.expiryDate,
        tia_completed: data.tiaCompleted,
        is_high_risk: isSelectedCountryBlocked,
        risk_assessment_required: isSelectedCountryBlocked,
        compliance_status: isSelectedCountryBlocked ? 'HIGH_RISK_LEGAL_REVIEW' : 'SCC_COMPLIANT',
      };

      // Log headers for debugging
      const token = localStorage.getItem('auth_token');
      console.log('Authorization header check:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 20) + '...' : 'none'
      });

      const result = await complianceApi.post<SCCRegistryResponse>('/scc/register', requestData);
      console.log('SCC registered successfully:', result);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['scc_registries'] });
      queryClient.invalidateQueries({ queryKey: ['sovereign_shield_stats'] });

      // Trigger Evidence Vault refresh
      window.dispatchEvent(new CustomEvent('refresh-evidence-vault'));

      // Show success toast
      toast.success('SCC registered successfully');

      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (error) {
      console.error('Error registering SCC:', error);
      console.error('Full error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      alert(`Failed to register SCC: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep1 = () => {
    return data.partnerName.trim() !== '' && data.countryCode !== '';
  };

  const validateStep2 = () => {
    return data.sccModule !== '' && data.dpaId.trim() !== '';
  };

  const validateStep3 = () => {
    return data.signedDate !== '' && data.expiryDate !== '' && new Date(data.expiryDate) > new Date(data.signedDate);
  };

  const filteredPartners = PARTNER_SUGGESTIONS.filter(partner =>
    partner.toLowerCase().includes(partnerSearch.toLowerCase())
  );

  const selectedCountry = SCC_REQUIRED_COUNTRIES.find(c => c.code === data.countryCode);
  const isSelectedCountryBlocked = BLOCKED_SCC_COUNTRIES.includes(data.countryCode);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-0.5 mx-2 transition-colors ${
                step < currentStep ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Context Information</h3>
        <p className="text-slate-400 text-sm">
          Provide basic information about the partner and destination country.
        </p>
      </div>

      <div className="space-y-4">
        {/* Partner Name with Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Partner Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="e.g., AWS Inc., Google Cloud"
              value={partnerSearch}
              onChange={(e) => {
                setPartnerSearch(e.target.value);
                setData(prev => ({ ...prev, partnerName: e.target.value }));
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
            {showSuggestions && partnerSearch && (
              <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredPartners.slice(0, 5).map((partner) => (
                  <div
                    key={partner}
                    className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-slate-300"
                    onClick={() => {
                      setPartnerSearch(partner);
                      setData(prev => ({ ...prev, partnerName: partner }));
                      setShowSuggestions(false);
                    }}
                  >
                    {partner}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Country Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Destination Country (SCC Required) <span className="text-red-400">*</span>
          </label>
          <Select
            value={data.countryCode}
            onValueChange={(value) => setData(prev => ({ ...prev, countryCode: value }))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select destination country requiring SCC" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {SCC_REQUIRED_COUNTRIES.map((country) => {
                const isBlocked = BLOCKED_SCC_COUNTRIES.includes(country.code);
                return (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.name} ({country.code})</span>
                      {isBlocked && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5 cursor-pointer">
                              BLOCKED
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs text-red-300 max-w-xs">
                              This transfer requires individual legal assessment (High Risk)
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">
            Only countries requiring Standard Contractual Clauses are shown.
            EEA countries and those with adequacy decisions do not require SCCs.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!validateStep1()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Legal Framework</h3>
        <p className="text-slate-400 text-sm">
          Select the appropriate SCC module and provide the DPA identifier.
        </p>
      </div>

      <div className="space-y-4">
        {/* SCC Module Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            SCC Module <span className="text-red-400">*</span>
          </label>
          <Select
            value={data.sccModule}
            onValueChange={(value) => setData(prev => ({ ...prev, sccModule: value as SccModule }))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select SCC module" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value={SccModule.Module1}>
                Module 1: Controller to Processor (C2P)
              </SelectItem>
              <SelectItem value={SccModule.Module2}>
                Module 2: Controller to Controller (C2C)
              </SelectItem>
              <SelectItem value={SccModule.Module3}>
                Module 3: Hybrid
              </SelectItem>
              <SelectItem value={SccModule.Module4}>
                Module 4: Other/Custom
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">
            Choose the appropriate SCC module based on your data transfer scenario.
          </p>
        </div>

        {/* DPA ID */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            DPA ID <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g., DPA-2024-001-AWS"
            value={data.dpaId}
            onChange={(e) => setData(prev => ({ ...prev, dpaId: e.target.value }))}
            className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          />
          <p className="text-xs text-slate-500 mt-1">
            Data Processing Agreement identifier from your contract.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!validateStep2()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Compliance Details</h3>
        <p className="text-slate-400 text-sm">
          Set contract dates and confirm TIA completion status.
        </p>
      </div>

      <div className="space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Signed Date <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={data.signedDate}
              onChange={(e) => setData(prev => ({ ...prev, signedDate: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Expiry Date <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={data.expiryDate}
              onChange={(e) => setData(prev => ({ ...prev, expiryDate: e.target.value }))}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* TIA Completed Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              TIA Completed
            </label>
            <p className="text-xs text-slate-500">
              Transfer Impact Assessment has been completed and approved
            </p>
            {isSelectedCountryBlocked && (
              <p className="text-xs text-red-400 mt-1 font-medium">
                This transfer requires individual legal assessment (High Risk)
              </p>
            )}
          </div>
          <Switch
            checked={data.tiaCompleted}
            onCheckedChange={(checked) => setData(prev => ({ ...prev, tiaCompleted: checked }))}
            disabled={isSelectedCountryBlocked}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-slate-800/30 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-3">Registration Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Partner:</span>
            <span className="text-slate-300">{data.partnerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Country:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">{selectedCountry?.name} ({data.countryCode})</span>
              {isSelectedCountryBlocked && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  HIGH RISK
                </Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">SCC Module:</span>
            <span className="text-slate-300">{data.sccModule}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">DPA ID:</span>
            <span className="text-slate-300">{data.dpaId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">TIA Status:</span>
            <span className={`text-slate-300 ${isSelectedCountryBlocked ? 'line-through opacity-50' : ''}`}>
              {data.tiaCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
          {isSelectedCountryBlocked && (
            <div className="mt-3 p-2 bg-red-900/20 border border-red-700/50 rounded text-xs text-red-300">
              ⚠️ This transfer requires individual legal assessment due to high-risk jurisdiction
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!validateStep3() || isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Register SCC
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Context Information';
      case 2:
        return 'Legal Framework';
      case 3:
        return 'Compliance Details';
      default:
        return 'SCC Registration';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Basic information about the data transfer partner and destination.';
      case 2:
        return 'Select the appropriate SCC module and provide legal identifiers.';
      case 3:
        return 'Set contract dates and confirm compliance requirements.';
      default:
        return 'Complete the SCC registration process.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900/90 backdrop-blur-xl border-slate-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            SCC Registration Wizard
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Step {currentStep} of 3: {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SccWizard;