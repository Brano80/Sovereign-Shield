'use client';

import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryData {
  code: string;
  name: string;
  status: 'adequate_protection' | 'scc_required' | 'blocked';
  transfers?: number;
  mechanisms?: number;
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
    // Build countryMap keyed by name - TopoJSON uses "name" property
    const map = new Map<string, CountryData>();
    countries.forEach(country => {
      map.set(country.name, country);
    });
    setCountryMap(map);
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

      setTooltipContent(`${countryData.name}\nStatus: ${formatStatus(countryData.status)}\nTransfers: ${countryData.transfers || 0}\nMechanisms: ${countryData.mechanisms || 0}`);
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
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-slate-400">Loading world map...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="mb-2">
        <span className="text-sm font-semibold text-white">TRANSFER MAP</span>
      </div>
      
      <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden relative" style={{ height: '400px' }}>
        <ComposableMap
          projectionConfig={{
            scale: 150,
            center: [0, 20],
          }}
          className="w-full h-full"
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const countryData = getCountryData(countryName);
                  
                  const fillColor = countryData 
                    ? getCountryColor(countryData.status, countryData.transfers || 0)
                    : '#374151';

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#64748b"
                      strokeWidth={0.5}
                      onMouseEnter={(event) => handleMouseEnter(geo, event)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", opacity: 0.8 },
                        pressed: { outline: "none" }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-6 justify-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-xs text-slate-300">Adequate Protection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-xs text-slate-300">SCC Required</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-xs text-slate-300">Transfer Blocked</span>
        </div>
      </div>

      {/* Caption */}
      <p className="text-xs text-slate-500 text-center mt-1 flex-shrink-0">
        Map will show transfer destinations and routes
      </p>

      {/* Tooltip */}
      {tooltipContent && tooltipPosition && (
        <div
          className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white shadow-lg pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <pre className="whitespace-pre-wrap font-mono">{tooltipContent}</pre>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
