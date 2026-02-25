"use client";

import { useState, useMemo } from "react";
import {
  Search,
  AlertTriangle
} from "lucide-react";

interface RequestItem {
  id: string;
  type: 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'RESTRICTION' | 'PORTABILITY' | 'OBJECTION';
  dataSubject: string;
  submitted: Date;
  dueDate: Date;
  status: 'NEW' | 'URGENT' | 'VERIFY' | 'IN_PROGRESS' | 'DONE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export function AllRequestsTab() {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Mock data - in real implementation this would come from API
  const mockRequests: RequestItem[] = [
    {
      id: 'REQ-4523',
      type: 'ACCESS',
      dataSubject: 'user_9012@example.com',
      submitted: new Date('2025-01-07T09:35:00'),
      dueDate: new Date('2025-02-06'),
      status: 'NEW',
      priority: 'MEDIUM'
    },
    {
      id: 'REQ-4521',
      type: 'ERASURE',
      dataSubject: 'john.doe@example.com',
      submitted: new Date('2025-01-05T14:20:00'),
      dueDate: new Date('2025-01-09'),
      status: 'URGENT',
      priority: 'CRITICAL'
    },
    {
      id: 'REQ-4518',
      type: 'ACCESS',
      dataSubject: 'maria.smith@example.com',
      submitted: new Date('2025-01-04T14:15:00'),
      dueDate: new Date('2025-01-10'),
      status: 'URGENT',
      priority: 'CRITICAL'
    },
    {
      id: 'REQ-4515',
      type: 'PORTABILITY',
      dataSubject: 'peter.jones@example.com',
      submitted: new Date('2025-01-04T11:30:00'),
      dueDate: new Date('2025-02-03'),
      status: 'VERIFY',
      priority: 'MEDIUM'
    },
    {
      id: 'REQ-4512',
      type: 'RECTIFICATION',
      dataSubject: 'anna.novak@example.com',
      submitted: new Date('2025-01-03T16:45:00'),
      dueDate: new Date('2025-02-02'),
      status: 'IN_PROGRESS',
      priority: 'HIGH'
    }
  ];

  // Filter requests
  const filteredRequests = useMemo(() => {
    return mockRequests.filter(request => {
      // Search filter
      if (searchTerm && !request.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !request.dataSubject.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && request.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && request.type !== typeFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && request.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [mockRequests, searchTerm, statusFilter, typeFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(filteredRequests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ACCESS': return '📥';
      case 'ERASURE': return '🗑️';
      case 'RECTIFICATION': return '✏️';
      case 'RESTRICTION': return '⏸️';
      case 'PORTABILITY': return '📤';
      case 'OBJECTION': return '🚫';
      default: return '📋';
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      URGENT: 'bg-red-500/20 text-red-400 border-red-500/30',
      VERIFY: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      DONE: 'bg-green-500/20 text-green-400 border-green-500/30'
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

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">ALL DATA SUBJECT REQUESTS</h2>
        <div className="flex items-center space-x-4">
          {selectedRequests.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">
                {selectedRequests.length} selected
              </span>
              <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
                Bulk Actions ▼
              </button>
            </div>
          )}
          <button
            onClick={() => window.open('/api/v1/lenses/gdpr-rights/export/requests-csv', '_blank')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
          >
            Export CSV
          </button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="NEW">New</option>
            <option value="URGENT">Urgent</option>
            <option value="VERIFY">Verify</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Types</option>
            <option value="ACCESS">Access</option>
            <option value="RECTIFICATION">Rectification</option>
            <option value="ERASURE">Erasure</option>
            <option value="RESTRICTION">Restriction</option>
            <option value="PORTABILITY">Portability</option>
            <option value="OBJECTION">Objection</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Date Range */}
          <input
            type="date"
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Date range"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-600 text-blue-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Data Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {paginatedRequests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                      className="rounded border-slate-600 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-slate-300">{request.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(request.type)}</span>
                      <span className="text-sm text-slate-300">{request.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">{request.dataSubject}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">{formatDate(request.submitted)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <span className={`text-sm ${isOverdue(request.dueDate) ? 'text-red-400' : 'text-slate-400'}`}>
                        {formatDate(request.dueDate)}
                      </span>
                      {isOverdue(request.dueDate) && (
                        <AlertTriangle size={12} className="text-red-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">No requests match the current filters</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 rounded text-sm transition-colors"
            >
              ← Prev
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 rounded text-sm transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
