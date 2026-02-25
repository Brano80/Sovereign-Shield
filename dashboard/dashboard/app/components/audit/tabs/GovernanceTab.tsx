"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function GovernanceTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Governance Controls
        </CardTitle>
        <CardDescription>
          Audit governance and compliance controls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Governance controls coming soon</p>
          <p className="text-sm">Compliance and governance audit features will be available here</p>
        </div>
      </CardContent>
    </Card>
  );
}
