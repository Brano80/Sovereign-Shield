import { notFound } from "next/navigation";
import SovereignShield from "../components/SovereignShield";
import TransparencyOversight from "../transparency-oversight/page";
import AIActArt5 from "../ai-act-art5/page";
import AIActPerformance from "../ai-act-performance/page";
import RiskOverview from "../risk-overview/page";
import GDPRRights from "../gdpr-rights/page";
import GDPRConsent from "../gdpr-consent/page";
import EmptyState, { EmptyStateProps } from "../../../components/EmptyState";

// Supported lens IDs - these are the valid lens identifiers
const SUPPORTED = new Set(["sovereign-shield", "unified-incidents", "transparency-oversight", "ai-act-transparency", "gdpr-rights", "ai-act-art5", "ai-act-performance", "risk-overview", "audit-evidence", "gdpr-consent"]);

export default async function LensPage(props: {
  params: Promise<{ lensId: string }>;
}) {
  const { lensId } = await props.params;

  // Check if the requested lens is supported
  if (!SUPPORTED.has(lensId)) return notFound();

  // Special handling for sovereign-shield
  if (lensId === "sovereign-shield") {
    return <SovereignShield />;
  }

  // Special handling for transparency-oversight and ai-act-transparency
  if (lensId === "transparency-oversight" || lensId === "ai-act-transparency") {
    return <TransparencyOversight />;
  }

  // Special handling for gdpr-rights
  if (lensId === "gdpr-rights") {
    return <GDPRRights />;
  }

  // Special handling for gdpr-consent
  if (lensId === "gdpr-consent") {
    return <GDPRConsent />;
  }

  // Special handling for ai-act-art5
  if (lensId === "ai-act-art5") {
    return <AIActArt5 />;
  }

  // Special handling for ai-act-performance
  if (lensId === "ai-act-performance") {
    return <AIActPerformance />;
  }

  // Special handling for risk-overview
  if (lensId === "risk-overview") {
    return <RiskOverview />;
  }

  // Return appropriate empty state for supported lenses
  const getEmptyStateType = (lensId: string): EmptyStateProps['type'] => {
    switch (lensId) {
      case 'sovereign-shield':
        return 'sovereign-shield';
      case 'unified-incidents':
        return 'unified-incidents';
      case 'transparency-oversight':
      case 'ai-act-transparency':  // Added support for new slug
        return 'transparency'; // Using transparency empty state for transparency lens
      case 'gdpr-rights':
        return 'gdpr-rights'; // Using gdpr-rights empty state
      case 'gdpr-consent':
        return 'gdpr-consent'; // Using gdpr-consent empty state
      case 'ai-act-art5':
        return 'ai-governance'; // AI Act Article 5 uses AI governance empty state as fallback
      case 'ai-act-performance':
        return 'ai-governance'; // AI Act Performance uses AI governance empty state as fallback
      case 'risk-overview':
        return 'risk-overview'; // Risk Overview uses risk-overview empty state
      case 'audit-evidence':
        return 'audit-evidence';
      default:
        return 'generic';
    }
  };

  const emptyStateType = getEmptyStateType(lensId);

  return (
    <div className="min-h-screen bg-slate-950">
      <EmptyState
        type={emptyStateType}
        actionLabel={lensId === 'sovereign-shield' ? 'Configure Policies' : 'Get Started'}
        onAction={() => {
          // Handle action - could navigate to setup wizard or settings
          console.log(`Setup ${lensId}`);
        }}
        showSetupGuide={true}
      />
    </div>
  );
}