// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, TrendingDown, TrendingUp, Upload, Download } from "lucide-react";
import { getHealthMetrics, MetricSnapshot, calculateRAG, RAGStatus } from "@/app/actions/health";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HealthPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period_type: 'week' as 'week' | 'month',
    start_date: '',
    end_date: '',
    channel: '',
    live_only: false,
  });

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await getHealthMetrics(filters);

      // Group by workflow and get latest
      const grouped = new Map<string, any>();

      for (const metric of data) {
        const key = `${metric.workflow_id}_${metric.channel}`;
        if (!grouped.has(key) || new Date(metric.period_start_date) > new Date(grouped.get(key).period_start_date)) {
          grouped.set(key, metric);
        }
      }

      setMetrics(Array.from(grouped.values()));
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRAGBadge = (status: RAGStatus) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      amber: 'bg-amber-100 text-amber-800',
      red: 'bg-red-100 text-red-800',
      unknown: 'bg-slate-100 text-slate-800',
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  const formatDelta = (delta: number | null) => {
    if (delta === null) return '-';
    const Icon = delta >= 0 ? TrendingUp : TrendingDown;
    const color = delta >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        {Math.abs(delta).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Channel Health</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Weekly and monthly performance tracking with RAG indicators
          </p>
          <div className="mt-2 flex gap-2">
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href="/health/pulse">Pulse Scorecard</Link>
            </Button>
            <span className="text-slate-300">•</span>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href="/health/targets">Targets</Link>
            </Button>
            <span className="text-slate-300">•</span>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href="/health/mapping">Workflow Mapping</Link>
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/health/import">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams({
                period_type: filters.period_type,
                start: filters.start_date,
                end: filters.end_date,
              });
              window.open(`/health/export?${params.toString()}`, '_blank');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Period Type</Label>
              <Select
                value={filters.period_type}
                onValueChange={(value: 'week' | 'month') => setFilters({ ...filters, period_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Channel</Label>
              <Select
                value={filters.channel || "all"}
                onValueChange={(value) => setFilters({ ...filters, channel: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="live-only"
              checked={filters.live_only}
              onChange={(e) => setFilters({ ...filters, live_only: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="live-only" className="cursor-pointer">Show live flows only</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>{metrics.length} workflows tracked</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : metrics.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500">No data available. Import metrics to get started.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/health/import">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Workflow</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Channel</th>
                    <th className="px-4 py-3 text-right">Sends</th>
                    <th className="px-4 py-3 text-right">Open Rate</th>
                    <th className="px-4 py-3 text-right">Click Rate</th>
                    <th className="px-4 py-3 text-right">Unsub Rate</th>
                    <th className="px-4 py-3 text-right">Bounce Rate</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => {
                    const rag = calculateRAG(metric, null, {
                      open_rate: 20,
                      click_rate: 2,
                      unsub_rate: 0.35,
                      bounce_rate: 3.0,
                      complaint_rate: 0.05,
                    });
                    return (
                      <tr
                        key={metric.id}
                        className="border-t hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        onClick={() => router.push(`/health/workflows/${metric.workflow_id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{metric.flows?.name || metric.workflow_id}</div>
                          <div className="text-xs text-slate-500">{metric.flows?.purpose}</div>
                        </td>
                        <td className="px-4 py-3">{metric.flows?.products?.name || '-'}</td>
                        <td className="px-4 py-3 capitalize">{metric.channel}</td>
                        <td className="px-4 py-3 text-right">{metric.sends.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          {metric.open_rate ? `${metric.open_rate.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {metric.click_rate ? `${metric.click_rate.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {metric.unsub_rate !== null ? `${metric.unsub_rate.toFixed(2)}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {metric.bounce_rate !== null ? `${metric.bounce_rate.toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">{getRAGBadge(rag.status)}</td>
                        <td className="px-4 py-3 text-slate-500">{metric.period_start_date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
