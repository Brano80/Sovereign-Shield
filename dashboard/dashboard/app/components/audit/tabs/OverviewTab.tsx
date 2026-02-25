"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/app/utils/api-config";
import {
  Shield,
  Database,
  Clock,
  FileText,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Lock
} from "lucide-react";

interface EvidenceEntry {
  id: string;
  event_id: string;
  event_type: string;
  severity: string;
  system_id: string;
  description: string;
  detected_at: string;
  resolution_status: string;
  affected_records_count?: number;
  created_at: string;
  updated_at: string;
}

export function OverviewTab() {
  const [entries, setEntries] = useState<EvidenceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidenceEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const apiUrl = `/api/v1/evidence/events?limit=20`;
      console.log('Fetching evidence from:', apiUrl, '(will be rewritten to localhost:8080)');

      const response = await fetch(apiUrl, {
        method: 'GET', // Explicitly specify GET method
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Evidence API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // DEBUG: Log the exact JSON structure from backend
      console.log('Real evidence data received:', data);
      console.log('Number of evidence entries:', data.events ? data.events.length : 'No events property');

      setEntries(data.events || []);
    } catch (err) {
      console.error('Failed to fetch evidence entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load evidence entries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidenceEntries();
  }, []);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };

    return colors[severity.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      investigating: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading evidence vault...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error}</p>
          <Button
            onClick={fetchEvidenceEntries}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Evidence Vault Overview</h2>
          <p className="text-muted-foreground">
            Cryptographically sealed audit trail and evidence records
          </p>
        </div>
        <Button onClick={fetchEvidenceEntries} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {entries.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {entries.filter(e => e.resolution_status === 'RESOLVED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {entries.filter(e => e.resolution_status === 'OPEN').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Evidence Entries</CardTitle>
          <CardDescription>
            Latest audit trail records from the evidence vault
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No evidence entries found</p>
              <p className="text-sm">Evidence records will appear here as the system processes compliance events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1">
                    {getSeverityIcon(entry.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{entry.event_id}</h4>
                      <Badge className={getSeverityBadge(entry.severity)}>
                        {entry.severity}
                      </Badge>
                      <Badge className={getStatusBadge(entry.resolution_status)}>
                        {entry.resolution_status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {entry.description} ({entry.affected_records_count || 0} records affected)
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>System: {entry.system_id}</span>
                      <span>Detected: {new Date(entry.detected_at).toLocaleString()}</span>
                      <span>Event Type: {entry.event_type}</span>
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Seal: {entry.id.substring(0, 8)}...
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {entries.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing 10 of {entries.length} entries
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
