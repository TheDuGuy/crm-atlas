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
import { Search, Filter, X } from "lucide-react";
import Link from "next/link";
import { getExperiments } from "@/app/actions/experiments";

type Experiment = Awaited<ReturnType<typeof getExperiments>>[0];

export function ExperimentsList() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [designFilter, setDesignFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExperiments().then((data) => {
      setExperiments(data);
      setLoading(false);
    });
  }, []);

  const filteredExperiments = experiments.filter((exp: any) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      exp.title.toLowerCase().includes(searchLower) ||
      (exp.opportunities as any)?.title?.toLowerCase().includes(searchLower) ||
      (exp.opportunities?.products as any)?.name?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === "all" || exp.status === statusFilter;
    const matchesDesign = designFilter === "all" || exp.design_type === designFilter;
    const matchesProduct =
      productFilter === "all" ||
      (exp.opportunities?.products as any)?.name === productFilter;

    return matchesSearch && matchesStatus && matchesDesign && matchesProduct;
  });

  const hasActiveFilters = statusFilter !== "all" || designFilter !== "all" || productFilter !== "all";

  const clearFilters = () => {
    setStatusFilter("all");
    setDesignFilter("all");
    setProductFilter("all");
  };

  // Get unique products for filter
  const products = Array.from(
    new Set(
      experiments
        .map((exp: any) => (exp.opportunities?.products as any)?.name)
        .filter(Boolean)
    )
  );

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-800",
    ready: "bg-blue-100 text-blue-800",
    running: "bg-green-100 text-green-800",
    readout: "bg-amber-100 text-amber-800",
    shipped: "bg-purple-100 text-purple-800",
    killed: "bg-red-100 text-red-800",
  };

  const designColors: Record<string, string> = {
    ab_test: "bg-indigo-100 text-indigo-800",
    holdout: "bg-pink-100 text-pink-800",
    pre_post: "bg-cyan-100 text-cyan-800",
    geo_split: "bg-orange-100 text-orange-800",
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
          <span>All Experiments ({filteredExperiments.length})</span>
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
              placeholder="Search experiments by title or opportunity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="readout">Readout</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="killed">Killed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={designFilter} onValueChange={setDesignFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Design Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designs</SelectItem>
                <SelectItem value="ab_test">A/B Test</SelectItem>
                <SelectItem value="holdout">Holdout</SelectItem>
                <SelectItem value="pre_post">Pre/Post</SelectItem>
                <SelectItem value="geo_split">Geo Split</SelectItem>
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
                <TableHead className="font-semibold">Experiment</TableHead>
                <TableHead className="font-semibold">Opportunity</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Design</TableHead>
                <TableHead className="font-semibold">Dates</TableHead>
                <TableHead className="font-semibold">Primary KPI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExperiments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No experiments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredExperiments.map((exp: any) => (
                  <TableRow key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <TableCell className="font-medium">
                      <Link
                        href={`/experiments/${exp.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {exp.title}
                      </Link>
                      {exp.flows?.name && (
                        <div className="text-xs text-slate-500 mt-1">
                          Flow: {exp.flows.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link
                        href={`/opportunities/${exp.opportunity_id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {exp.opportunities?.title || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {(exp.opportunities?.products as any)?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[exp.status]}>
                        {exp.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {exp.design_type ? (
                        <Badge variant="outline" className={designColors[exp.design_type]}>
                          {exp.design_type.replace("_", " ")}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {exp.start_date && exp.end_date ? (
                        <div className="space-y-1">
                          <div>
                            {new Date(exp.start_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-slate-500">
                            to{" "}
                            {new Date(exp.end_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{exp.primary_kpi || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
