/**
 * Central API Configuration
 *
 * This file provides a single source of truth for API base URL configuration.
 * All API calls should use getApiBase() to ensure consistent /api/v1 prefix.
 */

/**
 * License Tier Definitions
 */
export const LICENSE_TIERS = {
  T1: { name: "Starter", features: ["Basic compliance", "Essential modules"] },
  T2: { name: "Professional", features: ["Advanced compliance", "Priority support"] },
  T3: { name: "Business", features: ["Full compliance suite", "Custom integrations"] },
  T4: { name: "Enterprise", features: ["All features", "Dedicated support", "Custom deployments"] },
} as const;

/**
 * API Endpoints Configuration
 */
export const API_ENDPOINTS = {
  // DORA Governance
  DORA_GOVERNANCE: {
    OVERVIEW: '/dora/governance/overview',
    ROLES: '/dora/governance/roles',
    SUMMARY: '/dora/governance/summary',
    POLICIES: '/dora/governance/policies',
    CHANGE_REQUESTS: '/dora/governance/change-requests',
    MY_APPROVALS: '/dora/governance/my-approvals',
    OVERSIGHT: '/dora/governance/oversight',
    TRAINING: '/dora/governance/training',
  },
} as const;

/**
 * Get the API base URL with /api/v1 prefix
 * 
 * @returns The API base URL, always ending with /api/v1
 * 
 * @example
 * const API_BASE = getApiBase();
 * fetch(`${API_BASE}/risks`, { ... });
 */
export function getApiBase(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  
  console.log('🔍 DEBUG [getApiBase]: NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL);
  console.log('🔍 DEBUG [getApiBase]: baseUrl (after fallback):', baseUrl);
  
  // Ensure URL is fully qualified (starts with http:// or https://)
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    console.warn('⚠️ WARNING: baseUrl does not start with http:// or https://, prepending http://');
    const qualifiedUrl = `http://${baseUrl}`;
    console.log('🔍 DEBUG [getApiBase]: Qualified URL:', qualifiedUrl);
    return getApiBaseFromUrl(qualifiedUrl);
  }
  
  return getApiBaseFromUrl(baseUrl);
}

function getApiBaseFromUrl(baseUrl: string): string {
  // Ensure /api/v1 prefix is always present
  if (baseUrl.endsWith('/api/v1')) {
    console.log('🔍 DEBUG [getApiBaseFromUrl]: URL already has /api/v1 suffix');
    return baseUrl;
  }
  if (baseUrl.endsWith('/api/v1/')) {
    console.log('🔍 DEBUG [getApiBaseFromUrl]: URL has /api/v1/ suffix, removing trailing slash');
    return baseUrl.slice(0, -1); // Remove trailing slash
  }
  if (baseUrl.endsWith('/api')) {
    console.log('🔍 DEBUG [getApiBaseFromUrl]: URL has /api suffix, adding /v1');
    return `${baseUrl}/v1`;
  }
  
  // Add /api/v1 if not present
  const result = `${baseUrl.replace(/\/$/, '')}/api/v1`;
  console.log('🔍 DEBUG [getApiBaseFromUrl]: Added /api/v1 suffix, result:', result);
  return result;
}

/**
 * Default API base URL (for convenience)
 * 
 * NOTE: This is evaluated at module load time.
 * If NEXT_PUBLIC_API_URL changes at runtime, you need to call getApiBase() directly.
 */
export const API_BASE = getApiBase();

// Log the computed API_BASE at module load for debugging
if (typeof window !== 'undefined') {
  console.log('🔍 [api-config] Module loaded - API_BASE:', API_BASE);
  console.log('🔍 [api-config] NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL);
}
