import { useState, useEffect } from 'react';
import { UnifiedIncidentsData, IncidentsStats } from '../types';
import { API_BASE } from '@/utils/api-config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export function useIncidents() {
  const [data, setData] = useState<UnifiedIncidentsData | null>(null);
  const [stats, setStats] = useState<IncidentsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);

      const [incidentsResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/v1/incidents/unified`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE}/api/v1/incidents/stats/overview`, {
          headers: getAuthHeaders(),
        })
      ]);

      if (incidentsResponse.ok) {
        const incidentsData = await incidentsResponse.json();
        setData(incidentsData);
      } else if (incidentsResponse.status === 404) {
        // Endpoint not yet implemented - return empty data silently
        setData({
          totalIncidents: 0,
          activeIncidents: 0,
          criticalIncidents: 0,
          overdueIncidents: 0,
          incidents: [],
          deadlines: []
        });
      } else {
        console.error('Failed to fetch incidents:', incidentsResponse.status);
        setData({
          totalIncidents: 0,
          activeIncidents: 0,
          criticalIncidents: 0,
          overdueIncidents: 0,
          incidents: [],
          deadlines: []
        });
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else if (statsResponse.status === 404) {
        // Endpoint not yet implemented - return empty stats silently
        setStats({
          totalIncidents: 0,
          activeIncidents: 0,
          criticalIncidents: 0,
          overdueIncidents: 0,
          avgResponseTime: 0,
          slaCompliance: 100,
          gdprDeadlines: 0,
          doraDeadlines: 0,
          nis2Deadlines: 0,
          aiActIncidents: 0
        });
      } else {
        console.error('Failed to fetch stats:', statsResponse.status);
        setStats({
          totalIncidents: 0,
          activeIncidents: 0,
          criticalIncidents: 0,
          overdueIncidents: 0,
          avgResponseTime: 0,
          slaCompliance: 100,
          gdprDeadlines: 0,
          doraDeadlines: 0,
          nis2Deadlines: 0,
          aiActIncidents: 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load incidents');

      // Fallback data
      setData({
        totalIncidents: 0,
        activeIncidents: 0,
        criticalIncidents: 0,
        overdueIncidents: 0,
        incidents: [],
        deadlines: []
      });

      setStats({
        totalIncidents: 0,
        activeIncidents: 0,
        criticalIncidents: 0,
        overdueIncidents: 0,
        avgResponseTime: 0,
        slaCompliance: 100,
        gdprDeadlines: 0,
        doraDeadlines: 0,
        nis2Deadlines: 0,
        aiActIncidents: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchIncidents();
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return {
    data,
    stats,
    loading,
    error,
    refreshing,
    refreshData
  };
}