"use client";

import { useState } from "react";
import {
  Download,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Clock
} from "lucide-react";

interface PortabilityRequest {
  id: string;
  dataSubject: string;
  submitted: Date;
  dueDate: Date;
  format: 'JSON' | 'CSV' | 'XML' | 'PARQUET';
  scope: string;
  destination: 'DOWNLOAD' | 'DIRECT_TRANSFER';
  transferUrl?: string;
  status: 'NEW' | 'VERIFIED' | 'READY' | 'EXECUTING' | 'COMPLETED';
  size?: string;
  recordCount?: number;
}

interface CompletedExport {
  id: string;
  dataSubject: string;
  format: string;
  size: string;
  downloadUrl: string;
  completedDate: Date;
}

export function PortabilityTab() {
  const [selectedRequest, setSelectedRequest] = useState<PortabilityRequest | null>(null);

  const supportedFormats = [
    { name: 'JSON', description: 'Standard web format', icon: '📄' },
    { name: 'CSV', description: 'Spreadsheet compatible', icon: '📊' },
    { name: 'XML', description: 'Structured document format', icon: '📋' },
    { name: 'PARQUET', description: 'Analytics optimized', icon: '📈' }
  ];

  const mockRequests: PortabilityRequest[] = [
    {
      id: 'REQ-4515',
      dataSubject: 'peter.jones@example.com',
      submitted: new Date('2025-01-04T11:30:00'),
      dueDate: new Date('2025-02-03'),
      format: 'JSON',
      scope: 'All portable data',
      destination: 'DOWNLOAD',
      status: 'VERIFIED',
      size: '45 MB',
      recordCount: 1234
    },
    {
      id: 'REQ-4507',
      dataSubject: 'emma.white@example.com',
      submitted: new Date('2025-01-03T09:15:00'),
      dueDate: new Date('2025-02-01'),
      format: 'CSV',
      scope: 'Transaction history',
      destination: 'DIRECT_TRANSFER',
      transferUrl: 'https://competitor-service.com/api/transfer',
      status: 'READY',
      size: '234 MB',
      recordCount: 5678
    }
  ];

  const completedExports: CompletedExport[] = [
    {
      id: 'REQ-4489',
      dataSubject: 'user_4421@example.com',
      format: 'JSON',
      size: '45 MB',
      downloadUrl: '#',
      completedDate: new Date('2025-01-05')
    },
    {
      id: 'REQ-4478',
      dataSubject: 'user_3387@example.com',
      format: 'CSV',
      size: '12 MB',
      downloadUrl: '#',
      completedDate: new Date('2025-01-03')
    },
    {
      id: 'REQ-4465',
      dataSubject: 'user_2298@example.com',
      format: 'JSON',
      size: '89 MB',
      downloadUrl: '#',
      completedDate: new Date('2025-01-01')
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      VERIFIED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      READY: 'bg-green-500/20 text-green-400 border-green-500/30',
      EXECUTING: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return badges[status as keyof typeof badges] || badges.NEW;
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
          <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
            <Download size={24} className="text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">RIGHT TO DATA PORTABILITY (Article 20)</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Export personal data in machine-readable format to the data subject or another controller.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">EXPORT FORMATS SUPPORTED</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {supportedFormats.map((format) => (
            <div key={format.name} className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">{format.icon}</div>
              <div className="font-semibold text-white">{format.name}</div>
              <div className="text-xs text-slate-400">{format.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">PENDING EXPORT REQUESTS</h3>

        {mockRequests.map((request) => (
          <div key={request.id} className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-white">{request.id}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                  {getDaysRemaining(request.dueDate) <= 7 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">
                      <Clock size={12} className="mr-1" />
                      {getDaysRemaining(request.dueDate)} days
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-sm mb-2">
                  Data Subject: <span className="text-white">{request.dataSubject}</span>
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Format:</span>
                    <div className="text-white font-medium">{request.format}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Scope:</span>
                    <div className="text-white">{request.scope}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Destination:</span>
                    <div className="text-white">
                      {request.destination === 'DOWNLOAD' ? 'Download' : 'Direct Transfer'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Submitted:</span>
                    <div className="text-slate-300">{formatDate(request.submitted)}</div>
                  </div>
                </div>

                {request.destination === 'DIRECT_TRANSFER' && request.transferUrl && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <div className="flex items-center space-x-2">
                      <ExternalLink size={16} className="text-blue-400" />
                      <span className="text-sm text-blue-400">
                        Transfer to: {request.transferUrl}
                      </span>
                    </div>
                  </div>
                )}

                {request.status === 'READY' && request.size && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-sm text-green-400">
                        Export ready ({request.size}) • {request.recordCount?.toLocaleString()} records
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                {request.status === 'NEW' && (
                  <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                    Verify Identity
                  </button>
                )}
                {request.status === 'VERIFIED' && (
                  <>
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </>
                )}
                {request.status === 'READY' && (
                  <>
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                      Preview Export
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
                    >
                      {request.destination === 'DOWNLOAD' ? 'Download' : 'Execute Transfer'}
                    </button>
                    {request.destination === 'DIRECT_TRANSFER' && (
                      <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                        Download Instead
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completed Exports */}
      <div>
        <h3 className="text-lg font-semibold mb-4">COMPLETED EXPORTS</h3>
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Data Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Format</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600">
                {completedExports.map((exportItem) => (
                  <tr key={exportItem.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-slate-300">{exportItem.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">{exportItem.dataSubject}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white">{exportItem.format}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">{exportItem.size}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">{formatDate(exportItem.completedDate)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                        <Download size={14} className="mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-600 rounded-lg max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-600">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Download size={20} className="mr-2 text-green-400" />
                {selectedRequest.destination === 'DOWNLOAD' ? 'DOWNLOAD' : 'EXECUTE TRANSFER'}: {selectedRequest.id}
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
                    <div className="text-white font-medium">{selectedRequest.dataSubject}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">FORMAT:</span>
                    <div className="text-white font-medium">{selectedRequest.format}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">SCOPE:</span>
                    <div className="text-white">{selectedRequest.scope}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">SIZE:</span>
                    <div className="text-white font-medium">{selectedRequest.size}</div>
                  </div>
                </div>
              </div>

              {selectedRequest.destination === 'DIRECT_TRANSFER' && selectedRequest.transferUrl && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <ExternalLink size={20} className="text-blue-400" />
                    <div>
                      <div className="text-blue-400 font-medium">Direct Transfer</div>
                      <div className="text-blue-300 text-sm">Data will be transferred to: {selectedRequest.transferUrl}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-yellow-400 mt-0.5" />
                  <div>
                    <h5 className="text-yellow-400 font-medium mb-1">Export Confirmation</h5>
                    <p className="text-yellow-300 text-sm">
                      This will create a {selectedRequest.format} export of {selectedRequest.recordCount?.toLocaleString()} records
                      totaling {selectedRequest.size}. The export will be sealed to Evidence Graph with L2 integrity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors flex items-center">
                  <Download size={16} className="mr-2" />
                  {selectedRequest.destination === 'DOWNLOAD' ? 'Download Export' : 'Execute Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
