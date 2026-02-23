"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Search } from "lucide-react";
import Link from "next/link";
import { getSeasonalCampaigns, type SeasonalCampaign } from "@/app/actions/seasonal-bank";
import { useRouter } from "next/navigation";

export default function SeasonalBankPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<SeasonalCampaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<SeasonalCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [campaigns, searchQuery, productFilter, seasonFilter, objectiveFilter, statusFilter, priorityFilter, marketFilter]);

  const loadCampaigns = async () => {
    try {
      const data = await getSeasonalCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...campaigns];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.season.toLowerCase().includes(query) ||
        c.summary?.toLowerCase().includes(query)
      );
    }

    if (productFilter !== "all") {
      filtered = filtered.filter(c => c.product === productFilter);
    }

    if (seasonFilter !== "all") {
      filtered = filtered.filter(c => c.season === seasonFilter);
    }

    if (objectiveFilter !== "all") {
      filtered = filtered.filter(c => c.objective === objectiveFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }

    if (marketFilter !== "all") {
      filtered = filtered.filter(c => c.market.includes(marketFilter));
    }

    setFilteredCampaigns(filtered);
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

  const uniqueProducts = Array.from(new Set(campaigns.map(c => c.product))).sort();
  const uniqueSeasons = Array.from(new Set(campaigns.map(c => c.season))).sort();
  const uniqueMarkets = Array.from(new Set(campaigns.flatMap(c => c.market))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Seasonal Bank
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Pre-planned seasonal campaigns with audiences, orchestration, and assets
          </p>
        </div>
        <Button onClick={() => router.push('/seasonal-bank/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
            <div className="relative md:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {uniqueProducts.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {uniqueSeasons.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Objective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Objectives</SelectItem>
                <SelectItem value="activation">Activation</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="winback">Winback</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="awareness">Awareness</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_flight">In Flight</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {uniqueMarkets.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-500">No campaigns found.</p>
              <p className="mt-1 text-sm text-slate-400">
                Try adjusting your filters or create a new campaign.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left">Campaign</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Season</th>
                    <th className="px-4 py-3 text-left">Objective</th>
                    <th className="px-4 py-3 text-center">Priority</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left">Markets</th>
                    <th className="px-4 py-3 text-left">Timing</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3">
                        <Link
                          href={`/seasonal-bank/${campaign.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{campaign.product}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {campaign.season} {campaign.year}
                      </td>
                      <td className="px-4 py-3 capitalize">{campaign.objective}</td>
                      <td className="px-4 py-3 text-center">{getPriorityBadge(campaign.priority)}</td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(campaign.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {campaign.market.slice(0, 2).map((m) => (
                            <Badge key={m} variant="outline" className="text-xs">
                              {m}
                            </Badge>
                          ))}
                          {campaign.market.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{campaign.market.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'TBD'}
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
