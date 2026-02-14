import { getTopIdeas } from "@/app/actions/idea-bank";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

export async function TopIdeasWidget() {
  const topIdeas = await getTopIdeas(5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Ready-to-Ship Ideas
            </CardTitle>
            <CardDescription className="mt-2">
              Top ideas by impact/effort ratio
            </CardDescription>
          </div>
          <Link href="/idea-bank">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {topIdeas.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No ready ideas yet. Add some ideas to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {topIdeas.map((idea: any) => (
              <Link
                key={idea.id}
                href={`/idea-bank/${idea.id}`}
                className="block border rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-1">{idea.title}</div>
                    {idea.audience_logic && (
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {idea.audience_logic}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700"
                      >
                        {idea.goal?.replace("_", " ")}
                      </Badge>
                      {(idea.products as any)?.name && (
                        <Badge variant="outline" className="text-xs">
                          {(idea.products as any).name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={
                        idea.ratio >= 1.5
                          ? "bg-green-100 text-green-800"
                          : idea.ratio >= 1
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      }
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {idea.ratio.toFixed(1)}x
                    </Badge>
                    <div className="text-xs text-slate-500">
                      {idea.expected_impact}/{idea.effort}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
