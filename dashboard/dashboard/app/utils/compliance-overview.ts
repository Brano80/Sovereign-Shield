import { API_BASE } from "./api-config";
import { getAuthHeaders } from "./auth";

// Mock Data Mode for development (set MOCK_DATA=true in localStorage)
const USE_MOCK_DATA = typeof window !== "undefined" && localStorage.getItem("MOCK_DATA") === "true";

// Active incidents per regulation for violation-aware readiness
export interface ActiveIncidents {
  l1_count: number;  // CRITICAL - Hard blocks
  l2_count: number;  // HIGH - Soft blocks
  l3_count: number;  // MEDIUM - Assistive
  total: number;
}

export interface ComplianceOverview {
  gdpr_score: number;
  gdpr_base_score?: number;  // Score before incident penalty
  gdpr_active_incidents?: ActiveIncidents;
  eu_ai_act_score: number;
  eu_ai_act_base_score?: number;
  eu_ai_act_active_incidents?: ActiveIncidents;
  dora_score?: number;
  dora_base_score?: number;
  dora_active_incidents?: ActiveIncidents;
  overall_compliance_score: number;
  gdpr_articles: Array<{
    article_number: string;
    article_name: string;
    status: string;
    implementation_date: string | null;
    last_verified: string | null;
    active_incidents_count?: number;
  }>;
  eu_ai_act_articles: Array<{
    article_number: string;
    article_name: string;
    status: string;
    implementation_date: string | null;
    last_verified: string | null;
    active_incidents_count?: number;
  }>;
  dora_articles?: Array<{
    article_number: string;
    article_name: string;
    status: string;
    implementation_date: string | null;
    last_verified: string | null;
    active_incidents_count?: number;
  }>;
  last_updated: string;
}

// Top Triggered Articles
export interface TriggeredArticle {
  article_id: string;
  article_name: string;
  regulation: string;  // "GDPR", "AI_ACT", "DORA"
  trigger_count: number;
  l1_count: number;
  l2_count: number;
  l3_count: number;
  last_triggered: string | null;
}

export interface TopTriggeredArticlesResponse {
  articles: TriggeredArticle[];
  period_days: number;
  generated_at: string;
}

// Fetch top triggered articles
export async function fetchTopTriggeredArticles(days: number = 30): Promise<TopTriggeredArticlesResponse> {
  try {
    const res = await fetch(`${API_BASE}/reports/top-triggered-articles?days=${days}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      console.warn("Top triggered articles not available:", res.status);
      return { articles: [], period_days: days, generated_at: new Date().toISOString() };
    }
    return await res.json();
  } catch (error) {
    console.warn("Error fetching top triggered articles:", error);
    return { articles: [], period_days: days, generated_at: new Date().toISOString() };
  }
}

// Helper function to calculate readiness score based on compliant articles
function calculateReadiness(articles: Array<{ status: string }> | undefined): number {
  if (!articles || articles.length === 0) {
    return 0;
  }
  const compliantArticles = articles.filter(a => a.status === "COMPLIANT" || a.status === "COMPLETED").length;
  return (compliantArticles / articles.length) * 100;
}

// Shared fetch function for compliance overview
// Used by both Dashboard and Compliance Overview pages to ensure identical data processing
export async function fetchComplianceOverview(): Promise<ComplianceOverview> {
  // Mock Data Mode
  if (USE_MOCK_DATA) {
    console.log("🎭 Using MOCK DATA mode for compliance overview");
    // Return mock data (same structure as generateMockComplianceOverview)
    return {
      gdpr_score: 87.5,
      eu_ai_act_score: 0, // Will be calculated from 4 aggregated cards
      dora_score: 33.3,
      overall_compliance_score: 89.75,
      gdpr_articles: [
        {
          article_number: "12",
          article_name: "Transparent information, communication and modalities",
          status: "COMPLIANT",
          implementation_date: new Date().toISOString().split("T")[0],
          last_verified: new Date().toISOString().split("T")[0],
        },
        {
          article_number: "15",
          article_name: "Right of access by the data subject",
          status: "COMPLIANT",
          implementation_date: new Date().toISOString().split("T")[0],
          last_verified: new Date().toISOString().split("T")[0],
        },
        {
          article_number: "17",
          article_name: "Right to erasure ('right to be forgotten')",
          status: "COMPLIANT",
          implementation_date: new Date().toISOString().split("T")[0],
          last_verified: new Date().toISOString().split("T")[0],
        },
        {
          article_number: "25",
          article_name: "Data protection by design and by default",
          status: "COMPLIANT",
          implementation_date: new Date().toISOString().split("T")[0],
          last_verified: new Date().toISOString().split("T")[0],
        },
        {
          article_number: "32",
          article_name: "Security of processing",
          status: "PARTIAL",
          implementation_date: new Date().toISOString().split("T")[0],
          last_verified: new Date().toISOString().split("T")[0],
        },
      ],
      eu_ai_act_articles: [],
      dora_articles: [
        {
          article_number: "8",
          article_name: "Risk Management",
          status: "COMPLIANT",
          implementation_date: new Date().toISOString().split("T")[0],
          last_verified: new Date().toISOString().split("T")[0],
        },
        {
          article_number: "9",
          article_name: "ICT Third-Party Risk Management",
          status: "COMPLIANT",
          implementation_date: new Date().toISOString().split("T")[0],
          last_verified: new Date().toISOString().split("T")[0],
        },
        {
          article_number: "10",
          article_name: "Incident Reporting",
          status: "COMPLIANT",
          implementation_date: new Date().toISOString().split("T")[0],
          last_verified: new Date().toISOString().split("T")[0],
        },
        {
          article_number: "11",
          article_name: "Operational Resilience Testing",
          status: "NON_COMPLIANT",
          implementation_date: null,
          last_verified: null,
        },
      ],
      last_updated: new Date().toISOString(),
    };
  }
  
  try {
    const res = await fetch(`${API_BASE}/reports/compliance-overview`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error("Failed to fetch compliance overview:", res.status, errorText);
      if (res.status === 403) {
        throw new Error("Forbidden - You don't have permission to view compliance reports");
      }
      if (res.status === 401) {
        throw new Error("Unauthorized - Please login");
      }
      throw new Error(`Failed to fetch: ${res.status} - ${errorText}`);
    }
    const overview = await res.json();
    
    // Fetch DORA compliance status if available
    try {
      const doraRes = await fetch(`${API_BASE}/dora-lite/status`, {
        headers: getAuthHeaders(),
      });
      if (doraRes.ok) {
        const doraStatus = await doraRes.json();
        
        // Synchronize field names with DORA Lite dashboard (camelCase from backend)
        const incidentCount = doraStatus.incidentCount || doraStatus.incident_count || 0;
        const vendorCount = doraStatus.vendorCount || doraStatus.vendor_count || 0;
        const riskCount = doraStatus.riskCount || doraStatus.risk_count || 0;
        const slaCount = doraStatus.slaCount || doraStatus.sla_count || 0;
        const lastUpdated = doraStatus.lastUpdated || doraStatus.last_updated;
        
        // Update last_updated if DORA status has a newer timestamp
        if (lastUpdated) {
          const overviewLastUpdated = new Date(overview.last_updated).getTime();
          const doraLastUpdatedTime = new Date(lastUpdated).getTime();
          if (doraLastUpdatedTime > overviewLastUpdated) {
            overview.last_updated = lastUpdated;
          }
        }
        
        // Determine article statuses based on actual counts
        const article8Status = riskCount > 0 ? "COMPLIANT" : "NON_COMPLIANT";
        const article9Status = vendorCount > 0 ? "COMPLIANT" : "NON_COMPLIANT";
        const article10Status = incidentCount > 0 ? "COMPLIANT" : "NON_COMPLIANT";
        const article11Status = slaCount > 0 ? "COMPLIANT" : "NON_COMPLIANT";
        
        overview.dora_articles = [
          {
            article_number: "8",
            article_name: "Risk Management",
            status: article8Status,
            implementation_date: null,
            last_verified: null,
          },
          {
            article_number: "9",
            article_name: "ICT Third-Party Risk Management",
            status: article9Status,
            implementation_date: null,
            last_verified: null,
          },
          {
            article_number: "10",
            article_name: "Incident Reporting",
            status: article10Status,
            implementation_date: null,
            last_verified: null,
          },
          {
            article_number: "11",
            article_name: "Operational Resilience Testing",
            status: article11Status,
            implementation_date: null,
            last_verified: null,
          },
        ];
        
        // Calculate DORA Readiness Score
        overview.dora_score = calculateReadiness(overview.dora_articles);
      }
    } catch (doraError) {
      console.warn("DORA compliance status not available:", doraError);
    }
    
    // Recalculate all scores based on articles (remove hardcoded values from backend)
    overview.gdpr_score = calculateReadiness(overview.gdpr_articles);
    overview.eu_ai_act_score = 0; // Will be calculated in component from 4 aggregated cards
    
    return overview;
  } catch (error) {
    console.error("Error fetching compliance overview:", error);
    throw error;
  }
}

