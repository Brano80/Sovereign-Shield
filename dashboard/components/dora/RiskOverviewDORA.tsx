"use client";

import { RiskHeatmap } from "./RiskHeatmap";
import { ThresholdBreachesSummary } from "./ThresholdBreachesSummary";
import { RiskTrendChart } from "./RiskTrendChart";
import { OrganizationRiskSummary } from "./OrganizationRiskSummary";

export function RiskOverviewDORA() {
  const handleCellClick = (assetType: string, riskCategory: string) => {
    // Navigate to filtered asset list
    console.log(`Clicked: ${assetType} x ${riskCategory}`);
    // TODO: Implement navigation to filtered asset list
  };

  return (
    <div className="space-y-6">
      {/* Organization Risk Summary */}
      <OrganizationRiskSummary />

      {/* Risk Heatmap */}
      <RiskHeatmap onCellClick={handleCellClick} />

      {/* Threshold Breaches */}
      <ThresholdBreachesSummary />

      {/* Risk Trends */}
      <RiskTrendChart />
    </div>
  );
}

