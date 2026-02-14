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
import { getFlows } from "@/app/actions/flows";

type Flow = Awaited<ReturnType<typeof getFlows>>[0];

export function FlowsList() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [search, setSearch] = useState("");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [liveFilter, setLiveFilter] = useState<string>("all");
  const [stoFilter, setStoFilter] = useState<string>("all");
  const [triggerFilter, setTriggerFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFlows().then((data) => {
      setFlows(data);
      setLoading(false);
    });
  }, []);

  const filteredFlows = flows.filter((flow: any) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      flow.name.toLowerCase().includes(searchLower) ||
      flow.purpose.toLowerCase().includes(searchLower) ||
      (flow.products as any)?.name.toLowerCase().includes(searchLower);

    const matchesPurpose = purposeFilter === "all" || flow.purpose === purposeFilter;
    const matchesChannel =
      channelFilter === "all" || flow.channels.includes(channelFilter as any);
    const matchesLive =
      liveFilter === "all" || (liveFilter === "true" ? flow.live : !flow.live);
    const matchesSto = stoFilter === "all" || (stoFilter === "true" ? flow.sto : !flow.sto);
    const matchesTrigger = triggerFilter === "all" || flow.trigger_type === triggerFilter;

    return (
      matchesSearch &&
      matchesPurpose &&
      matchesChannel &&
      matchesLive &&
      matchesSto &&
      matchesTrigger
    );
  });

  const hasActiveFilters =
    purposeFilter !== "all" ||
    channelFilter !== "all" ||
    liveFilter !== "all" ||
    stoFilter !== "all" ||
    triggerFilter !== "all";

  const clearFilters = () => {
    setPurposeFilter("all");
    setChannelFilter("all");
    setLiveFilter("all");
    setStoFilter("all");
    setTriggerFilter("all");
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
          <span>All Flows ({filteredFlows.length})</span>
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
              placeholder="Search flows by name, purpose, or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="activation">Activation</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="winback">Winback</SelectItem>
                <SelectItem value="transactional">Transactional</SelectItem>
              </SelectContent>
            </Select>

            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[180px]">
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

            <Select value={triggerFilter} onValueChange={setTriggerFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Triggers</SelectItem>
                <SelectItem value="event_based">Event Based</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="api_triggered">API Triggered</SelectItem>
              </SelectContent>
            </Select>

            <Select value={liveFilter} onValueChange={setLiveFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Live Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Flows</SelectItem>
                <SelectItem value="true">Live Only</SelectItem>
                <SelectItem value="false">Not Live</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stoFilter} onValueChange={setStoFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="STO Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All STO</SelectItem>
                <SelectItem value="true">STO Yes</SelectItem>
                <SelectItem value="false">STO No</SelectItem>
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
                <TableHead className="font-semibold">Flow Name</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Purpose</TableHead>
                <TableHead className="font-semibold">Trigger</TableHead>
                <TableHead className="font-semibold">Frequency</TableHead>
                <TableHead className="font-semibold">Channels</TableHead>
                <TableHead className="font-semibold text-center">Priority</TableHead>
                <TableHead className="font-semibold text-center">Suppression</TableHead>
                <TableHead className="font-semibold text-center">Live</TableHead>
                <TableHead className="font-semibold text-center">STO</TableHead>
                <TableHead className="font-semibold">Iterable ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-slate-500">
                    No flows found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFlows.map((flow: any) => (
                  <TableRow key={flow.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <TableCell className="font-medium">
                      <Link
                        href={`/flows/${flow.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {flow.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {(flow.products as any)?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={purposeColors[flow.purpose]}>{flow.purpose}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{flow.trigger_type}</TableCell>
                    <TableCell className="text-sm">{flow.frequency || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {flow.channels.map((channel: any) => (
                          <Badge
                            key={channel}
                            variant="outline"
                            className={channelColors[channel]}
                          >
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {flow.priority ? (
                        <Badge variant="outline" className="font-mono">
                          P{flow.priority}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-600">
                          Not Set
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {flow.suppression_rules ? (
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-600">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {flow.live ? (
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {flow.sto ? (
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-800">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-mono">{flow.iterable_id || "—"}</TableCell>
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
