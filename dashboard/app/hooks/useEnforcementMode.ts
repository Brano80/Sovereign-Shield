import { useQuery } from "@tanstack/react-query";
import { complianceApi } from "../lib/api-client";

export interface SystemConfigResponse {
  runtime_mode: string;
  updated_at: string;
  enforcement_mode?: string;
  enabled_at?: string;
}

export const useEnforcementMode = () => {
  return useQuery<SystemConfigResponse | null>({
    queryKey: ["system-config"],
    enabled: typeof window !== 'undefined',
    queryFn: async () => {
      if (typeof window === 'undefined') return null;
      console.log("💎 HOOK DIRECT CHECK - Fetching system config");

      try {
        const data = await complianceApi.get<SystemConfigResponse>('/system/config');
        return data;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          console.error("❌ HOOK DEBUG: 401 Unauthorized! Token is likely invalid or missing.");
        }
        throw new Error("Failed to fetch system configuration");
      }
    },
  });
};
