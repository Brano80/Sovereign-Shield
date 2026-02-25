/**
 * Article-to-Lens Navigation Map
 * 
 * Maps regulatory article IDs to their corresponding lens dashboard paths.
 * Used by Compliance Overview to enable deep-linking to specific lenses.
 */

export type Regulation = "GDPR" | "AI_ACT" | "DORA";

export interface LensTarget {
  path: string;
  lensId: string;
  displayName: string;
}

/**
 * GDPR Article -> Lens Mapping
 */
export const GDPR_ARTICLE_TO_LENS: Record<string, LensTarget> = {
  "12": {
    path: "/dashboard/lenses/gdpr-rights",
    lensId: "gdpr-rights",
    displayName: "GDPR Rights",
  },
  "15": {
    path: "/dashboard/lenses/gdpr-rights",
    lensId: "gdpr-rights",
    displayName: "GDPR Rights",
  },
  "17": {
    path: "/dashboard/lenses/gdpr-rights",
    lensId: "gdpr-rights",
    displayName: "GDPR Rights",
  },
  "25": {
    path: "/dashboard/lenses/risk-overview",
    lensId: "risk-overview",
    displayName: "Risk Overview",
  },
  "32": {
    path: "/dashboard/lenses/audit-evidence",
    lensId: "audit-evidence",
    displayName: "Audit & Evidence",
  },
  "33": {
    path: "/dashboard/lenses/unified-incidents",
    lensId: "unified-incidents",
    displayName: "Unified Incidents",
  },
  "35": {
    path: "/dashboard/lenses/risk-overview",
    lensId: "risk-overview",
    displayName: "Risk Overview",
  },
  "44-49": {
    path: "/dashboard/lenses/sovereign-shield",
    lensId: "sovereign-shield",
    displayName: "Sovereign Shield",
  },
};

/**
 * EU AI Act Article -> Lens Mapping
 */
export const AI_ACT_ARTICLE_TO_LENS: Record<string, LensTarget> = {
  "5": {
    path: "/dashboard/lenses/ai-act-art5",
    lensId: "ai-act-art5",
    displayName: "Prohibited Practices",
  },
  "9": {
    path: "/dashboard/lenses/risk-overview",
    lensId: "risk-overview",
    displayName: "Risk Overview",
  },
  "10": {
    path: "/dashboard/lenses/ai-act-transparency",
    lensId: "ai-act-transparency",
    displayName: "Transparency & Human Oversight",
  },
  "13": {
    path: "/dashboard/lenses/ai-act-transparency",
    lensId: "ai-act-transparency",
    displayName: "Transparency & Human Oversight",
  },
  "14": {
    path: "/dashboard/lenses/ai-act-transparency",
    lensId: "ai-act-transparency",
    displayName: "Transparency & Human Oversight",
  },
  "15": {
    path: "/dashboard/lenses/ai-act-performance",
    lensId: "ai-act-performance",
    displayName: "AI Performance",
  },
  "11": {
    path: "/dashboard/lenses/audit-evidence",
    lensId: "audit-evidence",
    displayName: "Audit & Evidence",
  },
  "72": {
    path: "/dashboard/lenses/ai-act-performance",
    lensId: "ai-act-performance",
    displayName: "AI Performance",
  },
  "11&72": {
    path: "/dashboard/lenses/ai-act-performance",
    lensId: "ai-act-performance",
    displayName: "AI Performance",
  },
};

/**
 * DORA Article -> Lens Mapping
 */
export const DORA_ARTICLE_TO_LENS: Record<string, LensTarget> = {
  "6": {
    path: "/dashboard/lenses/risk-overview",
    lensId: "risk-overview",
    displayName: "Risk Overview",
  },
  "8": {
    path: "/dashboard/lenses/dora-assets",
    lensId: "dora-assets",
    displayName: "DORA Assets",
  },
  "9": {
    path: "/dashboard/lenses/sovereign-shield",
    lensId: "sovereign-shield",
    displayName: "Sovereign Shield",
  },
  "10": {
    path: "/dashboard/lenses/unified-incidents",
    lensId: "unified-incidents",
    displayName: "Unified Incidents",
  },
  "11": {
    path: "/dashboard/lenses/unified-incidents",
    lensId: "unified-incidents",
    displayName: "Unified Incidents",
  },
};

/**
 * Get the lens target for a given article
 * 
 * @param regulation - The regulation (GDPR, AI_ACT, DORA)
 * @param articleNumber - The article number (e.g., "44-49", "5", "11")
 * @returns The lens target or null if not mapped
 */
export function getLensForArticle(
  regulation: Regulation,
  articleNumber: string
): LensTarget | null {
  switch (regulation) {
    case "GDPR":
      return GDPR_ARTICLE_TO_LENS[articleNumber] || null;
    case "AI_ACT":
      return AI_ACT_ARTICLE_TO_LENS[articleNumber] || null;
    case "DORA":
      return DORA_ARTICLE_TO_LENS[articleNumber] || null;
    default:
      return null;
  }
}

/**
 * Check if an article has a corresponding lens
 */
export function hasLensMapping(regulation: Regulation, articleNumber: string): boolean {
  return getLensForArticle(regulation, articleNumber) !== null;
}

