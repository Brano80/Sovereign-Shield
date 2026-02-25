"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Network,
  AlertTriangle,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Asset {
  id: string;
  assetId: string;
  name: string;
  type: string;
  criticality: 'CRITICAL' | 'IMPORTANT' | 'STANDARD' | 'LOW';
  owner: string;
  status: 'ACTIVE' | 'DEGRADED' | 'MAINTENANCE' | 'DECOMMISSIONED';
  riskScore: number;
  lastReview: string;
  functions: string[];
  dependencies: number;
  thirdParty: string[];
}

interface AssetInventoryTableProps {
  showAll?: boolean;
}

export function AssetInventoryTable({ showAll = false }: AssetInventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Mock data for demonstration
  const mockAssets: Asset[] = [
    {
      id: '1',
      assetId: 'ICT-HW-001',
      name: 'Core Banking System',
      type: 'Application',
      criticality: 'CRITICAL',
      owner: 'IT Operations',
      status: 'ACTIVE',
      riskScore: 12,
      lastReview: 'Dec 15, 2025',
      functions: ['Payment Processing', 'Account Management', 'Transaction Recording'],
      dependencies: 3,
      thirdParty: ['AWS', 'Azure', 'Stripe']
    },
    {
      id: '2',
      assetId: 'ICT-DB-001',
      name: 'Customer Database',
      type: 'Database',
      criticality: 'CRITICAL',
      owner: 'DBA Team',
      status: 'ACTIVE',
      riskScore: 8,
      lastReview: 'Dec 18, 2025',
      functions: ['Data Storage', 'Customer Records', 'Transaction Logs'],
      dependencies: 1,
      thirdParty: ['AWS']
    },
    {
      id: '3',
      assetId: 'ICT-API-001',
      name: 'API Gateway',
      type: 'Infrastructure',
      criticality: 'IMPORTANT',
      owner: 'Platform Engineering',
      status: 'DEGRADED',
      riskScore: 67,
      lastReview: 'Nov 30, 2025',
      functions: ['API Routing', 'Authentication', 'Rate Limiting'],
      dependencies: 5,
      thirdParty: ['Kong', 'AWS']
    },
    {
      id: '4',
      assetId: 'ICT-MON-001',
      name: 'Monitoring Stack',
      type: 'Tool',
      criticality: 'STANDARD',
      owner: 'SRE Team',
      status: 'ACTIVE',
      riskScore: 5,
      lastReview: 'Dec 10, 2025',
      functions: ['System Monitoring', 'Alerting', 'Metrics Collection'],
      dependencies: 2,
      thirdParty: ['Datadog', 'Grafana']
    }
  ];

  const filteredAssets = useMemo(() => {
    return mockAssets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.assetId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || asset.type.toLowerCase() === typeFilter.toLowerCase();
      const matchesCriticality = criticalityFilter === 'all' || asset.criticality === criticalityFilter;
      const matchesOwner = ownerFilter === 'all' || asset.owner.toLowerCase().includes(ownerFilter.toLowerCase());

      return matchesSearch && matchesType && matchesCriticality && matchesOwner;
    });
  }, [mockAssets, searchTerm, typeFilter, criticalityFilter, ownerFilter]);

  const displayedAssets = showAll ? filteredAssets : filteredAssets.slice(0, 3);

  const toggleRowExpansion = (assetId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedRows(newExpanded);
  };

  const toggleRowSelection = (assetId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedRows(newSelected);
  };

  const getAssetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'application': return '🖥️';
      case 'database': return '🗄️';
      case 'infrastructure': return '🌐';
      case 'tool': return '🛠️';
      default: return '📦';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'IMPORTANT': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'STANDARD': return 'text-green-600 bg-green-50 border-green-200';
      case 'LOW': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600';
      case 'DEGRADED': return 'text-yellow-600';
      case 'MAINTENANCE': return 'text-blue-600';
      case 'DECOMMISSIONED': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📋 ASSET INVENTORY
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete register of ICT assets with compliance status
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          {/* Asset Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Criticality Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Criticality:</span>
            <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="IMPORTANT">Important</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Owner Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Owner:</span>
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                <SelectItem value="IT Operations">IT Operations</SelectItem>
                <SelectItem value="DBA Team">DBA Team</SelectItem>
                <SelectItem value="Platform Engineering">Platform Engineering</SelectItem>
                <SelectItem value="SRE Team">SRE Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 ml-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm">Critical Only</Button>
          <Button variant="outline" size="sm">Third-Party</Button>
          <Button variant="outline" size="sm">Needs Review</Button>
          <Button variant="outline" size="sm">Undocumented</Button>
          <Button variant="outline" size="sm" className="text-red-600 border-red-200">
            <AlertTriangle className="h-4 w-4 mr-1" />
            High Risk
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Criticality</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Last Review</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedAssets.map((asset) => (
              <>
                <TableRow key={asset.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(asset.id)}
                      onCheckedChange={() => toggleRowSelection(asset.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(asset.id)}
                      className="h-6 w-6 p-0"
                    >
                      {expandedRows.has(asset.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getAssetIcon(asset.type)}</span>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.assetId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("font-medium", getCriticalityColor(asset.criticality))}
                    >
                      {asset.criticality === 'CRITICAL' && '⚠️'}
                      {asset.criticality === 'IMPORTANT' && '🟡'}
                      {asset.criticality === 'STANDARD' && '🟢'}
                      {asset.criticality === 'LOW' && '⚪'}
                      {asset.criticality}
                    </Badge>
                  </TableCell>
                  <TableCell>{asset.owner}</TableCell>
                  <TableCell>
                    <span className={cn("font-medium", getStatusColor(asset.status))}>
                      {asset.status === 'ACTIVE' && '✅'}
                      {asset.status === 'DEGRADED' && '⚠️'}
                      {asset.status === 'MAINTENANCE' && '🔧'}
                      {asset.status === 'DECOMMISSIONED' && '🗑️'}
                      {asset.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn("font-medium", getRiskColor(asset.riskScore))}>
                      {asset.riskScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {asset.lastReview}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Network className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Row */}
                {expandedRows.has(asset.id) && (
                  <TableRow>
                    <TableCell colSpan={10} className="bg-muted/30">
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <strong>Functions:</strong>
                            <div className="mt-1 space-y-1">
                              {asset.functions.map((func, idx) => (
                                <div key={idx} className="text-muted-foreground">• {func}</div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <strong>Dependencies:</strong>
                            <div className="mt-1 text-muted-foreground">
                              {asset.dependencies} direct connections
                            </div>
                          </div>
                          <div>
                            <strong>Third-Party:</strong>
                            <div className="mt-1 space-y-1">
                              {asset.thirdParty.map((provider, idx) => (
                                <div key={idx} className="text-muted-foreground">• {provider}</div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <strong>Risk Details:</strong>
                            <div className="mt-1 text-muted-foreground">
                              Score: {asset.riskScore}/100
                              {asset.riskScore >= 70 && ' (High)'}
                              {asset.riskScore >= 40 && asset.riskScore < 70 && ' (Medium)'}
                              {asset.riskScore < 40 && ' (Low)'}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Dependencies</Button>
                          <Button size="sm" variant="outline">Risk Assessment</Button>
                          {asset.status === 'DEGRADED' && (
                            <Button size="sm" variant="destructive">Investigate</Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>

        {!showAll && filteredAssets.length > 3 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing 3 of {filteredAssets.length} assets
            </div>
            <Button variant="outline">
              Load More
            </Button>
          </div>
        )}

        {showAll && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {displayedAssets.length} of {filteredAssets.length} assets
            </div>
            <Button variant="outline">
              View All →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}