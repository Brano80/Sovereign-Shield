"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Activity, Clock, User, AlertTriangle } from "lucide-react";
import { complianceApi } from "@/app/lib/api-client";

export default function IncidentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [incident, setIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setIsLoading(true);

        // Get auth token
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
          throw new Error('No authentication token found. Please use Developer Login on the Home Page.');
        }

        // Try to fetch by ID (UUID from backend)
        let responseData;
        try {
          responseData = await complianceApi.get<any>(`/incidents/${params.id}`);
        } catch (error) {
          // If not found and ID looks like an incident number (INC-...), try listing incidents and finding by incidentId
          if (params.id.startsWith('INC-')) {
            const listData = await complianceApi.get<any>('/incidents?limit=100');

            if ((listData as any).ok) {
              const incidents = await (listData as any).json();
              const foundIncident = incidents.find((inc: any) => inc.incident_id === params.id);
              if (foundIncident) {
                setIncident(foundIncident);
                setIsLoading(false);
                return;
              }
            }
          }
        }

        if (!(responseData as any).ok) {
          throw new Error(`Failed to fetch incident: ${(responseData as any).status}`);
        }

        const incidentData = await (responseData as any).json();
        setIncident(incidentData);
      } catch (err) {
        console.error('Failed to fetch incident:', err);
        setError(err instanceof Error ? err.message : 'Failed to load incident');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncident();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Incident Not Found</h2>
          <p className="text-slate-400">{error || "The requested incident could not be found."}</p>
          <button
            onClick={() => router.push('/dashboard/lenses/unified-incidents')}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{incident.incident_id}</h1>
                <p className="text-slate-400">{incident.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Incident Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                  <p className="text-white">{incident.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <p className="text-slate-400">{incident.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                    <p className="text-white">{incident.incident_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Severity</label>
                    <p className="text-white">{incident.severity}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Status</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    {incident.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Created</span>
                  <span className="text-white">{new Date(incident.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Detected</span>
                  <span className="text-white">{new Date(incident.discovery_time).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}