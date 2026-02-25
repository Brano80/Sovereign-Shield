"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';
import type { Regulation, IncidentSeverity, IncidentStatus } from '../types';

interface Filters {
  search: string;
  status: IncidentStatus[];
  regulation: Regulation[];
  severity: IncidentSeverity[];
  dateRange: { start: Date; end: Date } | null;
  assignee: string;
}

interface IncidentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS: IncidentStatus[] = ['NEW', 'INVESTIGATING', 'ACTIVE', 'REPORTING', 'RESOLVED', 'OVERDUE'];
const REGULATION_OPTIONS: Regulation[] = ['GDPR', 'DORA', 'NIS2', 'AI_ACT'];
const SEVERITY_OPTIONS: IncidentSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function IncidentFilters({ filters, onFiltersChange, onClearFilters }: IncidentFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: filters.dateRange?.start || null,
    end: filters.dateRange?.end || null
  });

  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleStatusToggle = (status: IncidentStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  const handleRegulationToggle = (regulation: Regulation) => {
    const newRegulation = filters.regulation.includes(regulation)
      ? filters.regulation.filter(r => r !== regulation)
      : [...filters.regulation, regulation];
    updateFilters({ regulation: newRegulation });
  };

  const handleSeverityToggle = (severity: IncidentSeverity) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    updateFilters({ severity: newSeverity });
  };

  const handleDateSelect = (range: { start: Date | null; end: Date | null }) => {
    setDateRange(range);
    if (range.start && range.end) {
      updateFilters({ dateRange: { start: range.start, end: range.end } });
      setShowDatePicker(false);
    }
  };

  const clearDateRange = () => {
    setDateRange({ start: null, end: null });
    updateFilters({ dateRange: null });
  };

  const hasActiveFilters = filters.search ||
    filters.status.length > 0 ||
    filters.regulation.length > 0 ||
    filters.severity.length > 0 ||
    filters.dateRange ||
    filters.assignee;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search incidents..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 w-80"
            />
          </div>

          <Input
            placeholder="Filter by assignee..."
            value={filters.assignee}
            onChange={(e) => updateFilters({ assignee: e.target.value })}
            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 w-48"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-400 hover:text-white"
          >
            <X size={14} className="mr-2" />
            Clear all filters
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Filter size={14} className="mr-2" />
              Status
              {filters.status.length > 0 && (
                <Badge className="ml-2 bg-blue-500/20 text-blue-400">
                  {filters.status.length}
                </Badge>
              )}
              <ChevronDown size={14} className="ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 bg-slate-900 border-slate-700">
            <div className="space-y-2">
              <Label className="text-white font-medium">Status</Label>
              {STATUS_OPTIONS.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => handleStatusToggle(status)}
                    className="border-slate-600"
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {status.replace('_', ' ').toLowerCase()}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Regulation Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Filter size={14} className="mr-2" />
              Regulation
              {filters.regulation.length > 0 && (
                <Badge className="ml-2 bg-green-500/20 text-green-400">
                  {filters.regulation.length}
                </Badge>
              )}
              <ChevronDown size={14} className="ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 bg-slate-900 border-slate-700">
            <div className="space-y-2">
              <Label className="text-white font-medium">Regulation</Label>
              {REGULATION_OPTIONS.map(regulation => (
                <div key={regulation} className="flex items-center space-x-2">
                  <Checkbox
                    id={`regulation-${regulation}`}
                    checked={filters.regulation.includes(regulation)}
                    onCheckedChange={() => handleRegulationToggle(regulation)}
                    className="border-slate-600"
                  />
                  <Label
                    htmlFor={`regulation-${regulation}`}
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {regulation.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Severity Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Filter size={14} className="mr-2" />
              Severity
              {filters.severity.length > 0 && (
                <Badge className="ml-2 bg-red-500/20 text-red-400">
                  {filters.severity.length}
                </Badge>
              )}
              <ChevronDown size={14} className="ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 bg-slate-900 border-slate-700">
            <div className="space-y-2">
              <Label className="text-white font-medium">Severity</Label>
              {SEVERITY_OPTIONS.map(severity => (
                <div key={severity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`severity-${severity}`}
                    checked={filters.severity.includes(severity)}
                    onCheckedChange={() => handleSeverityToggle(severity)}
                    className="border-slate-600"
                  />
                  <Label
                    htmlFor={`severity-${severity}`}
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    {severity.toLowerCase()}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Filter */}
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <CalendarIcon size={14} className="mr-2" />
              Date Range
              {filters.dateRange && (
                <Badge className="ml-2 bg-purple-500/20 text-purple-400">
                  Set
                </Badge>
              )}
              <ChevronDown size={14} className="ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-white font-medium">Date Range</Label>
                {filters.dateRange && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateRange}
                    className="text-slate-400 hover:text-white h-auto p-1"
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-400">Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setDateRange(prev => ({ ...prev, start: date }));
                    }}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-400">End Date</Label>
                  <Input
                    type="date"
                    value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      setDateRange(prev => ({ ...prev, end: date }));
                    }}
                    className="bg-slate-800 border-slate-600 text-white mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDatePicker(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDateSelect(dateRange)}
                  disabled={!dateRange.start || !dateRange.end}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-sm text-slate-400">Active filters:</span>

          {filters.search && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              Search: "{filters.search}"
              <X
                size={12}
                className="ml-2 cursor-pointer"
                onClick={() => updateFilters({ search: '' })}
              />
            </Badge>
          )}

          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="bg-slate-500/20 text-slate-300">
              Status: {status.replace('_', ' ').toLowerCase()}
              <X
                size={12}
                className="ml-2 cursor-pointer"
                onClick={() => handleStatusToggle(status)}
              />
            </Badge>
          ))}

          {filters.regulation.map(regulation => (
            <Badge key={regulation} variant="secondary" className="bg-green-500/20 text-green-400">
              Reg: {regulation.replace('_', ' ')}
              <X
                size={12}
                className="ml-2 cursor-pointer"
                onClick={() => handleRegulationToggle(regulation)}
              />
            </Badge>
          ))}

          {filters.severity.map(severity => (
            <Badge key={severity} variant="secondary" className="bg-red-500/20 text-red-400">
              Sev: {severity.toLowerCase()}
              <X
                size={12}
                className="ml-2 cursor-pointer"
                onClick={() => handleSeverityToggle(severity)}
              />
            </Badge>
          ))}

          {filters.dateRange && (
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
              Date: {filters.dateRange.start.toLocaleDateString()} - {filters.dateRange.end.toLocaleDateString()}
              <X
                size={12}
                className="ml-2 cursor-pointer"
                onClick={clearDateRange}
              />
            </Badge>
          )}

          {filters.assignee && (
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
              Assignee: {filters.assignee}
              <X
                size={12}
                className="ml-2 cursor-pointer"
                onClick={() => updateFilters({ assignee: '' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}