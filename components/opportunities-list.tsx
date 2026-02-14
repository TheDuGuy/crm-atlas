import { getOpportunities } from "@/app/actions/opportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export async function OpportunitiesList() {
  const opportunities = await getOpportunities();

  const statusColors: Record<string, string> = {
    idea: "bg-slate-100 text-slate-800",
    planned: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Opportunities ({opportunities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Linked Flow</TableHead>
                <TableHead className="font-semibold text-center">Impact</TableHead>
                <TableHead className="font-semibold text-center">Effort</TableHead>
                <TableHead className="font-semibold text-center">Confidence</TableHead>
                <TableHead className="font-semibold text-center">Ratio</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No opportunities yet
                  </TableCell>
                </TableRow>
              ) : (
                opportunities.map((opp) => (
                  <TableRow key={opp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <TableCell className="font-medium">
                      <Link
                        href={`/opportunities/${opp.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {opp.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {opp.products ? (opp.products as any).name : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {opp.flows ? (opp.flows as any).name : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-100 text-blue-800">{opp.impact || "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-purple-100 text-purple-800">{opp.effort || "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800">
                        {opp.confidence || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {opp.ratio > 0 ? opp.ratio.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[opp.status]}>{opp.status}</Badge>
                    </TableCell>
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
