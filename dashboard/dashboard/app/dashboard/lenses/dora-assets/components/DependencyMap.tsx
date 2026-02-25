"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Grid3X3,
  Network,
  List,
  Eye,
  EyeOff,
  Filter,
  Settings,
  Play,
  Pause,
  ArrowRight,
  Database,
  Server,
  Cloud,
  Shield,
  AlertTriangle,
  CheckCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DependencyNode {
  id: string;
  assetId: string;
  name: string;
  type: string;
  criticality: 'CRITICAL' | 'IMPORTANT' | 'STANDARD' | 'LOW';
  status: 'ACTIVE' | 'DEGRADED' | 'DOWN';
  isThirdParty: boolean;
  position?: { x: number; y: number };
}

interface DependencyEdge {
  source: string;
  target: string;
  type: 'DIRECT' | 'INDIRECT';
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface DependencyMapProps {
  fullScreen?: boolean;
}

export function DependencyMap({ fullScreen = false }: DependencyMapProps) {
  const [viewMode, setViewMode] = useState<'2D' | '3D' | 'List'>('2D');
  const [highlightMode, setHighlightMode] = useState<'All' | 'Critical Path' | 'Third Party'>('All');
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  const mockNodes: DependencyNode[] = [
    {
      id: '1',
      assetId: 'ICT-HW-001',
      name: 'Core Banking System',
      type: 'Application',
      criticality: 'CRITICAL',
      status: 'ACTIVE',
      isThirdParty: false,
      position: { x: 400, y: 200 }
    },
    {
      id: '2',
      assetId: 'ICT-DB-001',
      name: 'Customer Database',
      type: 'Database',
      criticality: 'CRITICAL',
      status: 'ACTIVE',
      isThirdParty: false,
      position: { x: 250, y: 350 }
    },
    {
      id: '3',
      assetId: 'ICT-AUTH-001',
      name: 'Auth Service',
      type: 'Service',
      criticality: 'CRITICAL',
      status: 'ACTIVE',
      isThirdParty: false,
      position: { x: 550, y: 350 }
    },
    {
      id: '4',
      assetId: 'ICT-API-001',
      name: 'Payment Gateway',
      type: 'Infrastructure',
      criticality: 'CRITICAL',
      status: 'ACTIVE',
      isThirdParty: false,
      position: { x: 400, y: 500 }
    },
    {
      id: '5',
      assetId: 'AWS-RDS-001',
      name: 'AWS RDS',
      type: 'Cloud Database',
      criticality: 'CRITICAL',
      status: 'ACTIVE',
      isThirdParty: true,
      position: { x: 150, y: 500 }
    },
    {
      id: '6',
      assetId: 'AZURE-AD-001',
      name: 'Azure AD',
      type: 'Identity Service',
      criticality: 'CRITICAL',
      status: 'ACTIVE',
      isThirdParty: true,
      position: { x: 650, y: 500 }
    },
    {
      id: '7',
      assetId: 'STRIPE-API-001',
      name: 'Stripe API',
      type: 'Payment Service',
      criticality: 'CRITICAL',
      status: 'ACTIVE',
      isThirdParty: true,
      position: { x: 400, y: 650 }
    }
  ];

  const mockEdges: DependencyEdge[] = [
    { source: '1', target: '2', type: 'DIRECT', criticality: 'CRITICAL' },
    { source: '1', target: '3', type: 'DIRECT', criticality: 'CRITICAL' },
    { source: '1', target: '4', type: 'DIRECT', criticality: 'CRITICAL' },
    { source: '2', target: '5', type: 'DIRECT', criticality: 'CRITICAL' },
    { source: '3', target: '6', type: 'DIRECT', criticality: 'CRITICAL' },
    { source: '4', target: '7', type: 'DIRECT', criticality: 'CRITICAL' }
  ];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => setZoom(1);

  return (
    <Card className={cn(
      "bg-slate-800/50 border-slate-700 backdrop-blur-sm",
      fullScreen ? "h-[80vh]" : ""
    )}>
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-bold">
                ASSET DEPENDENCY MAP
              </CardTitle>
              <p className="text-slate-400 mt-1 text-sm">
                Visual representation of ICT asset relationships • {mockNodes.length} assets • {mockEdges.length} dependencies
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {!fullScreen && (
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Maximize2 className="h-4 w-4 mr-2" />
                Full Screen
              </Button>
            )}
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex items-center gap-6">
              {/* View Mode */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">View:</span>
                </div>
                <div className="flex bg-slate-700/50 rounded-lg p-1">
                  <Button
                    variant={viewMode === '2D' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('2D')}
                    className={cn(
                      "rounded-md transition-all duration-200",
                      viewMode === '2D' ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" : "text-slate-300 hover:bg-slate-600"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    2D
                  </Button>
                  <Button
                    variant={viewMode === '3D' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('3D')}
                    className={cn(
                      "rounded-md transition-all duration-200 mx-1",
                      viewMode === '3D' ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" : "text-slate-300 hover:bg-slate-600"
                    )}
                  >
                    <Network className="h-4 w-4 mr-2" />
                    3D
                  </Button>
                  <Button
                    variant={viewMode === 'List' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('List')}
                    className={cn(
                      "rounded-md transition-all duration-200",
                      viewMode === 'List' ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" : "text-slate-300 hover:bg-slate-600"
                    )}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>

              {/* Highlight Mode */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Highlight:</span>
                </div>
                <Select value={highlightMode} onValueChange={(v) => setHighlightMode(v as any)}>
                  <SelectTrigger className="w-36 bg-slate-700/50 border-slate-600 text-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="All" className="text-slate-300 hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        All
                      </div>
                    </SelectItem>
                    <SelectItem value="Critical Path" className="text-slate-300 hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        Critical Path
                      </div>
                    </SelectItem>
                    <SelectItem value="Third Party" className="text-slate-300 hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-blue-400" />
                        Third Party
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Zoom Controls */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">Zoom:</span>
                <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    className="text-slate-300 hover:bg-slate-600 h-8 w-8 p-0"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm min-w-[3rem] text-center text-slate-300 font-mono">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    className="text-slate-300 hover:bg-slate-600 h-8 w-8 p-0"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-slate-300 hover:bg-slate-600 h-8 w-8 p-0 ml-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAnimating(!isAnimating)}
                  className={cn(
                    "text-slate-300 hover:bg-slate-600",
                    isAnimating && "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                  )}
                >
                  {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span className="ml-2">{isAnimating ? 'Pause' : 'Animate'}</span>
                </Button>

                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {viewMode === 'List' ? (
          <DependencyListView nodes={mockNodes} edges={mockEdges} />
        ) : (
          <DependencyCanvasView
            nodes={mockNodes}
            edges={mockEdges}
            viewMode={viewMode}
            highlightMode={highlightMode}
            zoom={zoom}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            canvasRef={canvasRef}
          />
        )}

        {/* Legend */}
        <div className="p-4 border-t border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-slate-300">Legend:</span>
            </div>

            {/* Node Types */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-red-900/80 to-red-800/80 border-2 border-red-500 flex items-center justify-center">
                  <AlertTriangle className="h-2.5 w-2.5 text-red-300" />
                </div>
                <span className="text-slate-300">Critical Asset</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-2 border-blue-500 flex items-center justify-center">
                  <Cloud className="h-2.5 w-2.5 text-blue-300" />
                </div>
                <span className="text-slate-300">Third-Party</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-green-900/80 to-green-800/80 border-2 border-green-500 flex items-center justify-center">
                  <Server className="h-2.5 w-2.5 text-green-300" />
                </div>
                <span className="text-slate-300">Internal Asset</span>
              </div>
            </div>

            {/* Connection Types */}
            <div className="flex items-center gap-4 ml-4 border-l border-slate-600 pl-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-6 h-0.5 bg-slate-400 rounded"></div>
                  <ArrowRight className="h-3 w-3 text-slate-400 -ml-1" />
                </div>
                <span className="text-slate-300">Direct</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-6 h-0.5 bg-slate-500 border-dashed border-t rounded"></div>
                  <ArrowRight className="h-3 w-3 text-slate-500 -ml-1" />
                </div>
                <span className="text-slate-300">Indirect</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-6 h-0.5 bg-red-500 rounded shadow-lg shadow-red-500/30"></div>
                  <ArrowRight className="h-3 w-3 text-red-400 -ml-1" />
                </div>
                <span className="text-slate-300">Critical Path</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4 ml-4 border-l border-slate-600 pl-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full border border-slate-800 shadow-lg shadow-green-400/50"></div>
                <span className="text-slate-300">Active</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full border border-slate-800 shadow-lg shadow-yellow-400/50"></div>
                <span className="text-slate-300">Degraded</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full border border-slate-800 shadow-lg shadow-red-400/50"></div>
                <span className="text-slate-300">Down</span>
              </div>
            </div>
          </div>
        </div>

        {/* Node Detail Popup */}
        {selectedNode && (
          <NodeDetailPopup node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </CardContent>
    </Card>
  );
}

function DependencyCanvasView({
  nodes,
  edges,
  viewMode,
  highlightMode,
  zoom,
  selectedNode,
  onNodeSelect,
  canvasRef
}: {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  viewMode: '2D' | '3D';
  highlightMode: string;
  zoom: number;
  selectedNode: DependencyNode | null;
  onNodeSelect: (node: DependencyNode) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={canvasRef}
      className="relative h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden border border-slate-700"
      style={{ transform: `scale(${zoom})`, transformOrigin: 'center top' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="text-slate-600">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      {/* SVG for edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrowhead-critical"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#ef4444"
              className="drop-shadow-lg"
            />
          </marker>
          <marker
            id="arrowhead-normal"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#64748b"
            />
          </marker>
        </defs>

        {edges.map((edge, index) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);

          if (!sourceNode?.position || !targetNode?.position) return null;

          const isCritical = edge.criticality === 'CRITICAL';
          const isHighlighted = highlightMode === 'All' ||
            (highlightMode === 'Critical Path' && isCritical) ||
            (highlightMode === 'Third Party' && (sourceNode.isThirdParty || targetNode.isThirdParty));

          // Calculate control points for curved lines
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const curvature = Math.min(distance * 0.3, 50);

          const midX = (sourceNode.position.x + targetNode.position.x) / 2;
          const midY = (sourceNode.position.y + targetNode.position.y) / 2;
          const controlX = midX;
          const controlY = midY - curvature;

          const pathData = `M ${sourceNode.position.x + 50} ${sourceNode.position.y + 25} Q ${controlX + 50} ${controlY + 25} ${targetNode.position.x + 50} ${targetNode.position.y + 25}`;

          return (
            <g key={index}>
              {/* Drop shadow */}
              <path
                d={pathData}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={isCritical ? 5 : 4}
                strokeDasharray={edge.type === 'INDIRECT' ? '8,4' : undefined}
                className="opacity-50"
                filter="blur(1px)"
              />
              {/* Main line */}
              <path
                d={pathData}
                fill="none"
                stroke={isCritical ? '#ef4444' : isHighlighted ? '#64748b' : '#475569'}
                strokeWidth={isCritical ? 3 : 2}
                strokeDasharray={edge.type === 'INDIRECT' ? '8,4' : undefined}
                className="pointer-events-auto transition-all duration-300"
                markerEnd={isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead-normal)"}
                opacity={isHighlighted ? 1 : 0.4}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const isSelected = selectedNode?.id === node.id;
        const isCritical = node.criticality === 'CRITICAL';

        return (
          <div
            key={node.id}
            className={cn(
              "absolute cursor-pointer transition-all duration-300 group",
              "w-28 h-16 rounded-xl border-2 backdrop-blur-sm",
              "flex items-center justify-center text-xs font-medium",
              "hover:scale-110 hover:shadow-2xl hover:z-10",
              isSelected && "ring-4 ring-blue-400 ring-opacity-50 scale-110 z-20",
              // Base styling
              "bg-slate-800/80 border-slate-600 text-slate-200",
              // Critical nodes
              node.criticality === 'CRITICAL' && "bg-gradient-to-br from-red-900/80 to-red-800/80 border-red-500 text-red-100 shadow-red-500/20",
              node.criticality === 'IMPORTANT' && "bg-gradient-to-br from-yellow-900/80 to-yellow-800/80 border-yellow-500 text-yellow-100 shadow-yellow-500/20",
              node.criticality === 'STANDARD' && "bg-gradient-to-br from-green-900/80 to-green-800/80 border-green-500 text-green-100 shadow-green-500/20",
              node.criticality === 'LOW' && "bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-500 text-gray-100 shadow-gray-500/20",
              // Third party nodes
              node.isThirdParty && "bg-gradient-to-br from-blue-900/80 to-blue-800/80 border-blue-500 text-blue-100 shadow-blue-500/20",
              // Status-based styling
              node.status === 'DEGRADED' && "border-yellow-400 shadow-yellow-400/30",
              node.status === 'DOWN' && "border-red-400 shadow-red-400/30 opacity-75"
            )}
            style={{
              left: node.position?.x || 0,
              top: node.position?.y || 0,
              boxShadow: isCritical ? '0 0 20px rgba(239, 68, 68, 0.3)' :
                         node.isThirdParty ? '0 0 20px rgba(59, 130, 246, 0.3)' :
                         '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            onClick={() => onNodeSelect(node)}
          >
            <div className="text-center relative">
              {/* Icon */}
              <div className="flex justify-center mb-1">
                {node.isThirdParty ? (
                  <Cloud className="h-4 w-4 text-blue-400" />
                ) : node.type === 'Database' ? (
                  <Database className="h-4 w-4 text-current" />
                ) : node.type === 'Service' || node.type === 'Identity Service' ? (
                  <Shield className="h-4 w-4 text-current" />
                ) : (
                  <Server className="h-4 w-4 text-current" />
                )}
              </div>

              {/* Name */}
              <div className="truncate w-24 text-xs font-semibold leading-tight">
                {node.name}
              </div>

              {/* Status indicator */}
              <div className="absolute -top-1 -right-1">
                {node.status === 'ACTIVE' && (
                  <div className="w-2 h-2 bg-green-400 rounded-full border border-slate-800"></div>
                )}
                {node.status === 'DEGRADED' && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full border border-slate-800"></div>
                )}
                {node.status === 'DOWN' && (
                  <div className="w-2 h-2 bg-red-400 rounded-full border border-slate-800"></div>
                )}
              </div>

              {/* Critical indicator */}
              {isCritical && (
                <div className="absolute -bottom-1 -right-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                </div>
              )}
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-blue-400 to-purple-400"></div>
          </div>
        );
      })}
    </div>
  );
}

function DependencyListView({ nodes, edges }: { nodes: DependencyNode[]; edges: DependencyEdge[] }) {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Server className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-bold text-white">Assets ({nodes.length})</h4>
          </div>
          <div className="space-y-3">
            {nodes.map((node) => {
              const getIcon = () => {
                if (node.isThirdParty) return <Cloud className="h-4 w-4 text-blue-400" />;
                if (node.type === 'Database') return <Database className="h-4 w-4 text-current" />;
                if (node.type === 'Service' || node.type === 'Identity Service') return <Shield className="h-4 w-4 text-current" />;
                return <Server className="h-4 w-4 text-current" />;
              };

              return (
                <div key={node.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border-2",
                      node.criticality === 'CRITICAL' && "bg-red-900/50 border-red-500",
                      node.criticality === 'IMPORTANT' && "bg-yellow-900/50 border-yellow-500",
                      node.criticality === 'STANDARD' && "bg-green-900/50 border-green-500",
                      node.criticality === 'LOW' && "bg-gray-900/50 border-gray-500",
                      node.isThirdParty && "bg-blue-900/50 border-blue-500"
                    )}>
                      {getIcon()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{node.name}</div>
                      <div className="text-slate-400 text-xs">{node.assetId} • {node.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        node.status === 'ACTIVE' && "bg-green-400",
                        node.status === 'DEGRADED' && "bg-yellow-400",
                        node.status === 'DOWN' && "bg-red-400"
                      )}></div>
                      {node.isThirdParty && <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">Third Party</Badge>}
                      {node.criticality === 'CRITICAL' && <Badge className="bg-red-600 hover:bg-red-700 text-xs">Critical</Badge>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Network className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-bold text-white">Dependencies ({edges.length})</h4>
          </div>
          <div className="space-y-3">
            {edges.map((edge, index) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);

              return (
                <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-medium text-white text-sm">{sourceNode?.name}</span>
                      <ArrowRight className={cn(
                        "h-4 w-4",
                        edge.criticality === 'CRITICAL' ? "text-red-400" : "text-slate-400"
                      )} />
                      <span className="font-medium text-white text-sm">{targetNode?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "text-xs",
                        edge.criticality === 'CRITICAL' ? "bg-red-600 hover:bg-red-700" : "bg-slate-600 hover:bg-slate-700"
                      )}>
                        {edge.type}
                      </Badge>
                      {edge.criticality === 'CRITICAL' && (
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeDetailPopup({ node, onClose }: { node: DependencyNode; onClose: () => void }) {
  const getIcon = () => {
    if (node.isThirdParty) return <Cloud className="h-5 w-5 text-blue-400" />;
    if (node.type === 'Database') return <Database className="h-5 w-5 text-current" />;
    if (node.type === 'Service' || node.type === 'Identity Service') return <Shield className="h-5 w-5 text-current" />;
    return <Server className="h-5 w-5 text-current" />;
  };

  const getStatusColor = () => {
    switch (node.status) {
      case 'ACTIVE': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'DEGRADED': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'DOWN': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getCriticalityColor = () => {
    switch (node.criticality) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'IMPORTANT': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'STANDARD': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'LOW': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl p-6 z-20 min-w-80 animate-in slide-in-from-right-2 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border-2",
            node.criticality === 'CRITICAL' && "bg-red-900/50 border-red-500",
            node.criticality === 'IMPORTANT' && "bg-yellow-900/50 border-yellow-500",
            node.criticality === 'STANDARD' && "bg-green-900/50 border-green-500",
            node.criticality === 'LOW' && "bg-gray-900/50 border-gray-500",
            node.isThirdParty && "bg-blue-900/50 border-blue-500"
          )}>
            {getIcon()}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{node.name}</h3>
            <p className="text-slate-400 text-sm">{node.assetId}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Type</p>
            <p className="text-sm text-white font-medium">{node.type}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Provider</p>
            <p className="text-sm text-white font-medium">
              {node.isThirdParty ? 'Third Party' : 'Internal'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</p>
            <div className={cn("inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border", getStatusColor())}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                node.status === 'ACTIVE' && "bg-green-400",
                node.status === 'DEGRADED' && "bg-yellow-400",
                node.status === 'DOWN' && "bg-red-400"
              )}></div>
              {node.status}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Criticality</p>
            <div className={cn("inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border", getCriticalityColor())}>
              {node.criticality === 'CRITICAL' && <AlertTriangle className="h-3 w-3" />}
              {node.criticality}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
        <Button size="sm" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
          <Settings className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Zap className="h-4 w-4 mr-2" />
          Impact Sim
        </Button>
      </div>
    </div>
  );
}