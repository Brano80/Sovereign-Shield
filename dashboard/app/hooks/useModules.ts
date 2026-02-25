"use client";

import { useQuery } from "@tanstack/react-query";

export interface Module {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  category: "core" | "operational" | "integration";
  enabled: boolean;
  requires_license: boolean;
}

export function useModules() {
  return useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: async () => {
      try {
        const { getApiBase } = await import("../utils/api-config");
        const base = getApiBase();
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        const res = await fetch(`${base}/modules?all=true`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 404) {
          return [];
        }
        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }
        const data = await res.json();
        return data.modules || [];
      } catch (error: any) {
        if (error.message?.includes('Unauthorized') || error.status === 401) {
          return [];
        }
        throw new Error("Failed to fetch modules");
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry on auth errors
  });
}

export function useModuleEnabled(moduleName: string) {
  return useQuery<boolean>({
    queryKey: ["module-status", moduleName],
    queryFn: async () => {
      try {
        const data = await complianceApi.get<{ enabled?: boolean }>(`/modules/${moduleName}/status`);
        return data.enabled || false;
      } catch (error: any) {
        return false;
      }
    },
    refetchInterval: 30000,
  });
}


