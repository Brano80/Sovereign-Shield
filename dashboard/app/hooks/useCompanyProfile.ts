import { useState, useEffect } from "react";

export interface CompanyProfile {
  id: string;
  company_name: string;
  industry: string;
  company_size: string;
  country: string;
}

/**
 * Hook to get the current user's company profile.
 * In the API-first architecture, company info comes from the auth context.
 * Returns a minimal profile derived from the user's company_id.
 */
export function useCompanyProfile(user?: { id: string; company_id?: string } | null) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(true);
      setProfile(null);
      return;
    }

    if (user.company_id) {
      setProfile({
        id: user.company_id,
        company_name: "Veridion Tenant",
        industry: "",
        company_size: "",
        country: "",
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("company_id", user.company_id);
      }
    } else {
      setProfile(null);
    }

    setIsLoading(false);
  }, [user]);

  return { profile, isLoading, error };
}
