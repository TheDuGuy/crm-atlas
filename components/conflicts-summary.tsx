import { getConflictSummary } from "@/app/actions/conflicts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export async function ConflictsSummary() {
  const summary = await getConflictSummary();

  return (
    <Card className="border-amber-200 bg-amber-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Flow Conflicts
            </CardTitle>
            <CardDescription className="mt-2">
              Potential over-messaging risks detected across live flows
            </CardDescription>
          </div>
          <Link href="/conflicts">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {summary.totalConflicts === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold mb-1">No Conflicts Detected!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              All live flows have sufficient differentiation to avoid over-messaging.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summary.totalConflicts}</div>
                <div className="text-xs text-slate-600">Total Conflicts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.highRiskCount}</div>
                <div className="text-xs text-slate-600">High Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{summary.mediumRiskCount}</div>
                <div className="text-xs text-slate-600">Medium Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.lowRiskCount}</div>
                <div className="text-xs text-slate-600">Low Risk</div>
              </div>
            </div>

            {/* Top Conflicts */}
            {summary.topConflicts.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Top {summary.topConflicts.length} Highest Risk:
                </div>
                {summary.topConflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-3 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={
                              conflict.riskScore >= 5
                                ? "bg-red-100 text-red-800 border-red-200"
                                : conflict.riskScore >= 3
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            Risk: {conflict.riskScore}
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {conflict.sharedChannels.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <Link
                              href={`/flows/${conflict.flowA.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {conflict.flowA.name}
                            </Link>
                            <div className="text-xs text-slate-500">
                              {conflict.flowA.product_name}
                            </div>
                          </div>
                          <div>
                            <Link
                              href={`/flows/${conflict.flowB.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {conflict.flowB.name}
                            </Link>
                            <div className="text-xs text-slate-500">
                              {conflict.flowB.product_name}
                            </div>
                          </div>
                        </div>
                        {conflict.riskFactors.slice(0, 2).length > 0 && (
                          <div className="mt-2 flex items-start gap-1 text-xs text-slate-600">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{conflict.riskFactors.slice(0, 2).join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
