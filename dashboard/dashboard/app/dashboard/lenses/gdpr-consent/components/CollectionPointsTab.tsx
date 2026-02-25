'use client';

import React, { useState } from 'react';
import {
  Plus,
  Globe,
  Smartphone,
  Cookie,
  Mail,
  Edit,
  Eye,
  BarChart3,
  X,
  Calendar,
  Users,
  MousePointer,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CollectionPoint {
  id: string;
  type: 'website' | 'mobile' | 'cookie' | 'email';
  name: string;
  location: string;
  status: 'active' | 'scheduled';
  consentTypes: string[];
  method: string;
  statistics: {
    impressions: number;
    consents: number;
    conversionRate: number;
  };
  scheduledDate?: string;
  recipients?: number;
}

const CollectionPointsTab: React.FC = () => {
  const [newPointModalOpen, setNewPointModalOpen] = useState(false);

  // Mock data
  const collectionPoints: CollectionPoint[] = [
    {
      id: '1',
      type: 'website',
      name: 'Website Registration Form',
      location: 'https://app.example.com/signup',
      status: 'active',
      consentTypes: ['Marketing', 'Analytics', 'Profiling'],
      method: 'Checkbox (unchecked by default)',
      statistics: {
        impressions: 12450,
        consents: 9234,
        conversionRate: 74.2
      }
    },
    {
      id: '2',
      type: 'mobile',
      name: 'Mobile App Onboarding',
      location: 'First launch → Privacy settings screen',
      status: 'active',
      consentTypes: ['Marketing', 'Analytics', 'Geolocation'],
      method: 'Toggle switches (off by default)',
      statistics: {
        impressions: 5890,
        consents: 4123,
        conversionRate: 70.0
      }
    },
    {
      id: '3',
      type: 'cookie',
      name: 'Cookie Banner',
      location: 'All website pages (first visit)',
      status: 'active',
      consentTypes: ['Analytics cookies', 'Marketing cookies'],
      method: 'Accept/Reject/Customize buttons',
      statistics: {
        impressions: 45230,
        consents: 31661,
        conversionRate: 70.0 // Accept All
      }
    },
    {
      id: '4',
      type: 'email',
      name: 'Email Re-consent Campaign',
      location: 'Email template',
      status: 'scheduled',
      consentTypes: ['All'],
      method: 'Email with consent link',
      scheduledDate: 'Jan 15, 2026',
      recipients: 89,
      statistics: {
        impressions: 0,
        consents: 0,
        conversionRate: 0
      }
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <Globe size={20} className="text-blue-400" />;
      case 'mobile':
        return <Smartphone size={20} className="text-green-400" />;
      case 'cookie':
        return <Cookie size={20} className="text-yellow-400" />;
      case 'email':
        return <Mail size={20} className="text-purple-400" />;
      default:
        return <Globe size={20} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string, scheduledDate?: string) => {
    if (status === 'scheduled') {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">🟡 SCHEDULED</Badge>;
    }
    return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">🟢 ACTIVE</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">● CONSENT COLLECTION POINTS</CardTitle>
            <Button
              onClick={() => setNewPointModalOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Plus size={14} className="mr-2" />
              Add Collection Point
            </Button>
          </div>
          <p className="text-slate-400">Where and how consent is collected</p>
        </CardHeader>
      </Card>

      {/* Active Collection Points */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">ACTIVE COLLECTION POINTS</h3>
        <div className="space-y-4">
          {collectionPoints.filter(point => point.status === 'active').map((point) => (
            <Card key={point.id} className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                      {getTypeIcon(point.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-white">{point.name}</h4>
                        {getStatusBadge(point.status)}
                      </div>

                      <p className="text-slate-400 mb-2">
                        <strong>Location:</strong> {point.location}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            <strong>Consent Types:</strong>
                          </p>
                          <p className="text-slate-300 text-sm">{point.consentTypes.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            <strong>Method:</strong>
                          </p>
                          <p className="text-slate-300 text-sm">{point.method}</p>
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xl font-bold text-white">{point.statistics.impressions.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">Impressions</p>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xl font-bold text-white">{point.statistics.consents.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">Consents</p>
                        </div>
                        <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xl font-bold text-white">{point.statistics.conversionRate}%</p>
                          <p className="text-xs text-slate-400">
                            {point.type === 'cookie' ? 'Accept All' : 'Conversion Rate'}
                          </p>
                        </div>
                      </div>

                      {point.type === 'cookie' && (
                        <div className="mb-4">
                          <p className="text-slate-400 text-sm">
                            Customize: <span className="text-slate-300">4,523 (10%)</span>
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          <Eye size={14} className="mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          <BarChart3 size={14} className="mr-1" />
                          View Analytics
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          Disable
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Scheduled Campaigns */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">SCHEDULED CAMPAIGNS</h3>
        <div className="space-y-4">
          {collectionPoints.filter(point => point.status === 'scheduled').map((point) => (
            <Card key={point.id} className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                      {getTypeIcon(point.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-medium text-white">{point.name}</h4>
                        {getStatusBadge(point.status, point.scheduledDate)}
                      </div>

                      <p className="text-slate-400 mb-2">
                        <strong>Target:</strong> Users with expiring consent (next 30 days)
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            <strong>Consent Types:</strong>
                          </p>
                          <p className="text-slate-300 text-sm">{point.consentTypes.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">
                            <strong>Method:</strong>
                          </p>
                          <p className="text-slate-300 text-sm">{point.method}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          <span className="text-slate-300">Scheduled: {point.scheduledDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-slate-400" />
                          <span className="text-slate-300">Recipients: {point.recipients}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          <Eye size={14} className="mr-1" />
                          Preview Email
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Mail size={14} className="mr-1" />
                          Send Now
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Collection Point Modal */}
      <Dialog open={newPointModalOpen} onOpenChange={setNewPointModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Collection Point</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="text-slate-300">Collection Point Type *</Label>
              <Select>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-300">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="website">🌐 Website Form</SelectItem>
                  <SelectItem value="mobile">📱 Mobile App</SelectItem>
                  <SelectItem value="cookie">🍪 Cookie Banner</SelectItem>
                  <SelectItem value="email">📧 Email Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Name *</Label>
              <Input
                placeholder="e.g., Privacy Policy Cookie Banner"
                className="mt-1 bg-slate-800 border-slate-700 text-slate-300"
              />
            </div>

            <div>
              <Label className="text-slate-300">Location/URL *</Label>
              <Input
                placeholder="e.g., https://example.com/privacy or App Settings Screen"
                className="mt-1 bg-slate-800 border-slate-700 text-slate-300"
              />
            </div>

            <div>
              <Label className="text-slate-300">Consent Types Collected *</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  'Marketing', 'Analytics', 'Profiling', 'Third-Party',
                  'AI Training', 'Geolocation'
                ].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={type} />
                    <Label htmlFor={type} className="text-slate-300 text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Collection Method *</Label>
              <Select>
                <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-slate-300">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="checkbox">Checkbox (unchecked by default)</SelectItem>
                  <SelectItem value="toggle">Toggle switches (off by default)</SelectItem>
                  <SelectItem value="buttons">Accept/Reject/Customize buttons</SelectItem>
                  <SelectItem value="email-link">Email with consent link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button variant="outline" onClick={() => setNewPointModalOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                Create Collection Point
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionPointsTab;