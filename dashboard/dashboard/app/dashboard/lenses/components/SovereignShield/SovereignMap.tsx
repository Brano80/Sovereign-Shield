'use client';

import React, { useState, useEffect } from 'react';
import WorldMap from './WorldMap';
import { CountryData } from './types';
import { complianceApi } from '@/app/lib/api-client';

interface SovereignMapProps {
  countries?: any[];
  evidenceEvents?: any[];
  isLoading?: boolean;
  onCountryClick?: (country: any) => void;
  sccRegistries?: any[];
}

interface ApiCountryData {
  code: string;
  name: string;
  status: 'adequate_protection' | 'scc_required' | 'blocked';
  transfers: number;
  mechanisms: number;
}

interface WorldMapCountryData {
  code: string;
  name: string;
  status: 'adequate_protection' | 'scc_required' | 'blocked';
  transfers: number;
  mechanisms: number;
}

// Country code to name mapping for TopoJSON lookup (FIX 1)
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

const SovereignMap: React.FC<SovereignMapProps> = ({ countries: initialCountries = [], evidenceEvents = [], isLoading, onCountryClick, sccRegistries = [] }) => {
  const [countries, setCountries] = useState<WorldMapCountryData[]>(initialCountries);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      setApiLoading(true);
      setApiError(null);

      try {
        const apiResponse: any = await complianceApi.get('/lenses/sovereign-shield/countries', { timeout: 10000 });
        // Handle both array response and wrapped response
        const apiCountries: ApiCountryData[] = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.countries || apiResponse?.data || []);
        
        console.log('🔍 SovereignMap: Fetched countries from API:', apiCountries.length, 'countries');

        // SCC-required countries: US, AU, BR, MX, SG, ZA (always orange)
        const SCC_REQUIRED_COUNTRIES = new Set(['US', 'AU', 'BR', 'MX', 'SG', 'ZA']);
        // Blocked countries: CN, RU, KP, IR, SY, VE, BY (always red)
        const BLOCKED_COUNTRIES = new Set(['CN', 'RU', 'KP', 'IR', 'SY', 'VE', 'BY']);

        // Build a lookup map from API countries for status, names and metadata
        const apiCountryLookup = new Map<string, ApiCountryData>();
        apiCountries.forEach((apiCountry: ApiCountryData) => {
          apiCountryLookup.set(apiCountry.code.toUpperCase(), apiCountry);
        });

        // Track countries that have transfer events in last 7 days
        const countryEventMap = new Map<string, { lastTransfer: number; lastBlocked: number }>();
        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

        evidenceEvents.forEach((event: any) => {
          const payload = event.payload || {};
          const countryCode = (payload.destination_country_code || payload.country_code || '').toUpperCase();

          if (!countryCode || countryCode === 'EU' || countryCode === 'UN') return;

          const eventTime = event.occurredAt || event.recordedAt || event.createdAt;
          if (!eventTime) return;

          const eventTimestamp = new Date(eventTime).getTime();

          // Track events per country
          if (!countryEventMap.has(countryCode)) {
            countryEventMap.set(countryCode, { lastTransfer: 0, lastBlocked: 0 });
          }
          const countryEvents = countryEventMap.get(countryCode)!;

          if (event.eventType === 'DATA_TRANSFER') {
            if (eventTimestamp >= sevenDaysAgo) {
              countryEvents.lastTransfer = Math.max(countryEvents.lastTransfer, eventTimestamp);
            }
          } else if (event.eventType === 'DATA_TRANSFER_BLOCKED') {
            countryEvents.lastBlocked = Math.max(countryEvents.lastBlocked, eventTimestamp);
          }
        });

        // Build countries list from evidence events with status from API
        // Map coloring rules:
        // - adequate_protection: Green (country in ADEQUATE list from API)
        // - scc_required: Orange (country in SCC_REQUIRED list - ALWAYS orange regardless of SCC registration)
        // - blocked: Red (all others - CN, RU, KP etc)
        const convertedCountries: WorldMapCountryData[] = [];
        
        countryEventMap.forEach((events, countryCode) => {
          // Only include countries with events in last 7 days
          const hasRecentTransfer = events.lastTransfer >= sevenDaysAgo;
          const hasBlocked = events.lastBlocked > 0;
          
          if (!hasRecentTransfer && !hasBlocked) {
            // Skip countries with no recent events
            return;
          }

          // Get country metadata from API lookup
          const apiCountry = apiCountryLookup.get(countryCode);
          
          // Determine status based on country classification (not SCC registration)
          let status: 'adequate_protection' | 'scc_required' | 'blocked';
          if (BLOCKED_COUNTRIES.has(countryCode)) {
            // RED: Blocked countries (CN, RU, KP etc)
            status = 'blocked';
          } else if (SCC_REQUIRED_COUNTRIES.has(countryCode)) {
            // ORANGE: SCC-required countries (ALWAYS orange, regardless of SCC registration)
            status = 'scc_required';
          } else if (apiCountry?.status === 'adequate_protection') {
            // GREEN: Adequate countries from API
            status = 'adequate_protection';
          } else {
            // Default to API status or blocked if unknown
            status = (apiCountry?.status as 'adequate_protection' | 'scc_required' | 'blocked') || 'blocked';
          }

          // Use country name mapping for TopoJSON lookup
          const mappedName = countryNames[countryCode] || apiCountry?.name || countryCode;
          
          convertedCountries.push({
            code: countryCode,
            name: mappedName,
            status: status,
            transfers: apiCountry?.transfers || 0,
            mechanisms: apiCountry?.mechanisms || 0
          });
        });

        // Filter out invalid country codes
        const validCountries = convertedCountries.filter(c => /^[A-Z]{2}$/.test(c.code));

        console.log('🔍 SovereignMap: Countries from evidence events:', convertedCountries.length, 'countries');
        console.log('🔍 SovereignMap: Valid countries after filtering:', validCountries.length, 'countries');
        console.log('🔍 SovereignMap: Sample countries:', validCountries.slice(0, 3));
        
        // Verify countries array is non-empty before passing to WorldMap
        if (validCountries.length === 0) {
          console.warn('⚠️ SovereignMap: No countries to display - no valid countries with events in last 7 days');
        } else {
          console.log('✅ SovereignMap: Passing', validCountries.length, 'countries to WorldMap');
          // Log sample to verify status field is present
          const sample = validCountries.slice(0, 3);
          sample.forEach(c => {
            console.log(`  - ${c.code}: status=${c.status}, transfers=${c.transfers}`);
          });
        }

        setCountries(validCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setApiError(error instanceof Error ? error.message : 'Unknown error');

        // Fall back to initial countries if provided
        if (initialCountries.length > 0) {
          setCountries(initialCountries);
        }
      } finally {
        setApiLoading(false);
      }
    };

    // Always fetch from API to get latest data
    fetchCountries();
  }, [evidenceEvents]);

  return (
    <WorldMap
      countries={countries}
      isLoading={isLoading || apiLoading}
      onCountryClick={onCountryClick}
    />
  );
};

export default SovereignMap;
