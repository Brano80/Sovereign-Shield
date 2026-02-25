"use client";

import { useState, useMemo } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { IncidentTable } from '../components/IncidentTable';
import { IncidentFilters } from '../components/IncidentFilters';
import { IncidentDetailModal } from '../modals/IncidentDetailModal';
import { NewIncidentWizard } from '../modals/NewIncidentWizard';
import { useIncidents } from '../hooks/useIncidents';
import type { Incident, Regulation, IncidentSeverity, IncidentStatus } from '../types';

export function AllIncidentsTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [selectedIncidents, setSelectedIncidents] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewWizard, setShowNewWizard] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: [] as IncidentStatus[],
    regulation: [] as Regulation[],
    severity: [] as IncidentSeverity[],
    dateRange: null as { start: Date; end: Date } | null,
    assignee: ''
  });

  const { data, loading, error, refreshData } = useIncidents();

  // Mock incidents data for development
  const mockIncidents = [
    {
      id: "INC-2025-047",
      title: "Data Breach - Customer Database Compromised",
      description: "Unauthorized access to customer database containing PII",
      regulations: ["GDPR"],
      severity: "CRITICAL",
      status: "ACTIVE",
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      classifiedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      resolvedAt: null,
      assignee: "Sarah Chen",
      deadline: new Date(Date.now() + 70 * 60 * 60 * 1000), // 70 hours from now
      evidenceSealLevel: "L3",
      reportType: "BREACH_NOTIFICATION"
    },
    {
      id: "INC-2025-046",
      title: "Major ICT Disruption - Payment System Outage",
      description: "Payment processing system unavailable for 45 minutes",
      regulations: ["DORA"],
      severity: "HIGH",
      status: "INVESTIGATING",
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      classifiedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
      resolvedAt: null,
      assignee: "Michael Rodriguez",
      deadline: new Date(Date.now() + 20 * 60 * 60 * 1000),
      evidenceSealLevel: "L2",
      reportType: "MAJOR_INCIDENT"
    },
    {
      id: "INC-2025-045",
      title: "Significant Incident - Email Service Compromised",
      description: "Email service disruption affecting critical communications",
      regulations: ["NIS2"],
      severity: "MEDIUM",
      status: "REPORTING",
      detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      classifiedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      assignee: "Emma Thompson",
      deadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
      evidenceSealLevel: "L3",
      reportType: "INCIDENT_NOTIFICATION"
    }
  ];

  const incidents: Incident[] = (data?.incidents || mockIncidents) as Incident[];

  // Filter and paginate incidents
  const filteredIncidents = useMemo(() => {
    let filtered = incidents.filter(incident => {
      // Search filter
      if (filters.search && !incident.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !incident.id.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(incident.status)) {
        return false;
      }

      // Regulation filter
      if (filters.regulation.length > 0 && !filters.regulation.some(reg => incident.regulations.includes(reg))) {
        return false;
      }

      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(incident.severity)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const incidentDate = new Date(incident.detectedAt);
        if (incidentDate < filters.dateRange.start || incidentDate > filters.dateRange.end) {
          return false;
        }
      }

      // Assignee filter
      if (filters.assignee && !incident.assignee?.toLowerCase().includes(filters.assignee.toLowerCase())) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [incidents, filters]);

  const totalPages = Math.ceil(filteredIncidents.length / pageSize);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleIncidentSelect = (incidentId: string, selected: boolean) => {
    if (selected) {
      setSelectedIncidents(prev => [...prev, incidentId]);
    } else {
      setSelectedIncidents(prev => prev.filter(id => id !== incidentId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIncidents(paginatedIncidents.map(inc => inc.id));
    } else {
      setSelectedIncidents([]);
    }
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    console.log(`Exporting ${selectedIncidents.length} incidents as ${format}`);
  };

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
      return { text: `-${Math.abs(hours)}h ${Math.abs(minutes)}m`, urgent: true };
    }
    return { text: `${hours}h ${minutes}m`, urgent: hours < 4 };
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">All Incidents</h2>
          <Badge className="bg-slate-700 text-slate-300">
            {filteredIncidents.length} total
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {selectedIncidents.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                {selectedIncidents.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Download size={14} className="mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Download size={14} className="mr-2" />
                Export PDF
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Refresh
          </Button>

          <Button
            onClick={() => setShowNewWizard(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={14} className="mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Filters */}
      <IncidentFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({
          search: '',
          status: [],
          regulation: [],
          severity: [],
          dateRange: null,
          assignee: ''
        })}
      />

      {/* Incident Table */}
      <IncidentTable
        incidents={paginatedIncidents}
        selectedIncidents={selectedIncidents}
        onIncidentSelect={handleIncidentSelect}
        onSelectAll={handleSelectAll}
        onViewIncident={handleViewIncident}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredIncidents.length)} of {filteredIncidents.length} incidents
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <ChevronLeft size={14} />
              Previous
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                  }
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedIncident(null);
          }}
        />
      )}

      {showNewWizard && (
        <NewIncidentWizard
          onClose={() => setShowNewWizard(false)}
          onComplete={(newIncident) => {
            setShowNewWizard(false);
            refreshData();
          }}
        />
      )}
    </div>
  );
}