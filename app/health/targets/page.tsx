// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type KPITarget = {
  id: string;
  metric_name: string;
  product_id: string | null;
  workflow_id: string | null;
  channel: string | null;
  period_type: string | null;
  target_value: number;
  amber_threshold: number;
  red_threshold: number;
  amber_floor: number | null;
  red_floor: number | null;
  effective_from: string;
  effective_to: string | null;
  scope_type: string;
};

export default function TargetsPage() {
  const [targets, setTargets] = useState<KPITarget[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<KPITarget | null>(null);
  const [formData, setFormData] = useState({
    metric_name: 'open_rate',
    product_id: '',
    workflow_id: '',
    channel: '',
    period_type: '',
    target_value: '',
    amber_threshold: '',
    red_threshold: '',
    amber_floor: '',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: '',
    scope_type: 'product',
  });

  useEffect(() => {
    loadTargets();
    loadProducts();
  }, []);

  const loadTargets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('kpi_targets')
      .select('*')
      .order('effective_from', { ascending: false });

    setTargets(data || []);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name')
      .order('name');

    setProducts(data || []);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.metric_name || !formData.target_value || !formData.effective_from) {
      alert('Please fill in required fields: metric, target value, and effective from date');
      return;
    }

    // Check for overlapping targets
    const { data: overlapping } = await supabase
      .from('kpi_targets')
      .select('*')
      .eq('metric_name', formData.metric_name)
      .eq('product_id', formData.product_id || null)
      .eq('workflow_id', formData.workflow_id || null)
      .eq('channel', formData.channel || null)
      .eq('period_type', formData.period_type || null)
      .lte('effective_from', formData.effective_to || '9999-12-31')
      .or(`effective_to.gte.${formData.effective_from},effective_to.is.null`);

    if (overlapping && overlapping.length > 0 && (!editingTarget || overlapping[0].id !== editingTarget.id)) {
      alert('A target already exists for this scope and metric with overlapping dates. Please adjust the date range.');
      return;
    }

    const payload = {
      metric_name: formData.metric_name,
      metric: formData.metric_name, // Keep old column for compatibility
      product_id: formData.product_id || null,
      workflow_id: formData.workflow_id || null,
      channel: formData.channel || null,
      period_type: formData.period_type || null,
      target_value: parseFloat(formData.target_value),
      amber_threshold: parseFloat(formData.amber_threshold) || parseFloat(formData.target_value) * 0.7,
      red_threshold: parseFloat(formData.red_threshold) || parseFloat(formData.target_value) * 0.5,
      amber_floor: formData.amber_floor ? parseFloat(formData.amber_floor) : null,
      red_floor: null,
      effective_from: formData.effective_from,
      effective_to: formData.effective_to || null,
      scope_type: formData.scope_type,
      updated_at: new Date().toISOString(),
    };

    if (editingTarget) {
      await supabase
        .from('kpi_targets')
        .update(payload)
        .eq('id', editingTarget.id);
    } else {
      await supabase
        .from('kpi_targets')
        .insert([{
          ...payload,
          created_at: new Date().toISOString(),
        }]);
    }

    setDialogOpen(false);
    setEditingTarget(null);
    resetForm();
    loadTargets();
  };

  const handleEdit = (target: KPITarget) => {
    setEditingTarget(target);
    setFormData({
      metric_name: target.metric_name,
      product_id: target.product_id || '',
      workflow_id: target.workflow_id || '',
      channel: target.channel || '',
      period_type: target.period_type || '',
      target_value: target.target_value.toString(),
      amber_threshold: target.amber_threshold.toString(),
      red_threshold: target.red_threshold.toString(),
      amber_floor: target.amber_floor?.toString() || '',
      effective_from: target.effective_from,
      effective_to: target.effective_to || '',
      scope_type: target.scope_type,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this target?')) return;

    await supabase
      .from('kpi_targets')
      .delete()
      .eq('id', id);

    loadTargets();
  };

  const resetForm = () => {
    setFormData({
      metric_name: 'open_rate',
      product_id: '',
      workflow_id: '',
      channel: '',
      period_type: '',
      target_value: '',
      amber_threshold: '',
      red_threshold: '',
      amber_floor: '',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      scope_type: 'product',
    });
  };

  const createDefaults = async () => {
    const defaults = [
      { metric: 'open_rate', target: 20.0, amber: 14.0, red: 10.0 },
      { metric: 'click_rate', target: 2.0, amber: 1.4, red: 1.0 },
      { metric: 'unsub_rate', target: 0.20, amber: 0.35, red: 0.50 },
      { metric: 'bounce_rate', target: 1.5, amber: 3.0, red: 5.0 },
      { metric: 'complaint_rate', target: 0.02, amber: 0.05, red: 0.10 },
    ];

    const payload = defaults.map(d => ({
      metric_name: d.metric,
      metric: d.metric,
      scope_type: 'product',
      target_value: d.target,
      amber_threshold: d.amber,
      red_threshold: d.red,
      effective_from: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await supabase.from('kpi_targets').insert(payload);
    loadTargets();
  };

  const getScopeLabel = (target: KPITarget) => {
    if (target.workflow_id) return `Workflow: ${target.workflow_id}`;
    if (target.product_id) {
      const product = products.find(p => p.id === target.product_id);
      return `Product: ${product?.name || target.product_id}`;
    }
    if (target.channel) return `Channel: ${target.channel}`;
    return 'Global';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Target Management</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Configure KPI targets with versioning and scoping
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createDefaults}>
            Create Defaults
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingTarget(null); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" />
                New Target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTarget ? 'Edit Target' : 'Create New Target'}</DialogTitle>
                <DialogDescription>
                  Define KPI targets for specific metrics and scopes
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Metric *</Label>
                    <Select value={formData.metric_name} onValueChange={(v) => setFormData({...formData, metric_name: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open_rate">Open Rate</SelectItem>
                        <SelectItem value="click_rate">Click Rate</SelectItem>
                        <SelectItem value="unsub_rate">Unsub Rate</SelectItem>
                        <SelectItem value="bounce_rate">Bounce Rate</SelectItem>
                        <SelectItem value="complaint_rate">Complaint Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Value *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.target_value}
                      onChange={(e) => setFormData({...formData, target_value: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amber Threshold</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amber_threshold}
                      onChange={(e) => setFormData({...formData, amber_threshold: e.target.value})}
                      placeholder="Auto: target * 0.7"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Red Threshold</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.red_threshold}
                      onChange={(e) => setFormData({...formData, red_threshold: e.target.value})}
                      placeholder="Auto: target * 0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product (optional)</Label>
                    <Select value={formData.product_id} onValueChange={(v) => setFormData({...formData, product_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All products" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All products</SelectItem>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Channel (optional)</Label>
                    <Select value={formData.channel} onValueChange={(v) => setFormData({...formData, channel: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All channels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All channels</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="in_app">In-App</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Effective From *</Label>
                    <Input
                      type="date"
                      value={formData.effective_from}
                      onChange={(e) => setFormData({...formData, effective_from: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Effective To (optional)</Label>
                    <Input
                      type="date"
                      value={formData.effective_to}
                      onChange={(e) => setFormData({...formData, effective_to: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Target</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Targets
          </CardTitle>
          <CardDescription>{targets.length} targets configured</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : targets.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500">No targets configured. Create defaults to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Metric</th>
                    <th className="px-4 py-3 text-left">Scope</th>
                    <th className="px-4 py-3 text-right">Target</th>
                    <th className="px-4 py-3 text-right">Amber</th>
                    <th className="px-4 py-3 text-right">Red</th>
                    <th className="px-4 py-3 text-left">Effective From</th>
                    <th className="px-4 py-3 text-left">Effective To</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {targets.map((target) => (
                    <tr key={target.id} className="border-t">
                      <td className="px-4 py-3 font-medium capitalize">{target.metric_name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{getScopeLabel(target)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">{target.target_value}%</td>
                      <td className="px-4 py-3 text-right">{target.amber_threshold}%</td>
                      <td className="px-4 py-3 text-right">{target.red_threshold}%</td>
                      <td className="px-4 py-3">{target.effective_from}</td>
                      <td className="px-4 py-3">{target.effective_to || 'Active'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(target)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(target.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
