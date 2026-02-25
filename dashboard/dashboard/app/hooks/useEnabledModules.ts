"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export interface EnabledModule {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: "core" | "operational" | "integration" | "regulatory";
  enabled: boolean;
  requires_license: boolean;
  display_category?: string; // e.g., "gdpr_subject_rights", "aia_prohibited", "dora_inventory"
}

export function useEnabledModules() {
  const queryClient = useQueryClient();

  // Listen for module config changes from SSE stream
  useEffect(() => {
    const handleModuleConfigChanged = () => {
      console.log("useEnabledModules: Module config changed event received, invalidating cache");
      queryClient.invalidateQueries({ queryKey: ["enabled-modules"] });
    };

    window.addEventListener('module-config-changed', handleModuleConfigChanged);
    
    return () => {
      window.removeEventListener('module-config-changed', handleModuleConfigChanged);
    };
  }, [queryClient]);

  return useQuery<EnabledModule[]>({
    queryKey: ["enabled-modules"],
    queryFn: async () => {
      try {
        console.log("useEnabledModules: Fetching enabled modules...");
        const { getApiBase } = await import("../utils/api-config");
        const base = getApiBase();
        const url = `${base}/my/enabled-modules?all=true`;
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 404) {
          console.warn("useEnabledModules: /my/enabled-modules not implemented (404), using empty list");
          return [];
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || `API Error: ${res.status}`);
        }
        const data = await res.json();
        const modules = data.modules || [];
        console.log(`useEnabledModules: Found ${modules.length} enabled modules`, modules);
        return modules;
      } catch (error: any) {
        // Handle network errors gracefully (backend might be down)
        if (error.message?.includes('Failed to connect') || 
            error.message?.includes('Network error') ||
            error.message?.includes('timed out') ||
            error.message?.includes('Backend may be unavailable')) {
          console.warn("useEnabledModules: Backend unavailable - returning empty array");
          return [];
        }

        if (error.message?.includes('Unauthorized') || error.status === 401) {
          console.warn("useEnabledModules: Unauthorized (401) - Please log in again");
          return [];
        }
        if (error.status === 403) {
          console.warn("useEnabledModules: Forbidden (403) - Access denied");
          return [];
        }
        
        // For other errors, return empty array instead of throwing to prevent UI crashes
        console.warn("useEnabledModules: Error fetching modules, returning empty array", error.message || error);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds (fallback polling)
    retry: false,
    // Don't throw errors - return empty array instead
    throwOnError: false,
  });
}


