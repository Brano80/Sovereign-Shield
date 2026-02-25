"use client";

import { useState } from "react";
import {
  Eye,
  CheckCircle,
  AlertTriangle,
  Shield,
  Clock
} from "lucide-react";

interface AccessRequest {
  id: string;
  dataSubject: string;
  submitted: Date;
  dueDate: Date;
  status: 'NEW' | 'VERIFIED' | 'IN_PROGRESS' | 'COMPLETED';
  scope: string[];
  verified: boolean;
  progress: number;
  assignedTo?: string;
}

interface DataSource {
  source: string;
  status: 'COLLECTED' | 'PENDING' | 'FAILED';
  records: number;
  size: string;
}

export function AccessTab() {
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);

  // Mock data
  const mockRequests: AccessRequest[] = [
    {
      id: 'REQ-4523',
      dataSubject: 'user_9012@example.com',
      submitted: new Date('2025-01-07T09:35:00'),
      dueDate: new Date('2025-02-06'),
      status: 'NEW',
      scope: ['All personal data', 'Processing purposes'],
      verified: false,
      progress: 0,
      assignedTo: undefined
    },
    {
      id: 'REQ-4518',
      dataSubject: 'maria.smith@example.com',
      submitted: new Date('2025-01-04T14:15:00'),
      dueDate: new Date('2025-01-10'),
      status: 'IN_PROGRESS',
      scope: ['All personal data', 'Processing purposes', 'Data categories'],
      verified: true,
      progress: 80,
      assignedTo: '@compliance'
    }
  ];

  const mockDataSources: DataSource[] = [
    { source: 'Main Database', status: 'COLLECTED', records: 1247, size: '2.3 MB' },
    { source: 'CRM System', status: 'COLLECTED', records: 89, size: '450 KB' },
    { source: 'Analytics Platform', status: 'PENDING', records: 0, size: '—' },
    { source: 'Email Archives', status: 'COLLECTED', records: 234, size: '12 MB' },
    { source: 'Support Tickets', status: 'COLLECTED', records: 12, size: '89 KB' }
  ];

  const getStatusBadge = (status: string, verified: boolean) => {
    if (!verified && status === 'NEW') {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }

    const badges = {
      NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      VERIFIED: 'bg-green-500/20 text-green-400 border-green-500/30',
      IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return badges[status as keyof typeof badges] || badges.NEW;
  };

  const getDataSourceStatusIcon = (status: string) => {
    switch (status) {
      case 'COLLECTED': return <CheckCircle size={16} className="text-green-400" />;
      case 'PENDING': return <Clock size={16} className="text-yellow-400" />;
      case 'FAILED': return <AlertTriangle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Eye size={24} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">RIGHT OF ACCESS (Article 15)</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              &ldquo;The data subject shall have the right to obtain confirmation and access to their personal data and information about processing.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">PENDING REQUESTS</span>
            <Eye size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">8</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">COMPLETED THIS MONTH</span>
            <CheckCircle size={16} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">45</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">AVG PROCESSING TIME</span>
            <Clock size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">3.2 days</div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">PENDING REQUESTS</h3>

        {mockRequests.map((request) => (
          <div key={request.id} className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-white">{request.id}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(request.status, request.verified)}`}>
                    {request.verified ? 'VERIFIED' : request.status.replace('_', ' ')}
                  </span>
                  {getDaysRemaining(request.dueDate) <= 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                      <AlertTriangle size={12} className="mr-1" />
                      {getDaysRemaining(request.dueDate)} days
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-2">
                  Data Subject: <span className="text-white">{request.dataSubject}</span>
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>Submitted: {formatDate(request.submitted)}</span>
                  <span>Due: {formatDate(request.dueDate)}</span>
                  {request.assignedTo && <span>Assigned: {request.assignedTo}</span>}
                </div>
              </div>

              <div className="flex space-x-2">
                {!request.verified && (
                  <button className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium transition-colors">
                    Verify Identity
                  </button>
                )}
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                >
                  Start Processing
                </button>
                <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                  View Details
                </button>
              </div>
            </div>

            {/* Scope */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-slate-400 mb-2">REQUEST SCOPE</h5>
              <div className="flex flex-wrap gap-2">
                {request.scope.map((item, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress */}
            {request.status === 'IN_PROGRESS' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Progress</span>
                  <span className="text-sm text-white">{request.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${request.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-600">
              <h3 className="text-xl font-bold text-white">ACCESS REQUEST: {selectedRequest.id}</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">REQUEST INFO</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ID:</span>
                      <span className="text-white font-mono">{selectedRequest.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Submitted:</span>
                      <span className="text-white">{formatDate(selectedRequest.submitted)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Due Date:</span>
                      <span className={`font-medium ${getDaysRemaining(selectedRequest.dueDate) <= 3 ? 'text-red-400' : 'text-white'}`}>
                        {formatDate(selectedRequest.dueDate)}
                        {getDaysRemaining(selectedRequest.dueDate) <= 3 && ` (${getDaysRemaining(selectedRequest.dueDate)} days)`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusBadge(selectedRequest.status, selectedRequest.verified)}`}>
                        {selectedRequest.verified ? 'VERIFIED' : selectedRequest.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">DATA SUBJECT</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white">{selectedRequest.dataSubject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">User ID:</span>
                      <span className="text-white font-mono">user_9012</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verified:</span>
                      <span className="text-green-400">✓ Jan 07, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Previous Requests:</span>
                      <span className="text-white">1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Scope Checklist */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">REQUEST SCOPE</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    'All personal data held',
                    'Purposes of processing',
                    'Categories of data',
                    'Recipients or categories of recipients',
                    'Retention periods',
                    'Source of data (if not from subject)',
                    'Existence of automated decision-making'
                  ].map((item, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedRequest.scope.includes(item)}
                        readOnly
                        className="rounded border-slate-600 text-blue-600"
                      />
                      <span className="text-sm text-slate-300">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Discovery */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">DATA DISCOVERY</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Source</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Records</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Size</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600">
                      {mockDataSources.map((source, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-white">{source.source}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              {getDataSourceStatusIcon(source.status)}
                              <span className="text-sm text-slate-300">{source.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">{source.records.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{source.size}</td>
                          <td className="px-4 py-3">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              {source.status === 'PENDING' ? 'Fetch' : 'Preview'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Response Preparation */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">RESPONSE PREPARATION</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Format</label>
                    <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>PDF Report + JSON Export</option>
                      <option>PDF Report Only</option>
                      <option>JSON Export Only</option>
                      <option>XML Export</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Include</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-slate-600 text-blue-600" />
                        <span className="text-sm text-slate-300">Cover letter</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-slate-600 text-blue-600" />
                        <span className="text-sm text-slate-300">Data inventory</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-slate-600 text-blue-600" />
                        <span className="text-sm text-slate-300">Processing info</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Shield size={16} />
                    <span>Response will be sealed to Evidence Graph with L2 integrity</span>
                  </div>

                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
                      Preview Response
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                      Generate Final Package
                    </button>
                    <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors">
                      Send to Data Subject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
