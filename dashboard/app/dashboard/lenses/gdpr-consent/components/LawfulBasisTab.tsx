'use client';

import React, { useState } from 'react';
import {
  Plus,
  Shield,
  FileText,
  Briefcase,
  AlertTriangle,
  Heart,
  Building,
  Target,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProcessingActivity {
  id: string;
  activity: string;
  lawfulBasis: string;
  dataCategories: string[];
  status: 'valid' | 'none';
}

interface LawfulBasisInfo {
  article: string;
  title: string;
  icon: React.ElementType;
  usedFor: number;
  requirements: string[];
  description: string;
}

const LawfulBasisTab: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ProcessingActivity | null>(null);

  // Mock data
  const processingActivities: ProcessingActivity[] = [
    {
      id: '1',
      activity: 'Core Service Delivery',
      lawfulBasis: '📜 Contract (6.1.b)',
      dataCategories: ['Account', 'Usage'],
      status: 'valid'
    },
    {
      id: '2',
      activity: 'Marketing Emails',
      lawfulBasis: '✅ Consent (6.1.a)',
      dataCategories: ['Contact', 'Preferences'],
      status: 'valid'
    },
    {
      id: '3',
      activity: 'Analytics & Reporting',
      lawfulBasis: '✅ Consent (6.1.a)',
      dataCategories: ['Usage', 'Behavior'],
      status: 'valid'
    },
    {
      id: '4',
      activity: 'Fraud Prevention',
      lawfulBasis: '⚖️ Legit. Int.(6.1.f)',
      dataCategories: ['Transaction'],
      status: 'valid'
    },
    {
      id: '5',
      activity: 'Tax Compliance',
      lawfulBasis: '📋 Legal Obl.(6.1.c)',
      dataCategories: ['Financial'],
      status: 'valid'
    },
    {
      id: '6',
      activity: 'AI Model Training',
      lawfulBasis: '',
      dataCategories: [],
      status: 'none'
    }
  ];

  const lawfulBasisCards: LawfulBasisInfo[] = [
    {
      article: '6.1.a',
      title: 'CONSENT',
      icon: CheckCircle,
      usedFor: 4,
      requirements: [
        'Freely given',
        'Specific',
        'Informed',
        'Unambiguous'
      ],
      description: 'Processing is lawful only if the data subject has given consent to the processing of his or her personal data for one or more specific purposes.'
    },
    {
      article: '6.1.b',
      title: 'CONTRACT',
      icon: Briefcase,
      usedFor: 1,
      requirements: [
        'Necessary for contract',
        'Pre-contractual steps',
        'Performance of contract'
      ],
      description: 'Processing is necessary for the performance of a contract to which the data subject is party or in order to take steps at the request of the data subject prior to entering into a contract.'
    },
    {
      article: '6.1.c',
      title: 'LEGAL OBLIGATION',
      icon: FileText,
      usedFor: 1,
      requirements: [
        'Legal mandate',
        'Documentation',
        'Compliance with law'
      ],
      description: 'Processing is necessary for compliance with a legal obligation to which the controller is subject.'
    },
    {
      article: '6.1.d',
      title: 'VITAL INTERESTS',
      icon: Heart,
      usedFor: 0,
      requirements: [
        'Life/death situation',
        'Emergency',
        'Cannot obtain consent'
      ],
      description: 'Processing is necessary in order to protect the vital interests of the data subject or of another natural person.'
    },
    {
      article: '6.1.e',
      title: 'PUBLIC TASK',
      icon: Building,
      usedFor: 0,
      requirements: [
        'Public interest',
        'Official authority',
        'Legal basis in EU/EEA law'
      ],
      description: 'Processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller.'
    },
    {
      article: '6.1.f',
      title: 'LEGITIMATE INTERESTS',
      icon: Target,
      usedFor: 1,
      requirements: [
        'LIA documented',
        'Balancing test',
        'Opt-out option',
        'Not overriding rights'
      ],
      description: 'Processing is necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject.'
    }
  ];

  const handleAddActivity = () => {
    setEditingActivity(null);
    setModalOpen(true);
  };

  const handleEditActivity = (activity: ProcessingActivity) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'valid'
      ? <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">✓ Valid</Badge>
      : <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔴 None</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">● LAWFUL BASIS CONFIGURATION (Article 6)</CardTitle>
            <Button
              onClick={handleAddActivity}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus size={14} className="mr-2" />
              Add Activity
            </Button>
          </div>
          <p className="text-slate-400">Define the legal grounds for each processing activity</p>
        </CardHeader>
      </Card>

      {/* Processing Activities Table */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="text-lg font-medium text-white">PROCESSING ACTIVITIES</h3>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">ACTIVITY</TableHead>
                  <TableHead className="text-slate-300">LAWFUL BASIS</TableHead>
                  <TableHead className="text-slate-300">DATA CATEGORIES</TableHead>
                  <TableHead className="text-slate-300">STATUS</TableHead>
                  <TableHead className="text-slate-300 w-20">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processingActivities.map((activity) => (
                  <TableRow key={activity.id} className="border-slate-700 hover:bg-slate-800/30">
                    <TableCell className="text-slate-300 font-medium">{activity.activity}</TableCell>
                    <TableCell className="text-slate-300">{activity.lawfulBasis || 'Not configured'}</TableCell>
                    <TableCell className="text-slate-300">
                      {activity.dataCategories.length > 0 ? activity.dataCategories.join(', ') : '—'}
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditActivity(activity)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <Edit size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Lawful Basis Reference Cards */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">● LAWFUL BASIS REFERENCE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lawfulBasisCards.map((basis) => (
            <Card key={basis.article} className="bg-slate-800/50 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <basis.icon size={20} className="text-cyan-400" />
                    <div>
                      <CardTitle className="text-white text-sm">{basis.title}</CardTitle>
                      <p className="text-slate-400 text-xs">Art. {basis.article}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-slate-700 text-slate-300">
                    Used for: {basis.usedFor}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-slate-400 text-sm mb-3">{basis.description}</p>

                <div className="mb-3">
                  <p className="text-slate-300 text-xs font-medium mb-2">REQUIRES:</p>
                  <ul className="text-slate-400 text-xs space-y-1">
                    {basis.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Configuration Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingActivity ? 'Edit' : 'Configure'} Lawful Basis
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Processing Activity */}
            <div>
              <Label className="text-slate-300">Processing Activity *</Label>
              <Input
                defaultValue={editingActivity?.activity || ''}
                placeholder="e.g., Marketing Emails"
                className="mt-1 bg-slate-800 border-slate-700 text-slate-300"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-slate-300">Description *</Label>
              <Textarea
                placeholder="Describe the processing activity and its purpose..."
                className="mt-1 bg-slate-800 border-slate-700 text-slate-300 min-h-20"
              />
            </div>

            {/* Lawful Basis Selection */}
            <div>
              <Label className="text-slate-300">Lawful Basis *</Label>
              <RadioGroup defaultValue={editingActivity?.lawfulBasis || ''} className="mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg">
                    <RadioGroupItem value="consent" id="consent" />
                    <Label htmlFor="consent" className="text-slate-300 cursor-pointer">
                      ✅ Consent (6.1.a)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg">
                    <RadioGroupItem value="contract" id="contract" />
                    <Label htmlFor="contract" className="text-slate-300 cursor-pointer">
                      📜 Contract (6.1.b)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg">
                    <RadioGroupItem value="legal-obligation" id="legal-obligation" />
                    <Label htmlFor="legal-obligation" className="text-slate-300 cursor-pointer">
                      📋 Legal Obligation (6.1.c)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg">
                    <RadioGroupItem value="vital-interests" id="vital-interests" />
                    <Label htmlFor="vital-interests" className="text-slate-300 cursor-pointer">
                      💚 Vital Interests (6.1.d)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg">
                    <RadioGroupItem value="public-task" id="public-task" />
                    <Label htmlFor="public-task" className="text-slate-300 cursor-pointer">
                      🏛️ Public Task (6.1.e)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg">
                    <RadioGroupItem value="legitimate-interests" id="legitimate-interests" />
                    <Label htmlFor="legitimate-interests" className="text-slate-300 cursor-pointer">
                      ⚖️ Legitimate Interests (6.1.f)
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Data Categories */}
            <div>
              <Label className="text-slate-300">Data Categories *</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  'Contact Information', 'Preferences', 'Financial', 'Health',
                  'Biometric', 'Location', 'Behavioral', 'Employment'
                ].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox id={category} />
                    <Label htmlFor={category} className="text-slate-300 text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Retention Period */}
            <div>
              <Label className="text-slate-300">Data Retention Period *</Label>
              <Select>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-300">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="until-consent-withdrawn">Until consent withdrawn or 24 months of inactivity</SelectItem>
                  <SelectItem value="1-year">1 year</SelectItem>
                  <SelectItem value="2-years">2 years</SelectItem>
                  <SelectItem value="5-years">5 years</SelectItem>
                  <SelectItem value="indefinite">Indefinite (legal requirement)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Linked Consent Type */}
            <div>
              <Label className="text-slate-300">Linked Consent Type *</Label>
              <Select>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-300">
                  <SelectValue placeholder="Select consent type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="marketing">Marketing Communications</SelectItem>
                  <SelectItem value="analytics">Analytics & Tracking</SelectItem>
                  <SelectItem value="profiling">Profiling & Personalization</SelectItem>
                  <SelectItem value="third-party">Third-Party Data Sharing</SelectItem>
                  <SelectItem value="ai-training">AI Model Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Save size={14} className="mr-2" />
                {editingActivity ? 'Save Config' : 'Save Config'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LawfulBasisTab;