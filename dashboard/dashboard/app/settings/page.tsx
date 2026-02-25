"use client";

import DashboardLayout from "../components/DashboardLayout";
import { Settings, Shield, Key, Database, Bell, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "../utils/auth";
import { useEnforcementMode } from "../hooks/useEnforcementMode";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useCompanyProfile } from "../hooks/useCompanyProfile";
import { useSubscription } from "../hooks/useSubscription";
import { API_BASE } from "../utils/api-config";

async function setEnforcementMode(mode: string, description?: string) {
  const res = await fetch(`${API_BASE}/system/enforcement-mode`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      enforcement_mode: mode,
      description: description || `Changed to ${mode} mode`,
    }),
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    const error = await res.json();
    throw new Error(error.message || `Failed to set enforcement mode: ${res.status}`);
  }
  return res.json();
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [modeDescription, setModeDescription] = useState("");

  // Fetch enforcement mode using the hook
  const { data: enforcementMode, isLoading, error, refetch } = useEnforcementMode();
  
  // Get subscription status to check if in trial
  const { user } = useCurrentUser();
  const { profile: companyProfile } = useCompanyProfile(user);
  const companyId = companyProfile?.id;
  const { data: subscription } = useSubscription(companyId);
  
  // Check if currently in trial period
  const isTrial = subscription?.status === "TRIAL";

  const setModeMutation = useMutation({
    mutationFn: ({ mode, description }: { mode: string; description?: string }) =>
      setEnforcementMode(mode, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enforcement-mode"] });
      alert("Enforcement mode updated successfully");
      setModeDescription("");
    },
    onError: (error: Error) => {
      alert(`Failed to update enforcement mode: ${error.message}`);
    },
  });

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "ENFORCING":
        return "bg-red-900/30 text-red-400 border-red-800";
      case "SHADOW":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-800";
      case "DRY_RUN":
        return "bg-blue-900/30 text-blue-400 border-blue-800";
      default:
        return "bg-slate-900/30 text-slate-400 border-slate-800";
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case "ENFORCING":
        return "All policies are active and will block non-compliant requests";
      case "SHADOW":
        return "Policies are logged but not enforced - safe for testing";
      case "DRY_RUN":
        return "Similar to shadow mode - logs what would happen without blocking";
      default:
        return "";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">
            System configuration and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Enforcement Mode (Shadow Mode) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
              <Eye className="text-yellow-400" size={24} />
              <h2 className="text-xl font-bold text-white">Enforcement Mode</h2>
              </div>
              <button
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["enforcement-mode"] });
                  refetch();
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors disabled:opacity-50 text-sm"
                title="Refresh enforcement mode data"
              >
                <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            {isLoading ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking enforcement mode...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                <p className="font-semibold mb-1">Failed to load enforcement mode</p>
                <p className="text-sm">{error.message}</p>
                <p className="text-xs text-red-500/70 mt-2">
                  Please refresh the page or check your connection.
                </p>
              </div>
            ) : !enforcementMode ? (
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400">
                <p>No enforcement mode data available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">Current Mode</span>
                    <span className={`px-3 py-1 rounded text-sm font-medium border ${getModeColor(enforcementMode.enforcement_mode || '')}`}>
                      {enforcementMode.enforcement_mode}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    {getModeDescription(enforcementMode.enforcement_mode || '')}
                  </p>
                  {enforcementMode.enabled_at && (
                    <p className="text-xs text-slate-500 mt-2">
                      Enabled: {new Date(enforcementMode.enabled_at).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm text-slate-400 mb-2">
                    Change Enforcement Mode
                  </label>
                  {isTrial && enforcementMode?.enforcement_mode === "SHADOW" && (
                    <div className="mb-3 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="text-yellow-400 mt-0.5" size={18} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-yellow-400 mb-1">
                            Trial Period Active
                          </p>
                          <p className="text-xs text-yellow-300/80">
                            During your trial, the system operates in SHADOW MODE only. 
                            Policies are logged but not enforced. You can switch to ENFORCING mode after your trial ends.
                            {subscription?.days_remaining !== null && subscription?.days_remaining !== undefined && (
                              <span className="block mt-1 font-medium">
                                {subscription.days_remaining} days remaining in trial
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setModeMutation.mutate({ mode: "ENFORCING", description: modeDescription || "Switched to enforcing mode" })}
                      disabled={setModeMutation.isPending || enforcementMode.enforcement_mode === "ENFORCING" || (isTrial && enforcementMode?.enforcement_mode === "SHADOW")}
                      className={`p-3 rounded-lg border transition-colors ${
                        enforcementMode.enforcement_mode === "ENFORCING"
                          ? "bg-red-900/30 border-red-800 text-red-400"
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                      } disabled:opacity-50`}
                      title={isTrial && enforcementMode?.enforcement_mode === "SHADOW" ? "Cannot switch to ENFORCING mode during trial period" : ""}
                    >
                      <div className="font-semibold mb-1">ENFORCING</div>
                      <div className="text-xs text-slate-400">Active blocking</div>
                    </button>
                    <button
                      onClick={() => setModeMutation.mutate({ mode: "SHADOW", description: modeDescription || "Switched to shadow mode for testing" })}
                      disabled={setModeMutation.isPending || enforcementMode.enforcement_mode === "SHADOW"}
                      className={`p-3 rounded-lg border transition-colors ${
                        enforcementMode.enforcement_mode === "SHADOW"
                          ? "bg-yellow-900/30 border-yellow-800 text-yellow-400"
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                      } disabled:opacity-50`}
                    >
                      <div className="font-semibold mb-1">SHADOW</div>
                      <div className="text-xs text-slate-400">Log only</div>
                    </button>
                    <button
                      onClick={() => setModeMutation.mutate({ mode: "DRY_RUN", description: modeDescription || "Switched to dry run mode" })}
                      disabled={setModeMutation.isPending || enforcementMode.enforcement_mode === "DRY_RUN"}
                      className={`p-3 rounded-lg border transition-colors ${
                        enforcementMode.enforcement_mode === "DRY_RUN"
                          ? "bg-blue-900/30 border-blue-800 text-blue-400"
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                      } disabled:opacity-50`}
                    >
                      <div className="font-semibold mb-1">DRY_RUN</div>
                      <div className="text-xs text-slate-400">Test mode</div>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={modeDescription}
                    onChange={(e) => setModeDescription(e.target.value)}
                    placeholder="Optional: Add a description for this change"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                  />
                </div>

                {enforcementMode.enforcement_mode !== "ENFORCING" && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="text-yellow-400 mt-0.5" size={18} />
                    <div className="text-sm text-yellow-300">
                      <strong>Warning:</strong> Policies are not being enforced. All requests will be logged but not blocked.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-emerald-400" size={24} />
              <h2 className="text-xl font-bold text-white">System Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                <span className="text-slate-300">System Status</span>
                <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded text-sm font-medium">
                  OPERATIONAL
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                <span className="text-slate-300">Database Connection</span>
                <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded text-sm font-medium">
                  CONNECTED
                </span>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="text-blue-400" size={24} />
              <h2 className="text-xl font-bold text-white">API Configuration</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/50 rounded">
                <label className="text-sm text-slate-400 mb-1 block">
                  API Base URL
                </label>
                <input
                  type="text"
                  defaultValue="http://127.0.0.1:8080/api/v1"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Database Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Database</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-800/50 rounded">
                <span className="text-sm text-slate-400">Database Type: </span>
                <span className="text-white">PostgreSQL</span>
              </div>
              <div className="p-3 bg-slate-800/50 rounded">
                <span className="text-sm text-slate-400">Connection: </span>
                <span className="text-white">Active</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="text-orange-400" size={24} />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                <span className="text-slate-300">Real-time Updates</span>
                <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-800 rounded text-sm font-medium">
                  ENABLED
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                <span className="text-slate-300">Refresh Interval</span>
                <span className="text-white">5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

