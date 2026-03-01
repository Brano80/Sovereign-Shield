'use client';

import React, { useState, useEffect, useMemo } from 'react';
import WorldMap from './WorldMap';
import { EvidenceEvent } from '../utils/api';
import {
  EU_EEA_COUNTRIES,
  SCC_REQUIRED_COUNTRIES,
  BLOCKED_COUNTRIES,
  ADEQUATE_COUNTRIES,
  COUNTRY_NAMES,
  TOPOJSON_COUNTRY_NAMES,
  getCountryCodeFromName,
} from '../config/countries';

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

const SovereignMap: React.FC<SovereignMapProps> = ({ evidenceEvents = [], isLoading, onCountryClick }) => {
  const [countries, setCountries] = useState<CountryData[]>([]);

  const processedCountries = useMemo(() => {
    if (!evidenceEvents || evidenceEvents.length === 0) {
      return [];
    }

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const countryEventMap = new Map<string, { lastTransfer: number; lastBlocked: number; count: number }>();

    // Process events to build country map — include any event with valid destination (ALLOW, BLOCK, or REVIEW)
    evidenceEvents.forEach((event: any) => {
      const payload = event.payload || {};
      const destCode =
        event.destinationCountryCode ||
        event.destination_country_code ||
        payload.destinationCountryCode ||
        payload.destination_country_code ||
        payload.country_code;
      const destCountry =
        event.destinationCountry ||
        event.destination_country ||
        payload.destination_country ||
        payload.destinationCountry;
      let countryCode = (destCode || '').trim().toUpperCase();
      if (!countryCode && destCountry) {
        countryCode = getCountryCodeFromName(destCountry);
      }
      const mappedName = TOPOJSON_COUNTRY_NAMES[countryCode] || COUNTRY_NAMES[countryCode] || countryCode;
      if (process.env.NODE_ENV === 'development' && countryCode) {
        console.log('[Map] extracted code:', countryCode, '→ topoName:', mappedName);
      }

      if (!countryCode || countryCode === 'EU' || countryCode === 'UN' || countryCode.length !== 2) {
        return;
      }

      // Include any event with valid destination — case-insensitive, regardless of exact event type
      const eventTime = event.occurredAt || event.recordedAt || event.createdAt;
      if (!eventTime) return;

      const eventTimestamp = new Date(eventTime).getTime();
      if (eventTimestamp < thirtyDaysAgo) return;

      if (!countryEventMap.has(countryCode)) {
        countryEventMap.set(countryCode, { lastTransfer: 0, lastBlocked: 0, count: 0 });
      }

      const countryEvents = countryEventMap.get(countryCode)!;
      countryEvents.count += 1;

      const eventType = (event.eventType || '').toUpperCase();
      const isBlocked = eventType.includes('BLOCK') || (event.verificationStatus || '').toUpperCase() === 'BLOCK';
      if (isBlocked) {
        countryEvents.lastBlocked = Math.max(countryEvents.lastBlocked, eventTimestamp);
      } else {
        countryEvents.lastTransfer = Math.max(countryEvents.lastTransfer, eventTimestamp);
      }
    });

    // Convert to CountryData array
    const convertedCountries: CountryData[] = [];

    countryEventMap.forEach((events, countryCode) => {
      const hasRecentTransfer = events.lastTransfer >= thirtyDaysAgo;
      const hasBlocked = events.lastBlocked > 0;

      // Show country if it had any transfer activity (ALLOW, BLOCK, or REVIEW) in last 30 days
      if (!hasRecentTransfer && !hasBlocked) {
        return;
      }

      // Determine status based on country classification
      // Order matters: check EU/EEA first, then blocked, then SCC-required, then adequate, then unknown
      let status: 'adequate_protection' | 'scc_required' | 'blocked';
      if (EU_EEA_COUNTRIES.has(countryCode)) {
        // EU/EEA countries are treated as adequate protection (no transfer restrictions)
        status = 'adequate_protection';
      } else if (BLOCKED_COUNTRIES.has(countryCode)) {
        status = 'blocked';
      } else if (SCC_REQUIRED_COUNTRIES.has(countryCode)) {
        status = 'scc_required';
      } else if (ADEQUATE_COUNTRIES.has(countryCode)) {
        status = 'adequate_protection';
      } else {
        // Default to SCC-required for unknown countries (safer than blocked per GDPR Art. 25)
        status = 'scc_required';
      }

      // Use TopoJSON country name — TOPOJSON_COUNTRY_NAMES has exact names (e.g. "United States of America" for US)
      const mappedName = TOPOJSON_COUNTRY_NAMES[countryCode] || COUNTRY_NAMES[countryCode] || countryCode;

      convertedCountries.push({
        code: countryCode,
        name: mappedName,
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
