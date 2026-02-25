"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Settings,
  Menu,
  X,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Shield,
  ClipboardCheck,
  AlertTriangle,
  Globe,
  Ban,
  Bell,
  FileCheck,
  UserCheck,
  Server,
  Eye,
  FileText,
  Cpu,
  LayoutGrid,
  Handshake,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModules } from "../hooks/useModules";
import { useEnabledModules } from "../hooks/useEnabledModules";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useSubscription } from "../hooks/useSubscription";
import { useCompanyId } from "../hooks/useCompanyId";
import { useCompanyProfile } from "../hooks/useCompanyProfile";
import { useEnforcementMode } from "../hooks/useEnforcementMode";
import { useLicenseStatus } from "../hooks/useLicenseStatus";
import { removeAuthToken } from "../utils/auth";
import { getApiBase } from "../utils/api-config";
import { LogOut, User } from "lucide-react";
import { initAudioOnInteraction } from "../utils/audio-alerts";
import { AlertBanner } from "@/components/audit/AlertBanner";

// Navigation structure organized by legislative pillars
interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  module: string | null;
  optional?: boolean; // Mark as optional if module-dependent
  category?: string; // display_category for filtering
}

interface NavigationSection {
  title: string;
  subtitle?: string; // Optional subtitle shown below title
  icon: any;
  items: NavigationItem[];
  collapsible?: boolean; // Whether section can be collapsed
  defaultOpen?: boolean; // Default collapsed state
}

// COMPLIANCE HUB
const complianceHubSection: NavigationSection = {
  title: "COMPLIANCE HUB",
  icon: LayoutDashboard,
  items: [
    { name: "Compliance Overview", href: "/compliance-overview", icon: LayoutDashboard, module: null },
    { name: "Human Review Queue", href: "/dashboard/review-queue", icon: ClipboardCheck, module: null },
    { name: "Incident Timeline", href: "/dashboard/incidents", icon: AlertTriangle, module: null },
    { name: "Evidence Vault", href: "/dashboard/evidence", icon: Shield, module: null },
    { name: "Module & Enforcement Config", href: "/settings", icon: Settings, module: null },
  ],
};

// LENSES
const lensesSection: NavigationSection = {
  title: "LENSES",
  icon: BarChart3,
  items: [
    { name: "Sovereign Shield", href: "/dashboard/lenses/sovereign-shield", icon: Globe, module: "sovereign-shield" },
    { name: "AI Act Art. 5", href: "/dashboard/lenses/ai-act-art5", icon: Ban, module: "ai-act-art5" },
    { name: "Unified Incidents", href: "/dashboard/lenses/unified-incidents", icon: Bell, module: "unified-incidents" },
    { name: "GDPR Consent", href: "/dashboard/lenses/gdpr-consent", icon: FileCheck, module: "sovereign-shield" },
    { name: "GDPR Rights", href: "/dashboard/lenses/gdpr-rights", icon: UserCheck, module: "sovereign-shield" },
    { name: "Risk Overview", href: "/dashboard/lenses/risk-overview", icon: BarChart3, module: "ai-act-art5" },
    { name: "DORA Assets", href: "/dashboard/lenses/dora-assets", icon: Server, module: "unified-incidents" },
    { name: "Transparency & Oversight", href: "/dashboard/lenses/transparency-oversight", icon: Eye, module: "ai-act-art5" },
    { name: "AI Act Performance", href: "/dashboard/lenses/ai-act-performance", icon: Activity, module: "ai-act-art5" },
  ],
};

// AUDIT
const auditSection: NavigationSection = {
  title: "AUDIT",
  icon: FileText,
  items: [
    { name: "Audit Preparation", href: "/dashboard/audit-preparation", icon: FileText, module: null },
    { name: "AI System Registry", href: "/dashboard/ai-registry", icon: Cpu, module: null },
  ],
};

// All sections in order
const navigationSections: NavigationSection[] = [
  complianceHubSection,
  lensesSection,
  auditSection,
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarNavRef = useRef<HTMLElement | null>(null);
  
  // State for collapsible sections - initialize after sections are defined
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    "GDPR": true,
    "EU AI ACT": true,
    "DORA": true,
  });
  
  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };
  const { data: enabledModules = [], isLoading: enabledModulesLoading } = useEnabledModules();
  const { data: allModules = [], isLoading: allModulesLoading } = useModules();
  const { user, isLoading: userLoading } = useCurrentUser();
  
  // Restore scroll position on mount
  useEffect(() => {
    if (sidebarNavRef.current) {
      const savedScroll = sessionStorage.getItem('sidebarScroll');
      if (savedScroll) {
        sidebarNavRef.current.scrollTop = parseInt(savedScroll, 10);
      }
    }
  }, []);
  
  // Initialize audio alerts on first user interaction
  useEffect(() => {
    initAudioOnInteraction();
  }, []);
  
  // Check if user is admin (needed for filtering)
  const persistedUsername =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const persistedEnforcementOverride =
    typeof window !== "undefined" ? localStorage.getItem("enforcement_override") : null;
  const authToken =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const enforcementOverride =
    user?.enforcement_override ?? persistedEnforcementOverride === "true";

  // Admin can be detected by role OR username (admin), OR presence of auth_token (for developer bypass)
  const isAdmin = (user?.roles?.includes("admin") ?? false) || user?.username === "admin" || persistedUsername === "admin" || !!authToken;
  const adminFullPower = isAdmin || enforcementOverride;
  
  // Get company profile from API (based on JWT token, not localStorage)
  const { profile: companyProfile, isLoading: profileLoading, error: profileError } = useCompanyProfile(user);

  // Get system configuration (runtime mode)
  const { data: systemConfig, isLoading: isSystemConfigLoading, error: systemConfigError } = useEnforcementMode();

  // Get license status (heartbeat)
  const { licenseStatus, isLoading: isLicenseLoading, error: licenseError } = useLicenseStatus();

  console.log('🔍 DashboardLayout Debug:', {
    user: !!user,
    userRoles: user?.roles,
    userUsername: user?.username,
    authToken: !!authToken,
    isAdmin,
    systemConfig,
    isSystemConfigLoading: isSystemConfigLoading,
    systemConfigError,
    licenseStatus,
    isLicenseLoading: isLicenseLoading,
    licenseError
  });
  
  // Get company_id from profile (for backward compatibility with other hooks)
  const companyId = companyProfile?.id;
  
  // Get subscription status
  const { data: subscription, isLoading: subLoading } = useSubscription(companyId);
  
  // Debug: Log state changes
  useEffect(() => {
    console.log("📊 DashboardLayout State:", {
      user: user ? { 
        id: user.id, 
        username: user.username, 
        roles: user.roles
      } : null,
      companyProfile: companyProfile ? {
        id: companyProfile.id,
        company_name: companyProfile.company_name
      } : null,
      companyId,
      subscription: subscription ? { id: subscription.id, status: subscription.status } : null,
      profileLoading,
      subLoading,
      profileError
    });
  }, [user, companyProfile, companyId, subscription, profileLoading, subLoading, profileError]);
  
  // Debug logging
  useEffect(() => {
    if (systemConfig) {
      console.log('System Configuration fetched:', systemConfig);
    }
  }, [systemConfig]);

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem("company_id");
    localStorage.removeItem("username");
    localStorage.removeItem("enforcement_override");
    router.push("/");
  };

  // Basic auth check - redirect to login if no user
  useEffect(() => {
    if (!userLoading && !user) {
      console.log("❌ No user found, redirecting to login");
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // --- LOADING STATE ---
  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }


  // Helper to check if module is enabled
  const isModuleEnabled = (module: string | null) => {
    if (!module) return true;
    // Admin bypass: show all modules in sidebar regardless of company_module_configs
    if (adminFullPower) return true;
    return enabledModules.some((m) => m.name === module);
  };

  // Use navigation sections directly (no wizard filtering needed)
  const displayNavigationSections = navigationSections;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-40 transition-transform duration-300 flex flex-col overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-400 tracking-wider">
                VERIDION NEXUS
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Compliance Dashboard v1.0.0
              </p>
            </div>
          </div>
        </div>

        <nav 
          ref={sidebarNavRef}
          className="p-4 space-y-1 overflow-y-auto flex-1"
          onScroll={(e) => {
            // Store scroll position
            if (sidebarNavRef.current) {
              sessionStorage.setItem('sidebarScroll', sidebarNavRef.current.scrollTop.toString());
            }
          }}
        >
          {/* Render navigation sections with legislative pillars */}
          {displayNavigationSections.map((section, sectionIndex) => {
            // Show ALL items (not filtered) - we'll mark them as active/inactive
            const SectionIcon = section.icon;
            
            // Helper to check if module is enabled
            const isModuleEnabled = (module: string | null) => {
              if (!module) return true; // Items without module requirement are always enabled
              if (adminFullPower) return true;
              return enabledModules.some((m) => m.name === module);
            };
            
            // Helper to check if module exists in system
            // If allModules is not loaded yet, assume module exists (to avoid hiding items prematurely)
            const moduleExists = (module: string | null) => {
              if (!module) return true;
              if (allModulesLoading || allModules.length === 0) return true; // Assume exists while loading
              return allModules.some((m) => m.name === module);
            };
            
            // Helper to determine item status (simplified - no enterprise features)
            const getItemStatus = (item: NavigationItem): 'active' | 'inactive' => {
              // Full-power admin: all items are active regardless of DB/module config
              if (adminFullPower) {
                return 'active';
              }
              
              // Category-based items: check if any modules exist in this category
              if (item.category) {
                const hasModulesInCategory = enabledModules.some(m => m.display_category === item.category);
                return hasModulesInCategory ? 'active' : 'inactive';
              }
              
              // Items without module requirement are always active (e.g., Dashboard, Settings)
              if (!item.module) return 'active';
              
              // Check if module is enabled (exists in enabledModules from DB)
              if (isModuleEnabled(item.module)) {
                return 'active';
              }
              
              // If module exists in system but is not enabled = inactive
              if (moduleExists(item.module)) {
                return 'inactive';
              }
              
              // Module doesn't exist in system = inactive
              return 'inactive';
            };

            // Determine section header color based on section type
            const getSectionHeaderColor = () => {
              if (section.title === "GDPR") return "text-blue-300";
              if (section.title === "DORA") return "text-blue-300";
              if (section.title === "EU AI ACT") return "text-blue-300";
              return "text-emerald-300"; // Default for other sections
            };

            const isCollapsed = section.collapsible && collapsedSections[section.title] === false;
            
            return (
              <div key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
                {/* Section Header with Icon - Collapsible */}
                <div 
                  className={`px-4 py-2.5 mb-2 flex items-start gap-2 border-b border-slate-700/50 bg-slate-800/30 rounded-t ${
                    section.collapsible ? "cursor-pointer hover:bg-slate-800/50 transition-colors" : ""
                  }`}
                  onClick={() => section.collapsible && toggleSection(section.title)}
                >
                  {section.collapsible && (
                    <div className="mt-0.5 flex-shrink-0">
                      {isCollapsed ? (
                        <ChevronRight size={14} className={`${getSectionHeaderColor()}`} />
                      ) : (
                        <ChevronDown size={14} className={`${getSectionHeaderColor()}`} />
                      )}
                    </div>
                  )}
                  <SectionIcon size={16} className={`${getSectionHeaderColor()} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${getSectionHeaderColor()} uppercase tracking-wider`}>
                      {section.title}
                    </div>
                    {section.subtitle && (
                      <div className="text-xs font-medium text-slate-300 mt-0.5">
                        {section.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Items - Collapsible */}
                {!isCollapsed && (
                <div className="space-y-1">
                  {(() => {
                    // Sort items: active items first, then inactive items
                    const sortedItems = [...section.items].sort((a, b) => {
                      const statusA = getItemStatus(a);
                      const statusB = getItemStatus(b);
                      const isActiveA = statusA === 'active';
                      const isActiveB = statusB === 'active';
                      
                      // Active items come first
                      if (isActiveA && !isActiveB) return -1;
                      if (!isActiveA && isActiveB) return 1;
                      
                      // Maintain original order for items with same status
                      return 0;
                    });
                    
                    return sortedItems.map((item) => {
                    // Check if item is active (matches pathname)
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    const itemStatus = getItemStatus(item);
                    const isItemEnabled = itemStatus === 'active';
                    const isInactive = itemStatus === 'inactive';

                    // Determine styling based on status
                    const getItemClasses = () => {
                      if (isItemEnabled) {
                        // Active items - full color and clickable
                        return isActive
                          ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800 cursor-pointer"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer";
                      } else {
                        // Inactive items - grayed out (50% opacity) and not clickable
                        return "text-slate-500 opacity-50 cursor-not-allowed pointer-events-none";
                      }
                    };

                    const getIconColor = () => {
                      if (isItemEnabled) {
                        return isActive ? "text-emerald-400" : "text-slate-400";
                      }
                      return "text-slate-500 opacity-50";
                    };

                    const getTooltip = () => {
                      if (isInactive) {
                        return "Module not enabled - Enable in Settings";
                      }
                      return null;
                    };
                    
                    const content = (
                      <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors ${getItemClasses()}`}>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Icon size={18} className={`flex-shrink-0 ${getIconColor()}`} />
                          <span className="text-sm font-medium truncate">{item.name}</span>
                        </div>
                      </div>
                    );

                    // If item is enabled, render as Link, otherwise as div
                    if (isItemEnabled) {
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => {
                            setSidebarOpen(false);
                            // Preserve scroll position
                            const savedScroll = sessionStorage.getItem('sidebarScroll');
                            if (savedScroll && sidebarNavRef.current) {
                              setTimeout(() => {
                                if (sidebarNavRef.current) {
                                  sidebarNavRef.current.scrollTop = parseInt(savedScroll, 10);
                                }
                              }, 10);
                            }
                          }}
                        >
                          {content}
                        </Link>
                      );
                    } else {
                      const tooltip = getTooltip();
                      return (
                        <div key={item.name} title={tooltip || undefined}>
                          {content}
                        </div>
                      );
                    }
                    }); 
                  })()}
                </div>
                )}
              </div>
            );
          })}

        </nav>

        {/* License Status - moved to sidebar bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex-shrink-0">
          {licenseStatus && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              licenseStatus.status === 'ACTIVE'
                ? 'bg-green-900/20 border-green-700/50'
                : 'bg-red-900/20 border-red-700/50'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                licenseStatus.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                licenseStatus.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
              }`}>
                {licenseStatus.status === 'ACTIVE'
                  ? `License Active (${licenseStatus.days_remaining} days left)`
                  : licenseStatus.status === 'EXPIRED'
                  ? 'License Expired'
                  : 'System Locked'}
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      {/* License Warning Banner */}
      {licenseStatus && (licenseStatus.status === 'EXPIRED' || licenseStatus.status === 'INVALID') && (
        <div className="bg-red-900/90 border-b border-red-700/50 text-red-200 px-6 py-3 text-center text-sm font-medium">
          🚨 System functionality is limited. Please renew your license to restore full operation.
        </div>
      )}

      <main className="lg:ml-64 p-6 lg:p-10 relative">
        {/* Top Bar - SHADOW MODE Indicator and User Info */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
          {/* System Runtime Mode Badge and System Status - Left side */}
          <div className="flex items-center gap-2">
            {/* System Status Indicator */}
            <div className="px-3 py-2 rounded-lg border backdrop-blur-sm text-sm font-medium bg-emerald-900/20 border-emerald-700/50 text-emerald-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>System Operational</span>
              </div>
            </div>

            {/* Runtime Mode Badge */}
            {systemConfig && (
              <div className={`px-3 py-2 rounded-lg border backdrop-blur-sm text-sm font-medium ${
                systemConfig.runtime_mode === 'SHADOW'
                  ? 'bg-yellow-900/20 border-yellow-700/50 text-yellow-400'
                  : systemConfig.runtime_mode === 'PRODUCTION'
                  ? 'bg-red-900/20 border-red-700/50 text-red-400 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}>
                {systemConfig.runtime_mode === 'SHADOW' && '🟡 SHADOW MODE'}
                {systemConfig.runtime_mode === 'PRODUCTION' && '🔴 ENFORCEMENT'}
                {systemConfig.runtime_mode !== 'SHADOW' && systemConfig.runtime_mode !== 'PRODUCTION' && `⚪ ${systemConfig.runtime_mode}`}
              </div>
            )}

            {/* Toggle Switch - Only for admins */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={systemConfig?.runtime_mode === 'PRODUCTION'}
                    onChange={async (e) => {
                      const newMode = e.target.checked ? 'PRODUCTION' : 'SHADOW';
                      try {
                        // Get auth token
                        const directToken = localStorage.getItem('auth_token');
                        console.log("🎯 TOGGLE DEBUG: Direct token check before POST:", directToken ? "FOUND" : "MISSING");

                        const response = await fetch(`${getApiBase()}/system/config`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${directToken}`
                          },
                          body: JSON.stringify({ mode: newMode })
                        });

                        if (!response.ok) {
                          throw new Error(`Failed to change system mode: ${response.status}`);
                        }

                        // The useEnforcementMode hook will automatically refresh
                        console.log(`✅ System Mode Updated to ${newMode}`);
                        // Add toast-like feedback (could be replaced with actual toast library)
                        console.log(`🎉 System mode successfully changed to: ${newMode}`);
                      } catch (error) {
                        console.error('❌ Failed to change system mode:', error);
                        // Revert the checkbox state
                        e.target.checked = !e.target.checked;
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </div>
          
          {/* Spacer to push user info to the right */}
          <div className="flex-1"></div>
          
          {/* User Info and Logout - Right side */}
          <div className="flex items-center gap-3">
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 backdrop-blur-sm">
                <User size={18} className="text-slate-400" />
                <div className="flex flex-col min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate max-w-[150px]">
                    {user.full_name || user.username}
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-[150px]">
                    {user.email}
                  </div>
                </div>
              </div>
            )}


            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/30 border border-red-800/50 hover:border-red-800 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Content with top padding to avoid overlap */}
        <div className="pt-16">
          {/* Alert Banner */}
          <AlertBanner
            maxAlerts={3}
            onViewAll={() => window.open('/dashboard/evidence', '_blank')}
          />

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="lg:ml-64 border-t border-slate-800 py-4 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p className="text-center md:text-left">
              Disclaimer: Veridion Nexus provides technical facilitation and documentation frameworks. It does not constitute legal advice. Final regulatory responsibility remains with the User/Organization.
            </p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-emerald-400 transition-colors">
                Cookies
              </Link>
              <Link href="/dpa" className="hover:text-emerald-400 transition-colors">
                DPA
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">
            © 2025 Veridion Nexus. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

