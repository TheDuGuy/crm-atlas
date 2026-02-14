import { detectFlowConflicts } from "@/app/actions/conflicts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, Info } from "lucide-react";
import Link from "next/link";

export default async function ConflictsPage() {
  const conflicts = await detectFlowConflicts();

  const highRisk = conflicts.filter((c) => c.riskScore >= 5);
  const mediumRisk = conflicts.filter((c) => c.riskScore >= 3 && c.riskScore < 5);
  const lowRisk = conflicts.filter((c) => c.riskScore < 3);

  function getRiskColor(score: number) {
    if (score >= 5) return "bg-red-100 text-red-800 border-red-200";
    if (score >= 3) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  function getRiskLabel(score: number) {
    if (score >= 5) return "High Risk";
    if (score >= 3) return "Medium Risk";
    return "Low Risk";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Flow Conflict Detector</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Identify flows that may overlap and cause over-messaging
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conflicts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highRisk.length}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Medium Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{mediumRisk.length}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Low Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{lowRisk.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Conflicts are detected based on: shared channels, Daily frequency, event-based triggers,
          missing priorities/suppression rules, and same product. Higher risk scores indicate
          greater likelihood of over-messaging.
        </AlertDescription>
      </Alert>

      {/* Conflicts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Potential Conflicts ({conflicts.length})</CardTitle>
          <CardDescription>
            Sorted by risk score - fix high-risk conflicts first by setting priorities and
            suppression rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conflicts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Conflicts Detected!</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md">
                All live flows have sufficient differentiation in channels, timing, and priorities
                to avoid over-messaging.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                    <TableHead className="font-semibold">Risk</TableHead>
                    <TableHead className="font-semibold">Flow A</TableHead>
                    <TableHead className="font-semibold">Flow B</TableHead>
                    <TableHead className="font-semibold">Shared Channels</TableHead>
                    <TableHead className="font-semibold">Risk Factors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conflicts.map((conflict, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <TableCell>
                        <Badge className={getRiskColor(conflict.riskScore)}>
                          {getRiskLabel(conflict.riskScore)}
                          <span className="ml-2 font-mono">{conflict.riskScore}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/flows/${conflict.flowA.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline block"
                          >
                            {conflict.flowA.name}
                          </Link>
                          <div className="text-xs text-slate-500">
                            {conflict.flowA.product_name} • {conflict.flowA.trigger_type}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {conflict.flowA.priority ? (
                              <Badge variant="outline" className="text-xs">
                                P{conflict.flowA.priority}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                                No Priority
                              </Badge>
                            )}
                            {conflict.flowA.suppression_rules ? (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                                Has Rules
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                                No Rules
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/flows/${conflict.flowB.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline block"
                          >
                            {conflict.flowB.name}
                          </Link>
                          <div className="text-xs text-slate-500">
                            {conflict.flowB.product_name} • {conflict.flowB.trigger_type}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {conflict.flowB.priority ? (
                              <Badge variant="outline" className="text-xs">
                                P{conflict.flowB.priority}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                                No Priority
                              </Badge>
                            )}
                            {conflict.flowB.suppression_rules ? (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                                Has Rules
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                                No Rules
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {conflict.sharedChannels.map((channel) => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {conflict.riskFactors.slice(0, 3).map((factor, i) => (
                            <div key={i} className="text-xs text-slate-600 flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{factor}</span>
                            </div>
                          ))}
                          {conflict.riskFactors.length > 3 && (
                            <div className="text-xs text-slate-400">
                              +{conflict.riskFactors.length - 3} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Conflict Resolution Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Set Priorities (1-100)</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Lower number = higher priority. Transactional flows (1-20), Activation (21-40),
                Retention (41-60), Winback (61-80), Educational (81-100).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Define Suppression Rules</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Document suppression logic: "Suppress if user received any PL flow in last 24h" or
                "Suppress if TTP transaction in last 7d".
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Set Max Frequency</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Define max_frequency_per_user_days to prevent same flow sending too often (e.g., 7
                days minimum between sends).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">4. Review Shared Channels</h3>
              <p className="text-slate-600 dark:text-slate-400">
                If two flows share all channels and are both Daily, consider differentiating timing
                or reducing one to Weekly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
