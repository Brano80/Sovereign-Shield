"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export function EvidencePackagesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Evidence Packages
        </CardTitle>
        <CardDescription>
          Exportable evidence packages for regulatory submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Evidence packages coming soon</p>
          <p className="text-sm">Exportable evidence bundles for regulatory compliance will be available here</p>
        </div>
      </CardContent>
    </Card>
  );
}
