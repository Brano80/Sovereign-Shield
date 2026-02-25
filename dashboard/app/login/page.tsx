"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setAuthToken } from "../utils/auth";
import { Shield, Loader2, Zap } from "lucide-react";
import { API_BASE } from "../utils/api-config";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created successfully! Please log in.");
    }
  }, [searchParams]);

  const handleDevAccess = async () => {
    setDevLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/auth/dev-bypass`);
      if (!response.ok) {
        throw new Error("Dev bypass not available (production mode?)");
      }
      const data = await response.json();
      if (data.token) {
        setAuthToken(data.token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Dev bypass failed");
    } finally {
      setDevLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Login failed");
      }

      const data = await response.json();
      setAuthToken(data.token);

      try {
        localStorage.setItem("username", String(data.user?.username ?? ""));
        localStorage.setItem(
          "enforcement_override",
          data.user?.enforcement_override ? "true" : "false"
        );
      } catch {
        // ignore storage errors
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-3 text-emerald-400 hover:text-emerald-300 transition-colors group"
      >
        <Shield className="group-hover:scale-110 transition-transform" size={32} />
        <span className="text-2xl font-bold">Veridion Nexus</span>
      </Link>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">VERIDION NEXUS</h1>
          <p className="text-slate-400">Compliance Dashboard Login</p>
        </div>

        {/* Developer Quick Access */}
        <button
          onClick={handleDevAccess}
          disabled={devLoading}
          className="w-full mb-6 px-4 py-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/50 text-amber-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {devLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Zap size={18} />
          )}
          {devLoading ? "Connecting..." : "Developer Access"}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-800 px-2 text-slate-500">or login with credentials</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {success && (
            <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-400 px-4 py-2 rounded-lg text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-emerald-400" size={32} />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
