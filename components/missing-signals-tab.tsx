"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import {
  getMissingSignals,
  createMissingSignal,
  updateMissingSignal,
  deleteMissingSignal,
  type MissingSignal,
} from "@/app/actions/missing-signals";
import Link from "next/link";

type MissingSignalsTabProps = {
  productId: string;
  opportunities: Array<{ id: string; title: string }>;
};

export function MissingSignalsTab({ productId, opportunities }: MissingSignalsTabProps) {
  const [signals, setSignals] = useState<MissingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<MissingSignal | null>(null);
  const [formData, setFormData] = useState({
    signal_name: '',
    signal_type: 'field' as 'field' | 'event',
    description: '',
    why_missing: '',
    unlocks: '',
    estimated_impact: '' as '' | 'High' | 'Medium' | 'Low',
    effort_type: '' as '' | 'CRM' | 'Data' | 'Backend' | 'Mixed',
    status: 'idea' as 'idea' | 'requested' | 'in_progress' | 'live' | 'dropped',
    linked_opportunity_id: '',
  });

  useEffect(() => {
    loadSignals();
  }, [productId]);

  const loadSignals = async () => {
    setLoading(true);
    try {
      const data = await getMissingSignals(productId);
      setSignals(data);
    } catch (error) {
      console.error('Failed to load missing signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingSignal) {
        await updateMissingSignal(editingSignal.id, {
          signal_name: formData.signal_name,
          signal_type: formData.signal_type,
          description: formData.description,
          why_missing: formData.why_missing,
          unlocks: formData.unlocks || undefined,
          estimated_impact: formData.estimated_impact || undefined,
          effort_type: formData.effort_type || undefined,
          status: formData.status,
          linked_opportunity_id: formData.linked_opportunity_id || undefined,
        });
      } else {
        await createMissingSignal({
          product_id: productId,
          signal_name: formData.signal_name,
          signal_type: formData.signal_type,
          description: formData.description,
          why_missing: formData.why_missing,
          unlocks: formData.unlocks || undefined,
          estimated_impact: formData.estimated_impact || undefined,
          effort_type: formData.effort_type || undefined,
          status: formData.status,
          linked_opportunity_id: formData.linked_opportunity_id || undefined,
        });
      }
      setDialogOpen(false);
      resetForm();
      loadSignals();
    } catch (error) {
      console.error('Failed to save missing signal:', error);
      alert('Failed to save. Check that signal name is unique.');
    }
  };

  const handleEdit = (signal: MissingSignal) => {
    setEditingSignal(signal);
    setFormData({
      signal_name: signal.signal_name,
      signal_type: signal.signal_type,
      description: signal.description,
      why_missing: signal.why_missing,
      unlocks: signal.unlocks || '',
      estimated_impact: signal.estimated_impact || '',
      effort_type: signal.effort_type || '',
      status: signal.status,
      linked_opportunity_id: signal.linked_opportunity_id || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this missing signal?')) return;
    try {
      await deleteMissingSignal(id);
      loadSignals();
    } catch (error) {
      console.error('Failed to delete missing signal:', error);
    }
  };

  const resetForm = () => {
    setEditingSignal(null);
    setFormData({
      signal_name: '',
      signal_type: 'field',
      description: '',
      why_missing: '',
      unlocks: '',
      estimated_impact: '',
      effort_type: '',
      status: 'idea',
      linked_opportunity_id: '',
    });
  };

  const getImpactBadge = (impact: string | null) => {
    if (!impact) return <Badge variant="outline">-</Badge>;
    const colors = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-amber-100 text-amber-800',
      Low: 'bg-slate-100 text-slate-800',
    };
    return <Badge className={colors[impact as keyof typeof colors]}>{impact}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      idea: 'bg-slate-100 text-slate-800',
      requested: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      live: 'bg-green-100 text-green-800',
      dropped: 'bg-red-100 text-red-800',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Missing Signals
            </CardTitle>
            <CardDescription>
              Fields and events that don't exist but would unlock better CRM capabilities
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Signal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSignal ? 'Edit' : 'Add'} Missing Signal</DialogTitle>
                <DialogDescription>
                  Document a field or event that would improve CRM targeting
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signal_name">Signal Name *</Label>
                    <Input
                      id="signal_name"
                      value={formData.signal_name}
                      onChange={(e) => setFormData({ ...formData, signal_name: e.target.value })}
                      placeholder="e.g., last_purchase_date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={formData.signal_type}
                      onValueChange={(v: 'field' | 'event') => setFormData({ ...formData, signal_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="field">Field</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What this signal represents"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="why_missing">Why Missing *</Label>
                  <Textarea
                    id="why_missing"
                    value={formData.why_missing}
                    onChange={(e) => setFormData({ ...formData, why_missing: e.target.value })}
                    placeholder="Why this doesn't exist yet"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unlocks">What It Unlocks</Label>
                  <Textarea
                    id="unlocks"
                    value={formData.unlocks}
                    onChange={(e) => setFormData({ ...formData, unlocks: e.target.value })}
                    placeholder="What flows, segments, or opportunities this would enable"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estimated Impact</Label>
                    <Select
                      value={formData.estimated_impact}
                      onValueChange={(v) => setFormData({ ...formData, estimated_impact: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select impact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Effort Type</Label>
                    <Select
                      value={formData.effort_type}
                      onValueChange={(v) => setFormData({ ...formData, effort_type: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="CRM">CRM</SelectItem>
                        <SelectItem value="Data">Data</SelectItem>
                        <SelectItem value="Backend">Backend</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea</SelectItem>
                        <SelectItem value="requested">Requested</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Linked Opportunity</Label>
                    <Select
                      value={formData.linked_opportunity_id}
                      onValueChange={(v) => setFormData({ ...formData, linked_opportunity_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select opportunity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {opportunities.map((opp) => (
                          <SelectItem key={opp.id} value={opp.id}>
                            {opp.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Signal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading...</div>
        ) : signals.length === 0 ? (
          <div className="py-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-500">No missing signals documented yet.</p>
            <p className="mt-1 text-sm text-slate-400">
              Add signals to track fields/events that would improve CRM capabilities.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left">Signal Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-center">Impact</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Linked Opportunity</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((signal) => (
                  <tr key={signal.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 font-medium">{signal.signal_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">
                        {signal.signal_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{signal.description}</td>
                    <td className="px-4 py-3 text-center">{getImpactBadge(signal.estimated_impact)}</td>
                    <td className="px-4 py-3 text-center">{getStatusBadge(signal.status)}</td>
                    <td className="px-4 py-3">
                      {signal.linked_opportunity_id && signal.opportunities ? (
                        <Link
                          href={`/opportunities/${signal.linked_opportunity_id}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <span className="truncate max-w-xs">{signal.opportunities.title}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(signal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(signal.id)}
                        >
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
  );
}
