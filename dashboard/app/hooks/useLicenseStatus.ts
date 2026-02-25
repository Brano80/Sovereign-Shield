export interface LicenseStatus {
  status: "ACTIVE" | "EXPIRED" | "INVALID";
  days_remaining: number;
  key_preview: string;
}

/**
 * Stub hook — license validation removed in API-first pivot.
 * Always returns ACTIVE status.
 */
export function useLicenseStatus(): {
  licenseStatus: LicenseStatus;
  isLoading: boolean;
  error: string | null;
} {
  return {
    licenseStatus: { status: "ACTIVE", days_remaining: 999, key_preview: "API-FIRST" },
    isLoading: false,
    error: null,
  };
}
