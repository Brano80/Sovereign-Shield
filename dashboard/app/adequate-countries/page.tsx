'use client';

import DashboardLayout from '../components/DashboardLayout';

const adequateCountries = [
  { name: 'Andorra', code: 'AD', flag: '🇦🇩' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { name: 'Faroe Islands', code: 'FO', flag: '🇫🇴' },
  { name: 'Guernsey', code: 'GG', flag: '🇬🇬' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱' },
  { name: 'Isle of Man', code: 'IM', flag: '🇮🇲' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { name: 'Jersey', code: 'JE', flag: '🇯🇪' },
  { name: 'New Zealand', code: 'NZ', flag: '🇳🇿' },
  { name: 'Republic of Korea', code: 'KR', flag: '🇰🇷' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { name: 'Uruguay', code: 'UY', flag: '🇺🇾' },
];

const sccRequiredCountries = [
  { name: 'United States', code: 'US', flag: '🇺🇸' },
  { name: 'India', code: 'IN', flag: '🇮🇳' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  { name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾' },
];

const blockedCountries = [
  { name: 'China', code: 'CN', flag: '🇨🇳' },
  { name: 'Russia', code: 'RU', flag: '🇷🇺' },
  { name: 'Iran', code: 'IR', flag: '🇮🇷' },
  { name: 'North Korea', code: 'KP', flag: '🇰🇵' },
  { name: 'Syria', code: 'SY', flag: '🇸🇾' },
  { name: 'Belarus', code: 'BY', flag: '🇧🇾' },
];

function CountryCard({
  country,
  badgeLabel,
  badgeClass,
  borderHoverClass,
}: {
  country: { name: string; code: string; flag: string };
  badgeLabel: string;
  badgeClass: string;
  borderHoverClass: string;
}) {
  return (
    <div
      className={`p-4 bg-slate-700/50 rounded-lg border border-slate-600 transition-colors ${borderHoverClass}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{country.flag}</span>
        <div>
          <div className="text-sm font-medium text-white">{country.name}</div>
          <div className="text-xs text-slate-400">{country.code}</div>
        </div>
      </div>
      <div className="mt-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
          {badgeLabel}
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* EU-Recognised Adequate Countries */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-1">EU-Recognised Adequate Countries</h2>
            <p className="text-slate-400 text-sm mb-4">
              Valid EU Commission adequacy decisions
            </p>
            <div className="grid grid-cols-1 gap-3 flex-1">
              {adequateCountries.map((country) => (
                <CountryCard
                  key={country.code}
                  country={country}
                  badgeLabel="Adequate Protection"
                  badgeClass="bg-green-500/20 text-green-400"
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
          </div>

          {/* Blocked Countries */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-1">Blocked Countries</h2>
            <p className="text-slate-400 text-sm mb-4">
              No transfer permitted under policy
            </p>
            <div className="grid grid-cols-1 gap-3 flex-1">
              {blockedCountries.map((country) => (
                <CountryCard
                  key={country.code}
                  country={country}
                  badgeLabel="Blocked"
                  badgeClass="bg-red-500/20 text-red-400"
                  borderHoverClass="hover:border-red-500/50"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-400">
            <strong className="text-white">Note:</strong> EU-Recognised adequate countries permit transfers under GDPR Article 45 without additional safeguards.
            SCC-required countries need Standard Contractual Clauses or other approved transfer tools. Blocked countries are not permitted as transfer destinations under current policy.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
