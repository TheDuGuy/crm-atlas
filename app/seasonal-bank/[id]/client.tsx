"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Plus, Edit, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type SeasonalCampaignWithRelations,
  generateSeasonalBrief,
  createSeasonalAudience,
  updateSeasonalAudience,
  deleteSeasonalAudience,
  createSeasonalOrchestrationStep,
  updateSeasonalOrchestrationStep,
  deleteSeasonalOrchestrationStep,
  createSeasonalKpi,
  updateSeasonalKpi,
  deleteSeasonalKpi,
  createSeasonalAsset,
  updateSeasonalAsset,
  deleteSeasonalAsset,
  createSeasonalDataRequirement,
  updateSeasonalDataRequirement,
  deleteSeasonalDataRequirement,
} from "@/app/actions/seasonal-bank";

type SeasonalBankDetailClientProps = {
  campaign: SeasonalCampaignWithRelations;
};

export function SeasonalBankDetailClient({ campaign: initialCampaign }: SeasonalBankDetailClientProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(initialCampaign);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const brief = await generateSeasonalBrief(campaign.id);
      const blob = new Blob([brief], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign.name.replace(/\s+/g, '-').toLowerCase()}-brief.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export brief:', error);
      alert('Failed to export brief');
    } finally {
      setExporting(false);
    }
  };

  const refreshCampaign = () => {
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-slate-100 text-slate-800",
      planned: "bg-blue-100 text-blue-800",
      in_flight: "bg-green-100 text-green-800",
      completed: "bg-purple-100 text-purple-800",
      archived: "bg-slate-200 text-slate-600",
    };
    return <Badge className={colors[status] || "bg-slate-100"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800",
      medium: "bg-amber-100 text-amber-800",
      low: "bg-slate-100 text-slate-800",
    };
    return <Badge className={colors[priority] || "bg-slate-100"}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/seasonal-bank">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export Brief'}
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            {campaign.name}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">{campaign.product}</Badge>
            <Badge variant="outline">{campaign.season} {campaign.year}</Badge>
            <Badge className="capitalize">{campaign.objective}</Badge>
            {getStatusBadge(campaign.status)}
            {getPriorityBadge(campaign.priority)}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audiences">
            Audiences ({campaign.audiences?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="orchestration">
            Orchestration ({campaign.orchestration_steps?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="kpis">
            KPIs ({campaign.kpis?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="assets">
            Copy & Creative ({campaign.assets?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="data">
            Data Requirements ({campaign.data_requirements?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-slate-600">Markets</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {campaign.market.map((m) => (
                      <Badge key={m} variant="outline">{m}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Timing</Label>
                  <div className="text-sm mt-1">
                    {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'TBD'} -{' '}
                    {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'TBD'}
                  </div>
                </div>
              </div>

              {campaign.summary && (
                <div>
                  <Label className="text-sm text-slate-600">Summary</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{campaign.summary}</p>
                </div>
              )}

              {campaign.creative_direction && (
                <div>
                  <Label className="text-sm text-slate-600">Creative Direction</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{campaign.creative_direction}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audiences">
          <AudiencesTab campaignId={campaign.id} audiences={campaign.audiences || []} onRefresh={refreshCampaign} />
        </TabsContent>

        <TabsContent value="orchestration">
          <OrchestrationTab campaignId={campaign.id} steps={campaign.orchestration_steps || []} onRefresh={refreshCampaign} />
        </TabsContent>

        <TabsContent value="kpis">
          <KpisTab campaignId={campaign.id} kpis={campaign.kpis || []} onRefresh={refreshCampaign} />
        </TabsContent>

        <TabsContent value="assets">
          <AssetsTab campaignId={campaign.id} assets={campaign.assets || []} onRefresh={refreshCampaign} />
        </TabsContent>

        <TabsContent value="data">
          <DataRequirementsTab campaignId={campaign.id} requirements={campaign.data_requirements || []} onRefresh={refreshCampaign} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Audiences Tab Component
function AudiencesTab({ campaignId, audiences, onRefresh }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    audience_name: '',
    description: '',
    segment_criteria: '',
    estimated_size: '',
  });

  const handleSave = async () => {
    try {
      if (editing) {
        await updateSeasonalAudience(editing.id, {
          audience_name: formData.audience_name,
          description: formData.description || undefined,
          segment_criteria: formData.segment_criteria || undefined,
          estimated_size: formData.estimated_size ? parseInt(formData.estimated_size) : undefined,
        });
      } else {
        await createSeasonalAudience({
          seasonal_campaign_id: campaignId,
          audience_name: formData.audience_name,
          description: formData.description || undefined,
          segment_criteria: formData.segment_criteria || undefined,
          estimated_size: formData.estimated_size ? parseInt(formData.estimated_size) : undefined,
        });
      }
      setDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to save audience:', error);
      alert('Failed to save audience');
    }
  };

  const handleEdit = (aud: any) => {
    setEditing(aud);
    setFormData({
      audience_name: aud.audience_name,
      description: aud.description || '',
      segment_criteria: aud.segment_criteria || '',
      estimated_size: aud.estimated_size?.toString() || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this audience?')) return;
    try {
      await deleteSeasonalAudience(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete audience:', error);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ audience_name: '', description: '', segment_criteria: '', estimated_size: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audiences</CardTitle>
            <CardDescription>Target segments for this campaign</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Audience
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit' : 'Add'} Audience</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Audience Name *</Label>
                  <Input
                    value={formData.audience_name}
                    onChange={(e) => setFormData({ ...formData, audience_name: e.target.value })}
                    placeholder="e.g., Active Card Reader Users"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What defines this audience?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Segment Criteria</Label>
                  <Textarea
                    value={formData.segment_criteria}
                    onChange={(e) => setFormData({ ...formData, segment_criteria: e.target.value })}
                    placeholder="Technical segment definition"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Size</Label>
                  <Input
                    type="number"
                    value={formData.estimated_size}
                    onChange={(e) => setFormData({ ...formData, estimated_size: e.target.value })}
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {audiences.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No audiences yet</p>
        ) : (
          <div className="space-y-4">
            {audiences.map((aud: any) => (
              <div key={aud.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{aud.audience_name}</h3>
                    {aud.description && <p className="text-sm text-slate-600 mt-1">{aud.description}</p>}
                    {aud.segment_criteria && (
                      <p className="text-xs text-slate-500 mt-2 font-mono">{aud.segment_criteria}</p>
                    )}
                    {aud.estimated_size && (
                      <p className="text-xs text-slate-500 mt-1">Est. Size: {aud.estimated_size.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(aud)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(aud.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Orchestration Tab Component
function OrchestrationTab({ campaignId, steps, onRefresh }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    step_order: '',
    channel: '',
    timing_description: '',
    content_summary: '',
  });

  const handleSave = async () => {
    try {
      if (editing) {
        await updateSeasonalOrchestrationStep(editing.id, {
          step_order: parseInt(formData.step_order),
          channel: formData.channel,
          timing_description: formData.timing_description,
          content_summary: formData.content_summary || undefined,
        });
      } else {
        await createSeasonalOrchestrationStep({
          seasonal_campaign_id: campaignId,
          step_order: parseInt(formData.step_order),
          channel: formData.channel,
          timing_description: formData.timing_description,
          content_summary: formData.content_summary || undefined,
        });
      }
      setDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to save step:', error);
      alert('Failed to save step');
    }
  };

  const handleEdit = (step: any) => {
    setEditing(step);
    setFormData({
      step_order: step.step_order.toString(),
      channel: step.channel,
      timing_description: step.timing_description,
      content_summary: step.content_summary || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this step?')) return;
    try {
      await deleteSeasonalOrchestrationStep(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete step:', error);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ step_order: '', channel: '', timing_description: '', content_summary: '' });
  };

  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orchestration</CardTitle>
            <CardDescription>Sequential steps for campaign delivery</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit' : 'Add'} Orchestration Step</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Step Order *</Label>
                    <Input
                      type="number"
                      value={formData.step_order}
                      onChange={(e) => setFormData({ ...formData, step_order: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Channel *</Label>
                    <Select value={formData.channel} onValueChange={(v) => setFormData({ ...formData, channel: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="in-app">In-App</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="direct_mail">Direct Mail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timing *</Label>
                  <Input
                    value={formData.timing_description}
                    onChange={(e) => setFormData({ ...formData, timing_description: e.target.value })}
                    placeholder="e.g., 2 days before holiday"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content Summary</Label>
                  <Textarea
                    value={formData.content_summary}
                    onChange={(e) => setFormData({ ...formData, content_summary: e.target.value })}
                    placeholder="Brief description of message content"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedSteps.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No steps yet</p>
        ) : (
          <div className="space-y-3">
            {sortedSteps.map((step: any) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step {step.step_order}</Badge>
                      <Badge className="capitalize">{step.channel}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      <strong>Timing:</strong> {step.timing_description}
                    </p>
                    {step.content_summary && (
                      <p className="text-sm text-slate-600 mt-1">{step.content_summary}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(step)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(step.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// KPIs Tab Component
function KpisTab({ campaignId, kpis, onRefresh }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    kpi_name: '',
    kpi_type: '',
    target_value: '',
    actual_value: '',
  });

  const handleSave = async () => {
    try {
      if (editing) {
        await updateSeasonalKpi(editing.id, {
          kpi_name: formData.kpi_name,
          kpi_type: formData.kpi_type,
          target_value: formData.target_value || undefined,
          actual_value: formData.actual_value || undefined,
        });
      } else {
        await createSeasonalKpi({
          seasonal_campaign_id: campaignId,
          kpi_name: formData.kpi_name,
          kpi_type: formData.kpi_type,
          target_value: formData.target_value || undefined,
          actual_value: formData.actual_value || undefined,
        });
      }
      setDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to save KPI:', error);
      alert('Failed to save KPI');
    }
  };

  const handleEdit = (kpi: any) => {
    setEditing(kpi);
    setFormData({
      kpi_name: kpi.kpi_name,
      kpi_type: kpi.kpi_type,
      target_value: kpi.target_value || '',
      actual_value: kpi.actual_value || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this KPI?')) return;
    try {
      await deleteSeasonalKpi(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete KPI:', error);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ kpi_name: '', kpi_type: '', target_value: '', actual_value: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>KPIs</CardTitle>
            <CardDescription>Success metrics for this campaign</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add KPI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit' : 'Add'} KPI</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>KPI Name *</Label>
                  <Input
                    value={formData.kpi_name}
                    onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })}
                    placeholder="e.g., Email Open Rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={formData.kpi_type} onValueChange={(v) => setFormData({ ...formData, kpi_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="retention">Retention</SelectItem>
                      <SelectItem value="reach">Reach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <Input
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="e.g., 25%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Actual Value</Label>
                  <Input
                    value={formData.actual_value}
                    onChange={(e) => setFormData({ ...formData, actual_value: e.target.value })}
                    placeholder="e.g., 28%"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {kpis.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No KPIs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left">KPI</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Target</th>
                  <th className="px-4 py-3 text-left">Actual</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi: any) => (
                  <tr key={kpi.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{kpi.kpi_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">{kpi.kpi_type}</Badge>
                    </td>
                    <td className="px-4 py-3">{kpi.target_value || '—'}</td>
                    <td className="px-4 py-3">{kpi.actual_value || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(kpi)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(kpi.id)}>
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

// Assets Tab Component
function AssetsTab({ campaignId, assets, onRefresh }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    asset_type: '',
    title: '',
    content: '',
    url: '',
  });

  const handleSave = async () => {
    try {
      if (editing) {
        await updateSeasonalAsset(editing.id, {
          asset_type: formData.asset_type,
          title: formData.title,
          content: formData.content || undefined,
          url: formData.url || undefined,
        });
      } else {
        await createSeasonalAsset({
          seasonal_campaign_id: campaignId,
          asset_type: formData.asset_type,
          title: formData.title,
          content: formData.content || undefined,
          url: formData.url || undefined,
        });
      }
      setDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('Failed to save asset');
    }
  };

  const handleEdit = (asset: any) => {
    setEditing(asset);
    setFormData({
      asset_type: asset.asset_type,
      title: asset.title,
      content: asset.content || '',
      url: asset.url || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    try {
      await deleteSeasonalAsset(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ asset_type: '', title: '', content: '', url: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Copy & Creative</CardTitle>
            <CardDescription>Campaign assets and creative materials</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit' : 'Add'} Asset</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={formData.asset_type} onValueChange={(v) => setFormData({ ...formData, asset_type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copy">Copy</SelectItem>
                        <SelectItem value="creative_direction">Creative Direction</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Email Subject Line"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Asset content or description"
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No assets yet</p>
        ) : (
          <div className="space-y-4">
            {assets.map((asset: any) => (
              <div key={asset.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{asset.asset_type.replace('_', ' ')}</Badge>
                      <h3 className="font-semibold">{asset.title}</h3>
                    </div>
                    {asset.content && (
                      <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{asset.content}</p>
                    )}
                    {asset.url && (
                      <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
                        View Asset →
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(asset)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(asset.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Data Requirements Tab Component
function DataRequirementsTab({ campaignId, requirements, onRefresh }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    requirement_name: '',
    description: '',
    data_source: '',
    status: 'needed',
  });

  const handleSave = async () => {
    try {
      if (editing) {
        await updateSeasonalDataRequirement(editing.id, {
          requirement_name: formData.requirement_name,
          description: formData.description || undefined,
          data_source: formData.data_source || undefined,
          status: formData.status,
        });
      } else {
        await createSeasonalDataRequirement({
          seasonal_campaign_id: campaignId,
          requirement_name: formData.requirement_name,
          description: formData.description || undefined,
          data_source: formData.data_source || undefined,
          status: formData.status,
        });
      }
      setDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error) {
      console.error('Failed to save requirement:', error);
      alert('Failed to save requirement');
    }
  };

  const handleEdit = (req: any) => {
    setEditing(req);
    setFormData({
      requirement_name: req.requirement_name,
      description: req.description || '',
      data_source: req.data_source || '',
      status: req.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this requirement?')) return;
    try {
      await deleteSeasonalDataRequirement(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete requirement:', error);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ requirement_name: '', description: '', data_source: '', status: 'needed' });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      needed: "bg-red-100 text-red-800",
      in_progress: "bg-amber-100 text-amber-800",
      available: "bg-green-100 text-green-800",
    };
    return <Badge className={colors[status]}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Requirements</CardTitle>
            <CardDescription>Data dependencies for this campaign</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Requirement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit' : 'Add'} Data Requirement</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Requirement Name *</Label>
                  <Input
                    value={formData.requirement_name}
                    onChange={(e) => setFormData({ ...formData, requirement_name: e.target.value })}
                    placeholder="e.g., Purchase History"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Why this data is needed"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Source</Label>
                  <Input
                    value={formData.data_source}
                    onChange={(e) => setFormData({ ...formData, data_source: e.target.value })}
                    placeholder="e.g., Payments API"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="needed">Needed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {requirements.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No data requirements yet</p>
        ) : (
          <div className="space-y-3">
            {requirements.map((req: any) => (
              <div key={req.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{req.requirement_name}</h3>
                      {getStatusBadge(req.status)}
                    </div>
                    {req.description && (
                      <p className="text-sm text-slate-600 mt-1">{req.description}</p>
                    )}
                    {req.data_source && (
                      <p className="text-xs text-slate-500 mt-1">Source: {req.data_source}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(req)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(req.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
