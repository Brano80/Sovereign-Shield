'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchSCCRegistries, createSCCRegistry, SCCRegistry } from '../utils/api';
import { Plus, ChevronDown, ChevronRight, RefreshCw, Eye, Edit, RotateCcw, Trash2 } from 'lucide-react';

const SCC_REQUIRED_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
];

const PARTNER_SUGGESTIONS = [
  'AWS Inc.',
  'Google Cloud',
  'Microsoft Azure',
  'Salesforce',
  'Wipro Ltd',
  'TCS',
  'Adobe',
  'Oracle',
  'IBM',
  'SAP',
];

type SCCModule = 'Module1' | 'Module2' | 'Module3' | 'Module4';

export default function SCCRegistryPage() {
  const [registries, setRegistries] = useState<SCCRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All Status' | 'ACTIVE' | 'EXPIRING' | 'EXPIRED'>('All Status');
  const [wizardStep, setWizardStep] = useState(0); // 0 = closed, 1-3 = steps
  const [wizardData, setWizardData] = useState({
    partnerName: '',
    countryCode: '',
    sccModule: '' as SCCModule | '',
    dpaId: '',
    signedDate: '',
    expiryDate: '',
    tiaCompleted: false,
  });
  const [partnerSearch, setPartnerSearch] = useState('');
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);

  useEffect(() => {
    loadRegistries();
  }, []);

  async function loadRegistries() {
    try {
      const data = await fetchSCCRegistries();
      // Ensure data is always an array
      setRegistries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load SCC registries:', error);
      setRegistries([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadRegistries();
    setRefreshing(false);
  }

  async function handleWizardSubmit() {
    try {
      const countryName = SCC_REQUIRED_COUNTRIES.find(c => c.code === wizardData.countryCode)?.name || wizardData.countryCode;
      await createSCCRegistry({
        partnerName: wizardData.partnerName,
        destinationCountry: countryName,
        expiryDate: wizardData.expiryDate || undefined,
      });
      setWizardStep(0);
      setWizardData({
        partnerName: '',
        countryCode: '',
        sccModule: '',
        dpaId: '',
        signedDate: '',
        expiryDate: '',
        tiaCompleted: false,
      });
      setPartnerSearch('');
      await loadRegistries();
    } catch (error) {
      console.error('Failed to create SCC registry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create SCC registry';
      alert(errorMessage);
    }
  }

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusConfig = (expiryDate: string) => {
    if (!expiryDate) return { level: 1, label: 'Active', color: 'green' };
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 0) {
      return { level: 4, label: 'EXPIRED', color: 'red' };
    } else if (daysUntilExpiry <= 14) {
      return { level: 4, label: 'EXPIRING', color: 'red' };
    } else if (daysUntilExpiry <= 60) {
      return { level: 2, label: 'EXPIRING', color: 'yellow' };
    } else {
      return { level: 1, label: 'ACTIVE', color: 'green' };
    }
  };

  const getStatusSummary = () => {
    if (!Array.isArray(registries)) {
      return { total: 0, critical: 0, warning: 0, active: 0 };
    }

    const critical = registries.filter(scc => {
      if (!scc.expiryDate) return false;
      const daysUntilExpiry = Math.ceil((new Date(scc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
    }).length;

    const warning = registries.filter(scc => {
      if (!scc.expiryDate) return false;
      const daysUntilExpiry = Math.ceil((new Date(scc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 60 && daysUntilExpiry > 14;
    }).length;

    const active = registries.filter(scc => {
      if (!scc.expiryDate) return true;
      const daysUntilExpiry = Math.ceil((new Date(scc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 60;
    }).length;

    return { total: registries.length, critical, warning, active };
  };

  const filteredRegistries = Array.isArray(registries) ? registries.filter(registry => {
    const matchesSearch = searchTerm === '' ||
      registry.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registry.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'All Status') return matchesSearch;
    
    const status = getStatusConfig(registry.expiryDate || '');
    if (statusFilter === 'ACTIVE') return matchesSearch && status.label === 'ACTIVE';
    if (statusFilter === 'EXPIRING') return matchesSearch && status.label === 'EXPIRING';
    if (statusFilter === 'EXPIRED') return matchesSearch && status.label === 'EXPIRED';
    
    return matchesSearch;
  }) : [];

  const getCountryFlag = (countryCode: string) => {
    const country = SCC_REQUIRED_COUNTRIES.find(c => c.code === countryCode);
    return country?.flag || '🏳️';
  };

  const filteredPartners = PARTNER_SUGGESTIONS.filter(partner =>
    partner.toLowerCase().includes(partnerSearch.toLowerCase())
  );

  const statusSummary = getStatusSummary();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">SCC REGISTRY</h1>
            <p className="text-slate-400 text-sm">Manage Standard Contractual Clauses</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setWizardStep(1)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Register New SCC
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option>All Status</option>
            <option>ACTIVE</option>
            <option>EXPIRING</option>
            <option>EXPIRED</option>
          </select>
          <input
            type="text"
            placeholder="Search partner or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400 flex-1"
          />
        </div>

        {/* Summary */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-300">
              Summary: <span className="text-white font-medium">{statusSummary.total}</span> Active SCCs
            </span>
            {statusSummary.critical > 0 && (
              <>
                <span className="text-slate-500">|</span>
                <span className="text-red-400 font-medium">{statusSummary.critical} Critical</span>
              </>
            )}
            {statusSummary.warning > 0 && (
              <>
                <span className="text-slate-500">|</span>
                <span className="text-yellow-400 font-medium">{statusSummary.warning} Warning</span>
              </>
            )}
            {statusSummary.active > 0 && (
              <>
                <span className="text-slate-500">|</span>
                <span className="text-green-400 font-medium">{statusSummary.active} Active</span>
              </>
            )}
            <span className="ml-auto text-xs text-slate-500">
              SCC Types: C2C = Controller to Controller | C2P = Controller to Processor
            </span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
            Loading...
          </div>
        ) : filteredRegistries.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400 mb-2">No SCC registrations found.</p>
            <p className="text-sm text-slate-500">Create your first regulatory anchor.</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-8"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      PARTNER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      COUNTRY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      SIGNED
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      EXPIRES
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredRegistries.map((registry) => {
                    const status = getStatusConfig(registry.expiryDate || '');
                    const isExpanded = expandedRows.has(registry.id);
                    return (
                      <>
                        <tr key={registry.id} className="hover:bg-slate-700/30">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleRowExpansion(registry.id)}
                              className="text-slate-400 hover:text-slate-300"
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-medium">
                            {registry.partnerName}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {getCountryFlag(registry.destinationCountry)} {registry.destinationCountry}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            C2C
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {registry.expiryDate ? new Date(registry.expiryDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {registry.expiryDate ? new Date(registry.expiryDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              status.color === 'red'
                                ? 'bg-red-500/20 text-red-400'
                                : status.color === 'yellow'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-slate-700/20">
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-3">Contract Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Type:</span>
                                      <span className="text-white">C2C</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Signed:</span>
                                      <span className="text-white">{registry.expiryDate ? new Date(registry.expiryDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Expires:</span>
                                      <span className="text-white">{registry.expiryDate ? new Date(registry.expiryDate).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">DPA ID:</span>
                                      <span className="text-white">—</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-3">Expiry & Compliance</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Days Until Expiry:</span>
                                      <span className="text-white">
                                        {registry.expiryDate
                                          ? (() => {
                                              const days = Math.ceil((new Date(registry.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                              return days <= 0 ? 'EXPIRED' : `${days} days`;
                                            })()
                                          : 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">TIA Completed:</span>
                                      <span className="text-white">No</span>
                                    </div>
                                  </div>
                                  <div className="mt-4 flex gap-2">
                                    <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      View Contract
                                    </button>
                                    <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1">
                                      <Edit className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1">
                                      <RotateCcw className="w-3 h-3" />
                                      Renew SCC
                                    </button>
                                    <button className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs font-medium transition-colors flex items-center gap-1">
                                      <Trash2 className="w-3 h-3" />
                                      Revoke
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCC Registration Wizard */}
        {wizardStep > 0 && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">SCC Registration Wizard</h2>
                  <p className="text-sm text-slate-400 mt-1">Step {wizardStep} of 3</p>
                </div>
                <button
                  onClick={() => setWizardStep(0)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3].map((step) => (
                  <>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= wizardStep ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && <div className={`w-12 h-0.5 ${step < wizardStep ? 'bg-blue-600' : 'bg-slate-700'}`} />}
                  </>
                ))}
              </div>

              {/* Step 1: Partner & Country */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Partner Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={partnerSearch}
                        onChange={(e) => {
                          setPartnerSearch(e.target.value);
                          setWizardData({ ...wizardData, partnerName: e.target.value });
                          setShowPartnerSuggestions(true);
                        }}
                        onFocus={() => setShowPartnerSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowPartnerSuggestions(false), 200)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter partner name..."
                      />
                      {showPartnerSuggestions && partnerSearch && filteredPartners.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg">
                          {filteredPartners.slice(0, 5).map((partner) => (
                            <button
                              key={partner}
                              type="button"
                              onClick={() => {
                                setPartnerSearch(partner);
                                setWizardData({ ...wizardData, partnerName: partner });
                                setShowPartnerSuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-600"
                            >
                              {partner}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Destination Country (SCC Required) *</label>
                    <select
                      value={wizardData.countryCode}
                      onChange={(e) => setWizardData({ ...wizardData, countryCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select country...</option>
                      {SCC_REQUIRED_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name} ({country.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setWizardStep(0)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => wizardData.partnerName && wizardData.countryCode && setWizardStep(2)}
                      disabled={!wizardData.partnerName || !wizardData.countryCode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: SCC Module & DPA */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">SCC Module *</label>
                    <select
                      value={wizardData.sccModule}
                      onChange={(e) => setWizardData({ ...wizardData, sccModule: e.target.value as SCCModule })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select module...</option>
                      <option value="Module1">Module 1: Controller to Processor (C2P)</option>
                      <option value="Module2">Module 2: Controller to Controller (C2C)</option>
                      <option value="Module3">Module 3: Hybrid</option>
                      <option value="Module4">Module 4: Other/Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">DPA ID *</label>
                    <input
                      type="text"
                      value={wizardData.dpaId}
                      onChange={(e) => setWizardData({ ...wizardData, dpaId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter DPA identifier..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => wizardData.sccModule && wizardData.dpaId && setWizardStep(3)}
                      disabled={!wizardData.sccModule || !wizardData.dpaId}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Dates & TIA */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Signed Date *</label>
                      <input
                        type="date"
                        value={wizardData.signedDate}
                        onChange={(e) => setWizardData({ ...wizardData, signedDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">Expiry Date *</label>
                      <input
                        type="date"
                        value={wizardData.expiryDate}
                        onChange={(e) => setWizardData({ ...wizardData, expiryDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="tiaCompleted"
                      checked={wizardData.tiaCompleted}
                      onChange={(e) => setWizardData({ ...wizardData, tiaCompleted: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="tiaCompleted" className="text-sm text-slate-300">
                      TIA Completed (Transfer Impact Assessment)
                    </label>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Registration Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Partner:</span>
                        <span className="text-white">{wizardData.partnerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Country:</span>
                        <span className="text-white">
                          {SCC_REQUIRED_COUNTRIES.find(c => c.code === wizardData.countryCode)?.name || wizardData.countryCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SCC Module:</span>
                        <span className="text-white">{wizardData.sccModule}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">DPA ID:</span>
                        <span className="text-white">{wizardData.dpaId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">TIA Status:</span>
                        <span className="text-white">{wizardData.tiaCompleted ? 'Completed' : 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleWizardSubmit}
                      disabled={!wizardData.signedDate || !wizardData.expiryDate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Register SCC
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
