"use client";

import { useRegulationScore } from "@/hooks/useComplianceData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Regulation, ArticleScore } from "@/lib/compliance/compliance-score-types";
import { cn } from "@/lib/utils";

interface RegulationDetailPanelProps {
  regulation: Regulation;
  onClose: () => void;
}

const STATUS_ICONS = {
  COMPLIANT: { icon: CheckCircle, color: 'text-green-500' },
  PARTIAL: { icon: AlertTriangle, color: 'text-yellow-500' },
  NON_COMPLIANT: { icon: XCircle, color: 'text-red-500' },
  NOT_ASSESSED: { icon: Clock, color: 'text-gray-500' },
};

const REGULATION_NAMES: Record<Regulation, string> = {
  GDPR: 'General Data Protection Regulation',
  DORA: 'Digital Operational Resilience Act',
  NIS2: 'Network and Information Security Directive 2',
  AI_ACT: 'EU Artificial Intelligence Act',
};

export function RegulationDetailPanel({ regulation, onClose }: RegulationDetailPanelProps) {
  const { data, isLoading, error } = useRegulationScore(regulation);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive">Failed to load: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {regulation} Compliance Detail
            {data && (
              <Badge
                variant="outline"
                className={cn(
                  data.status === 'COMPLIANT' && 'bg-green-500/10 text-green-500',
                  data.status === 'PARTIAL' && 'bg-yellow-500/10 text-yellow-500',
                  data.status === 'NON_COMPLIANT' && 'bg-red-500/10 text-red-500'
                )}
              >
                {data.score}%
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{REGULATION_NAMES[regulation]}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : data && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-500/10">
                <div className="text-2xl font-bold text-green-500">
                  {data.compliantArticles}
                </div>
                <div className="text-xs text-muted-foreground">Compliant</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                <div className="text-2xl font-bold text-yellow-500">
                  {data.partialArticles}
                </div>
                <div className="text-xs text-muted-foreground">Partial</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10">
                <div className="text-2xl font-bold text-red-500">
                  {data.nonCompliantArticles}
                </div>
                <div className="text-xs text-muted-foreground">Non-Compliant</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-500/10">
                <div className="text-2xl font-bold text-gray-500">
                  {data.notAssessedArticles}
                </div>
                <div className="text-xs text-muted-foreground">Not Assessed</div>
              </div>
            </div>

            {/* Active Clocks */}
            {data.activeClocks.length > 0 && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Active Regulatory Clocks</span>
                </div>
                <div className="space-y-2">
                  {data.activeClocks.map((clock) => (
                    <div key={clock.clockId} className="flex items-center justify-between text-sm">
                      <span>{clock.clockType}</span>
                      <Badge variant="outline">{clock.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critical Gaps */}
            {data.criticalGaps.length > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Critical Gaps</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {data.criticalGaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <div>
                        <p>{gap.description}</p>
                        <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Articles Accordion */}
            <div>
              <h4 className="font-medium mb-3">Articles ({data.totalArticles})</h4>
              <Accordion type="single" collapsible className="space-y-2">
                {data.articles.map((article) => (
                  <ArticleAccordionItem key={article.articleId} article={article} />
                ))}
              </Accordion>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ArticleAccordionItem({ article }: { article: ArticleScore }) {
  const statusConfig = STATUS_ICONS[article.status as keyof typeof STATUS_ICONS] || STATUS_ICONS.NOT_ASSESSED;
  const StatusIcon = statusConfig.icon;

  return (
    <AccordionItem value={article.articleId} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 flex-1">
          <StatusIcon className={cn("h-4 w-4", statusConfig.color)} />
          <div className="flex-1 text-left">
            <span className="font-medium">{article.articleId}</span>
            <span className="text-muted-foreground ml-2">{article.articleName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={article.score} className="w-20 h-2" />
            <span className={cn("text-sm font-medium", statusConfig.color)}>
              {article.score}%
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pt-2 space-y-3">
          {/* Evidence */}
          <div className="text-sm">
            <span className="text-muted-foreground">Evidence count: </span>
            <span className="font-medium">{article.evidenceCount}</span>
          </div>

          {/* Confidence */}
          <div className="text-sm">
            <span className="text-muted-foreground">Confidence: </span>
            <span className="font-medium">{article.confidence}%</span>
          </div>

          {/* Gaps */}
          {article.gaps.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Gaps identified:</span>
              <ul className="mt-1 space-y-1">
                {article.gaps.map((gap, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        gap.severity === 'HIGH' && 'bg-red-500/10 text-red-500',
                        gap.severity === 'MEDIUM' && 'bg-yellow-500/10 text-yellow-500',
                        gap.severity === 'LOW' && 'bg-blue-500/10 text-blue-500'
                      )}
                    >
                      {gap.severity}
                    </Badge>
                    <div>
                      <p>{gap.description}</p>
                      <p className="text-xs text-muted-foreground">{gap.recommendation}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* View Details Button */}
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="h-3 w-3 mr-2" />
            View Full Evidence
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
