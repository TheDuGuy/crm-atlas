"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, Edit, X, Beaker, Target, Users, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Experiment = any;

export function ExperimentDetail({ experiment }: { experiment: Experiment }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: experiment.title || "",
    design_type: experiment.design_type || "",
    eligibility: experiment.eligibility || "",
    treatment: experiment.treatment || "",
    control: experiment.control || "",
    exposure_definition: experiment.exposure_definition || "",
    primary_kpi: experiment.primary_kpi || "",
    secondary_kpis: experiment.secondary_kpis || "",
    guardrails: experiment.guardrails || "",
    duration: experiment.duration || "",
    success_criteria: experiment.success_criteria || "",
    notes: experiment.notes || "",
  });

  const designTypeColors: Record<string, string> = {
    ab_test: "bg-blue-100 text-blue-800",
    holdout: "bg-purple-100 text-purple-800",
    pre_post: "bg-green-100 text-green-800",
    staged_rollout: "bg-orange-100 text-orange-800",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-800",
    planned: "bg-blue-100 text-blue-800",
    running: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const DetailField = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-500" />}
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</Label>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
        {value || <span className="text-slate-400 italic">Not set</span>}
      </div>
    </div>
  );

  const EditableField = ({
    label,
    value,
    onChange,
    rows = 3
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <Link
              href="/experiments"
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              ← Back to Experiments
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{experiment.title}</h1>
          {experiment.opportunities && (
            <Link
              href={`/opportunities/${experiment.opportunities.id}`}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <Target className="h-3 w-3" />
              {experiment.opportunities.title}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[experiment.status] || "bg-slate-100 text-slate-800"}>
            {experiment.status}
          </Badge>
          <Badge className={designTypeColors[experiment.design_type] || "bg-slate-100 text-slate-800"}>
            {experiment.design_type?.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Audience & Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailField
                label="Eligibility"
                value={experiment.eligibility}
              />
              <DetailField
                label="Exposure Definition"
                value={experiment.exposure_definition}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Test Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailField
                label="Treatment"
                value={experiment.treatment}
              />
              <DetailField
                label="Control"
                value={experiment.control}
              />
              <DetailField
                label="Duration"
                value={experiment.duration}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Success Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailField
                label="Primary KPI"
                value={experiment.primary_kpi}
              />
              <DetailField
                label="Secondary KPIs"
                value={experiment.secondary_kpis}
              />
              <DetailField
                label="Guardrails"
                value={experiment.guardrails}
              />
              <DetailField
                label="Success Criteria"
                value={experiment.success_criteria}
              />
            </CardContent>
          </Card>

          {experiment.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DetailField
                  label="Notes"
                  value={experiment.notes}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
