"use client";

import { useState, useEffect } from "react";
import { ICTAsset, ICTAssetCategory, AssetCriticality } from "@/lib/dora/asset-inventory-types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Server,
  Database,
  Cloud,
  Globe,
  Shield,
  ChevronRight,
} from "lucide-react";

const CATEGORY_ICONS: Record<ICTAssetCategory, typeof Server> = {
  HARDWARE: Server,
  SOFTWARE: Database,
  NETWORK: Globe,
  DATA: Database,
  CLOUD_SERVICE: Cloud,
  API: Globe,
  PROTOCOL: Shield,
  TOOL: Server,
  THIRD_PARTY_SERVICE: Cloud,
};

const CRITICALITY_COLORS: Record<AssetCriticality, string> = {
  CRITICAL: "bg-red-500/10 text-red-400",
  IMPORTANT: "bg-orange-500/10 text-orange-400",
  STANDARD: "bg-blue-500/10 text-blue-400",
  LOW: "bg-gray-500/10 text-gray-400",
};

const COMPLIANCE_COLORS = {
  COMPLIANT: "bg-green-500/10 text-green-400",
  NON_COMPLIANT: "bg-red-500/10 text-red-400",
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-400",
  EXEMPTED: "bg-purple-500/10 text-purple-400",
};

export function AssetRegistryTab() {
  const [assets, setAssets] = useState<ICTAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0 });
  
  // Filters
  const [filters, setFilters] = useState({
    category: "all",
    criticality: "all",
    complianceStatus: "all",
    environment: "all",
    search: "",
  });

  useEffect(() => {
    fetchAssets();
  }, [filters, pagination.page]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        view: "list",
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.category !== "all") params.set("category", filters.category);
      if (filters.criticality !== "all") params.set("criticality", filters.criticality);
      if (filters.complianceStatus !== "all") params.set("complianceStatus", filters.complianceStatus);
      if (filters.environment !== "all") params.set("environment", filters.environment);
      if (filters.search) params.set("search", filters.search);

      const response = await fetch(`/api/v1/dora/assets?${params}`);
      const data = await response.json();

      setAssets(data.assets);
      setPagination((prev) => ({ ...prev, total: data.pagination.total }));
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search assets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-8 w-64 bg-slate-900 border-slate-800 text-white"
            />
          </div>

          {/* Category */}
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="HARDWARE">Hardware</SelectItem>
              <SelectItem value="SOFTWARE">Software</SelectItem>
              <SelectItem value="NETWORK">Network</SelectItem>
              <SelectItem value="CLOUD_SERVICE">Cloud Service</SelectItem>
              <SelectItem value="API">API</SelectItem>
              <SelectItem value="THIRD_PARTY_SERVICE">Third Party</SelectItem>
            </SelectContent>
          </Select>

          {/* Criticality */}
          <Select
            value={filters.criticality}
            onValueChange={(value) => setFilters({ ...filters, criticality: value })}
          >
            <SelectTrigger className="w-36 bg-slate-900 border-slate-800">
              <SelectValue placeholder="Criticality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="IMPORTANT">Important</SelectItem>
              <SelectItem value="STANDARD">Standard</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Compliance */}
          <Select
            value={filters.complianceStatus}
            onValueChange={(value) => setFilters({ ...filters, complianceStatus: value })}
          >
            <SelectTrigger className="w-40 bg-slate-900 border-slate-800">
              <SelectValue placeholder="Compliance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="COMPLIANT">Compliant</SelectItem>
              <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
              <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Register Asset
        </Button>
      </div>

      {/* Assets Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-300">Asset</TableHead>
              <TableHead className="text-slate-300">Category</TableHead>
              <TableHead className="text-slate-300">Version</TableHead>
              <TableHead className="text-slate-300">Criticality</TableHead>
              <TableHead className="text-slate-300">Environment</TableHead>
              <TableHead className="text-slate-300">Compliance</TableHead>
              <TableHead className="text-slate-300">Risk</TableHead>
              <TableHead className="text-slate-300"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Server className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">No assets found</p>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => {
                const CategoryIcon = CATEGORY_ICONS[asset.category] || Server;
                return (
                  <TableRow key={asset.id} className="border-slate-800">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-slate-800">
                          <CategoryIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{asset.name}</p>
                          <p className="text-xs text-slate-500">{asset.assetId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-300">{asset.category.replace(/_/g, " ")}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-slate-300">{asset.version}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={CRITICALITY_COLORS[asset.criticality]}>
                        {asset.criticality}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-300">{asset.environment}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={COMPLIANCE_COLORS[asset.compliance?.complianceStatus || "PENDING_REVIEW"]}>
                        {asset.compliance?.complianceStatus?.replace(/_/g, " ") || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {asset.riskProfile?.currentRiskScore ? (
                        <span className={`font-mono text-sm ${
                          asset.riskProfile.currentRiskScore >= 70 ? "text-red-400" :
                          asset.riskProfile.currentRiskScore >= 50 ? "text-orange-400" :
                          "text-green-400"
                        }`}>
                          {asset.riskProfile.currentRiskScore.toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} assets
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

