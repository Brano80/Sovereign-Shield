"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

export function LogExplorerTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Log Explorer
        </CardTitle>
        <CardDescription>
          Advanced log filtering and exploration tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Log Explorer functionality coming soon</p>
          <p className="text-sm">Advanced filtering and search capabilities will be available here</p>
        </div>
      </CardContent>
    </Card>
  );
}
