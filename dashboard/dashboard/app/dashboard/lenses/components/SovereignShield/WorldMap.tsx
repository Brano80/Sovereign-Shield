'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { MapPin } from 'lucide-react';

interface CountryData {
  code: string;
  name: string;
  status: 'adequate_protection' | 'scc_required' | 'blocked';
  transfers: number;
  mechanisms: number;
}

interface WorldMapProps {
  countries?: CountryData[];
  isLoading?: boolean;
  onCountryClick?: (country: CountryData) => void;
}

const getCountryColor = (status: string, transfers: number = 0): string => {
  // In empty state (no transfers), use muted/greyed colors
  if (transfers === 0) {
    switch (status) {
      case 'adequate_protection':
        return '#374151'; // grey-700 (muted green)
      case 'scc_required':
        return '#4B5563'; // grey-600 (muted orange)
      case 'blocked':
        return '#6B7280'; // grey-500 (muted red)
      default:
        return '#374151'; // grey-700
    }
  }

  // Normal colors when there are active transfers
  switch (status) {
    case 'adequate_protection':
      return '#10B981'; // green-500
    case 'scc_required':
      return '#F97316'; // orange-500
    case 'blocked':
      return '#EF4444'; // red-500
    default:
      return '#64748B'; // slate-500
  }
};

const getCountryStatus = (status: string): string => {
  switch (status) {
    case 'adequate_protection':
      return 'Adequate Protection';
    case 'scc_required':
      return 'SCC Required';
    case 'blocked':
      return 'Transfer Blocked';
    default:
      return 'Unknown';
  }
};

const formatStatus = (status: string): string => {
  switch (status) {
    case 'adequate_protection':
      return 'Adequate Protection';
    case 'scc_required':
      return 'SCC Required';
    case 'blocked':
      return 'Transfer Blocked';
    default:
      return 'Unknown';
  }
};

const WorldMap: React.FC<WorldMapProps> = ({ countries = [], isLoading, onCountryClick }) => {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [countryMap, setCountryMap] = useState<Map<string, CountryData>>(new Map());

  useEffect(() => {
    console.log('🔍 WorldMap: Received countries prop:', countries.length, 'countries');
    if (countries.length > 0) {
      console.log('🔍 WorldMap: Sample countries:', countries.slice(0, 3).map(c => ({
        code: c.code,
        status: c.status,
        transfers: c.transfers
      })));
    }
    
    // Build countryMap keyed by name (FIX 1) - TopoJSON uses "name" property
    const map = new Map<string, CountryData>();
    countries.forEach(country => {
      map.set(country.name, country);
    });
    setCountryMap(map);
    console.log('🔍 WorldMap: Country map built with', map.size, 'entries');
    console.log('WorldMap countries loaded:', map.size, 'sample:', Array.from(map.entries()).slice(0,3));
  }, [countries]);

  const getCountryData = (countryName: string | undefined): CountryData | null => {
    if (!countryName || typeof countryName !== 'string') return null;
    return countryMap.get(countryName) || null;
  };

  const handleMouseEnter = (geo: any, event: React.MouseEvent) => {
    const countryName = geo.properties.name;
    const countryData = getCountryData(countryName);

    if (countryData) {
      const rect = (event.target as SVGElement).getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });

      setTooltipContent(`${countryData.name}\nStatus: ${formatStatus(countryData.status)}\nTransfers: ${countryData.transfers}\nMechanisms: ${countryData.mechanisms}`);
    }
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
    setTooltipPosition(null);
  };

  const handleCountryClick = (geo: any) => {
    const countryName = geo.properties.name;
    const countryData = getCountryData(countryName);

    if (countryData && onCountryClick) {
      onCountryClick(countryData);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-400">Loading world map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-full relative">
      <h3 className="text-lg font-semibold text-white mb-4">🌍 TRANSFER MAP</h3>

      <div className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 120,
            center: [0, 40]
          }}
          width={800}
          height={500}
          className="w-full h-auto"
        >
          <ZoomableGroup zoom={1} center={[0, 40]}>
            <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
              {({ geographies }: { geographies: any[] }) => {
                // Log first geography's ALL properties
                if (geographies.length > 0) {
                  console.log('First geo properties:', JSON.stringify(geographies[0]?.properties));
                }
                
                let matchCount = 0;
                return geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const countryData = getCountryData(countryName);
                  
                  // Log first 3 matches only
                  if (countryData && matchCount < 3) {
                    matchCount++;
                    console.log('MAP MATCH:', countryName, geo.properties.name, countryData.status);
                  }
                  
                  // Log if DE transfer exists and we're checking Germany
                  if (countryName === 'Germany' && countryData) {
                    console.log('Germany (DE) match found:', countryData);
                  }
                  
                  const fillColor = countryData 
                    ? getCountryColor(countryData.status, countryData.transfers)
                    : '#374151';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#1f2937"
                      strokeWidth={0.5}
                      onMouseEnter={(event: React.MouseEvent) => handleMouseEnter(geo, event)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", opacity: 0.8 },
                        pressed: { outline: "none" }
                      }}
                    />
                  );
                });
              }}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 rounded-lg p-3">
          <div className="text-white text-sm font-medium mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-slate-300">Adequate Protection</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-slate-300">SCC Required</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-slate-300">Transfer Blocked</span>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltipContent && tooltipPosition && (
          <div
            className="absolute bg-slate-900/95 border border-slate-700 rounded-lg p-3 min-w-48 z-10 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <div className="text-white font-medium text-sm whitespace-pre-line">
                {tooltipContent}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-slate-400 text-center">
        Map will show transfer destinations and routes
      </div>
    </div>
  );
};

export default WorldMap;
