"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Chart: any;
  }
}

export default function Home() {
  const marketChartRef = useRef<HTMLCanvasElement>(null);
  const growthChartRef = useRef<HTMLCanvasElement>(null);
  const pricingChartRef = useRef<HTMLCanvasElement>(null);
  const [evalCount, setEvalCount] = useState(100000);
  const [cost, setCost] = useState(900);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [selectedTier, setSelectedTier] = useState("L1");
  const [enforcementMode, setEnforcementMode] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState("Growth");
  const [decisions, setDecisions] = useState<Array<{ time: string; action: string; reg: string; isBlock: boolean }>>([]);

  const actions = ["data_transfer", "cross_border_sync", "pii_export", "llm_api_call", "s3_upload", "db_export"];
  const regs = ["Art. 44 (Principle)", "Art. 45 (Adequacy)", "Art. 46 (SCC/safeguards)", "Art. 49 (Derogations)"];

  const tierData = {
    L1: {
      title: "Synchronous Sealing",
      desc: "Every Sovereign Shield decision — ALLOW, BLOCK, REVIEW — is immediately sealed with a SHA-256 hash appended to a local hash chain in the request path. Adds under 5ms to transfer evaluation latency.",
      latency: "< 5ms",
      legal: "Technical Audit Trail",
      color: "bg-sky-500",
      textColor: "text-sky-400",
    },
    L2: {
      title: "Merkle Root Anchoring",
      desc: "Every 10 minutes, all sealed transfer decisions are aggregated into a Merkle tree. The root hash is anchored to a public ledger. Proves that no decision in your evidence chain has been altered since that timestamp.",
      latency: "Background (No Overhead)",
      legal: "Audit Readiness",
      color: "bg-indigo-500",
      textColor: "text-indigo-400",
    },
    L3: {
      title: "Provenance Sealing (TEE)",
      desc: "Transfer enforcement logic runs inside a hardware-sealed Trusted Execution Environment. Even system administrators cannot modify the evaluation logic or tamper with sealed evidence. Produces a cryptographic attestation with every decision.",
      latency: "~ 10ms",
      legal: "Admin-Proof",
      color: "bg-violet-500",
      textColor: "text-violet-400",
    },
    L4: {
      title: "Signicat QES Sealing",
      desc: "Each transfer decision is signed with an eIDAS-compliant Qualified Electronic Signature via Signicat. Equivalent legal weight to a handwritten signature under EU law. The strongest possible evidence for regulatory defense or litigation.",
      latency: "Async (Seconds)",
      legal: "Forensic / Courtroom",
      color: "bg-rose-500",
      textColor: "text-rose-400",
    },
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.Chart && chartLoaded) {
      initializeCharts();
    }
  }, [chartLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      createDecision();
    }, 2500);
    return () => clearInterval(interval);
  }, [enforcementMode]);

  useEffect(() => {
    for (let i = 0; i < 6; i++) {
      createDecision();
    }
  }, []);

  const createDecision = () => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const reg = regs[Math.floor(Math.random() * regs.length)];
    const isBlock = Math.random() > 0.65;
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setDecisions((prev) => {
      const newDecisions = [{ time, action, reg, isBlock }, ...prev];
      return newDecisions.slice(0, 8);
    });
  };

  const toggleEnforcementMode = () => setEnforcementMode(!enforcementMode);
  const selectTier = (tier: string) => setSelectedTier(tier);

  const initializeCharts = () => {
    if (!window.Chart) return;
    const Chart = window.Chart;

    if (marketChartRef.current) {
      const ctx = marketChartRef.current.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["No SCC in Place", "Blocked Jurisdiction", "Missing Adequacy Decision", "Unknown Jurisdiction"],
            datasets: [{ data: [35, 25, 30, 10], backgroundColor: ["#f43f5e", "#0ea5e9", "#6366f1", "#94a3b8"], borderWidth: 0 }],
          },
          options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } },
            cutout: "70%",
          },
        });
      }
    }

    if (growthChartRef.current) {
      const ctx = growthChartRef.current.getContext("2d");
      if (ctx) {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Q1", "Q2", "Q3", "Q4"],
            datasets: [{ label: "Evaluations (Millions)", data: [1.2, 4.8, 12.5, 28.9], backgroundColor: "#38bdf8", borderRadius: 8 }],
          },
          options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } },
          },
        });
      }
    }

    if (pricingChartRef.current) {
      const ctx = pricingChartRef.current.getContext("2d");
      if (ctx) renderPricingChart(ctx);
    }
  };

  const renderPricingChart = (ctx: CanvasRenderingContext2D) => {
    if (!window.Chart) return;
    const chartPoints = [50000, 250000, 500000, 750000, 1000000].map(
      (v) => 500 + (v > 50000 ? (v - 50000) * 0.008 : 0)
    );
    new window.Chart(ctx, {
      type: "line",
      data: {
        labels: ["50k", "250k", "500k", "750k", "1M"],
        datasets: [{
          label: "Monthly Cost (USD)",
          data: chartPoints,
          borderColor: "#0ea5e9",
          tension: 0.4,
          fill: true,
          backgroundColor: "rgba(14, 165, 233, 0.05)",
          pointRadius: 4,
        }],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true }, x: { ticks: { font: { size: 10 } } } },
      },
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setEvalCount(val);
    setCost(Math.round(500 + (val > 50000 ? (val - 50000) * 0.008 : 0)));
  };

  const currentTier = tierData[selectedTier as keyof typeof tierData];

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" onLoad={() => setChartLoaded(true)} strategy="lazyOnload" />
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap");
        body { font-family: "Inter", sans-serif; background-color: #f8fafc; color: #1e293b; scroll-behavior: smooth; }
        .chart-container { position: relative; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto; height: 280px; max-height: 320px; }
        .glass { background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); }
        .gradient-text { background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .tier-card.active { border-color: #38bdf8; background-color: rgba(56,189,248,0.15); box-shadow: 0 0 20px rgba(56,189,248,0.2); }
        input[type="range"] { accent-color: #0ea5e9; }
        @media (max-width: 640px) { .chart-container { height: 220px; } }
        .cockpit-glow { box-shadow: 0 0 50px -12px rgba(56,189,248,0.3); }
        .decision-line { animation: slideIn 0.3s ease-out forwards; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <div className="antialiased">

        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 glass shadow-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src="/veridion-logo.svg" alt="Veridion Nexus" className="h-9 w-auto" />
            </a>
            <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
              <a href="#market" className="hover:text-sky-600 transition-colors">Problem</a>
              <a href="#engine" className="hover:text-sky-600 transition-colors">Evidence</a>
              <a href="#overview" className="hover:text-sky-600 transition-colors">Live</a>
              <a href="#pricing" className="hover:text-sky-600 transition-colors">Pricing</a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-full text-sky-600 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse inline-block"></span>
            GDPR Chapter V (Art. 44-49) — Runtime Enforcement
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-4 uppercase italic">
            EU Data Transfers.<br /><span className="gradient-text">Enforced at Runtime.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Every time an AI agent moves personal data across borders, it's a regulatory event. Veridion Nexus is a runtime enforcement engine that evaluates every transfer against GDPR Chapter V (Art. 44-49), blocks transfers without a legal basis, and seals cryptographic evidence before the data moves.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center text-xs font-bold">
            <span className="px-3 py-1.5 bg-slate-900 text-white rounded-full">Sovereign Shield</span>
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">Evidence Vault</span>
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">Cryptographic Shredder</span>
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">Human Oversight</span>
          </div>
        </header>

        {/* Section 1: Problem */}
        <section id="market" className="py-12 bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Every AI Agent Call Is a Potential GDPR Violation</h2>
              <p className="text-slate-600 leading-relaxed">
                When an AI agent calls OpenAI, uploads to AWS S3, or queries an external API — it transfers EU personal data across borders. Under <strong>GDPR Chapter V (Art. 44-49)</strong>, every transfer requires a legal basis: an adequacy decision (Art. 45), appropriate safeguards such as Standard Contractual Clauses or binding corporate rules (Art. 46), or, in specific cases, derogations (Art. 49). Most don't have one.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Max Fine (GDPR)</div>
                <div className="text-4xl font-extrabold text-slate-900 mb-2">4%</div>
                <div className="text-slate-400 text-sm font-medium">Of global annual turnover for serious infringements including unlawful transfers (Art. 83(5) GDPR).</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Non-Adequate Countries</div>
                <div className="text-4xl font-extrabold text-sky-600 mb-2">100+</div>
                <div className="text-slate-400 text-sm font-medium">Jurisdictions requiring SCC or BCR before any data transfer.</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Agent API Calls / Day</div>
                <div className="text-4xl font-extrabold text-rose-500 mb-2">10,000+</div>
                <div className="text-slate-400 text-sm font-medium">Each one a potential unverified cross-border transfer.</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="chart-container">
                <canvas ref={marketChartRef}></canvas>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-xl">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Block Before the Transfer Happens</h4>
                    <p className="text-slate-500 text-sm">Traditional DLP tools flag violations after data has already crossed the border. Sovereign Shield intercepts the transfer <i>before</i> it executes — ALLOW, BLOCK, or REVIEW in under 100ms.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-xl">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900">SCC Registry Checked on Every Transfer</h4>
                    <p className="text-slate-500 text-sm">Standard Contractual Clauses are verified at runtime against the live SCC registry — not just at setup. Expired or missing SCCs trigger automatic REVIEW or BLOCK.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-xl">3</div>
                  <div>
                    <h4 className="font-bold text-slate-900">GDPR Art. 17 Erasure on Demand</h4>
                    <p className="text-slate-500 text-sm">All transferred data is encrypted with AES-256-GCM. On an erasure request, the key is cryptographically shredded — making the data permanently unrecoverable without deleting it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Evidence Graph */}
        <section id="engine" className="py-12 max-w-6xl mx-auto px-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden mb-8">
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold mb-2 italic text-sky-400">The Evidence Graph</h2>
              <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-8">
                Every transfer decision — ALLOW, BLOCK, or REVIEW — is sealed into an <strong>append-only cryptographic chain</strong>. Tamper-evident. Timestamped. Linked to the exact GDPR article that determined the outcome. Four sealing tiers, from technical audit trail to courtroom-grade QES signatures.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {(["L1", "L2", "L3", "L4"] as const).map((tier) => {
                  const tierInfo = tierData[tier];
                  const isActive = selectedTier === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => selectTier(tier)}
                      className={`tier-card ${isActive ? "active" : ""} p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left`}
                    >
                      <div className={`${isActive ? tierInfo.textColor : "text-slate-400"} font-black text-2xl mb-1`}>{tier}</div>
                      <div className="text-xs font-bold text-white uppercase tracking-widest mb-2">
                        {tier === "L1" ? "Synchronous" : tier === "L2" ? "Merkle Root" : tier === "L3" ? "Provenance" : "QES Forensic"}
                      </div>
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded uppercase">Live</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-white/10 border border-white/10 p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="shrink-0">
                    <div className={`w-14 h-14 ${currentTier.color} rounded-xl flex items-center justify-center text-white text-2xl font-black`}>
                      {selectedTier}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{currentTier.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">{currentTier.desc}</p>
                    <div className="mt-4 flex gap-3">
                      <span className="px-3 py-1 bg-sky-500/20 text-sky-400 text-[10px] font-bold rounded-full uppercase">
                        Latency: {currentTier.latency}
                      </span>
                      <span className="px-3 py-1 bg-white/10 text-slate-400 text-[10px] font-bold rounded-full uppercase">
                        {currentTier.legal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Section 3: Live Cockpit */}
        <section id="overview" className="py-12 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold mb-2 italic uppercase">Sovereign Shield — Live</h2>
              <p className="text-slate-400 text-sm">Every agent data transfer evaluated in real-time. Blocked transfers sealed as evidence. SCC status verified against the registry on every call.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-800 border border-white/10 p-5 rounded-2xl cockpit-glow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compliance Health</span>
                    <span className={`px-2 py-1 ${enforcementMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "bg-amber-500/20 text-amber-400 border-amber-500/50"} text-[10px] font-bold rounded border`}>
                      {enforcementMode ? "ENFORCING" : "MONITORING"}
                    </span>
                  </div>
                  <div className="text-center py-3">
                    <div className="text-3xl font-black text-white mb-1">99.8%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Compliance Health Score</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Mode:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${enforcementMode ? "text-sky-400" : "text-amber-500"}`}>
                        {enforcementMode ? "ENFORCEMENT" : "SHADOW MODE"}
                      </span>
                      <button onClick={toggleEnforcementMode} className="w-8 h-4 bg-sky-500 rounded-full relative">
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${enforcementMode ? "right-0.5" : "left-0.5"}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 border border-white/10 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">SCC Registry Status</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs font-medium text-slate-300">Art. 33(1) Breach Notification (72h)</div>
                        <div className="text-xs font-mono text-sky-400">71:24:59</div>
                      </div>
                      <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full w-[98%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs font-medium text-slate-300">SCC — OpenAI US</div>
                        <div className="text-xs font-mono text-emerald-400">Valid</div>
                      </div>
                      <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full w-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs font-medium text-slate-300">SCC — AWS US-East</div>
                        <div className="text-xs font-mono text-rose-400">Expired</div>
                      </div>
                      <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full w-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs font-medium text-slate-300">SCC — Azure EU</div>
                        <div className="text-xs font-mono text-emerald-400">Valid</div>
                      </div>
                      <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full w-[85%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[380px]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-Time Evidence Stream</span>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                    <span className="text-[10px] text-sky-400 font-mono">LIVE FEED</span>
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto font-mono text-xs scrollbar-hide">
                  {decisions.map((decision, idx) => (
                    <div key={idx} className="decision-line border-l-2 border-white/5 pl-3 py-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 uppercase">[{decision.time}]</span>
                        <span className={`${decision.isBlock ? "text-rose-400" : "text-emerald-400"} font-bold`}>
                          {enforcementMode ? (decision.isBlock ? "BLOCK" : "ALLOW") : "DETECT"}
                        </span>
                      </div>
                      <div className="text-slate-500">
                        Transfer: <span className="text-slate-300">{decision.action}</span> • Rule: <span className="text-slate-300">{decision.reg}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-900/50 text-center text-[10px] text-slate-500 italic">
                  All decisions sealed in Evidence Graph — SHA-256 hash chain → Merkle Root → TEE Attestation → Signicat QES
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Scale */}
        <section id="growth" className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-4 italic uppercase">Scales With Your AI Activity</h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Every agent API call is a potential GDPR transfer event. As your AI agents make more calls, Sovereign Shield evaluates more transfers — automatically, at the same sub-100ms latency. Compliance scales with usage, not with headcount.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-sm font-semibold text-slate-700">Transfer evaluation: &lt; 100ms p99 latency</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-sm font-semibold text-slate-700">SCC registry checked on every transfer — not just at setup</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-sm font-semibold text-slate-700">Evidence sealed for every ALLOW and BLOCK decision</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <span className="text-sm font-semibold text-slate-700">GDPR Art. 17 erasure: cryptographic key shredding on demand</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <canvas ref={growthChartRef}></canvas>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Pricing */}
        <section id="pricing" className="py-12 bg-sky-50 border-t border-sky-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 uppercase">Simple, Usage-Based Pricing</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Start free. Scale as your AI agents grow. No compliance headcount needed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Developer",
                  price: "$0",
                  sub: "Free forever",
                  cta: "Get API Key",
                  features: ["10,000 evaluations/month", "Sovereign Shield (ALLOW/BLOCK)", "L1 Evidence Vault", "Community support"],
                },
                {
                  name: "Startup",
                  price: "$49",
                  sub: "per month",
                  cta: "Start Free Trial",
                  features: ["100,000 evaluations/month", "SCC Registry checks", "L1 + L2 Evidence Vault", "Human review queue", "Email support"],
                },
                {
                  name: "Growth",
                  price: "$199",
                  sub: "per month",
                  cta: "Get Started",
                  badge: "Most Popular",
                  features: ["1,000,000 evaluations/month", "Full L1–L3 Evidence Vault", "Crypto Shredder (GDPR Art. 17)", "TEE Provenance Sealing", "Priority support"],
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  sub: "annual contract",
                  cta: "Contact Sales",
                  features: ["Unlimited evaluations", "Full L1–L4 + Signicat QES", "On-premise deployment", "SLA + dedicated support", "Custom SCC registry"],
                },
              ].map((plan) => {
                const isSelected = selectedPlan === plan.name;
                return (
                  <div
                    key={plan.name}
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`rounded-2xl p-6 flex flex-col relative cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-slate-900 border border-sky-500 shadow-xl scale-[1.02]"
                        : "bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-500 text-white text-[10px] font-black uppercase rounded-full">{plan.badge}</div>
                    )}
                    <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${isSelected ? "text-sky-400" : "text-slate-400"}`}>{plan.name}</div>
                    <div className={`text-4xl font-black mb-1 ${isSelected ? "text-white" : "text-slate-900"}`}>{plan.price}</div>
                    <div className="text-slate-400 text-sm mb-6">{plan.sub}</div>
                    <ul className="space-y-2 text-sm flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className={`flex gap-2 ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                          <span className="text-emerald-400 font-bold">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <div className={`mt-6 text-center text-xs font-bold uppercase rounded-lg py-2 ${
                      isSelected
                        ? "bg-sky-500 text-white"
                        : "border border-slate-200 text-slate-400"
                    }`}>{plan.cta}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-slate-900 text-slate-500 text-center">
          <p className="text-xs tracking-widest font-mono uppercase">© 2026 Veridion Nexus — Sovereign Shield. All Decisions Sealed.</p>
        </footer>

      </div>
    </>
  );
}
