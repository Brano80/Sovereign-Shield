'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Eye,
  Send,
  Users,
  AlertTriangle,
  CheckCircle,
  Settings,
  Share,
  Mail,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ConsentType {
  id: string;
  name: string;
  purpose: string;
  validityPeriod: string;
  renewal: 'required' | 'optional';
  granularity: 'granular' | 'bundled';
  status: 'active' | 'not_configured';
  statistics: {
    consented: number;
    consentRate: number;
    avgAge: number;
  };
  partners?: number; // for third-party
}

const ConsentTypesTab: React.FC = () => {
  const [newConsentModalOpen, setNewConsentModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ConsentType | null>(null);
  const [wizardStep, setWizardStep] = useState(1);

  // Mock data
  const consentTypes: ConsentType[] = [
    {
      id: '1',
      name: 'Marketing Communications',
      purpose: 'Promotional emails, newsletters, product updates',
      validityPeriod: '12 months',
      renewal: 'required',
      granularity: 'granular',
      status: 'active',
      statistics: {
        consented: 8234,
        consentRate: 82,
        avgAge: 6.2
      }
    },
    {
      id: '2',
      name: 'Analytics & Tracking',
      purpose: 'Usage analytics, behavior tracking, service improvement',
      validityPeriod: '12 months',
      renewal: 'required',
      granularity: 'granular',
      status: 'active',
      statistics: {
        consented: 7123,
        consentRate: 71,
        avgAge: 7.8
      }
    },
    {
      id: '3',
      name: 'Profiling & Personalization',
      purpose: 'Personalized recommendations, user profiling',
      validityPeriod: '12 months',
      renewal: 'required',
      granularity: 'granular',
      status: 'active',
      statistics: {
        consented: 5412,
        consentRate: 54,
        avgAge: 5.1
      }
    },
    {
      id: '4',
      name: 'Third-Party Data Sharing',
      purpose: 'Sharing data with partners, advertisers',
      validityPeriod: '12 months',
      renewal: 'required',
      granularity: 'granular',
      status: 'active',
      partners: 5,
      statistics: {
        consented: 3845,
        consentRate: 38,
        avgAge: 4.3
      }
    },
    {
      id: '5',
      name: 'AI Model Training',
      purpose: 'Training AI models with user data',
      validityPeriod: 'Not configured',
      renewal: 'required',
      granularity: 'granular',
      status: 'not_configured',
      statistics: {
        consented: 0,
        consentRate: 0,
        avgAge: 0
      }
    }
  ];

  const handleEditType = (type: ConsentType) => {
    setSelectedType(type);
    setEditModalOpen(true);
  };

  const handleNewType = () => {
    setSelectedType(null);
    setWizardStep(1);
    setNewConsentModalOpen(true);
  };

  const handleConfigureType = (type: ConsentType) => {
    setSelectedType(type);
    setWizardStep(1);
    setNewConsentModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">🟢 ACTIVE</Badge>
      : <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔴 NOT CONFIGURED</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">● CONSENT TYPES</CardTitle>
            <Button
              onClick={handleNewType}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus size={14} className="mr-2" />
              New Consent Type
            </Button>
          </div>
          <p className="text-slate-400">Configure consent categories and their requirements</p>
        </CardHeader>
      </Card>

      {/* Consent Type Cards */}
      <div className="space-y-4">
        {consentTypes.map((type) => (
          <Card key={type.id} className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-white">{type.name}</h3>
                    {getStatusBadge(type.status)}
                  </div>

                  <p className="text-slate-400 mb-4">{type.purpose}</p>

                  {type.status === 'not_configured' ? (
                    <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-red-400" />
                        <span className="text-red-400 font-medium">This consent type has not been configured.</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">
                        Processing for {type.name.toLowerCase()} is currently blocked.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleConfigureType(type)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Configure Now
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-2xl font-bold text-white">{type.statistics.consented.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">Consented</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-2xl font-bold text-white">{type.statistics.consentRate}%</p>
                        <p className="text-xs text-slate-400">Consent Rate</p>
                      </div>
                      <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-2xl font-bold text-white">{type.statistics.avgAge}</p>
                        <p className="text-xs text-slate-400">Avg Age (months)</p>
                      </div>
                    </div>
                  )}

                  {type.status === 'active' && (
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>Validity: <span className="text-slate-300">{type.validityPeriod}</span></span>
                      <span>Renewal: <span className="text-slate-300">{type.renewal}</span></span>
                      <span>Granular: <span className="text-slate-300">{type.granularity}</span></span>
                      {type.partners && (
                        <span>Third Parties: <span className="text-slate-300">{type.partners} registered partners</span></span>
                      )}
                    </div>
                  )}
                </div>

                {type.status === 'active' && (
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                      <Eye size={14} className="mr-1" />
                      View Consents
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                      <Send size={14} className="mr-1" />
                      Send Campaign
                    </Button>
                    {type.partners && (
                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        <Share size={14} className="mr-1" />
                        Manage Partners
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                      Disable
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Consent Type Wizard Modal */}
      <Dialog open={newConsentModalOpen} onOpenChange={setNewConsentModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">New Consent Type</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                wizardStep >= 1 ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 rounded ${
                wizardStep >= 2 ? 'bg-cyan-600' : 'bg-slate-700'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                wizardStep >= 2 ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 rounded ${
                wizardStep >= 3 ? 'bg-cyan-600' : 'bg-slate-700'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                wizardStep >= 3 ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                3
              </div>
            </div>

            <div className="text-sm text-slate-400">
              Step {wizardStep} of 3: {
                wizardStep === 1 ? 'Basic Information' :
                wizardStep === 2 ? 'Requirements' :
                'Review & Create'
              }
            </div>

            {/* Step 1: Basic Information */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Template (optional)</Label>
                  <Select>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-300">
                      <SelectValue placeholder="○ Start from scratch" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="scratch">○ Start from scratch</SelectItem>
                      <SelectItem value="marketing">○ Marketing Communications (template)</SelectItem>
                      <SelectItem value="analytics">○ Analytics & Tracking (template)</SelectItem>
                      <SelectItem value="third-party">○ Third-Party Sharing (template)</SelectItem>
                      <SelectItem value="ai">○ AI/ML Processing (template)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Consent Type Name *</Label>
                  <Input
                    placeholder="e.g., AI Model Training"
                    className="mt-1 bg-slate-800 border-slate-700 text-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Purpose (user-facing description) *</Label>
                  <Textarea
                    placeholder="Describe what this consent is for..."
                    className="mt-1 bg-slate-800 border-slate-700 text-slate-300 min-h-20"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Category *</Label>
                  <Select>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="personalization">Personalization</SelectItem>
                      <SelectItem value="third-party">Third-Party</SelectItem>
                      <SelectItem value="ai">AI/ML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Requirements */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-white">CONSENT REQUIREMENTS (Art. 7)</h3>

                <div>
                  <Label className="text-slate-300">Validity Period *</Label>
                  <Select>
                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-300">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      <SelectItem value="6-months">6 months</SelectItem>
                      <SelectItem value="12-months">12 months</SelectItem>
                      <SelectItem value="24-months">24 months</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Renewal *</Label>
                  <RadioGroup defaultValue="required">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="required" id="required" />
                      <Label htmlFor="required" className="text-slate-300">
                        Required (must re-consent after expiry)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="optional" id="optional" />
                      <Label htmlFor="optional" className="text-slate-300">
                        Optional (auto-extend unless withdrawn)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-slate-300">Granularity *</Label>
                  <RadioGroup defaultValue="granular">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="granular" id="granular" />
                      <Label htmlFor="granular" className="text-slate-300">
                        Granular (separate from other consents)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bundled" id="bundled" />
                      <Label htmlFor="bundled" className="text-slate-300">
                        Bundled (part of general consent)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-slate-300">COLLECTION REQUIREMENTS</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      'Clear affirmative action required (no pre-ticked boxes)',
                      'Separate from other terms and conditions',
                      'Easy withdrawal mechanism provided',
                      'Record timestamp and method of consent',
                      'Store IP address for verification'
                    ].map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox id={`req-${index}`} defaultChecked />
                        <Label htmlFor={`req-${index}`} className="text-slate-300 text-sm">
                          {requirement}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Create */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">Review Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Consent Type:</span>
                      <span className="text-slate-300">AI Model Training</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Validity:</span>
                      <span className="text-slate-300">12 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Renewal:</span>
                      <span className="text-slate-300">Required</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Granularity:</span>
                      <span className="text-slate-300">Granular</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              {wizardStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Previous
                </Button>
              )}

              <div className="flex-1"></div>

              {wizardStep < 3 ? (
                <Button
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  Next: {wizardStep === 1 ? 'Requirements →' : 'Review →'}
                </Button>
              ) : (
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Create Type
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsentTypesTab;