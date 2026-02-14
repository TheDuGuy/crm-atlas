"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import Link from "next/link";
import { getAllLiveFlows } from "@/app/actions/dashboard";

type Flow = Awaited<ReturnType<typeof getAllLiveFlows>>[0];

export function AllLiveFlows() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLiveFlows().then((data) => {
      setFlows(data);
      setLoading(false);
    });
  }, []);

  const filteredFlows = flows.filter((flow: any) => {
    const searchLower = search.toLowerCase();
    return (
      flow.name.toLowerCase().includes(searchLower) ||
      flow.purpose.toLowerCase().includes(searchLower) ||
      (flow.products as any)?.name.toLowerCase().includes(searchLower) ||
      flow.iterable_id?.toLowerCase().includes(searchLower)
    );
  });

  const purposeColors: Record<string, string> = {
    activation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    retention: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    winback: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    transactional: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };

  const channelColors: Record<string, string> = {
    email: "bg-slate-100 text-slate-800",
    push: "bg-orange-100 text-orange-800",
    in_app: "bg-teal-100 text-teal-800",
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Live Flows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Live Flows ({filteredFlows.length})</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search flows by name, purpose, product, or Iterable ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
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
                <TableHead className="font-semibold text-center">STO</TableHead>
                <TableHead className="font-semibold">Iterable ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No live flows found
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
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {(flow.products as any)?.name || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={purposeColors[flow.purpose]}>
                        {flow.purpose}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{flow.trigger_type}</TableCell>
                    <TableCell className="text-sm">{flow.frequency || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {flow.channels.map((channel: any) => (
                          <Badge key={channel} variant="outline" className={channelColors[channel]}>
                            {channel}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {flow.sto ? (
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
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
