"use client";

import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Users
} from "lucide-react";
import { complianceApi } from "@/app/lib/api-client";

interface ErasureRequest {
  id: string;
  dataSubject: string;
  submitted: Date;
  dueDate: Date;
  grounds: string;
  scope: string;
  status: 'PENDING' | 'REVIEW' | 'APPROVED' | 'EXECUTING' | 'COMPLETED';
  exceptionReview?: boolean;
  exceptionReason?: string;
}

interface ErasureStats {
  pending: number;
  completedThisMonth: number;
  totalShredded: number;
  totalUsers: number;
}

export function ErasureTab() {
  const [selectedRequest, setSelectedRequest] = useState<ErasureRequest | null>(null);

  const stats: ErasureStats = {
    pending: 6,
    completedThisMonth: 34,
    totalShredded: 12400, // MB
    totalUsers: 847
  };

  const mockRequests: ErasureRequest[] = [
    {
      id: 'REQ-4521',
      dataSubject: 'john.doe@example.com',
      submitted: new Date('2025-01-05T14:20:00'),
      dueDate: new Date('2025-01-09'),
      grounds: 'Withdrawal of consent (Art. 17(1)(b))',
      scope: 'Complete erasure - all systems',
      status: 'PENDING',
      exceptionReview: false
    },
    {
      id: 'REQ-4510',
      dataSubject: 'alex.carter@example.com',
      submitted: new Date('2025-01-03T10:15:00'),
      dueDate: new Date('2025-02-02'),
      grounds: 'Data no longer necessary (Art. 17(1)(a))',
      scope: 'Marketing data only',
      status: 'REVIEW',
      exceptionReview: true,
      exceptionReason: 'Active contract found - partial erasure only?'
    }
  ];

  const mockDataToErase = [
    { source: 'Main Database', records: 2341, size: '4.5 MB', method: 'Crypto-Shred (AES-256)' },
    { source: 'CRM System', records: 156, size: '890 KB', method: 'Crypto-Shred (AES-256)' },
    { source: 'Analytics', records: 8923, size: '12 MB', method: 'Crypto-Shred (AES-256)' },
    { source: 'Email Archives', records: 567, size: '45 MB', method: 'Crypto-Shred (AES-256)' },
    { source: 'Backups', records: 0, size: '62 MB', method: 'Key Destruction' }
  ];

  const mockThirdPartyNotifications = [
    { processor: 'AWS Analytics', status: 'Notified', automated: true },
    { processor: 'Salesforce CRM', status: 'Notified', automated: true }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      REVIEW: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
      EXECUTING: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
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
          <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
            <Shield size={24} className="text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">RIGHT TO ERASURE (Article 17)</h2>
            <p className="text-slate-400 text-sm mb-2">&ldquo;Right to be Forgotten&rdquo; • Powered by Crypto-Shredder</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              The data subject shall have the right to obtain erasure of personal data concerning them without undue delay.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">PENDING</span>
            <AlertTriangle size={16} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.pending}</div>
          <div className="text-xs text-yellow-400 mt-1">⚠ 2 urgent</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">COMPLETED THIS MONTH</span>
            <CheckCircle size={16} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.completedThisMonth}</div>
          <div className="text-xs text-green-400 mt-1">↗ 8%</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">CRYPTO-SHREDDED</span>
            <HardDrive size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{(stats.totalShredded / 1000).toFixed(1)} TB</div>
          <div className="text-xs text-slate-500 mt-1">Total erased</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">USERS AFFECTED</span>
            <Users size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</div>
          <div className="text-xs text-slate-500 mt-1">Since inception</div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">PENDING ERASURE REQUESTS</h3>

        {mockRequests.map((request) => (
          <div key={request.id} className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-white">{request.id}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                    {request.status}
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

                <div className="space-y-1 text-sm text-slate-500">
                  <div>Submitted: {formatDate(request.submitted)} • Due: {formatDate(request.dueDate)}</div>
                  <div className="text-slate-400">Grounds: {request.grounds}</div>
                  <div className="text-slate-400">Scope: {request.scope}</div>
                </div>

                {request.exceptionReview && request.exceptionReason && (
                  <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle size={16} className="text-orange-400 mt-0.5" />
                      <div>
                        <div className="text-orange-400 font-medium text-sm">Exception Review Required</div>
                        <div className="text-orange-300 text-sm">{request.exceptionReason}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                {request.exceptionReview ? (
                  <>
                    <button className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-medium transition-colors">
                      Review Exception
                    </button>
                    <button className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors">
                      Partial Erasure
                    </button>
                    <button className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors">
                      Reject with Reason
                    </button>
                  </>
                ) : (
                  <>
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                      Run Pre-flight
                    </button>
                <button
                  onClick={async () => {
                    // Show confirmation modal first
                    if (window.confirm(`Are you sure you want to execute irreversible erasure for user ${request.dataSubject}? This action cannot be undone.`)) {
                      try {
                        const response = await complianceApi.post<any>('/lenses/gdpr-rights/erasure/execute', {
                          requestId: request.id,
                          userId: request.dataSubject.split('@')[0], // Extract user ID from email
                          grounds: request.grounds,
                          confirmation: `ERASE ${request.dataSubject.split('@')[0]}`
                        });

                        if (response.ok) {
                          const result = await response.json();
                          alert(`Erasure completed successfully! Certificate ID: ${result.certificate.id}`);
                          // Refresh the page or update state
                          window.location.reload();
                        } else {
                          const error = await response.json();
                          alert(`Erasure failed: ${error.message}`);
                        }
                      } catch (error) {
                        alert(`Error executing erasure: ${error}`);
                      }
                    }
                  }}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                >
                  Execute Crypto-Shred
                </button>
                    <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-600">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Shield size={20} className="mr-2 text-red-400" />
                EXECUTE ERASURE: {selectedRequest.id}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">DATA SUBJECT:</span>
                    <div className="text-white font-medium">{selectedRequest.dataSubject} (user_8892)</div>
                  </div>
                  <div>
                    <span className="text-slate-400">GROUNDS:</span>
                    <div className="text-white">{selectedRequest.grounds}</div>
                  </div>
                </div>
              </div>

              {/* Pre-flight Checklist */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <CheckCircle size={20} className="mr-2 text-green-400" />
                  PRE-FLIGHT CHECKLIST
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { check: 'Identity verified', status: true },
                    { check: 'No legal hold on data', status: true },
                    { check: 'No active contract requiring retention', status: true },
                    { check: 'No regulatory retention period active', status: true },
                    { check: 'No pending litigation', status: true },
                    { check: 'Third-party processors identified (2 found)', status: true }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-sm text-slate-300">{item.check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data to be Erased */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">DATA TO BE ERASED</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Source</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Records</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Size</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-600">
                      {mockDataToErase.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-white">{item.source}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{item.records.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{item.size}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{item.method}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-700/20">
                        <td className="px-4 py-3 text-sm font-medium text-white">TOTAL</td>
                        <td className="px-4 py-3 text-sm font-medium text-white">11,987</td>
                        <td className="px-4 py-3 text-sm font-medium text-white">124 MB</td>
                        <td className="px-4 py-3 text-sm text-slate-300">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Third-party Notifications */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">THIRD-PARTY NOTIFICATION (Art. 19)</h4>
                <div className="space-y-2">
                  {mockThirdPartyNotifications.map((notification, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/30 rounded">
                      <span className="text-sm text-white">{notification.processor} (processor)</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-400">✓ {notification.status}</span>
                        {notification.automated && (
                          <span className="text-xs text-slate-500">automatically</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning and Confirmation */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-red-400 mt-0.5" />
                  <div>
                    <h5 className="text-red-400 font-medium mb-2">⚠ WARNING: This operation is IRREVERSIBLE</h5>
                    <p className="text-red-300 text-sm">
                      All data will be cryptographically destroyed and cannot be recovered.
                      This action affects {selectedRequest.dataSubject} across all systems.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Confirmation: Type "ERASE user_8892" to confirm
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="ERASE user_8892"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400 flex items-center">
                    <Shield size={16} className="mr-2" />
                    Evidence: Erasure certificate will be sealed with L4 integrity
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors flex items-center">
                      <Shield size={16} className="mr-2" />
                      Execute Erasure
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
