"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, X, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getIdeas } from "@/app/actions/idea-bank";

type Idea = Awaited<ReturnType<typeof getIdeas>>[0];

export function IdeaBankList() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [goalFilter, setGoalFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIdeas().then((data) => {
      setIdeas(data);
      setLoading(false);
    });
  }, []);

  const filteredIdeas = ideas.filter((idea: any) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      idea.title.toLowerCase().includes(searchLower) ||
      idea.audience_logic?.toLowerCase().includes(searchLower) ||
      (idea.products as any)?.name?.toLowerCase().includes(searchLower);

    const matchesType = typeFilter === "all" || idea.type === typeFilter;
    const matchesGoal = goalFilter === "all" || idea.goal === goalFilter;
    const matchesStatus = statusFilter === "all" || idea.status === statusFilter;
    const matchesProduct =
      productFilter === "all" || (idea.products as any)?.name === productFilter;
    const matchesChannel =
      channelFilter === "all" || idea.channels?.includes(channelFilter as any);

    return (
      matchesSearch &&
      matchesType &&
      matchesGoal &&
      matchesStatus &&
      matchesProduct &&
      matchesChannel
    );
  });

  const hasActiveFilters =
    typeFilter !== "all" ||
    goalFilter !== "all" ||
    statusFilter !== "all" ||
    productFilter !== "all" ||
    channelFilter !== "all";

  const clearFilters = () => {
    setTypeFilter("all");
    setGoalFilter("all");
    setStatusFilter("all");
    setProductFilter("all");
    setChannelFilter("all");
  };

  // Get unique products for filter
  const products = Array.from(
    new Set(ideas.map((idea: any) => (idea.products as any)?.name).filter(Boolean))
  );

  const typeColors: Record<string, string> = {
    one_off: "bg-blue-100 text-blue-800",
    burst: "bg-orange-100 text-orange-800",
    reactive: "bg-red-100 text-red-800",
    seasonal: "bg-green-100 text-green-800",
    recovery: "bg-amber-100 text-amber-800",
  };

  const goalColors: Record<string, string> = {
    activation: "bg-blue-100 text-blue-800",
    retention: "bg-green-100 text-green-800",
    cross_sell: "bg-purple-100 text-purple-800",
    winback: "bg-amber-100 text-amber-800",
    education: "bg-cyan-100 text-cyan-800",
  };

  const channelColors: Record<string, string> = {
    email: "bg-slate-100 text-slate-800",
    push: "bg-orange-100 text-orange-800",
    in_app: "bg-teal-100 text-teal-800",
  };

  const getRatio = (idea: any) => {
    if (idea.expected_impact && idea.effort) {
      return (idea.expected_impact / idea.effort).toFixed(1);
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-500">Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Idea Bank ({filteredIdeas.length})</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardTitle>
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search ideas by title or audience..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one_off">One-off</SelectItem>
                <SelectItem value="burst">Burst</SelectItem>
                <SelectItem value="reactive">Reactive</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="recovery">Recovery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={goalFilter} onValueChange={setGoalFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                <SelectItem value="activation">Activation</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="cross_sell">Cross-sell</SelectItem>
                <SelectItem value="winback">Winback</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>

            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
              </SelectContent>
            </Select>

            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead className="font-semibold">Idea</TableHead>
                <TableHead className="font-semibold">Type / Goal</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Channels</TableHead>
                <TableHead className="font-semibold text-center">Impact</TableHead>
                <TableHead className="font-semibold text-center">Effort</TableHead>
                <TableHead className="font-semibold text-center">Ratio</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIdeas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No ideas found
                  </TableCell>
                </TableRow>
              ) : (
                filteredIdeas.map((idea: any) => {
                  const ratio = getRatio(idea);
                  return (
                    <TableRow key={idea.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <TableCell className="font-medium max-w-xs">
                        <Link
                          href={`/idea-bank/${idea.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {idea.title}
                        </Link>
                        {idea.audience_logic && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {idea.audience_logic}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={typeColors[idea.type]}>
                            {idea.type.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className={goalColors[idea.goal]}>
                            {idea.goal.replace("_", " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {(idea.products as any)?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {idea.channels?.map((channel: any) => (
                            <Badge
                              key={channel}
                              variant="outline"
                              className={`text-xs ${channelColors[channel]}`}
                            >
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {idea.expected_impact ? (
                          <Badge variant="outline" className="font-mono">
                            {idea.expected_impact}/5
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {idea.effort ? (
                          <Badge variant="outline" className="font-mono">
                            {idea.effort}/5
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {ratio ? (
                          <Badge
                            className={
                              parseFloat(ratio) >= 1.5
                                ? "bg-green-100 text-green-800"
                                : parseFloat(ratio) >= 1
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-800"
                            }
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {ratio}x
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            idea.status === "ready"
                              ? "bg-green-100 text-green-800"
                              : idea.status === "needs_review"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-800"
                          }
                        >
                          {idea.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
