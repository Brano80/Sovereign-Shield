"use client";

import DashboardLayout from '@/app/components/DashboardLayout';
import EvidenceVault from '@/app/dashboard/lenses/components/EvidenceVault';

export default function EvidenceVaultPage() {
  return (
    <DashboardLayout>
      <EvidenceVault />
    </DashboardLayout>
  );
}
