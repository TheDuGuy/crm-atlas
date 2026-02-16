"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { calculateRAG } from "@/app/actions/health";

type WorkflowHealthDetailProps = {
  workflowId: string;
  metrics: any[];
};

export function WorkflowHealthDetail({ workflowId, metrics }: WorkflowHealthDetailProps) {
  const latestMetric = metrics[metrics.length - 1];
  const flow = latestMetric.flows;

  // Calculate trend data
  const trendData = {
    sends: metrics.map(m => ({ date: m.period_start_date, value: m.sends })),
    openRate: metrics.map(m => ({ date: m.period_start_date, value: m.open_rate })),
    clickRate: metrics.map(m => ({ date: m.period_start_date, value: m.click_rate })),
  };

  // Get previous period for comparison
  const previousMetric = metrics.length > 1 ? metrics[metrics.length - 2] : null;

  // Calculate deltas
  const sendsDelta = previousMetric
    ? ((latestMetric.sends - previousMetric.sends) / previousMetric.sends) * 100
    : null;

  const openRateDelta = previousMetric && previousMetric.open_rate && latestMetric.open_rate
    ? ((latestMetric.open_rate - previousMetric.open_rate) / previousMetric.open_rate) * 100
    : null;

  const clickRateDelta = previousMetric && previousMetric.click_rate && latestMetric.click_rate
    ? ((latestMetric.click_rate - previousMetric.click_rate) / previousMetric.click_rate) * 100
    : null;

  const rag = calculateRAG(latestMetric, previousMetric, {
    open_rate: 20,
    click_rate: 2,
    unsub_rate: 0.35,
    bounce_rate: 3.0,
    complaint_rate: 0.05,
  });

  const formatDelta = (delta: number | null) => {
    if (delta === null) return null;
    const Icon = delta >= 0 ? TrendingUp : TrendingDown;
    const color = delta >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon className="h-3 w-3" />
        {Math.abs(delta).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/health" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to Health
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{flow?.name || workflowId}</h1>
        <div className="mt-2 flex items-center gap-3">
          {flow?.products?.name && (
            <Badge variant="outline">{flow.products.name}</Badge>
          )}
          {flow?.purpose && (
            <Badge variant="outline" className="capitalize">{flow.purpose}</Badge>
          )}
          {flow?.live && (
            <Badge className="bg-green-100 text-green-800">Live</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Sends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMetric.sends.toLocaleString()}</div>
            {formatDelta(sendsDelta)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetric.open_rate ? `${latestMetric.open_rate.toFixed(1)}%` : '-'}
            </div>
            {formatDelta(openRateDelta)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetric.click_rate ? `${latestMetric.click_rate.toFixed(1)}%` : '-'}
            </div>
            {formatDelta(clickRateDelta)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={
              rag.status === 'green' ? 'bg-green-100 text-green-800' :
              rag.status === 'amber' ? 'bg-amber-100 text-amber-800' :
              rag.status === 'red' ? 'bg-red-100 text-red-800' :
              'bg-slate-100 text-slate-800'
            }>
              {rag.status.toUpperCase()}
            </Badge>
            {rag.reasons.length > 0 && (
              <div className="mt-2 text-xs text-slate-600">
                {rag.reasons[0]}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribe Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetric.unsub_rate !== null ? `${latestMetric.unsub_rate.toFixed(2)}%` : '-'}
            </div>
            {latestMetric.unsubs !== null && (
              <div className="text-xs text-slate-500 mt-1">
                {latestMetric.unsubs.toLocaleString()} unsubs
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetric.bounce_rate !== null ? `${latestMetric.bounce_rate.toFixed(1)}%` : '-'}
            </div>
            {latestMetric.bounces !== null && (
              <div className="text-xs text-slate-500 mt-1">
                {latestMetric.bounces.toLocaleString()} bounces
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complaint Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetric.complaint_rate !== null ? `${latestMetric.complaint_rate.toFixed(2)}%` : '-'}
            </div>
            {latestMetric.complaints !== null && (
              <div className="text-xs text-slate-500 mt-1">
                {latestMetric.complaints.toLocaleString()} complaints
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {rag.status !== 'green' && rag.reasons.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              Health Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
              {rag.reasons.map((reason, idx) => (
                <li key={idx}>• {reason}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Historical Performance
          </CardTitle>
          <CardDescription>Last {metrics.length} periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-2 text-left">Period</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Sends</th>
                  <th className="px-4 py-2 text-right">Opens</th>
                  <th className="px-4 py-2 text-right">Clicks</th>
                  <th className="px-4 py-2 text-right">Open Rate</th>
                  <th className="px-4 py-2 text-right">Click Rate</th>
                  <th className="px-4 py-2 text-right">CTOR</th>
                  <th className="px-4 py-2 text-right">Unsub Rate</th>
                  <th className="px-4 py-2 text-right">Bounce Rate</th>
                  <th className="px-4 py-2 text-right">Complaint Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.slice().reverse().map((metric, idx) => (
                  <tr key={metric.id} className="border-t">
                    <td className="px-4 py-2">{metric.period_start_date}</td>
                    <td className="px-4 py-2 capitalize">{metric.period_type}</td>
                    <td className="px-4 py-2 text-right">{metric.sends.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{metric.opens.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">{metric.clicks.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      {metric.open_rate ? `${metric.open_rate.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {metric.click_rate ? `${metric.click_rate.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {metric.ctor ? `${metric.ctor.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {metric.unsub_rate !== null ? `${metric.unsub_rate.toFixed(2)}%` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {metric.bounce_rate !== null ? `${metric.bounce_rate.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {metric.complaint_rate !== null ? `${metric.complaint_rate.toFixed(2)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {flow?.description && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Description:</strong> {flow.description}</div>
            {flow.trigger_type && <div><strong>Trigger:</strong> {flow.trigger_type}</div>}
            {flow.frequency && <div><strong>Frequency:</strong> {flow.frequency}</div>}
            {flow.channels && <div><strong>Channels:</strong> {flow.channels.join(', ')}</div>}
            {flow.sto !== null && <div><strong>STO:</strong> {flow.sto ? 'Enabled' : 'Disabled'}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
