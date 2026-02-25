"use client";

import { useQuery } from "@tanstack/react-query";
import { complianceApi } from "../lib/api-client";

export interface SCCRecord {
  id: string;
  partner_name: string;
  country_code: string;
  scc_module: string;
  dpa_id: string;
  signed_date: string;
  expiry_date: string;
  tia_completed: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SCCRegistryResponse {
  id: string;
  partner: string;
  country: string;
  countryCode: string;
  type: 'C2C' | 'C2P';
  signedDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED';
  daysUntilExpiry: number;
  contractDetails: {
    contractType: string;
    dpaId: string;
    tiaCompleted: boolean;
    tiaDate?: string;
  };
}

function transformSCCRecord(record: SCCRecord): SCCRegistryResponse {
  // Map backend SCC module to frontend type
  const moduleToType: Record<string, 'C2C' | 'C2P'> = {
    'Module1': 'C2P', // Controller to Processor
    'Module2': 'C2C', // Controller to Controller
    'Module3': 'C2P', // Hybrid (default to C2P)
    'Module4': 'C2P', // Other/Custom (default to C2P)
  };

  const type = moduleToType[record.scc_module] || 'C2P';
  const contractType = type === 'C2C' ? 'Controller to Controller' : 'Controller to Processor';

  // Calculate status based on expiry date
  const daysUntilExpiry = Math.ceil((new Date(record.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  let status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' = 'ACTIVE';

  if (daysUntilExpiry <= 0) {
    status = 'EXPIRED';
  } else if (daysUntilExpiry <= 60) {
    status = 'EXPIRING';
  }

  return {
    id: record.id,
    partner: record.partner_name,
    country: getCountryName(record.country_code),
    countryCode: record.country_code,
    type,
    signedDate: new Date(record.signed_date).toISOString().split('T')[0],
    expiryDate: new Date(record.expiry_date).toISOString().split('T')[0],
    status,
    daysUntilExpiry,
    contractDetails: {
      contractType,
      dpaId: record.dpa_id,
      tiaCompleted: record.tia_completed,
      tiaDate: record.tia_completed ? new Date(record.signed_date).toISOString().split('T')[0] : undefined,
    },
  };
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'AT': 'Austria',
    'SE': 'Sweden',
    'DK': 'Denmark',
    'NO': 'Norway',
    'FI': 'Finland',
    'CH': 'Switzerland',
    'JP': 'Japan',
    'AU': 'Australia',
    'CA': 'Canada',
    'IN': 'India',
  };
  return countries[code] || code;
}

export function useSccRegistries() {
  return useQuery<SCCRegistryResponse[]>({
    queryKey: ["scc_registries"],
    queryFn: async () => {
      try {
        const data = await complianceApi.get<SCCRecord[]>('/scc');
        return data.map(transformSCCRecord);
      } catch (error) {
        console.error('Failed to fetch SCC registries:', error);
        // Return empty array on error to avoid breaking the UI
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });
}