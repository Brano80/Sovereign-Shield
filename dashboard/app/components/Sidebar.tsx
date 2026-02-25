'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, FileText, Shield, ClipboardCheck, List, MapPin } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Sovereign Shield', icon: Globe },
  { href: '/transfer-log', label: 'Transfer Log', icon: List },
  { href: '/review-queue', label: 'Review Queue', icon: ClipboardCheck },
  { href: '/scc-registry', label: 'SCC Registry', icon: FileText },
  { href: '/adequate-countries', label: 'Adequate Countries', icon: MapPin },
  { href: '/evidence-vault', label: 'Evidence Vault', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white mb-1">VERIDION NEXUS</h1>
          <p className="text-xs text-slate-400">Compliance Dashboard v1.0.0</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
