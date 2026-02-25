"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Calendar,
  Users,
  Send,
  TrendingUp
} from "lucide-react";

interface DisclosureTemplate {
  id: string;
  name: string;
  usedBy: string;
  type: 'DECISION' | 'ACTION' | 'INTERACTION' | 'SUGGESTION';
  lastUpdated: Date;
  status: 'ACTIVE' | 'REVIEW' | 'DRAFT';
  requiredElements: string[];
}

interface DisclosureEvent {
  timestamp: Date;
  userId: string;
  systemName: string;
  disclosureType: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
}

interface DisclosuresTabProps {
  disclosureTemplates: DisclosureTemplate[];
  disclosureEvents: DisclosureEvent[];
  showTemplateEditor: DisclosureTemplate | null;
  setShowTemplateEditor: (template: DisclosureTemplate | null) => void;
}

export function DisclosuresTab({
  disclosureTemplates,
  disclosureEvents,
  showTemplateEditor,
  setShowTemplateEditor
}: DisclosuresTabProps) {
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter templates
  const filteredTemplates = disclosureTemplates.filter(template => {
    if (selectedType !== 'ALL' && template.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && template.status !== selectedStatus) return false;
    return true;
  });

  // Filter events
  const filteredEvents = disclosureEvents.slice(0, 20); // Show last 20 events

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle size={16} className="text-green-400" />;
      case 'FAILED': return <XCircle size={16} className="text-red-400" />;
      case 'PENDING': return <Clock size={16} className="text-yellow-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getTemplateStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
      REVIEW: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      DRAFT: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">AI DISCLOSURE MANAGEMENT</h2>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
          onClick={() => setShowTemplateEditor({
            id: 'new',
            name: '',
            usedBy: '',
            type: 'DECISION',
            lastUpdated: new Date(),
            status: 'DRAFT',
            requiredElements: []
          })}
        >
          <Plus size={16} />
          <span>Create Template</span>
        </button>
      </div>

      <p className="text-slate-400">
        Art. 13 (Transparency) • Art. 50 (GPAI) • Art. 52 (Certain AI Systems)
      </p>

      {/* Compliance Overview */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6">COMPLIANCE OVERVIEW</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Disclosure Coverage */}
          <div className="text-center">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Disclosure Coverage</h4>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.992)}`}
                    className="text-green-400"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-green-400">99.2%</div>
                  <div className="text-xs text-slate-500">6/6 systems</div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Rate */}
          <div className="text-center">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Delivery Rate</h4>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.998)}`}
                    className="text-blue-400"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-blue-400">99.8%</div>
                  <div className="text-xs text-slate-500">Delivered OK</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Awareness */}
          <div className="text-center">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-400 mb-2">User Awareness</h4>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - 0.94)}`}
                    className="text-yellow-400"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-yellow-400">94%</div>
                  <div className="text-xs text-slate-500">Acknowledged</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclosure Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">DISCLOSURE TEMPLATES</h3>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="DECISION">Decision</option>
              <option value="ACTION">Action</option>
              <option value="INTERACTION">Interaction</option>
              <option value="SUGGESTION">Suggestion</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="REVIEW">Review</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-600 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Used By
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText size={16} className="text-slate-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-white">{template.name}</div>
                        <div className="text-xs text-slate-500">
                          {template.requiredElements.length} elements
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">{template.usedBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300 capitalize">
                      {template.type.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">{formatDate(template.lastUpdated)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTemplateStatusBadge(template.status)}`}>
                      {template.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowTemplateEditor(template)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-300 transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Templates Found</h3>
              <p className="text-slate-400 mb-6">
                {selectedType !== 'ALL' || selectedStatus !== 'ALL'
                  ? 'No templates match the current filters'
                  : 'No disclosure templates have been created yet'
                }
              </p>
              {(selectedType !== 'ALL' || selectedStatus !== 'ALL') && (
                <button
                  onClick={() => {
                    setSelectedType('ALL');
                    setSelectedStatus('ALL');
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Disclosure Events */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">RECENT DISCLOSURE EVENTS</h3>

        <div className="bg-slate-800/50 border border-slate-600 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  System
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {filteredEvents.map((event, index) => (
                <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-slate-300">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300 font-mono">{event.userId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">{event.systemName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300 capitalize">
                      {event.disclosureType.toLowerCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(event.status)}
                      <span className="text-sm text-slate-300 capitalize">
                        {event.status.toLowerCase()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Send size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Disclosure Events</h3>
              <p className="text-slate-400">No disclosure events have been recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Disclosure Template Editor Modal Component
interface DisclosureTemplateEditorProps {
  template: DisclosureTemplate;
  onClose: () => void;
  onSave: (template: DisclosureTemplate) => void;
}

export function DisclosureTemplateEditor({
  template,
  onClose,
  onSave
}: DisclosureTemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<DisclosureTemplate>(template);
  const [templateContent, setTemplateContent] = useState(`# Decision Notice

This decision regarding your {{request_type}} was made with the assistance of an automated system.

**Decision:** {{decision_outcome}}
**Key Factors:** {{explanation_summary}}

You have the right to:
- Request a detailed explanation
- Request human review of this decision
- Contest this decision

[Request Explanation] [Request Human Review] [Contest Decision]`);

  const [previewMode, setPreviewMode] = useState(false);

  const requiredElements = [
    'AI involvement statement',
    'Purpose of processing',
    'Logic involved (plain language)',
    'Significance and consequences',
    'Right to human review',
    'Right to contest decision',
    'Right to explanation',
    'Contact information'
  ];

  const handleSave = () => {
    onSave(editedTemplate);
  };

  const renderPreview = () => {
    return templateContent
      .replace('{{request_type}}', 'personal loan application')
      .replace('{{decision_outcome}}', 'DENIED')
      .replace('{{explanation_summary}}', 'Debt-to-income ratio (42%) exceeds threshold (35%)');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold">
            {template.id === 'new' ? 'CREATE DISCLOSURE TEMPLATE' : 'EDIT DISCLOSURE TEMPLATE'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={editedTemplate.name}
                onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., credit-disclosure-v2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Type
              </label>
              <select
                value={editedTemplate.type}
                onChange={(e) => setEditedTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DECISION">Decision Notice</option>
                <option value="ACTION">Action Notice</option>
                <option value="INTERACTION">Interaction Notice</option>
                <option value="SUGGESTION">Suggestion Notice</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Used By
            </label>
            <input
              type="text"
              value={editedTemplate.usedBy}
              onChange={(e) => setEditedTemplate(prev => ({ ...prev, usedBy: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Credit Scoring Engine"
            />
          </div>

          {/* Required Elements Checklist */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">REQUIRED ELEMENTS (Art. 13, 22)</h3>
              <span className="text-green-400 font-semibold">
                ☑ All {requiredElements.length} elements
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requiredElements.map((element, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-400">☑</span>
                  <span className="text-sm text-slate-300">{element}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Template Content */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">TEMPLATE CONTENT</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                >
                  {previewMode ? 'Edit' : 'Preview'}
                </button>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                  Test Delivery
                </button>
              </div>
            </div>

            {!previewMode ? (
              <textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                className="w-full h-64 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter template content with variables..."
              />
            ) : (
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">PREVIEW</h4>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-300">
                    {renderPreview()}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
