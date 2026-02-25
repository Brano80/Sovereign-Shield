// dashboard/app/lib/api-client.ts
import { toast } from 'sonner';
import { getApiBase } from '../utils/api-config';

export const complianceApi = {
  async request<T>(endpoint: string, options: RequestInit & { timeout?: number } = {}): Promise<T> {
    const token = localStorage.getItem('auth_token'); // Tvoj kľúč pre JWT

    // Extract method and timeout from options, default to GET
    // Increased timeout from 3s to 10s to handle slower backend responses
    const { method = 'GET', headers: requestHeaders, timeout: timeoutMs = 10000, ...fetchOptions } = options;

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...requestHeaders,
    };

    try {
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const API_BASE_URL = getApiBase();
      console.log(`🔍 API Call: ${method} ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`🔍 API Response: ${response.status} for ${endpoint}`);

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        // Tu môžeš pridať redirect na login: window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`API Request Timeout [${endpoint}]: Request timed out after ${timeoutMs}ms`);
        throw new Error(`API unavailable - request timed out after ${timeoutMs}ms`);
      }
      
      // Handle network errors (CORS, connection refused, etc.)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        // Log as warning instead of error to reduce noise when backend is down
        console.warn(`API Request Failed [${endpoint}]: Network error - Backend may be unavailable or CORS issue`);
        const API_BASE_URL = getApiBase();
        throw new Error(`Failed to connect to backend at ${API_BASE_URL}. Please ensure the backend server is running and CORS is configured correctly.`);
      }
      
      // Only log non-network errors as errors
      if (!(error instanceof TypeError)) {
        console.error(`API Request Failed [${endpoint}]:`, error);
      } else {
        console.warn(`API Request Failed [${endpoint}]:`, error);
      }
      throw error;
    }
  },

  get: <T>(url: string, options?: { timeout?: number }) => complianceApi.request<T>(url, { method: 'GET', ...options }),
  post: <T>(url: string, body: any) => complianceApi.request<T>(url, {
    method: 'POST',
    body: JSON.stringify(body)
  }),

  // Evidence API functions
  getEvidenceEvents: () => complianceApi.get<{ events: any[], totalCount: number }>('/evidence/events'),
};