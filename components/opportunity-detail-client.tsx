"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Lightbulb } from "lucide-react";
import Link from "next/link";
import { getExperimentsByOpportunity } from "@/app/actions/experiments";
import { useRouter } from "next/navigation";

type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  impact: number | null;
  effort: number | null;
  confidence: number | null;
  status: string;
  product_id: string | null;
  linked_flow_id: string | null;
  created_at: string;
  updated_at: string;
  products?: { name: string } | null;
  flows?: { name: string } | null;
};

export function OpportunityDetailClient({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter();
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loadingExperiments, setLoadingExperiments] = useState(true);

  useEffect(() => {
    getExperimentsByOpportunity(opportunity.id).then((data) => {
      setExperiments(data);
      setLoadingExperiments(false);
    });
  }, [opportunity.id]);

  const statusColors: Record<string, string> = {
    idea: "bg-slate-100 text-slate-800",
    planned: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const experimentStatusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-800",
    ready: "bg-blue-100 text-blue-800",
    running: "bg-green-100 text-green-800",
    readout: "bg-amber-100 text-amber-800",
    shipped: "bg-purple-100 text-purple-800",
    killed: "bg-red-100 text-red-800",
  };

  const handleCreateExperiment = () => {
    router.push(
      `/experiments/new?opportunityId=${opportunity.id}&title=${encodeURIComponent(
        opportunity.title
      )}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/opportunities"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Opportunities
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-slate-100">{opportunity.title}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-amber-500" />
              {opportunity.title}
            </h1>
            {(opportunity.products as any)?.name && (
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {(opportunity.products as any).name}
              </p>
            )}
          </div>
          <Badge className={statusColors[opportunity.status]}>
            {opportunity.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* ICE Score Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {opportunity.impact ? `${opportunity.impact}/10` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Effort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {opportunity.effort ? `${opportunity.effort}/10` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {opportunity.confidence ? `${opportunity.confidence}/10` : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="experiments">
            Experiments ({experiments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {opportunity.description && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Description</label>
                  <p className="mt-1 text-sm">{opportunity.description}</p>
                </div>
              )}
              {opportunity.flows && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Linked Flow</label>
                  <p className="mt-1 text-sm">
                    <Link
                      href={`/flows/${opportunity.linked_flow_id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {(opportunity.flows as any).name}
                    </Link>
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Created At</label>
                  <p className="mt-1 text-sm">
                    {new Date(opportunity.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Last Updated</label>
                  <p className="mt-1 text-sm">
                    {new Date(opportunity.updated_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Experiments ({experiments.length})</CardTitle>
                  <CardDescription>
                    Measurement plans and tests for this opportunity
                  </CardDescription>
                </div>
                <Button onClick={handleCreateExperiment}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Experiment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingExperiments ? (
                <div className="text-center py-8 text-slate-500">Loading experiments...</div>
              ) : experiments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">
                    No experiments yet for this opportunity
                  </p>
                  <Button onClick={handleCreateExperiment} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Experiment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {experiments.map((exp: any) => (
                    <Link
                      key={exp.id}
                      href={`/experiments/${exp.id}`}
                      className="block border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{exp.title}</div>
                          {exp.hypothesis && (
                            <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {exp.hypothesis}
                            </div>
                          )}
                          {exp.flows && (
                            <div className="text-xs text-slate-500 mt-2">
                              Flow: {(exp.flows as any).name}
                            </div>
                          )}
                          {exp.start_date && exp.end_date && (
                            <div className="text-xs text-slate-500 mt-1">
                              {new Date(exp.start_date).toLocaleDateString()} -{" "}
                              {new Date(exp.end_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={experimentStatusColors[exp.status]}>
                            {exp.status}
                          </Badge>
                          {exp.design_type && (
                            <Badge variant="outline" className="text-xs">
                              {exp.design_type.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
