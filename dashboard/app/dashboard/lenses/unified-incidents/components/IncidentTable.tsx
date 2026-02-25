"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  FileText,
  User,
  Clock,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { IncidentStatusBadge } from './IncidentStatusBadge';
import { RegulationBadge } from './RegulationBadge';
import { SeverityBadge } from './SeverityBadge';
import type { Incident } from '../types';

interface IncidentTableProps {
  incidents: Incident[];
  selectedIncidents: string[];
  onIncidentSelect: (incidentId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewIncident: (incident: Incident) => void;
  loading?: boolean;
}

type SortField = 'id' | 'title' | 'detectedAt' | 'deadline' | 'assignee';
type SortDirection = 'asc' | 'desc';

export function IncidentTable({
  incidents,
  selectedIncidents,
  onIncidentSelect,
  onSelectAll,
  onViewIncident,
  loading = false
}: IncidentTableProps) {
  const [sortField, setSortField] = useState<SortField>('detectedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedIncidents = [...incidents].sort((a, b) => {
    let aVal: any, bVal: any;

    switch (sortField) {
      case 'id':
        aVal = a.id;
        bVal = b.id;
        break;
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'detectedAt':
        aVal = new Date(a.detectedAt).getTime();
        bVal = new Date(b.detectedAt).getTime();
        break;
      case 'deadline':
        aVal = a.deadline ? new Date(a.deadline.dueAt).getTime() : Infinity;
        bVal = b.deadline ? new Date(b.deadline.dueAt).getTime() : Infinity;
        break;
      case 'assignee':
        aVal = a.assignee || '';
        bVal = b.assignee || '';
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const formatDateTime = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTimeRemaining = (deadline: import('../types').IncidentDeadline | null | undefined) => {
    if (!deadline) return { text: 'No deadline', urgent: false };

    const now = new Date();
    const diff = new Date(deadline.dueAt).getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
      return {
        text: `-${Math.abs(hours)}h ${Math.abs(minutes)}m`,
        urgent: true,
        overdue: true
      };
    }

    if (hours < 4) {
      return { text: `${hours}h ${minutes}m`, urgent: true, overdue: false };
    }

    return { text: `${hours}h ${minutes}m`, urgent: false, overdue: false };
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium text-slate-300 hover:text-white hover:bg-transparent"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ?
          <ChevronUp size={14} className="ml-1" /> :
          <ChevronDown size={14} className="ml-1" />
      )}
    </Button>
  );

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Loading incidents...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/70">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedIncidents.length === sortedIncidents.length && sortedIncidents.length > 0}
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                  className="border-slate-600"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="id">ID</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="title">Title</SortButton>
              </th>
              <th className="px-4 py-3 text-left">Regulation</th>
              <th className="px-4 py-3 text-left">Severity</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">
                <SortButton field="detectedAt">Detected</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="deadline">Next Deadline</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="assignee">Assignee</SortButton>
              </th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedIncidents.map((incident) => {
              const timeRemaining = getTimeRemaining(incident.deadline);
              const isSelected = selectedIncidents.includes(incident.id);

              return (
                <tr
                  key={incident.id}
                  className={`border-t border-slate-700 hover:bg-slate-800/30 ${
                    isSelected ? 'bg-slate-800/50' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onIncidentSelect(incident.id, checked as boolean)}
                      className="border-slate-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded">
                      {incident.id}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="text-white font-medium truncate" title={incident.title}>
                        {incident.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {incident.regulations.map(reg => (
                          <RegulationBadge key={reg} regulation={reg} size="sm" />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <IncidentStatusBadge status={incident.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">
                      {formatDateTime(incident.detectedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {incident.deadline ? (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={timeRemaining.urgent ? 'text-red-400' : 'text-slate-400'} />
                        <span className={`text-sm font-medium ${
                          timeRemaining.overdue ? 'text-red-400' :
                          timeRemaining.urgent ? 'text-orange-400' : 'text-slate-300'
                        }`}>
                          {timeRemaining.text}
                        </span>
                        {timeRemaining.urgent && (
                          <AlertTriangle size={12} className="text-red-400" />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {incident.assignee ? (
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-300">{incident.assignee}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewIncident(incident)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <FileText size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedIncidents.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No incidents found</h3>
          <p className="text-slate-400">
            Try adjusting your filters or create a new incident.
          </p>
        </div>
      )}
    </div>
  );
}
