"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Restriction {
  id: string;
  dataSubject: string;
  type: 'FULL' | 'PARTIAL';
  affectedProcessing: string[];
  reason: string;
  since: Date;
  reviewDate: Date;
  status: 'ACTIVE' | 'REVIEW' | 'LIFTED';
}

interface Objection {
  id: string;
  dataSubject: string;
  type: 'DIRECT_MARKETING' | 'LEGITIMATE_INTERESTS';
  grounds?: string;
  since: Date;
  status: 'ACTIVE' | 'REVIEW' | 'ACCEPTED' | 'REJECTED';
}

export function RestrictionsObjectionsTab() {
  const [activeSubTab, setActiveSubTab] = useState<'restrictions' | 'objections'>('restrictions');

  const mockRestrictions: Restriction[] = [
    {
      id: 'RESTRICT-0892',
      dataSubject: 'lisa.brown@example.com',
      type: 'PARTIAL',
      affectedProcessing: ['Marketing emails', 'Analytics tracking'],
      reason: 'Contesting data accuracy',
      since: new Date('2025-01-02'),
      reviewDate: new Date('2025-01-16'),
      status: 'ACTIVE'
    }
  ];

  const mockObjections: Objection[] = [
    {
      id: 'OBJECT-1247',
      dataSubject: 'tom.wilson@example.com',
      type: 'DIRECT_MARKETING',
      since: new Date('2025-01-03'),
      status: 'ACTIVE'
    },
    {
      id: 'OBJECT-1245',
      dataSubject: 'sarah.miller@example.com',
      type: 'LEGITIMATE_INTERESTS',
      grounds: 'Credit scoring for fraud prevention',
      since: new Date('2025-01-05'),
      status: 'REVIEW'
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilReview = (reviewDate: Date) => {
    const today = new Date();
    const diffTime = reviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
            <AlertTriangle size={24} className="text-yellow-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">PROCESSING RESTRICTIONS & OBJECTIONS</h2>
            <p className="text-slate-400 text-sm mb-2">Article 18 (Restriction) • Article 21 (Right to Object)</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Data subjects can restrict processing and object to processing based on legitimate grounds.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveSubTab('restrictions')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSubTab === 'restrictions'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Restrictions (Art. 18)
          </button>
          <button
            onClick={() => setActiveSubTab('objections')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSubTab === 'objections'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Objections (Art. 21)
          </button>
        </div>
      </div>

      {/* Restrictions Tab */}
      {activeSubTab === 'restrictions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">ACTIVE RESTRICTIONS</h3>
            <div className="text-sm text-slate-400">
              {mockRestrictions.length} active
            </div>
          </div>

          {mockRestrictions.map((restriction) => (
            <div key={restriction.id} className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{restriction.id}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      restriction.type === 'FULL'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {restriction.type} RESTRICTION
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      restriction.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : restriction.status === 'REVIEW'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}>
                      {restriction.status}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm mb-3">
                    Data Subject: <span className="text-white">{restriction.dataSubject}</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Reason:</span>
                      <div className="text-white">{restriction.reason}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Since:</span>
                      <div className="text-slate-300">{formatDate(restriction.since)}</div>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-500">Affected Processing:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {restriction.affectedProcessing.map((process, index) => (
                          <span key={index} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">
                            ✗ {process}
                          </span>
                        ))}
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
                          ✓ Core service
                        </span>
                      </div>
                    </div>
                  </div>

                  {restriction.status === 'ACTIVE' && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-blue-400" />
                        <span className="text-sm text-blue-400">
                          Review scheduled: {formatDate(restriction.reviewDate)}
                          ({getDaysUntilReview(restriction.reviewDate)} days)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                    Review Restriction
                  </button>
                  <button className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors">
                    Lift Restriction
                  </button>
                  <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                    Contact User
                  </button>
                </div>
              </div>
            </div>
          ))}

          {mockRestrictions.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No active restrictions
            </div>
          )}
        </div>
      )}

      {/* Objections Tab */}
      {activeSubTab === 'objections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">ACTIVE OBJECTIONS</h3>
            <div className="text-sm text-slate-400">
              {mockObjections.length} active
            </div>
          </div>

          {mockObjections.map((objection) => (
            <div key={objection.id} className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{objection.id}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      objection.type === 'DIRECT_MARKETING'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {objection.type.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      objection.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : objection.status === 'REVIEW'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        : objection.status === 'ACCEPTED'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {objection.status}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm mb-3">
                    Data Subject: <span className="text-white">{objection.dataSubject}</span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Objection Type:</span>
                      <div className="text-white">
                        {objection.type === 'DIRECT_MARKETING'
                          ? 'Direct Marketing (Art. 21(2)) - Absolute right'
                          : 'Legitimate Interests (Art. 21(1)) - Requires review'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Since:</span>
                      <div className="text-slate-300">{formatDate(objection.since)}</div>
                    </div>
                    {objection.grounds && (
                      <div className="md:col-span-2">
                        <span className="text-slate-500">Processing:</span>
                        <div className="text-white">{objection.grounds}</div>
                      </div>
                    )}
                  </div>

                  {objection.status === 'ACTIVE' && objection.type === 'DIRECT_MARKETING' && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded">
                      <div className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-sm text-green-400">
                          All direct marketing ceased immediately
                        </span>
                      </div>
                    </div>
                  )}

                  {objection.status === 'REVIEW' && objection.type === 'LEGITIMATE_INTERESTS' && (
                    <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle size={16} className="text-orange-400 mt-0.5" />
                        <div>
                          <div className="text-orange-400 font-medium text-sm">Review needed</div>
                          <div className="text-orange-300 text-sm">Compelling grounds assessment required</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                    Audit Trail
                  </button>

                  {objection.status === 'REVIEW' && (
                    <>
                      <button className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors">
                        Accept Objection
                      </button>
                      <button className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors">
                        Reject with Reason
                      </button>
                    </>
                  )}

                  {objection.status === 'ACTIVE' && objection.type === 'LEGITIMATE_INTERESTS' && (
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                      Assess Grounds
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {mockObjections.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No active objections
            </div>
          )}
        </div>
      )}
    </div>
  );
}
