"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  User,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Link
} from 'lucide-react';

interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface CorrectiveActionsTrackerProps {
  actions: CorrectiveAction[];
  onUpdate: (actions: CorrectiveAction[]) => void;
}

export function CorrectiveActionsTracker({ actions, onUpdate }: CorrectiveActionsTrackerProps) {
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    owner: '',
    dueDate: '',
    priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW'
  });

  const addAction = () => {
    if (!newAction.title || !newAction.owner) return;

    const action: CorrectiveAction = {
      id: Date.now().toString(),
      ...newAction,
      status: 'PENDING'
    };

    onUpdate([...actions, action]);
    setNewAction({
      title: '',
      description: '',
      owner: '',
      dueDate: '',
      priority: 'MEDIUM'
    });
  };

  const updateAction = (id: string, updates: Partial<CorrectiveAction>) => {
    const updatedActions = actions.map(action =>
      action.id === id ? { ...action, ...updates } : action
    );
    onUpdate(updatedActions);
  };

  const deleteAction = (id: string) => {
    const filteredActions = actions.filter(action => action.id !== id);
    onUpdate(filteredActions);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: 'Pending' };
      case 'IN_PROGRESS':
        return { color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'In Progress' };
      case 'COMPLETED':
        return { color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Completed' };
      case 'VERIFIED':
        return { color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Verified' };
      default:
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: status };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'High' };
      case 'MEDIUM':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Medium' };
      case 'LOW':
        return { color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Low' };
      default:
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: priority };
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return { text: `${Math.abs(days)} days overdue`, urgent: true };
    }

    return { text: `${days} days remaining`, urgent: days <= 2 };
  };

  return (
    <div className="space-y-6">
      {/* Add New Action */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-white font-medium mb-4">Add Corrective Action</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-400">Action Title *</Label>
                <Input
                  value={newAction.title}
                  onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What needs to be done..."
                  className="bg-slate-900/50 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-400">Owner *</Label>
                <Select
                  value={newAction.owner}
                  onValueChange={(value) => setNewAction(prev => ({ ...prev, owner: value }))}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                    <SelectItem value="Michael Rodriguez">Michael Rodriguez</SelectItem>
                    <SelectItem value="Emma Thompson">Emma Thompson</SelectItem>
                    <SelectItem value="David Park">David Park</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-400">Description</Label>
              <Textarea
                value={newAction.description}
                onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the corrective action..."
                rows={2}
                className="bg-slate-900/50 border-slate-600 text-white mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-400">Due Date</Label>
                <Input
                  type="date"
                  value={newAction.dueDate}
                  onChange={(e) => setNewAction(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-slate-900/50 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-400">Priority</Label>
                <Select
                  value={newAction.priority}
                  onValueChange={(value) => setNewAction(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={addAction}
                  disabled={!newAction.title || !newAction.owner}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  <Plus size={14} className="mr-2" />
                  Add Action
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.map(action => {
          const statusConfig = getStatusConfig(action.status);
          const priorityConfig = getPriorityConfig(action.priority);
          const daysRemaining = getDaysRemaining(action.dueDate);

          return (
            <Card key={action.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{action.title}</h3>
                      <Badge className={`${priorityConfig.bgColor} text-white border-0`}>
                        {priorityConfig.label}
                      </Badge>
                      <Badge className={`${statusConfig.bgColor} text-white border-0`}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {action.description && (
                      <p className="text-slate-300 text-sm mb-3">{action.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-slate-400">{action.owner}</span>
                      </div>

                      {action.dueDate && (
                        <div className={`flex items-center gap-2 ${daysRemaining?.urgent ? 'text-red-400' : 'text-slate-400'}`}>
                          <Calendar size={14} />
                          <span>{daysRemaining?.text}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAction(action.id)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                {/* Status Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={action.status === 'COMPLETED' || action.status === 'VERIFIED'}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateAction(action.id, { status: 'COMPLETED' });
                          } else {
                            updateAction(action.id, { status: 'PENDING' });
                          }
                        }}
                        className="border-slate-600"
                      />
                      <Label className="text-slate-300 text-sm">Mark as completed</Label>
                    </div>

                    {action.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAction(action.id, { status: 'VERIFIED' })}
                        className="border-purple-600 text-purple-400 hover:bg-purple-900"
                      >
                        <Link size={14} className="mr-1" />
                        Link to Evidence
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {action.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAction(action.id, { status: 'IN_PROGRESS' })}
                        className="border-blue-600 text-blue-400 hover:bg-blue-900"
                      >
                        Start
                      </Button>
                    )}

                    {action.status === 'IN_PROGRESS' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAction(action.id, { status: 'COMPLETED' })}
                        className="border-green-600 text-green-400 hover:bg-green-900"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {actions.length === 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Corrective Actions</h3>
              <p className="text-slate-400">
                Add corrective actions to address the root cause and prevent future incidents.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {actions.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-white font-medium mb-4">Actions Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{actions.length}</p>
                <p className="text-sm text-slate-400">Total Actions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {actions.filter(a => a.status === 'IN_PROGRESS').length}
                </p>
                <p className="text-sm text-slate-400">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {actions.filter(a => a.status === 'COMPLETED' || a.status === 'VERIFIED').length}
                </p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {actions.filter(a => a.dueDate && getDaysRemaining(a.dueDate)?.urgent).length}
                </p>
                <p className="text-sm text-slate-400">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}