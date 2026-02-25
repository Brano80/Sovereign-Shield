"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";

export function DependencyGraphTab() {
  const [assetId, setAssetId] = useState("");
  const [depth, setDepth] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Enter Asset ID..."
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="w-64 bg-slate-900 border-slate-800 text-white"
        />
        <Button onClick={() => {/* TODO: Fetch dependency graph */}}>
          Load Graph
        </Button>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-12 text-center">
        <Network className="h-12 w-12 mx-auto text-slate-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Dependency Graph</h3>
        <p className="text-slate-400">
          Visual dependency graph visualization coming soon.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Enter an Asset ID and click "Load Graph" to view dependencies.
        </p>
      </div>
    </div>
  );
}

