import React from 'react';
import { AlertTriangle, FileText, Shield, Clock, MapPin, Server, Database, Gavel } from 'lucide-react';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { BlockEvent } from './types';

interface EvidenceDetailProps {
  blockEvent: BlockEvent;
}

const EvidenceDetail: React.FC<EvidenceDetailProps> = ({ blockEvent }) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };


  return (
    <div className="space-y-6">
      {/* Shadow Mode Banner */}
      {blockEvent.shadowMode && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-yellow-400">SENSITIVE AUDIT LOG - SIMULATED BLOCK</span>
          </div>
          <p className="text-yellow-300 mt-2 text-sm">
            This block was simulated in shadow mode. No actual data transfer was prevented.
          </p>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Evidence Detail</h2>
        <p className="text-slate-400">Block ID: {blockEvent.id}</p>
      </div>

      {/* Block Overview */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Block Overview</h3>
          <SeverityBadge level={
            blockEvent.blockLevel === 'L1' ? 2 :
            blockEvent.blockLevel === 'L2' ? 3 :
            4
          } />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-400">Timestamp</p>
              <p className="text-white font-medium">{formatTimestamp(blockEvent.timestamp)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-400">Destination</p>
              <p className="text-white font-medium">{blockEvent.destination.country} ({blockEvent.destination.countryCode})</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-400">Source</p>
              <p className="text-white font-medium">{blockEvent.source}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-sm text-slate-400">User</p>
              <p className="text-white font-medium">{blockEvent.user}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Transfer Volume</span>
            <span className="text-white font-medium">
              {blockEvent.transferVolume.records.toLocaleString()} records • {blockEvent.transferVolume.size}
            </span>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-slate-400 text-sm">Reason</p>
          <p className="text-white mt-1">{blockEvent.reason}</p>
        </div>
      </div>

      {/* Technical Evidence */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Technical Evidence</h3>
        </div>

        {blockEvent.evidenceVault ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Request ID (Rust)</span>
                <code className="text-blue-400 font-mono text-sm bg-slate-800 px-2 py-1 rounded">
                  {blockEvent.evidenceVault.requestId}
                </code>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Source IP</span>
                <code className="text-green-400 font-mono text-sm bg-slate-800 px-2 py-1 rounded">
                  {blockEvent.evidenceVault.sourceIP}
                </code>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">AI Gateway Endpoint</span>
                <code className="text-purple-400 font-mono text-sm bg-slate-800 px-2 py-1 rounded">
                  {blockEvent.destination.endpoint || 'N/A'}
                </code>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Data Category</span>
                <SeverityBadge level={2} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Technical evidence not available</p>
          </div>
        )}
      </div>

      {/* Legal Evidence */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Gavel className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Legal Evidence</h3>
        </div>

        {blockEvent.evidenceVault ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">GDPR Citation</span>
                <span className="text-purple-400 font-medium">
                  {blockEvent.evidenceVault.gdprCitation}
                </span>
              </div>
              <p className="text-sm text-slate-300">
                Article 44-49: International data transfers and adequacy decisions
              </p>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">SCC Mechanism Status</span>
                <SeverityBadge level={
                  blockEvent.evidenceVault.sccStatus === 'VALID' ? 1 :
                  blockEvent.evidenceVault.sccStatus === 'EXPIRED' ? 4 :
                  blockEvent.evidenceVault.sccStatus === 'MISSING' ? 3 :
                  1
                } />
              </div>
              <p className="text-sm text-slate-300">
                Standard Contractual Clauses compliance status for international data transfers
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Legal evidence not available</p>
          </div>
        )}
      </div>

      {/* Compliance Status */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Compliance Assessment</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Transfer Mechanism</span>
            <span className={`font-medium ${blockEvent.mechanism ? 'text-green-400' : 'text-red-400'}`}>
              {blockEvent.mechanism ? blockEvent.mechanism.type : 'None Available'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Adequacy Decision</span>
            <span className="text-slate-400">Not Applicable</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Shadow Mode</span>
            <span className={`font-medium ${blockEvent.shadowMode ? 'text-yellow-400' : 'text-slate-400'}`}>
              {blockEvent.shadowMode ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetail;
