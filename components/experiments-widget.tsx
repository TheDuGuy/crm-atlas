import { getExperimentStats } from "@/app/actions/experiments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Beaker } from "lucide-react";
import Link from "next/link";

export async function ExperimentsWidget() {
  const stats = await getExperimentStats();
  const inFlight = stats.running + stats.readout;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-blue-600" />
              Experiments in Flight
            </CardTitle>
            <CardDescription className="mt-2">
              Active experiments and readouts
            </CardDescription>
          </div>
          <Link href="/experiments">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">{inFlight}</div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Running</span>
                <Badge className="bg-green-100 text-green-800">{stats.running}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Readout</span>
                <Badge className="bg-amber-100 text-amber-800">{stats.readout}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Ready</span>
                <Badge className="bg-blue-100 text-blue-800">{stats.ready}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Shipped</span>
                <Badge className="bg-purple-100 text-purple-800">{stats.shipped}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Draft</span>
                <Badge variant="outline">{stats.draft}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Killed</span>
                <Badge variant="outline" className="bg-red-50 text-red-600">
                  {stats.killed}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
