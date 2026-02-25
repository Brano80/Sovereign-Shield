import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, removeAuthToken, setAuthToken } from "../utils/auth";
import { complianceApi } from "../lib/api-client";

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  roles: string[];
  onboarded?: boolean;
  enforcement_override?: boolean;
  company_id?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      let token = getAuthToken();

      // If no token, try to get one from dev-bypass endpoint (development only)
      if (!token) {
        console.log("🔧 No auth token found, trying dev-bypass endpoint...");
        try {
          // Use centralized API configuration
          const { getApiBase } = await import("../utils/api-config");
          const API_BASE = getApiBase();
          const bypassResponse = await fetch(`${API_BASE}/auth/dev-bypass`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          if (bypassResponse.ok) {
            const bypassData = await bypassResponse.json();
            if (bypassData.token) {
              console.log("✅ Got token from dev-bypass, storing it...");
              setAuthToken(bypassData.token);
              token = bypassData.token;
            }
          }
        } catch (error) {
          console.warn("⚠️ Dev-bypass failed, user will need to authenticate manually:", error);
        }
      }

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔍 Fetching /auth/me with token:", token ? "present" : "missing");

        try {
          const userData = await complianceApi.get<any>('/auth/me');

          console.log("✅ User data fetched from /auth/me:", {
            ...userData,
            onboarded: userData.onboarded,
            onboardedType: typeof userData.onboarded
          });
          setUser(userData);

          // Persist admin/enforcement state across refreshes
          try {
            localStorage.setItem("username", String(userData.username ?? ""));
            localStorage.setItem(
              "enforcement_override",
              userData.enforcement_override ? "true" : "false"
            );
          } catch {
            // ignore storage errors
          }
        } catch (error) {
          console.warn("⚠️ Failed to fetch /auth/me (backend may be offline):", error);
          // Backend is not available - this is OK for unauthenticated users
          return;
        }
      } catch (err) {
        // Network error or CORS issue
        console.error("❌ Network error fetching user info:", err);
        setError("Cannot connect to backend. Is the server running?");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  return { user, isLoading, error };
}

