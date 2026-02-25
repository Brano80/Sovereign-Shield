import { useState, useEffect } from "react";

/**
 * Hook to get company_id for the current user.
 * Resolves from the user object returned by /auth/me (which includes company_id).
 * Falls back to localStorage for persistence across page loads.
 */
export function useCompanyId(user?: { id: string; company_id?: string } | null) {
  const [companyId, setCompanyId] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("company_id") || undefined;
    }
    return undefined;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(true);
      return;
    }

    if (user.company_id) {
      setCompanyId(user.company_id);
      if (typeof window !== "undefined") {
        localStorage.setItem("company_id", user.company_id);
      }
    }

    setIsLoading(false);
  }, [user]);

  return { companyId, isLoading };
}
