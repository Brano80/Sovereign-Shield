import { useState, useEffect } from 'react';
import { IncidentDeadline } from '../types';
import { API_BASE } from '@/utils/api-config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export function useDeadlines() {
  const [deadlines, setDeadlines] = useState<IncidentDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/v1/incidents/deadlines`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setDeadlines(data);
      } else {
        console.error('Failed to fetch deadlines:', response.status);
        setDeadlines([]);
      }
    } catch (err) {
      console.error('Failed to fetch deadlines:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deadlines');
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  };

  const getUrgentDeadlines = () => {
    const now = new Date().getTime();
    return deadlines
      .filter(deadline => deadline.status === 'PENDING')
      .map(deadline => ({
        ...deadline,
        timeRemaining: new Date(deadline.dueAt).getTime() - now
      }))
      .sort((a, b) => a.timeRemaining - b.timeRemaining)
      .slice(0, 8); // Top 8 most urgent
  };

  const getOverdueDeadlines = () => {
    const now = new Date().getTime();
    return deadlines.filter(deadline =>
      deadline.status === 'PENDING' &&
      new Date(deadline.dueAt).getTime() < now
    );
  };

  const getDeadlinesByUrgency = () => {
    const now = new Date().getTime();
    const urgent = deadlines.filter(d =>
      d.status === 'PENDING' &&
      new Date(d.dueAt).getTime() - now <= 4 * 60 * 60 * 1000 && // Within 4 hours
      new Date(d.dueAt).getTime() > now
    );

    const upcoming = deadlines.filter(d =>
      d.status === 'PENDING' &&
      new Date(d.dueAt).getTime() - now <= 24 * 60 * 60 * 1000 && // Within 24 hours
      new Date(d.dueAt).getTime() - now > 4 * 60 * 60 * 1000 // More than 4 hours
    );

    const future = deadlines.filter(d =>
      d.status === 'PENDING' &&
      new Date(d.dueAt).getTime() - now > 24 * 60 * 60 * 1000 // More than 24 hours
    );

    return {
      overdue: getOverdueDeadlines(),
      urgent,
      upcoming,
      future
    };
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  return {
    deadlines,
    loading,
    error,
    getUrgentDeadlines,
    getOverdueDeadlines,
    getDeadlinesByUrgency,
    refreshDeadlines: fetchDeadlines
  };
}