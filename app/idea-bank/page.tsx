import { IdeaBankList } from "@/components/idea-bank-list";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { SeedIdeasButton } from "@/components/seed-ideas-button";
import { SeedDetailedIdeasButton } from "@/components/seed-detailed-ideas-button";

export default function IdeaBankPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-amber-500" />
            Idea Bank
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Ready-to-ship tactical campaigns for rapid response and recovery
          </p>
        </div>
        <div className="flex gap-2">
          <SeedIdeasButton />
          <SeedDetailedIdeasButton />
          <Link href="/idea-bank/new">
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              New Idea
            </Button>
          </Link>
        </div>
      </div>
      <IdeaBankList />
    </div>
  );
}
