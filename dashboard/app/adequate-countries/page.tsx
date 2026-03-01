'use client';

import DashboardLayout from '../components/DashboardLayout';
import { ADEQUATE_COUNTRY_LIST, SCC_REQUIRED_COUNTRY_LIST, BLOCKED_COUNTRY_LIST } from '../config/countries';

function CountryCard({
  country,
  badgeLabel,
  badgeClass,
  borderHoverClass,
}: {
  country: { name: string; code: string; flag: string; note?: string; badgeLabel?: string };
  badgeLabel: string;
  badgeClass: string;
  borderHoverClass: string;
}) {
  const displayBadgeLabel = country.badgeLabel || badgeLabel;
  return (
    <div
      className={`p-4 bg-slate-700/50 rounded-lg border border-slate-600 transition-colors ${borderHoverClass}`}
    >
      <div>
        <div className="text-sm font-medium text-white">{country.name}</div>
        <div className="text-xs text-slate-400">{country.code}</div>
        {country.note && (
          <div className="text-xs text-slate-500 mt-1 italic">{country.note}</div>
        )}
      </div>
      <div className="mt-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
          {displayBadgeLabel}
        </span>
      </div>
    </div>
  );
}

export default function AdequateCountriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Country Classifications</h1>
          <p className="text-slate-400 text-sm">
            EU adequacy, SCC-required, and blocked destinations
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Based on EU Commission adequacy decisions where applicable. Lists may not be exhaustive or current; check official Commission sources. Last reviewed: February 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* EU-Recognised Adequate Countries */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-1">EU-Recognised Adequate Countries</h2>
            <p className="text-slate-400 text-sm mb-2">
              Valid EU Commission adequacy decisions (Art. 45)
            </p>
            <a href="https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mb-4 inline-block">
              Official Commission adequacy list →
            </a>
            <div className="grid grid-cols-1 gap-3 flex-1">
              {ADEQUATE_COUNTRY_LIST.map((country) => (
                <CountryCard
                  key={country.code}
                  country={country}
                  badgeLabel="Adequate Protection"
                  badgeClass="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  borderHoverClass="hover:border-green-500/50"
                />
              ))}
            </div>
          </div>

          {/* SCC Required countries */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-1">SCC Required Countries</h2>
            <p className="text-slate-400 text-sm mb-4">
              Transfers allowed with Standard Contractual Clauses
            </p>
            <div className="grid grid-cols-1 gap-3 flex-1">
              {sccRequiredCountries.map((country) => (
                <CountryCard
                  key={country.code}
                  country={country}
                  badgeLabel="SCC Required"
                  badgeClass="bg-orange-500/20 text-orange-400"
                  borderHoverClass="hover:border-orange-500/50"
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                * US transfers to DPF-certified organizations may qualify under Art. 45 adequacy decision (EU-US Data Privacy Framework).
              </p>
            </div>
          </div>

          {/* Blocked Countries */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-1">Blocked Countries</h2>
            <p className="text-slate-400 text-sm mb-4">
              No transfer permitted under organisational policy (GDPR does not prohibit any country by name; a legal basis is required)
            </p>
            <div className="grid grid-cols-1 gap-3 flex-1">
              {BLOCKED_COUNTRY_LIST.map((country) => (
                <CountryCard
                  key={country.code}
                  country={country}
                  badgeLabel="Blocked"
                  badgeClass="bg-red-500/15 text-red-400 border border-red-500/25"
                  borderHoverClass="hover:border-red-500/50"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-2">
          <p className="text-sm text-slate-400">
            <strong className="text-white">Note:</strong> EU-Recognised adequate countries permit transfers under GDPR Article 45 without additional safeguards.
            SCC-required countries need appropriate safeguards under Art. 46 (e.g. Standard Contractual Clauses, BCRs). In specific cases, derogations under Art. 49 may apply. Blocked countries are not permitted as transfer destinations under current organisational policy; the GDPR does not prohibit transfers to any specific country by name.
          </p>
          <p className="text-xs text-slate-500">
            This page is for illustration and policy reference only. It does not constitute legal advice. Verify current adequacy and safeguard requirements with official sources and legal counsel.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
