// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Download, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { getPulseScorecard } from "@/app/actions/health-v2";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PulsePage() {
  const router = useRouter();
  const [scorecard, setScorecard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period_type: 'week' as 'week' | 'month',
    period_date: '',
    channels: [] as string[],
    live_only: false,
  });

  // Set default date to latest period (current week/month start)
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    setFilters(prev => ({
      ...prev,
      period_date: monday.toISOString().split('T')[0],
    }));
  }, []);

  useEffect(() => {
    if (filters.period_date) {
      loadScorecard();
    }
  }, [filters]);

  const loadScorecard = async () => {
    setLoading(true);
    try {
      const data = await getPulseScorecard(filters);
      setScorecard(data);
    } catch (error) {
      console.error('Failed to load pulse scorecard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      amber: 'bg-amber-100 text-amber-800',
      red: 'bg-red-100 text-red-800',
      unknown: 'bg-slate-100 text-slate-800',
    };
    return <Badge className={colors[status] || colors.unknown}>{status.toUpperCase()}</Badge>;
  };

  const formatDelta = (delta: number | null) => {
    if (delta === null) return '-';
    const Icon = delta >= 0 ? TrendingUp : TrendingDown;
    const color = delta >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={`flex items-center gap-1 text-xs ${color}`}>
        <Icon className="h-3 w-3" />
        {Math.abs(delta).toFixed(1)}%
      </span>
    );
  };

  const handleChannelToggle = (channel: string) => {
    setFilters(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pulse Scorecard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Weekly/monthly health overview by product
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/health">
              <Activity className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams({
                period_type: filters.period_type,
                date: filters.period_date,
                channels: filters.channels.join(','),
              });
              window.open(`/health/export/pdf?${params.toString()}`, '_blank');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
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
              <Label>Period Date</Label>
              <Input
                type="date"
                value={filters.period_date}
                onChange={(e) => setFilters({ ...filters, period_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex gap-2">
                {['email', 'push', 'in_app'].map(channel => (
                  <Button
                    key={channel}
                    size="sm"
                    variant={filters.channels.includes(channel) ? 'default' : 'outline'}
                    onClick={() => handleChannelToggle(channel)}
                  >
                    {channel}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="live-only"
                  checked={filters.live_only}
                  onChange={(e) => setFilters({ ...filters, live_only: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="live-only" className="cursor-pointer">Live flows only</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>{scorecard.length} products tracked</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : scorecard.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500">No data available for this period.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {scorecard.map((product) => (
                <div key={product.product_id} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{product.product_name}</h3>
                      <p className="text-sm text-slate-500">{product.workflows.length} workflows</p>
                    </div>
                    <div>
                      {getStatusBadge(product.overall_status)}
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div>
                      <div className="text-xs text-slate-500">Sends</div>
                      <div className="text-xl font-bold">{product.sends.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Open Rate</div>
                      <div className="text-xl font-bold">
                        {product.open_rate !== null ? `${product.open_rate.toFixed(1)}%` : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Click Rate</div>
                      <div className="text-xl font-bold">
                        {product.click_rate !== null ? `${product.click_rate.toFixed(1)}%` : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Unsub Rate</div>
                      <div className="text-xl font-bold">
                        {product.unsub_rate !== null ? `${product.unsub_rate.toFixed(2)}%` : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Bounce Rate</div>
                      <div className="text-xl font-bold">
                        {product.bounce_rate !== null ? `${product.bounce_rate.toFixed(1)}%` : '-'}
                      </div>
                    </div>
                  </div>

                  {product.watchouts.length > 0 && (
                    <div className="mb-4 rounded-md bg-amber-50 p-3 dark:bg-amber-900/10">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold text-amber-800 dark:text-amber-200">Key Watchouts:</div>
                          <ul className="list-disc list-inside text-amber-700 dark:text-amber-300">
                            {product.watchouts.map((watchout, idx) => (
                              <li key={idx}>{watchout}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams({
                        product_id: product.product_id,
                        period_type: filters.period_type,
                        period_date: filters.period_date,
                      });
                      router.push(`/health?${params.toString()}`);
                    }}
                  >
                    View Workflows →
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
