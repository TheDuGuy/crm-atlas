"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Save, Edit, Lightbulb, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { updateIdea, convertIdeaToOpportunity } from "@/app/actions/idea-bank";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Idea = any;

export function IdeaDetailRich({ idea }: { idea: Idea }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [formData, setFormData] = useState({
    reasoning: idea.reasoning || "",
    hypothesis: idea.hypothesis || "",
    what_to_send: idea.what_to_send || "",
    why_now_trigger: idea.why_now_trigger || "",
    measurement_plan: idea.measurement_plan || "",
    guardrails: idea.guardrails || "",
    variants: idea.variants || "",
    prerequisites: idea.prerequisites || "",
    follow_ups: idea.follow_ups || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateIdea(idea.id, formData);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating idea:", error);
      alert("Failed to update idea");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      reasoning: idea.reasoning || "",
      hypothesis: idea.hypothesis || "",
      what_to_send: idea.what_to_send || "",
      why_now_trigger: idea.why_now_trigger || "",
      measurement_plan: idea.measurement_plan || "",
      guardrails: idea.guardrails || "",
      variants: idea.variants || "",
      prerequisites: idea.prerequisites || "",
      follow_ups: idea.follow_ups || "",
    });
    setIsEditing(false);
  };

  const handleConvertToOpportunity = async () => {
    const confirmed = confirm(
      `Convert "${idea.title}" to an Opportunity?\n\nThis will create a new opportunity pre-filled with this idea's details.`
    );
    if (!confirmed) return;

    setIsConverting(true);
    try {
      const opportunity = await convertIdeaToOpportunity(idea.id);
      router.push(`/opportunities/${opportunity.id}`);
    } catch (error) {
      console.error("Error converting idea:", error);
      alert("Failed to convert idea to opportunity");
    } finally {
      setIsConverting(false);
    }
  };

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

  const getRatio = () => {
    if (idea.expected_impact && idea.effort) {
      return (idea.expected_impact / idea.effort).toFixed(1);
    }
    return null;
  };

  const ratio = getRatio();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/idea-bank" className="text-blue-600 hover:text-blue-800 hover:underline">
            Idea Bank
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-slate-100">{idea.title}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-amber-500" />
              {idea.title}
            </h1>
            {(idea.products as any)?.name && (
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {(idea.products as any).name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={typeColors[idea.type]}>{idea.type.replace("_", " ")}</Badge>
            <Badge variant="outline" className={goalColors[idea.goal]}>
              {idea.goal.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {idea.expected_impact ? `${idea.expected_impact}/5` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Effort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{idea.effort ? `${idea.effort}/5` : "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {idea.confidence ? `${idea.confidence}/5` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Impact/Effort</CardTitle>
          </CardHeader>
          <CardContent>
            {ratio ? (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div className="text-3xl font-bold">{ratio}x</div>
              </div>
            ) : (
              <div className="text-3xl font-bold text-slate-400">—</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Convert to Opportunity CTA */}
      {idea.converted_opportunity_id ? (
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Converted to Opportunity</h3>
                  <p className="text-sm text-green-700 mt-1">
                    This idea has been converted to an opportunity
                  </p>
                </div>
              </div>
              <Link href={`/opportunities/${idea.converted_opportunity_id}`}>
                <Button variant="outline" className="border-green-300">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Opportunity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Ready to turn this into a project?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Convert this idea to an opportunity to track it formally with experiments
                </p>
              </div>
              <Button
                onClick={handleConvertToOpportunity}
                disabled={isConverting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {isConverting ? "Converting..." : "Convert to Opportunity"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-600">Audience</Label>
            <p className="text-sm mt-1">{idea.audience_logic || "Not specified"}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-600">Channels</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {idea.channels?.map((channel: any) => (
                  <Badge key={channel} variant="outline" className={channelColors[channel]}>
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-600">Message Angle</Label>
              <p className="text-sm mt-1 capitalize">
                {idea.message_angle?.replace("_", " ") || "Not specified"}
              </p>
            </div>
          </div>
          {idea.copy_notes && (
            <div>
              <Label className="text-sm font-medium text-slate-600">Copy Notes</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap">{idea.copy_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rich Details Accordion */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detailed Campaign Plan</CardTitle>
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
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {/* Reasoning */}
            <AccordionItem value="reasoning">
              <AccordionTrigger className="text-base font-semibold">
                💡 Reasoning & Data
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">
                  Why this idea makes sense - data/insight behind it
                </p>
                {isEditing ? (
                  <Textarea
                    value={formData.reasoning}
                    onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
                    rows={4}
                    placeholder="Describe the data or insight that supports this idea..."
                  />
                ) : formData.reasoning ? (
                  <p className="text-sm whitespace-pre-wrap">{formData.reasoning}</p>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Hypothesis */}
            <AccordionItem value="hypothesis">
              <AccordionTrigger className="text-base font-semibold">
                🔬 Hypothesis
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">Testable hypothesis for this campaign</p>
                {isEditing ? (
                  <Textarea
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
              </AccordionContent>
            </AccordionItem>

            {/* What to Send */}
            <AccordionItem value="what_to_send">
              <AccordionTrigger className="text-base font-semibold">
                📧 What to Send
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">
                  Message structure and content bullets (not full copy)
                </p>
                {isEditing ? (
                  <Textarea
                    value={formData.what_to_send}
                    onChange={(e) => setFormData({ ...formData, what_to_send: e.target.value })}
                    rows={6}
                    placeholder="• Subject line&#10;• Hero message&#10;• Key points (bullets)&#10;• CTA&#10;• Social proof"
                    className="font-mono text-sm"
                  />
                ) : formData.what_to_send ? (
                  <div className="text-sm whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 rounded-md p-3 border font-mono">
                    {formData.what_to_send}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* When/Why to Deploy */}
            <AccordionItem value="why_now_trigger">
              <AccordionTrigger className="text-base font-semibold">
                ⏰ When & Why to Deploy
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">Timing and trigger conditions</p>
                {isEditing ? (
                  <Textarea
                    value={formData.why_now_trigger}
                    onChange={(e) =>
                      setFormData({ ...formData, why_now_trigger: e.target.value })
                    }
                    rows={3}
                    placeholder="When should this campaign be deployed and why?"
                  />
                ) : formData.why_now_trigger ? (
                  <p className="text-sm whitespace-pre-wrap">{formData.why_now_trigger}</p>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Measurement Plan */}
            <AccordionItem value="measurement_plan">
              <AccordionTrigger className="text-base font-semibold">
                📊 Measurement Plan
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">KPIs and comparison methodology</p>
                {isEditing ? (
                  <Textarea
                    value={formData.measurement_plan}
                    onChange={(e) =>
                      setFormData({ ...formData, measurement_plan: e.target.value })
                    }
                    rows={4}
                    placeholder="Primary KPI, secondary KPIs, how to measure success..."
                  />
                ) : formData.measurement_plan ? (
                  <p className="text-sm whitespace-pre-wrap">{formData.measurement_plan}</p>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Guardrails */}
            <AccordionItem value="guardrails">
              <AccordionTrigger className="text-base font-semibold">
                🛡️ Guardrails
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">
                  Metrics to monitor for potential harm
                </p>
                {isEditing ? (
                  <Textarea
                    value={formData.guardrails}
                    onChange={(e) => setFormData({ ...formData, guardrails: e.target.value })}
                    rows={2}
                    placeholder="Churn rate, support tickets, NPS, unsubscribes..."
                  />
                ) : formData.guardrails ? (
                  <p className="text-sm whitespace-pre-wrap">{formData.guardrails}</p>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Variants */}
            <AccordionItem value="variants">
              <AccordionTrigger className="text-base font-semibold">
                🔀 Variants (Optional)
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">A/B test angles or variations</p>
                {isEditing ? (
                  <Textarea
                    value={formData.variants}
                    onChange={(e) => setFormData({ ...formData, variants: e.target.value })}
                    rows={3}
                    placeholder="Variant A: [angle]&#10;Variant B: [angle]&#10;Variant C: [angle]"
                  />
                ) : formData.variants ? (
                  <p className="text-sm whitespace-pre-wrap">{formData.variants}</p>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Prerequisites */}
            <AccordionItem value="prerequisites">
              <AccordionTrigger className="text-base font-semibold">
                ✅ Prerequisites
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">
                  Required fields, events, or data points
                </p>
                {isEditing ? (
                  <Textarea
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                    rows={3}
                    placeholder="Fields: [list]&#10;Events: [list]&#10;Integrations: [list]"
                  />
                ) : formData.prerequisites ? (
                  <p className="text-sm whitespace-pre-wrap">{formData.prerequisites}</p>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Follow-ups */}
            <AccordionItem value="follow_ups">
              <AccordionTrigger className="text-base font-semibold">
                🔄 Follow-up Actions
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs text-slate-500 mb-2">
                  Next steps if user converts or doesn't convert
                </p>
                {isEditing ? (
                  <Textarea
                    value={formData.follow_ups}
                    onChange={(e) => setFormData({ ...formData, follow_ups: e.target.value })}
                    rows={4}
                    placeholder="If converts: [actions]&#10;If doesn't convert: [actions]"
                  />
                ) : formData.follow_ups ? (
                  <p className="text-sm whitespace-pre-wrap">{formData.follow_ups}</p>
                ) : (
                  <p className="text-sm text-slate-400">Not set</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Status:</span>
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
          </div>
          {idea.owner && (
            <div className="flex justify-between">
              <span className="text-slate-600">Owner:</span>
              <span>{idea.owner}</span>
            </div>
          )}
          {idea.last_used_at && (
            <div className="flex justify-between">
              <span className="text-slate-600">Last Used:</span>
              <span>{new Date(idea.last_used_at).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Created:</span>
            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Last Updated:</span>
            <span>{new Date(idea.updated_at).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
