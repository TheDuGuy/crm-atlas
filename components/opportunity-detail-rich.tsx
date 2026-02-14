"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Lightbulb, Save, Edit, Beaker } from "lucide-react";
import Link from "next/link";
import { getExperimentsByOpportunity } from "@/app/actions/experiments";
import { updateOpportunity } from "@/app/actions/opportunities";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Opportunity = any;

export function OpportunityDetailRich({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter();
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loadingExperiments, setLoadingExperiments] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    problem: opportunity.problem || "",
    insight: opportunity.insight || "",
    hypothesis: opportunity.hypothesis || "",
    proposed_solution: opportunity.proposed_solution || "",
    primary_kpi: opportunity.primary_kpi || "",
    secondary_kpis: opportunity.secondary_kpis || "",
    guardrails: opportunity.guardrails || "",
    audience_logic: opportunity.audience_logic || "",
    execution_notes: opportunity.execution_notes || "",
    data_requirements: opportunity.data_requirements || "",
    test_design: opportunity.test_design || "",
    success_criteria: opportunity.success_criteria || "",
    risks_mitigations: opportunity.risks_mitigations || "",
  });

  useEffect(() => {
    getExperimentsByOpportunity(opportunity.id).then((data) => {
      setExperiments(data);
      setLoadingExperiments(false);
    });
  }, [opportunity.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOpportunity(opportunity.id, formData);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating opportunity:", error);
      alert("Failed to update opportunity");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      problem: opportunity.problem || "",
      insight: opportunity.insight || "",
      hypothesis: opportunity.hypothesis || "",
      proposed_solution: opportunity.proposed_solution || "",
      primary_kpi: opportunity.primary_kpi || "",
      secondary_kpis: opportunity.secondary_kpis || "",
      guardrails: opportunity.guardrails || "",
      audience_logic: opportunity.audience_logic || "",
      execution_notes: opportunity.execution_notes || "",
      data_requirements: opportunity.data_requirements || "",
      test_design: opportunity.test_design || "",
      success_criteria: opportunity.success_criteria || "",
      risks_mitigations: opportunity.risks_mitigations || "",
    });
    setIsEditing(false);
  };

  const handleCreateExperiment = () => {
    router.push(
      `/experiments/new?opportunityId=${opportunity.id}&title=${encodeURIComponent(
        opportunity.title
      )}`
    );
  };

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

  const designColors: Record<string, string> = {
    ab_test: "bg-indigo-100 text-indigo-800",
    holdout: "bg-pink-100 text-pink-800",
    pre_post: "bg-cyan-100 text-cyan-800",
    geo_split: "bg-orange-100 text-orange-800",
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
          <div className="flex items-center gap-2">
            <Badge className={statusColors[opportunity.status]}>
              {opportunity.status.replace("_", " ")}
            </Badge>
          </div>
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

      {/* CTA: Create Experiment */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ready to test this opportunity?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Create an experiment with pre-filled details from this opportunity
              </p>
            </div>
            <Button onClick={handleCreateExperiment} className="bg-blue-600 hover:bg-blue-700">
              <Beaker className="mr-2 h-4 w-4" />
              Create Experiment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rich Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Opportunity Details</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem */}
          <div>
            <Label htmlFor="problem" className="text-base font-semibold">
              Problem
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              What problem does this opportunity solve?
            </p>
            {isEditing ? (
              <Textarea
                id="problem"
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                rows={3}
                placeholder="Describe the problem..."
              />
            ) : formData.problem ? (
              <p className="text-sm whitespace-pre-wrap">{formData.problem}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Insight */}
          <div>
            <Label htmlFor="insight" className="text-base font-semibold">
              Insight
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              What data or insight led to this opportunity?
            </p>
            {isEditing ? (
              <Textarea
                id="insight"
                value={formData.insight}
                onChange={(e) => setFormData({ ...formData, insight: e.target.value })}
                rows={3}
                placeholder="Describe the key insight..."
              />
            ) : formData.insight ? (
              <p className="text-sm whitespace-pre-wrap">{formData.insight}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Hypothesis */}
          <div>
            <Label htmlFor="hypothesis" className="text-base font-semibold">
              Hypothesis
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              What's the testable hypothesis?
            </p>
            {isEditing ? (
              <Textarea
                id="hypothesis"
                value={formData.hypothesis}
                onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                rows={3}
                placeholder="If we [action], then [outcome] because [reasoning]..."
              />
            ) : formData.hypothesis ? (
              <p className="text-sm whitespace-pre-wrap">{formData.hypothesis}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Proposed Solution */}
          <div>
            <Label htmlFor="proposed_solution" className="text-base font-semibold">
              Proposed Solution
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Detailed description of the proposed solution
            </p>
            {isEditing ? (
              <Textarea
                id="proposed_solution"
                value={formData.proposed_solution}
                onChange={(e) =>
                  setFormData({ ...formData, proposed_solution: e.target.value })
                }
                rows={4}
                placeholder="Describe the solution in detail..."
              />
            ) : formData.proposed_solution ? (
              <p className="text-sm whitespace-pre-wrap">{formData.proposed_solution}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Audience Logic */}
          <div>
            <Label htmlFor="audience_logic" className="text-base font-semibold">
              Audience & Targeting
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Who is the target audience and how do we identify them?
            </p>
            {isEditing ? (
              <Textarea
                id="audience_logic"
                value={formData.audience_logic}
                onChange={(e) => setFormData({ ...formData, audience_logic: e.target.value })}
                rows={3}
                placeholder="Define the target audience..."
              />
            ) : formData.audience_logic ? (
              <p className="text-sm whitespace-pre-wrap">{formData.audience_logic}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Measurement */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="primary_kpi" className="text-base font-semibold">
                Primary KPI
              </Label>
              <p className="text-xs text-slate-500 mb-2">Main success metric</p>
              {isEditing ? (
                <Textarea
                  id="primary_kpi"
                  value={formData.primary_kpi}
                  onChange={(e) => setFormData({ ...formData, primary_kpi: e.target.value })}
                  rows={2}
                  placeholder="e.g., Activation rate increase of 15%"
                />
              ) : formData.primary_kpi ? (
                <p className="text-sm whitespace-pre-wrap">{formData.primary_kpi}</p>
              ) : (
                <p className="text-sm text-slate-400">Not set</p>
              )}
            </div>

            <div>
              <Label htmlFor="secondary_kpis" className="text-base font-semibold">
                Secondary KPIs
              </Label>
              <p className="text-xs text-slate-500 mb-2">Additional metrics to track</p>
              {isEditing ? (
                <Textarea
                  id="secondary_kpis"
                  value={formData.secondary_kpis}
                  onChange={(e) => setFormData({ ...formData, secondary_kpis: e.target.value })}
                  rows={2}
                  placeholder="List secondary metrics..."
                />
              ) : formData.secondary_kpis ? (
                <p className="text-sm whitespace-pre-wrap">{formData.secondary_kpis}</p>
              ) : (
                <p className="text-sm text-slate-400">Not set</p>
              )}
            </div>
          </div>

          {/* Guardrails */}
          <div>
            <Label htmlFor="guardrails" className="text-base font-semibold">
              Guardrails
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Metrics to monitor to ensure no harm
            </p>
            {isEditing ? (
              <Textarea
                id="guardrails"
                value={formData.guardrails}
                onChange={(e) => setFormData({ ...formData, guardrails: e.target.value })}
                rows={2}
                placeholder="e.g., Churn rate, support tickets, NPS..."
              />
            ) : formData.guardrails ? (
              <p className="text-sm whitespace-pre-wrap">{formData.guardrails}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Test Design */}
          <div>
            <Label htmlFor="test_design" className="text-base font-semibold">
              Test Design
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Recommended experimental methodology
            </p>
            {isEditing ? (
              <Select
                value={formData.test_design}
                onValueChange={(value) => setFormData({ ...formData, test_design: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select test design" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="ab_test">A/B Test</SelectItem>
                  <SelectItem value="holdout">Holdout</SelectItem>
                  <SelectItem value="pre_post">Pre/Post</SelectItem>
                  <SelectItem value="geo_split">Geo Split</SelectItem>
                </SelectContent>
              </Select>
            ) : formData.test_design ? (
              <Badge variant="outline" className={designColors[formData.test_design]}>
                {formData.test_design.replace("_", " ")}
              </Badge>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Success Criteria */}
          <div>
            <Label htmlFor="success_criteria" className="text-base font-semibold">
              Success Criteria
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              What defines success for this opportunity?
            </p>
            {isEditing ? (
              <Textarea
                id="success_criteria"
                value={formData.success_criteria}
                onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                rows={2}
                placeholder="Define success criteria..."
              />
            ) : formData.success_criteria ? (
              <p className="text-sm whitespace-pre-wrap">{formData.success_criteria}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Data Requirements */}
          <div>
            <Label htmlFor="data_requirements" className="text-base font-semibold">
              Data Requirements
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Required fields, events, or data points
            </p>
            {isEditing ? (
              <Textarea
                id="data_requirements"
                value={formData.data_requirements}
                onChange={(e) =>
                  setFormData({ ...formData, data_requirements: e.target.value })
                }
                rows={2}
                placeholder="List required data elements..."
              />
            ) : formData.data_requirements ? (
              <p className="text-sm whitespace-pre-wrap">{formData.data_requirements}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Execution Notes */}
          <div>
            <Label htmlFor="execution_notes" className="text-base font-semibold">
              Execution Notes
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Implementation details and considerations
            </p>
            {isEditing ? (
              <Textarea
                id="execution_notes"
                value={formData.execution_notes}
                onChange={(e) => setFormData({ ...formData, execution_notes: e.target.value })}
                rows={3}
                placeholder="Add execution notes..."
              />
            ) : formData.execution_notes ? (
              <p className="text-sm whitespace-pre-wrap">{formData.execution_notes}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>

          {/* Risks & Mitigations */}
          <div>
            <Label htmlFor="risks_mitigations" className="text-base font-semibold">
              Risks & Mitigations
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Potential risks and how to mitigate them
            </p>
            {isEditing ? (
              <Textarea
                id="risks_mitigations"
                value={formData.risks_mitigations}
                onChange={(e) =>
                  setFormData({ ...formData, risks_mitigations: e.target.value })
                }
                rows={3}
                placeholder="List risks and mitigations..."
              />
            ) : formData.risks_mitigations ? (
              <p className="text-sm whitespace-pre-wrap">{formData.risks_mitigations}</p>
            ) : (
              <p className="text-sm text-slate-400">Not set</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experiments Tab */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Experiments ({experiments.length})</CardTitle>
              <CardDescription>Measurement plans and tests for this opportunity</CardDescription>
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
              <p className="text-slate-500 mb-4">No experiments yet for this opportunity</p>
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
                      <Badge className={experimentStatusColors[exp.status]}>{exp.status}</Badge>
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
    </div>
  );
}
