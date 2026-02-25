"use client";

import { RegulatoryClock } from '../components/RegulatoryClock';
import { IncidentsByRegulation } from '../components/IncidentsByRegulation';
import { IncidentTrendChart } from '../components/IncidentTrendChart';
import { RequiresAttentionPanel } from '../components/RequiresAttentionPanel';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { Incident, IncidentDeadline } from '../types';

interface OverviewTabProps {
  data?: {
    incidents: Incident[];
    deadlines: IncidentDeadline[];
  };
  loading?: boolean;
}

export function OverviewTab({ data, loading }: OverviewTabProps) {
  const handleRegulationClick = (regulation: string) => {
    // Navigate to All Incidents tab with regulation filter
    console.log('Filter by regulation:', regulation);
  };

  const handleViewAllAttention = () => {
    // Navigate to full attention view or modal
    console.log('View all attention items');
  };

  const handleViewAllActivity = () => {
    // Navigate to full activity feed
    console.log('View all activities');
  };

  const handleAttentionItemClick = (item: any) => {
    // Navigate to incident detail
    console.log('Attention item clicked:', item);
  };

  const handleActivityClick = (activity: any) => {
    // Navigate to incident detail or activity detail
    console.log('Activity clicked:', activity);
  };

  return (
    <div className="space-y-6">
      {/* 2-column layout: 60/40 split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (60% width - spans 3/5 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Regulatory Clock - Full width in left column */}
          <RegulatoryClock
            deadlines={data?.deadlines || []}
            loading={loading}
          />

          {/* Incidents by Regulation */}
          <IncidentsByRegulation
            loading={loading}
            onRegulationClick={handleRegulationClick}
          />

          {/* Incident Trend Chart */}
          <IncidentTrendChart
            loading={loading}
          />
        </div>

        {/* Right Column (40% width - spans 2/5 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requires Attention Panel */}
          <RequiresAttentionPanel
            loading={loading}
            onViewAll={handleViewAllAttention}
            onItemClick={handleAttentionItemClick}
          />

          {/* Reporting Compliance Stats */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📊 Reporting Compliance (30 Days)
            </h3>

            <div className="space-y-4">
              {/* On Time Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">On Time</span>
                  <span className="text-emerald-400 font-medium">38 reports (95%)</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              {/* Late Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Late</span>
                  <span className="text-red-400 font-medium">2 reports (5%)</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-400">3.2h</div>
                  <div className="text-xs text-slate-400">Avg Initial Report</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-400">18.4d</div>
                  <div className="text-xs text-slate-400">Avg Final Report</div>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-600">
                {"Target: <4h initial, <30d final"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed - Bottom of page */}
      <RecentActivityFeed
        loading={loading}
        onViewAll={handleViewAllActivity}
        onActivityClick={handleActivityClick}
      />
    </div>
  );
}