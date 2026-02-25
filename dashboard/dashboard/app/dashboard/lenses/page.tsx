"use client";

import { useComplianceSummary } from "@/hooks/useComplianceData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  AlertTriangle,
  FileText,
  Users,
  Server,
  Building2,
  Eye,
  Activity,
  Lock,
  CheckCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Lens definitions with their compliance mappings
const LENSES = [
  {
    id: 'sovereign-shield',
    name: 'Sovereign Shield',
    description: 'GeoIP enforcement and data sovereignty',
    icon: Shield,
    href: '/dashboard/lenses/sovereign-shield',
    regulations: ['GDPR', 'DORA'],
    articles: ['GDPR Art.44-49', 'DORA Art.9'],
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'unified-incidents',
    name: 'Unified Incidents',
    description: 'Incident management and reporting',
    icon: AlertTriangle,
    href: '/dashboard/lenses/unified-incidents',
    regulations: ['GDPR', 'DORA', 'NIS2'],
    articles: ['GDPR Art.33', 'DORA Art.17-19', 'NIS2 Art.23'],
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    id: 'risk-overview',
    name: 'Risk Overview',
    description: 'Risk assessment and management',
    icon: Activity,
    href: '/dashboard/lenses/risk-overview',
    regulations: ['GDPR', 'DORA', 'AI_ACT'],
    articles: ['GDPR Art.35', 'DORA Art.6', 'AI Act Art.9'],
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    id: 'ai-act-art5',
    name: 'AI Act Art.5',
    description: 'Prohibited AI practices enforcement',
    icon: Eye,
    href: '/dashboard/lenses/ai-act-art5',
    regulations: ['AI_ACT'],
    articles: ['AI Act Art.5'],
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    id: 'gdpr-rights',
    name: 'GDPR Rights',
    description: 'Data subject rights management',
    icon: Users,
    href: '/dashboard/lenses/gdpr-rights',
    regulations: ['GDPR'],
    articles: ['GDPR Art.15-20'],
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    id: 'gdpr-consent',
    name: 'GDPR Consent',
    description: 'Consent management and tracking',
    icon: CheckCircle,
    href: '/dashboard/lenses/gdpr-consent',
    regulations: ['GDPR'],
    articles: ['GDPR Art.6-7'],
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
  {
    id: 'dora-assets',
    name: 'DORA Assets',
    description: 'ICT asset inventory and management',
    icon: Server,
    href: '/dashboard/lenses/dora-assets',
    regulations: ['DORA'],
    articles: ['DORA Art.5-8'],
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    id: 'transparency',
    name: 'Transparency',
    description: 'AI transparency and disclosure',
    icon: FileText,
    href: '/dashboard/lenses/transparency',
    regulations: ['AI_ACT'],
    articles: ['AI Act Art.13-14, 50, 52'],
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    id: 'ai-performance',
    name: 'AI Performance',
    description: 'AI system monitoring and accuracy',
    icon: Activity,
    href: '/dashboard/lenses/ai-performance',
    regulations: ['AI_ACT'],
    articles: ['AI Act Art.15'],
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
];

export default function LensesPage() {
  const { data: summary, isLoading } = useComplianceSummary();

  // Get score for a regulation
  const getRegulationScore = (regulation: string) => {
    if (!summary) return null;
    const reg = summary.regulations.find(r => r.regulation === regulation);
    return reg?.score ?? null;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Compliance Lenses</h1>
        <p className="text-muted-foreground">
          Specialized views for different compliance domains and regulations
        </p>
      </div>

      {/* Lenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {LENSES.map((lens) => {
          const Icon = lens.icon;

          // Calculate average score for this lens's regulations
          const scores = lens.regulations
            .map(r => getRegulationScore(r))
            .filter((s): s is number => s !== null);
          const avgScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null;

          return (
            <Link key={lens.id} href={lens.href}>
              <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-2 rounded-lg", lens.bg)}>
                      <Icon className={cn("h-5 w-5", lens.color)} />
                    </div>
                    {avgScore !== null && (
                      <Badge
                        variant="outline"
                        className={cn(
                          avgScore >= 80 && "bg-green-500/10 text-green-500",
                          avgScore >= 50 && avgScore < 80 && "bg-yellow-500/10 text-yellow-500",
                          avgScore < 50 && "bg-red-500/10 text-red-500"
                        )}
                      >
                        {avgScore}%
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{lens.name}</CardTitle>
                  <CardDescription>{lens.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Regulations */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lens.regulations.map((reg) => (
                      <Badge key={reg} variant="secondary" className="text-xs">
                        {reg}
                      </Badge>
                    ))}
                  </div>

                  {/* Articles */}
                  <div className="text-xs text-muted-foreground mb-3">
                    {lens.articles.join(' • ')}
                  </div>

                  {/* Score Progress */}
                  {avgScore !== null && (
                    <Progress value={avgScore} className="h-1.5" />
                  )}

                  {/* Arrow */}
                  <div className="flex items-center justify-end mt-3 text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
