'use client';

import React, { useState, useEffect, useMemo } from 'react';
import WorldMap from './WorldMap';
import { EvidenceEvent } from '../utils/api';

interface SovereignMapProps {
  evidenceEvents?: EvidenceEvent[];
  isLoading?: boolean;
  onCountryClick?: (country: any) => void;
}

interface CountryData {
  code: string;
  name: string;
  status: 'adequate_protection' | 'scc_required' | 'blocked';
  transfers: number;
}

// SCC-required countries (align with Adequate Countries page): US, IN, AU, BR, MX, SG, ZA, etc.
const SCC_REQUIRED_COUNTRIES = new Set(['US', 'IN', 'AU', 'BR', 'MX', 'SG', 'ZA', 'ID', 'TR', 'PH', 'VN', 'EG', 'NG', 'PK', 'BD', 'TH', 'MY']);
// Blocked countries (align with Adequate Countries page): CN, RU, KP, IR, SY, BY
const BLOCKED_COUNTRIES = new Set(['CN', 'RU', 'KP', 'IR', 'SY', 'BY']);

// Adequate countries (EU-recognised)
const ADEQUATE_COUNTRIES = new Set([
  'AD', 'AR', 'CA', 'FO', 'GG', 'IL', 'IM', 'JP', 'JE', 'NZ', 'KR', 'CH', 'GB', 'UY'
]);

// TopoJSON country name mapping (TopoJSON uses full country names, not codes)
const countryNames: Record<string, string> = {
  'DE': 'Germany',
  'CN': 'China',
  'RU': 'Russia',
  'US': 'United States of America',
  'GB': 'United Kingdom',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'AT': 'Austria',
  'SE': 'Sweden',
  'DK': 'Denmark',
  'NO': 'Norway',
  'FI': 'Finland',
  'CH': 'Switzerland',
  'JP': 'Japan',
  'AU': 'Australia',
  'CA': 'Canada',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'SG': 'Singapore',
  'ZA': 'South Africa',
  'KR': 'South Korea',
  'NZ': 'New Zealand',
  'AR': 'Argentina',
  'UY': 'Uruguay',
  'IL': 'Israel',
  'AD': 'Andorra',
  'FO': 'Faroe Islands',
  'GG': 'Guernsey',
  'IM': 'Isle of Man',
  'JE': 'Jersey',
  'PL': 'Poland',
  'PT': 'Portugal',
  'RO': 'Romania',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
  'GR': 'Greece',
  'HU': 'Hungary',
  'IE': 'Ireland',
  'LV': 'Latvia',
  'LT': 'Lithuania',
  'LU': 'Luxembourg',
  'MT': 'Malta',
  'CZ': 'Czechia',
  'EE': 'Estonia',
  'CY': 'Cyprus',
  'HR': 'Croatia',
  'BG': 'Bulgaria',
  'IS': 'Iceland',
  'LI': 'Liechtenstein',
};

const SovereignMap: React.FC<SovereignMapProps> = ({ evidenceEvents = [], isLoading, onCountryClick }) => {
  const [countries, setCountries] = useState<CountryData[]>([]);

  const processedCountries = useMemo(() => {
    if (!evidenceEvents || evidenceEvents.length === 0) {
      return [];
    }

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const countryEventMap = new Map<string, { lastTransfer: number; lastBlocked: number; count: number }>();

    // Process events to build country map
    evidenceEvents.forEach((event: any) => {
      const payload = event.payload || {};
      const countryCode = (payload.destination_country_code || payload.country_code || '').toUpperCase();

      if (!countryCode || countryCode === 'EU' || countryCode === 'UN' || countryCode.length !== 2) {
        return;
      }

      const eventTime = event.occurredAt || event.recordedAt || event.createdAt;
      if (!eventTime) return;

      const eventTimestamp = new Date(eventTime).getTime();

      if (!countryEventMap.has(countryCode)) {
        countryEventMap.set(countryCode, { lastTransfer: 0, lastBlocked: 0, count: 0 });
      }

      const countryEvents = countryEventMap.get(countryCode)!;
      countryEvents.count += 1;

      if (event.eventType === 'DATA_TRANSFER') {
        if (eventTimestamp >= sevenDaysAgo) {
          countryEvents.lastTransfer = Math.max(countryEvents.lastTransfer, eventTimestamp);
        }
      } else if (event.eventType === 'DATA_TRANSFER_BLOCKED') {
        countryEvents.lastBlocked = Math.max(countryEvents.lastBlocked, eventTimestamp);
      }
    });

    // Convert to CountryData array
    const convertedCountries: CountryData[] = [];

    countryEventMap.forEach((events, countryCode) => {
      const hasRecentTransfer = events.lastTransfer >= sevenDaysAgo;
      const hasBlocked = events.lastBlocked > 0;

      if (!hasRecentTransfer && !hasBlocked) {
        return;
      }

      // Determine status based on country classification
      let status: 'adequate_protection' | 'scc_required' | 'blocked';
      if (BLOCKED_COUNTRIES.has(countryCode)) {
        status = 'blocked';
      } else if (SCC_REQUIRED_COUNTRIES.has(countryCode)) {
        status = 'scc_required';
      } else if (ADEQUATE_COUNTRIES.has(countryCode)) {
        status = 'adequate_protection';
      } else {
        // Default to blocked for unknown countries
        status = 'blocked';
      }

      // Use TopoJSON country name (full name, not code)
      const mappedName = countryNames[countryCode] || countryCode;

      convertedCountries.push({
        code: countryCode,
        name: mappedName, // TopoJSON uses full country names
        status: status,
        transfers: events.count,
        mechanisms: 0,
      });
    });

    return convertedCountries.filter(c => /^[A-Z]{2}$/.test(c.code));
  }, [evidenceEvents]);

  useEffect(() => {
    setCountries(processedCountries);
  }, [processedCountries]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-slate-400">Loading map...</div>
      </div>
    );
  }

  return (
    <WorldMap countries={countries} isLoading={isLoading} onCountryClick={onCountryClick} />
  );
};

export default SovereignMap;
