'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Info,
  ArrowRight
} from 'lucide-react';

interface AddSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSystemModal: React.FC<AddSystemModalProps> = ({ isOpen, onClose }) => {
  const [selectedSystem, setSelectedSystem] = useState('');
  const [checkFrequency, setCheckFrequency] = useState('interval');
  const [metrics, setMetrics] = useState({
    accuracy: true,
    robustness: true,
    security: true,
    latency: true,
    uptime: true,
    drift: true
  });

  const mockRegisteredSystems = [
    { id: 'credit-scoring-v3', name: 'Credit Scoring Engine', risk: 'HIGH' },
    { id: 'hiring-assistant-v2', name: 'HR Recruitment AI', risk: 'HIGH' },
    { id: 'content-mod-v4', name: 'Content Moderation', risk: 'LIMITED' },
    { id: 'customer-service-v1', name: 'Customer Service', risk: 'HIGH' },
    { id: 'recommendation-v3', name: 'Recommendation Engine', risk: 'LIMITED' },
    { id: 'search-ranking-v2', name: 'Search Ranking', risk: 'LIMITED' }
  ];

  const handleMetricChange = (metric: keyof typeof metrics) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const handleAddSystem = () => {
    // Here you would implement the logic to add the system to monitoring
    console.log('Adding system to monitoring:', {
      selectedSystem,
      checkFrequency,
      metrics
    });
    onClose();
  };

  const selectedSystemData = mockRegisteredSystems.find(s => s.id === selectedSystem);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">ADD AI SYSTEM FOR MONITORING</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* System Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">System Selection *</label>
            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select from registered AI systems..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {mockRegisteredSystems.map((system) => (
                  <SelectItem key={system.id} value={system.id} className="text-slate-300">
                    <div className="flex items-center justify-between w-full">
                      <span>{system.name}</span>
                      <Badge variant="outline" className="text-xs ml-2">
                        {system.risk}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Info size={14} />
              <span>AI Systems are registered in Transparency & Human Oversight lens.</span>
              <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto text-xs">
                Register New System →
              </Button>
            </div>
          </div>

          {/* Monitoring Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">MONITORING CONFIGURATION</h3>

            {/* Check Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Check Frequency *</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="realtime"
                    name="frequency"
                    value="realtime"
                    checked={checkFrequency === 'realtime'}
                    onChange={(e) => setCheckFrequency(e.target.value)}
                    className="text-cyan-400 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="realtime" className="text-slate-300 text-sm">Real-time (every request)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="interval"
                    name="frequency"
                    value="interval"
                    checked={checkFrequency === 'interval'}
                    onChange={(e) => setCheckFrequency(e.target.value)}
                    className="text-cyan-400 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="interval" className="text-slate-300 text-sm">Interval (every 15 minutes)</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="hourly"
                    name="frequency"
                    value="hourly"
                    checked={checkFrequency === 'hourly'}
                    onChange={(e) => setCheckFrequency(e.target.value)}
                    className="text-cyan-400 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="hourly" className="text-slate-300 text-sm">Hourly</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="daily"
                    name="frequency"
                    value="daily"
                    checked={checkFrequency === 'daily'}
                    onChange={(e) => setCheckFrequency(e.target.value)}
                    className="text-cyan-400 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="daily" className="text-slate-300 text-sm">Daily</label>
                </div>
              </div>
            </div>

            {/* Metrics to Monitor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Metrics to Monitor *</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accuracy"
                    checked={metrics.accuracy}
                    onCheckedChange={() => handleMetricChange('accuracy')}
                    className="border-slate-700"
                  />
                  <label htmlFor="accuracy" className="text-slate-300 text-sm">Accuracy</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="robustness"
                    checked={metrics.robustness}
                    onCheckedChange={() => handleMetricChange('robustness')}
                    className="border-slate-700"
                  />
                  <label htmlFor="robustness" className="text-slate-300 text-sm">Robustness</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="security"
                    checked={metrics.security}
                    onCheckedChange={() => handleMetricChange('security')}
                    className="border-slate-700"
                  />
                  <label htmlFor="security" className="text-slate-300 text-sm">Security</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="latency"
                    checked={metrics.latency}
                    onCheckedChange={() => handleMetricChange('latency')}
                    className="border-slate-700"
                  />
                  <label htmlFor="latency" className="text-slate-300 text-sm">Latency</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uptime"
                    checked={metrics.uptime}
                    onCheckedChange={() => handleMetricChange('uptime')}
                    className="border-slate-700"
                  />
                  <label htmlFor="uptime" className="text-slate-300 text-sm">Uptime</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="drift"
                    checked={metrics.drift}
                    onCheckedChange={() => handleMetricChange('drift')}
                    className="border-slate-700"
                  />
                  <label htmlFor="drift" className="text-slate-300 text-sm">Drift Detection</label>
                </div>
              </div>
            </div>

            {/* Alert Thresholds */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Alert Thresholds</label>
              <Select defaultValue="default">
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Use default thresholds (recommended for risk level)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="default" className="text-slate-300">
                    Use default thresholds (recommended for risk level)
                  </SelectItem>
                  <SelectItem value="custom" className="text-slate-300">
                    Custom thresholds
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button
              onClick={handleAddSystem}
              disabled={!selectedSystem}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Add to Monitoring
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSystemModal;