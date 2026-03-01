/**
 * Shared country classification config (GDPR Art. 44-49).
 * Single source of truth for EU/EEA, Adequate, SCC-required, and Blocked countries.
 */

export const EU_EEA_COUNTRIES = new Set<string>([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
]);

export const ADEQUATE_COUNTRIES = new Set<string>([
  'AD', 'AR', 'BR', 'CA', 'FO', 'GG', 'IL', 'IM', 'JP', 'JE', 'NZ', 'KR', 'CH', 'GB', 'UY',
]);

export const SCC_REQUIRED_COUNTRIES = new Set<string>([
  'US', 'IN', 'AU', 'MX', 'SG', 'ZA', 'ID', 'TR', 'PH', 'VN', 'EG', 'NG', 'PK', 'BD', 'TH', 'MY',
]);

export const BLOCKED_COUNTRIES = new Set<string>([
  'CN', 'RU', 'KP', 'IR', 'SY', 'BY',
]);

/** Maps ISO code → exact name used in world-atlas TopoJSON (for map highlighting). TopoJSON uses "United States of America" not "United States". */
export const TOPOJSON_COUNTRY_NAMES: Record<string, string> = {
  US: 'United States of America',
  GB: 'United Kingdom',
};

export const COUNTRY_NAMES: Record<string, string> = {
  AD: 'Andorra', AR: 'Argentina', AU: 'Australia', AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria',
  BR: 'Brazil', BY: 'Belarus', CA: 'Canada', CH: 'Switzerland', CN: 'China', CY: 'Cyprus',
  CZ: 'Czechia', DE: 'Germany', DK: 'Denmark', EE: 'Estonia', EG: 'Egypt', ES: 'Spain',
  FI: 'Finland', FO: 'Faroe Islands', FR: 'France', GB: 'United Kingdom', GG: 'Guernsey',
  GR: 'Greece', HR: 'Croatia', HU: 'Hungary', ID: 'Indonesia', IE: 'Ireland', IL: 'Israel',
  IM: 'Isle of Man', IN: 'India', IR: 'Iran', IS: 'Iceland', IT: 'Italy', JE: 'Jersey',
  JP: 'Japan', KP: 'North Korea', KR: 'South Korea', LI: 'Liechtenstein', LT: 'Lithuania',
  LU: 'Luxembourg', LV: 'Latvia', MT: 'Malta', MX: 'Mexico', MY: 'Malaysia', NG: 'Nigeria',
  NL: 'Netherlands', NO: 'Norway', NZ: 'New Zealand', PK: 'Pakistan', PH: 'Philippines',
  PL: 'Poland', PT: 'Portugal', RO: 'Romania', RU: 'Russia', SE: 'Sweden', SG: 'Singapore',
  SI: 'Slovenia', SK: 'Slovakia', SY: 'Syria', TH: 'Thailand', TR: 'Turkey', US: 'United States',
  UY: 'Uruguay', VN: 'Vietnam', ZA: 'South Africa', BD: 'Bangladesh',
};

/** Country list for Adequate Countries page (EU-recognised adequate) */
export const ADEQUATE_COUNTRY_LIST = [
  { name: 'Andorra', code: 'AD', flag: '🇦🇩' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', note: 'Adequacy decision adopted January 2026' },
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

/** Country list for SCC Required section */
export const SCC_REQUIRED_COUNTRY_LIST = [
  { name: 'United States', code: 'US', flag: '🇺🇸', badgeLabel: 'SCC Required / DPF*' },
  { name: 'India', code: 'IN', flag: '🇮🇳' },
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
  { name: 'Australia', code: 'AU', flag: '🇦🇺' },
];

/** Country list for Blocked section */
export const BLOCKED_COUNTRY_LIST = [
  { name: 'China', code: 'CN', flag: '🇨🇳' },
  { name: 'Russia', code: 'RU', flag: '🇷🇺' },
  { name: 'Iran', code: 'IR', flag: '🇮🇷' },
  { name: 'North Korea', code: 'KP', flag: '🇰🇵' },
  { name: 'Syria', code: 'SY', flag: '🇸🇾' },
  { name: 'Belarus', code: 'BY', flag: '🇧🇾' },
];

/** Map country name (various forms) to ISO 2-letter code */
export function getCountryCodeFromName(countryName: string): string {
  if (!countryName) return '';
  const name = countryName.trim().toUpperCase();
  const countryMap: Record<string, string> = {
    'UNITED STATES': 'US', 'USA': 'US', 'UNITED STATES OF AMERICA': 'US',
    'UNITED KINGDOM': 'GB', 'UK': 'GB', 'GREAT BRITAIN': 'GB',
    'GERMANY': 'DE', 'DEUTSCHLAND': 'DE', 'BRAZIL': 'BR', 'BRASIL': 'BR',
    'CHINA': 'CN', 'JAPAN': 'JP', 'INDIA': 'IN', 'AUSTRALIA': 'AU', 'CANADA': 'CA',
    'MEXICO': 'MX', 'SOUTH KOREA': 'KR', 'KOREA': 'KR', 'RUSSIA': 'RU',
    'NETHERLANDS': 'NL', 'HOLLAND': 'NL', 'SWITZERLAND': 'CH', 'SWEDEN': 'SE',
    'NORWAY': 'NO', 'DENMARK': 'DK', 'FINLAND': 'FI', 'POLAND': 'PL', 'BELGIUM': 'BE',
    'AUSTRIA': 'AT', 'PORTUGAL': 'PT', 'GREECE': 'GR', 'IRELAND': 'IE',
    'CZECH REPUBLIC': 'CZ', 'CZECHIA': 'CZ', 'ROMANIA': 'RO', 'HUNGARY': 'HU',
    'SINGAPORE': 'SG', 'SOUTH AFRICA': 'ZA', 'INDONESIA': 'ID', 'TURKEY': 'TR',
    'TURKIYE': 'TR', 'PHILIPPINES': 'PH', 'VIETNAM': 'VN', 'EGYPT': 'EG',
    'NIGERIA': 'NG', 'PAKISTAN': 'PK', 'BANGLADESH': 'BD', 'THAILAND': 'TH',
    'MALAYSIA': 'MY', 'ARGENTINA': 'AR', 'ISRAEL': 'IL', 'NEW ZEALAND': 'NZ',
    'FRANCE': 'FR', 'ITALY': 'IT', 'ITALIA': 'IT', 'SPAIN': 'ES', 'ESPANA': 'ES',
    'CHILE': 'CL', 'COLOMBIA': 'CO', 'PERU': 'PE', 'VENEZUELA': 'VE',
    'SAUDI ARABIA': 'SA', 'UNITED ARAB EMIRATES': 'AE', 'UAE': 'AE',
    ...Object.fromEntries(Object.entries(COUNTRY_NAMES).map(([code, n]) => [n.toUpperCase(), code])),
  };
  if (countryMap[name]) return countryMap[name];
  if (name.length === 2 && /^[A-Z]{2}$/.test(name)) return name;
  for (const [key, code] of Object.entries(countryMap)) {
    if (name.includes(key) || key.includes(name)) return code;
  }
  return '';
}

/** Legal basis for transfer to country (GDPR Art. 44-49) */
export function getLegalBasis(countryCode: string): string {
  if (!countryCode) return '';
  const code = countryCode.toUpperCase();
  if (EU_EEA_COUNTRIES.has(code)) return 'Art. 45';
  if (BLOCKED_COUNTRIES.has(code)) return 'Art. 44 Blocked';
  if (SCC_REQUIRED_COUNTRIES.has(code)) return 'Art. 46 SCC';
  if (ADEQUATE_COUNTRIES.has(code)) return 'Art. 45';
  return 'Art. 46 SCC';
}

/** Full legal basis text for display */
export function getLegalBasisFullText(countryCode: string): string {
  if (!countryCode) return '—';
  const code = countryCode.toUpperCase();
  if (EU_EEA_COUNTRIES.has(code)) return 'Art. 45 — Adequacy Decision (EU/EEA)';
  if (BLOCKED_COUNTRIES.has(code)) return 'Art. 44 — Transfer Prohibited (Blocked)';
  if (SCC_REQUIRED_COUNTRIES.has(code)) return 'Art. 46 — Standard Contractual Clauses Required';
  if (ADEQUATE_COUNTRIES.has(code)) return 'Art. 45 — Adequacy Decision';
  return 'Art. 46 — SCC Required (third country)';
}
