import React from 'react';
import { Clock, AlertTriangle, Shield, MapPin, Server, Database, FileText, ExternalLink } from 'lucide-react';

interface EvidenceEvent {
  id: string;
  eventId: string;
  correlationId: string;
  causationId?: string;
  sequenceNumber: bigint;
  occurredAt: string;
  recordedAt: string;
  eventType: string;
  severity: 'L1' | 'L2' | 'L3' | 'L4';
  sourceSystem: string;
  sourceIp?: string;
  regulatoryTags: string[];
  articles: string[];
  payload: {
    destinationCountry?: string;
    destinationCountryCode?: string;
    endpoint?: string;
    dataCategory?: string;
    records?: number;
    size?: string;
    requestId?: string;
    transferMechanism?: string;
    sccStatus?: string;
    [key: string]: any;
  };
  payloadHash: string;
  previousHash: string;
  verificationStatus?: string;
  lastVerification?: string;
  createdAt: string;
  updatedAt: string;
}

interface EvidenceEventsTableProps {
  events: EvidenceEvent[];
  isLoading: boolean;
  highlightedEventId?: string | null;
  onEventClick: (event: EvidenceEvent) => void;
}

const EvidenceEventsTable: React.FC<EvidenceEventsTableProps> = ({
  events,
  isLoading,
  highlightedEventId,
  onEventClick
}) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'L1': return 'text-green-700 bg-green-100 border-green-200'; // Low: Green background
      case 'L2': return 'text-blue-700 bg-blue-100 border-blue-200'; // Medium: Blue background
      case 'L3': return 'text-orange-700 bg-orange-100 border-orange-200'; // High: Orange background
      case 'L4': return 'text-white bg-red-600 border-red-700'; // Critical: Red background / White text
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'L1': return <Shield className="w-4 h-4 text-green-600" />; // Low: Green shield
      case 'L2': return <AlertTriangle className="w-4 h-4 text-blue-600" />; // Medium: Blue alert
      case 'L3': return <AlertTriangle className="w-4 h-4 text-orange-600" />; // High: Orange alert
      case 'L4': return <AlertTriangle className="w-4 h-4 text-red-600" />; // Critical: Red alert
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'DATA_TRANSFER': return 'text-blue-400 bg-blue-500/10';
      case 'CONTRACTUAL': return 'text-emerald-400 bg-emerald-500/10';
      case 'SHADOW_MODE_TEST': return 'text-purple-400 bg-purple-500/10';
      case 'COMPLIANCE_CHECK': return 'text-green-400 bg-green-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-slate-400">Loading evidence events...</span>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-700/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="text-center text-slate-400 py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Evidence Events Found</h3>
          <p>Try adjusting your filters or check back later for new events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Evidence Events Archive</h3>
        <p className="text-slate-400 text-sm">{events.length} events found</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Verification</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {events.map((event) => {
              const isHighlighted = highlightedEventId && (
                event.id === highlightedEventId ||
                event.eventId === highlightedEventId ||
                event.correlationId === highlightedEventId
              );

              return (
                <tr
                  key={event.id}
                  className={`cursor-pointer transition-colors ${
                    isHighlighted
                      ? 'bg-blue-500/20 border-l-4 border-l-blue-400 hover:bg-blue-500/30'
                      : 'hover:bg-slate-700/30'
                  }`}
                  onClick={() => onEventClick(event)}
                >
                  {/* Event Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.eventType ?? '')}`}>
                        {event.eventType?.replace('_', ' ') ?? 'Unknown'}
                      </div>
                      <div>
                        <div className="text-white font-medium">{event.eventId ?? 'N/A'}</div>
                        <div className="text-slate-400 text-sm">Seq: {event.sequenceNumber?.toString() ?? 'N/A'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Risk Level */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                      {getSeverityIcon(event.severity)}
                      {event.severity}
                    </span>
                  </td>

                  {/* Destination */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">
                          {event.payload?.destinationCountry ?? 'N/A'}
                          {event.payload?.destinationCountryCode && (
                            <span className="text-slate-400 ml-1">({event.payload.destinationCountryCode})</span>
                          )}
                        </div>
                        {event.payload?.endpoint ? (
                          <div className="text-slate-400 text-sm">{event.payload.endpoint}</div>
                        ) : (
                          <div className="text-slate-400 text-sm">No endpoint</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Data Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{event.payload?.dataCategory ?? 'N/A'}</div>
                        {typeof event.payload?.records === 'number' ? (
                          <div className="text-slate-400 text-sm">
                            {event.payload.records.toLocaleString()} records • {event.payload?.size ?? 'Unknown size'}
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm">No record count • {event.payload?.size ?? 'Unknown size'}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{event.sourceSystem ?? 'N/A'}</div>
                        {event.sourceIp ? (
                          <div className="text-slate-400 text-sm">{event.sourceIp}</div>
                        ) : (
                          <div className="text-slate-400 text-sm">No IP available</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{formatTimeAgo(event.occurredAt)}</div>
                        <div className="text-slate-400 text-sm">{formatTimestamp(event.occurredAt)}</div>
                      </div>
                    </div>
                  </td>

                  {/* Verification Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {event.verificationStatus === 'VERIFIED' ? (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <div>
                            <div className="text-emerald-400 font-medium text-sm">VERIFIED</div>
                            {event.lastVerification && (
                              <div className="text-slate-400 text-xs">
                                {formatTimestamp(event.lastVerification)}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : event.verificationStatus === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
                          <div>
                            <div className="text-yellow-400 font-medium text-sm">PENDING</div>
                            <div className="text-slate-400 text-xs">Awaiting verification</div>
                          </div>
                        </div>
                      ) : event.verificationStatus === 'FAILED' ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <div>
                            <div className="text-red-400 font-medium text-sm">FAILED</div>
                            <div className="text-slate-400 text-xs">Verification error</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-500" />
                          <div>
                            <div className="text-slate-500 font-medium text-sm">UNVERIFIED</div>
                            <div className="text-slate-400 text-xs">Not yet verified</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination info */}
      <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Showing {events.length} events</span>
          <span>Evidence Vault maintains immutable audit trail</span>
        </div>
      </div>
    </div>
  );
};

export default EvidenceEventsTable;
