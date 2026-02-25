export type LensAccent = "emerald" | "cyan" | "violet" | "amber" | "red" | "blue";

export type LensCategory = "cross" | "gdpr" | "dora" | "ai_act";

export type LensDef = {
  lensId: string;
  title: string;
  subtitle: string;
  href: string;
  accent: LensAccent;
  articleLabels: string[];
  // Lightweight ACL metadata (UI hint). Backend still enforces real auth on endpoints.
  requiredScopes?: string[];
  showSovereignPulse?: boolean;
  /**
   * Category for grouping in dashboard.
   * - "cross" = Cross-regulation (always shown if any regulation enabled)
   * - "gdpr" = GDPR-specific
   * - "dora" = DORA-specific  
   * - "ai_act" = EU AI Act-specific
   */
  category: LensCategory;
  /**
   * Module dependencies - lens is shown if ANY of these modules are enabled.
   * Empty array means always show (core functionality).
   */
  requiredModules: string[];
};

export const LENSES: LensDef[] = [
  // === CROSS-REGULATION LENSES (shown if any related regulation is enabled) ===
  {
    lensId: "sovereign-shield",
    title: "Sovereign Shield",
    subtitle: "GDPR 25 · 32 · 44–49 · DORA 9",
    href: "/dashboard/lenses/sovereign-shield",
    accent: "emerald",
    showSovereignPulse: true,
    articleLabels: ["GDPR 25", "GDPR 32", "GDPR 44", "GDPR 45", "GDPR 46", "GDPR 47", "GDPR 48", "GDPR 49", "DORA 9"],
    requiredScopes: ["transfer:read", "transfer:enforce", "privacy_design:read", "security:read"],
    category: "cross",
    requiredModules: ["sovereign-shield"],
  },
  {
    lensId: "unified-incidents",
    title: "Unified Incidents",
    subtitle: "GDPR 33 · DORA 13–19 · AI Act 11–12",
    href: "/dashboard/lenses/unified-incidents",
    accent: "amber",
    articleLabels: ["GDPR 33", "DORA 13–19", "AI Act 11–12"],
    requiredScopes: ["incident:read"],
    category: "cross",
    requiredModules: ["module_breach_management", "sovereign-shield"], // Show if breach management OR sovereign-shield enabled
  },
  {
    lensId: "risk-overview",
    title: "Risk Overview",
    subtitle: "GDPR 35 · DORA 6 · AI Act 9",
    href: "/dashboard/lenses/risk-overview",
    accent: "blue",
    articleLabels: ["GDPR 35", "DORA 6", "AI Act 9"],
    requiredScopes: ["risk:read"],
    category: "cross",
    requiredModules: ["ai-act-art5", "sovereign-shield"], // Show if ai-act-art5 OR sovereign-shield enabled
  },
  {
    lensId: "transparency-oversight",
    title: "Transparency & Oversight",
    subtitle: "AI Act 13,14,50,52 · GDPR 13,14",
    href: "/dashboard/lenses/transparency-oversight",
    accent: "violet",
    articleLabels: ["AI Act 13", "AI Act 14", "AI Act 50", "AI Act 52", "GDPR 13", "GDPR 14"],
    requiredScopes: ["ai:transparency", "gdpr:transparency"],
    category: "cross",
    requiredModules: ["ai-act-art5", "sovereign-shield"], // Show if ai-act-art5 OR sovereign-shield enabled
  },

  // === GDPR-SPECIFIC LENSES ===
  {
    lensId: "gdpr-rights",
    title: "GDPR – Rights",
    subtitle: "Access · Export · Erasure",
    href: "/dashboard/lenses/gdpr-rights",
    accent: "cyan",
    articleLabels: ["GDPR 15", "GDPR 16", "GDPR 17", "GDPR 20", "GDPR 21", "GDPR 22"],
    requiredScopes: ["gdpr:rights"],
    category: "gdpr",
    requiredModules: ["sovereign-shield"],
  },
  {
    lensId: "gdpr-consent",
    title: "GDPR Consent",
    subtitle: "Articles 6-7 • Lawful Basis & Consent Management",
    href: "/dashboard/lenses/gdpr-consent",
    accent: "cyan",
    articleLabels: ["GDPR 6", "GDPR 7"],
    requiredScopes: ["gdpr:consent"],
    category: "gdpr",
    requiredModules: ["sovereign-shield"],
  },

  // === DORA-SPECIFIC LENSES ===
  {
    lensId: "dora-assets",
    title: "DORA – Assets",
    subtitle: "Inventory · Critical functions",
    href: "/dashboard/lenses/dora-assets",
    accent: "blue",
    articleLabels: ["DORA 5", "DORA 6"],
    requiredScopes: ["dora:assets"],
    category: "dora",
    requiredModules: ["module_dora_lite", "sovereign-shield"], // Show if dora-lite OR sovereign-shield enabled
  },

  // === AI ACT-SPECIFIC LENSES ===
  {
    lensId: "ai-act-art5",
    title: "AI Act Art. 5",
    subtitle: "Prohibited AI Practices • Banned Applications Detection",
    href: "/dashboard/lenses/ai-act-art5",
    accent: "red",
    articleLabels: ["AI Act 5.1.a", "AI Act 5.1.b", "AI Act 5.1.c", "AI Act 5.1.d", "AI Act 5.1.e", "AI Act 5.1.f", "AI Act 5.1.g", "AI Act 5.1.h"],
    requiredScopes: ["ai:art5", "ai:monitor"],
    category: "ai_act",
    requiredModules: ["ai-act-art5", "sovereign-shield"], // Show if ai-act-art5 OR sovereign-shield enabled
  },
  {
    lensId: "ai-act-performance",
    title: "AI Act – Performance",
    subtitle: "Drift · Monitoring",
    href: "/dashboard/lenses/ai-act-performance",
    accent: "amber",
    articleLabels: ["AI Act 15"],
    requiredScopes: ["ai:monitor"],
    category: "ai_act",
    requiredModules: ["ai-act-art5", "sovereign-shield"], // Show if ai-act-art5 OR sovereign-shield enabled
  },
];

export function getLensDef(lensId: string): LensDef | undefined {
  return LENSES.find((l) => l.lensId === lensId);
}

/**
 * Check if a lens should be visible based on enabled modules.
 * A lens is visible if ANY of its required modules is enabled.
 */
export function isLensEnabled(lens: LensDef, enabledModuleNames: string[]): boolean {
  // If no modules required, always show (core functionality)
  if (!lens.requiredModules || lens.requiredModules.length === 0) {
    return true;
  }
  
  // Show if ANY required module is enabled
  const isEnabled = lens.requiredModules.some((m) => enabledModuleNames.includes(m));
  if (!isEnabled) {
    console.log(`🔍 LensRegistry: Lens "${lens.lensId}" hidden - requires: [${lens.requiredModules.join(", ")}], enabled: [${enabledModuleNames.join(", ")}]`);
  }
  return isEnabled;
}

/**
 * Get all lenses filtered by enabled modules.
 */
export function getEnabledLenses(enabledModuleNames: string[]): LensDef[] {
  return LENSES.filter((lens) => isLensEnabled(lens, enabledModuleNames));
}

/**
 * Get lenses grouped by category, filtered by enabled modules.
 * Empty categories are excluded.
 */
export function getLensesByCategory(enabledModuleNames: string[]): Record<LensCategory, LensDef[]> {
  const enabledLenses = getEnabledLenses(enabledModuleNames);
  
  const grouped: Record<LensCategory, LensDef[]> = {
    cross: [],
    gdpr: [],
    dora: [],
    ai_act: [],
  };
  
  for (const lens of enabledLenses) {
    grouped[lens.category].push(lens);
  }
  
  return grouped;
}

/**
 * Category display names for UI.
 */
export const CATEGORY_DISPLAY_NAMES: Record<LensCategory, string> = {
  cross: "Cross-Regulation",
  gdpr: "GDPR",
  dora: "DORA",
  ai_act: "EU AI Act",
};

/**
 * Category order for display.
 */
export const CATEGORY_ORDER: LensCategory[] = ["cross", "gdpr", "dora", "ai_act"];


