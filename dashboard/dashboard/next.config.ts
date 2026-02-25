import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker builds, not Vercel
  // Vercel handles its own output format
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),
  // Allow API calls to backend - use env var for production
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Suppress React DevTools warnings about params Promise serialization
  // This is a known issue in Next.js 16 where DevTools tries to serialize props
  reactStrictMode: true,
  experimental: {
    // This helps with Next.js 16 params Promise handling in DevTools
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Set turbopack root to dashboard directory to silence lockfile warning
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
