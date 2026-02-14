"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Link as LinkIcon,
  Save,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { updateFlow } from "@/app/actions/flows";
import { useRouter } from "next/navigation";

type Flow = NonNullable<Awaited<ReturnType<typeof import("@/app/actions/flows").getFlow>>>;

export function FlowDetailClient({ flow }: { flow: Flow }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [priority, setPriority] = useState<number | null>(flow.priority);
  const [maxFrequency, setMaxFrequency] = useState<number | null>(
    flow.max_frequency_per_user_days
  );
  const [suppressionRules, setSuppressionRules] = useState<string>(
    flow.suppression_rules || ""
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateFlow(flow.id, {
        priority: priority || undefined,
        max_frequency_per_user_days: maxFrequency || undefined,
        suppression_rules: suppressionRules || undefined,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating flow:", error);
      alert("Failed to update flow");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPriority(flow.priority);
    setMaxFrequency(flow.max_frequency_per_user_days);
    setSuppressionRules(flow.suppression_rules || "");
    setIsEditing(false);
  };

  const purposeColors: Record<string, string> = {
    activation: "bg-blue-100 text-blue-800",
    retention: "bg-green-100 text-green-800",
    winback: "bg-amber-100 text-amber-800",
    transactional: "bg-purple-100 text-purple-800",
  };

  const channelColors: Record<string, string> = {
    email: "bg-slate-100 text-slate-800",
    push: "bg-orange-100 text-orange-800",
    in_app: "bg-teal-100 text-teal-800",
  };

  const fields = (flow.flow_field_dependencies || [])
    .map((dep: any) => dep.fields)
    .filter(Boolean);
  const events = (flow.flow_event_dependencies || [])
    .map((dep: any) => dep.events)
    .filter(Boolean);
  const deeplinks = (flow.flow_deeplinks || []).map((dep: any) => dep.deeplinks).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/flows" className="text-blue-600 hover:text-blue-800 hover:underline">
            Flows
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 dark:text-slate-100">{flow.name}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{flow.name}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {(flow.products as any)?.name || "Unknown Product"}
            </p>
          </div>
          <div className="flex gap-2">
            {flow.live ? (
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Not Live
              </Badge>
            )}
            {flow.sto ? (
              <Badge className="bg-green-100 text-green-800">STO</Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-600">
                No STO
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={purposeColors[flow.purpose]}>{flow.purpose}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Trigger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{flow.trigger_type}</div>
            {flow.frequency && <div className="text-xs text-slate-500 mt-1">{flow.frequency}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {flow.channels.map((channel: any) => (
                <Badge key={channel} variant="outline" className={channelColors[channel]}>
                  {channel}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Iterable ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm">{flow.iterable_id || "—"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Conflict Management Section */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" />
                Conflict Management
              </CardTitle>
              <CardDescription className="mt-2">
                Configure priority, frequency caps, and suppression rules to prevent over-messaging
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
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
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority (1-100)
                <span className="text-xs text-slate-500 ml-2">Lower = Higher Priority</span>
              </Label>
              {isEditing ? (
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  max={100}
                  value={priority || ""}
                  onChange={(e) => setPriority(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="e.g., 10"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {priority ? (
                    <Badge variant="outline" className="font-mono text-base px-3 py-1">
                      P{priority}
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Not set - may cause conflicts</span>
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Transactional: 1-20, Activation: 21-40, Retention: 41-60, Winback: 61-80,
                Educational: 81-100
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFrequency">
                Max Frequency (days)
                <span className="text-xs text-slate-500 ml-2">
                  Minimum days between sends to same user
                </span>
              </Label>
              {isEditing ? (
                <Input
                  id="maxFrequency"
                  type="number"
                  min={1}
                  value={maxFrequency || ""}
                  onChange={(e) =>
                    setMaxFrequency(e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="e.g., 7"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {maxFrequency ? (
                    <Badge variant="outline" className="font-mono text-base px-3 py-1">
                      {maxFrequency} days
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-500">No limit set</span>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Prevents this flow from sending to the same user too frequently
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="suppressionRules">
                Suppression Rules
                <span className="text-xs text-slate-500 ml-2">
                  Document when this flow should be suppressed
                </span>
              </Label>
              {isEditing ? (
                <Textarea
                  id="suppressionRules"
                  value={suppressionRules}
                  onChange={(e) => setSuppressionRules(e.target.value)}
                  placeholder="e.g., Suppress if user received any PL flow in last 24h OR Suppress if TTP transaction in last 7d"
                  rows={4}
                  className="font-mono text-sm"
                />
              ) : (
                <div>
                  {suppressionRules ? (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-3 border">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {suppressionRules}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">
                        No suppression rules defined - may cause conflicts
                      </span>
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Be specific about conditions, timeframes, and other flows that should block this
                one
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Details */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="dependencies">
            Dependencies ({fields.length + events.length})
          </TabsTrigger>
          <TabsTrigger value="deeplinks">Deeplinks ({deeplinks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {flow.description && (
                <div>
                  <Label className="text-slate-600">Description</Label>
                  <p className="mt-1 text-sm">{flow.description}</p>
                </div>
              )}
              {flow.trigger_logic && (
                <div>
                  <Label className="text-slate-600">Trigger Logic</Label>
                  <div className="mt-1 bg-slate-50 dark:bg-slate-900 rounded-md p-3 border">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{flow.trigger_logic}</pre>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Created At</Label>
                  <p className="mt-1 text-sm">
                    {new Date(flow.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">Last Updated</Label>
                  <p className="mt-1 text-sm">
                    {new Date(flow.updated_at).toLocaleDateString("en-US", {
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

        <TabsContent value="dependencies" className="space-y-4">
          {fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fields ({fields.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fields.map((field: any) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <div className="font-medium">{field.name}</div>
                      {field.description && (
                        <div className="text-sm text-slate-600 mt-1">{field.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Events ({events.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {events.map((event: any) => (
                    <div
                      key={event.id}
                      className="border rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <div className="font-medium">{event.name}</div>
                      {event.description && (
                        <div className="text-sm text-slate-600 mt-1">{event.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {fields.length === 0 && events.length === 0 && (
            <Card>
              <CardContent className="text-center py-12 text-slate-500">
                No dependencies configured
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deeplinks" className="space-y-4">
          {deeplinks.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Deeplinks ({deeplinks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deeplinks.map((deeplink: any) => (
                    <div
                      key={deeplink.id}
                      className="border rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-slate-400" />
                          <Badge variant="outline" className={channelColors[deeplink.channel]}>
                            {deeplink.channel}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 font-mono text-sm bg-slate-100 dark:bg-slate-800 rounded px-2 py-1">
                        {deeplink.url}
                      </div>
                      {deeplink.description && (
                        <div className="text-sm text-slate-600 mt-2">{deeplink.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12 text-slate-500">
                No deeplinks configured
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
