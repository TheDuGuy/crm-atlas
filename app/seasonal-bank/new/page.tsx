"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSeasonalCampaign } from "@/app/actions/seasonal-bank";

export default function NewSeasonalCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    product: '',
    season: '',
    year: new Date().getFullYear().toString(),
    objective: '',
    status: 'draft',
    priority: 'medium',
    market: [] as string[],
    start_date: '',
    end_date: '',
    summary: '',
    creative_direction: '',
  });

  const handleMarketToggle = (market: string) => {
    setFormData(prev => ({
      ...prev,
      market: prev.market.includes(market)
        ? prev.market.filter(m => m !== market)
        : [...prev.market, market]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const campaign = await createSeasonalCampaign({
        name: formData.name,
        product: formData.product,
        season: formData.season,
        year: parseInt(formData.year),
        objective: formData.objective,
        status: formData.status,
        priority: formData.priority,
        market: formData.market.length > 0 ? formData.market : ['US'],
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        summary: formData.summary || null,
        creative_direction: formData.creative_direction || null,
      });

      router.push(`/seasonal-bank/${campaign.id}`);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please check all required fields.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/seasonal-bank">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create Seasonal Campaign</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Set up a new seasonal campaign with audiences, orchestration, and assets
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Basic information about this seasonal campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Valentine's Day TTP - Get Paid Anywhere"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={formData.product}
                  onValueChange={(v) => setFormData({ ...formData, product: v })}
                  required
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Card Reader">Card Reader</SelectItem>
                    <SelectItem value="Payment Links">Payment Links</SelectItem>
                    <SelectItem value="Tap to Pay">Tap to Pay</SelectItem>
                    <SelectItem value="Terminal">Terminal</SelectItem>
                    <SelectItem value="PBB">PBB</SelectItem>
                    <SelectItem value="Sell in Person">Sell in Person</SelectItem>
                    <SelectItem value="Cross-Product">Cross-Product</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">Season *</Label>
                <Input
                  id="season"
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  placeholder="e.g., Valentine's Day, Spring, Holiday"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective *</Label>
                <Select
                  value={formData.objective}
                  onValueChange={(v) => setFormData({ ...formData, objective: v })}
                  required
                >
                  <SelectTrigger id="objective">
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activation">Activation</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="retention">Retention</SelectItem>
                    <SelectItem value="winback">Winback</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Markets *</Label>
              <div className="flex flex-wrap gap-2">
                {['US', 'UK', 'CA', 'AU', 'EU', 'Global'].map((market) => (
                  <Button
                    key={market}
                    type="button"
                    variant={formData.market.includes(market) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMarketToggle(market)}
                  >
                    {market}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Campaign Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief description of campaign goals and approach"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creative_direction">Creative Direction</Label>
              <Textarea
                id="creative_direction"
                value={formData.creative_direction}
                onChange={(e) => setFormData({ ...formData, creative_direction: e.target.value })}
                placeholder="Visual and messaging direction for this campaign"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create Campaign'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
