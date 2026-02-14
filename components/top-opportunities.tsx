import { getTopOpportunities } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function TopOpportunities() {
  const opportunities = await getTopOpportunities();

  const statusColors: Record<string, string> = {
    idea: "bg-slate-100 text-slate-800",
    planned: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Opportunities</CardTitle>
        <Link
          href="/opportunities"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {opportunities.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No opportunities yet</p>
          ) : (
            opportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="block p-4 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{opp.title}</h3>
                    {opp.products && (
                      <p className="text-xs text-slate-500 mb-2">
                        {(opp.products as any).name}
                      </p>
                    )}
                  </div>
                  <Badge className={statusColors[opp.status]}>{opp.status}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Impact:</span>
                    <span className="font-semibold text-blue-600">
                      {opp.impact}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Effort:</span>
                    <span className="font-semibold text-purple-600">
                      {opp.effort}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Ratio:</span>
                    <span className="font-semibold text-green-600">
                      {opp.ratio.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
